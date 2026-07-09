import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
// Allowed origins for image URLs — SSOT in lib/image.ts (base hosts shared
// with the in-content optimizer rewrite + route-only extras like lh3).
import { SRCSET_WIDTHS, ALLOWED_IMAGE_HOSTS } from '@/lib/image';

// Also allow MinIO/localhost in dev
const isDev = process.env.NODE_ENV === 'development';

const MAX_WIDTH = 1920;
const DEFAULT_QUALITY = 70;
const MAX_SOURCE_SIZE = 50 * 1024 * 1024; // 50MB
const FETCH_TIMEOUT_MS = 30_000; // 30s — large PNGs from R2 can be slow

// In-memory cache — effective in long-lived processes (docker/node) and local dev.
// On serverless (Vercel), each cold start gets an empty cache; the real caching
// layer is the Cache-Control: immutable header which CDNs and browsers honour.
const cache = new Map<string, { buffer: Uint8Array; contentType: string; timestamp: number }>();
const MAX_CACHE_SIZE = 50;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (isDev && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
      return true;
    }
    return ALLOWED_IMAGE_HOSTS.some(host => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function getCacheKey(url: string, width: number, quality: number, format: string): string {
  return `${url}|${width}|${quality}|${format}`;
}

function evictStaleEntries() {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      cache.delete(key);
    }
  }
  // If still over limit, remove oldest entries
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, cache.size - MAX_CACHE_SIZE);
    for (const [key] of toRemove) {
      cache.delete(key);
    }
  }
}


/**
 * Read a fetch Response body into an ArrayBuffer, aborting (returns null) the
 * moment the accumulated size exceeds `maxBytes`. Prevents an allowed host
 * serving an unbounded chunked stream from OOM-ing the shared origin process.
 */
async function readCappedBody(response: Response, maxBytes: number): Promise<ArrayBuffer | null> {
  const reader = response.body?.getReader();
  if (!reader) {
    // No stream (shouldn't happen for a 200 image); fall back to a capped buffer.
    const buf = await response.arrayBuffer();
    return buf.byteLength > maxBytes ? null : buf;
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        return null;
      }
      chunks.push(value);
    }
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { out.set(c, offset); offset += c.byteLength; }
  return out.buffer;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const url = searchParams.get('url');
  const w = Math.min(Math.max(parseInt(searchParams.get('w') || '0', 10) || 0, 0), 2048);
  const q = Math.min(Math.max(parseInt(searchParams.get('q') || String(DEFAULT_QUALITY), 10) || DEFAULT_QUALITY, 1), 100);
  const f = searchParams.get('f') || 'webp';

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  // Snap to nearest valid width (shared with OptimizedImage srcSet)
  let width = 0;
  if (w > 0) {
    width = SRCSET_WIDTHS.find(vw => vw >= w) || MAX_WIDTH;
  }

  const quality = Math.max(1, Math.min(100, q));
  const format = f === 'avif' ? 'avif' : 'webp';

  // Check cache
  const cacheKey = getCacheKey(url, width, quality, format);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return new Response(cached.buffer as BodyInit, {
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    // Fetch the original image
    // redirect:'manual' — do NOT auto-follow. An allowed image host (R2, lh3,
    // *.reno-stars.com) that answers a bare object GET with a 3xx is anomalous;
    // following it is a blind-SSRF vector (redirect to 127.0.0.1:5435, the
    // metadata IP, etc. — the internal request fires before any post-hoc URL
    // check). We treat any redirect from an allowed host as a hard reject.
    const response = await fetch(url, {
      headers: { 'Accept': 'image/*' },
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (response.status >= 300 && response.status < 400) {
      return NextResponse.json({ error: 'Source refused: unexpected redirect' }, { status: 403 });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: 502 },
      );
    }

    // Reject oversized source images before buffering
    const contentLength = response.headers.get('Content-Length');
    if (contentLength && parseInt(contentLength, 10) > MAX_SOURCE_SIZE) {
      return NextResponse.json({ error: 'Source image too large' }, { status: 413 });
    }

    // Stream with a hard byte cap — Content-Length may be absent (chunked) or
    // spoofed, and response.arrayBuffer() would buffer a multi-GB body into the
    // single shared Node heap (OOM → whole self-hosted site down) before any
    // size check. Abort as soon as we cross MAX_SOURCE_SIZE.
    const arrayBuffer = await readCappedBody(response, MAX_SOURCE_SIZE);
    if (arrayBuffer === null) {
      return NextResponse.json({ error: 'Source image too large' }, { status: 413 });
    }

    let pipeline = sharp(new Uint8Array(arrayBuffer), {
      // Limit input pixel count to avoid OOM on huge source images
      // 200MP should cover any realistic photo
      limitInputPixels: 200_000_000,
      // Use sequential read for better memory efficiency on large files
      sequentialRead: true,
    });

    // Resize if width specified
    if (width > 0) {
      pipeline = pipeline.resize(width, undefined, {
        withoutEnlargement: true,
        fit: 'inside',
        // Use faster lanczos for large downscales
        kernel: width <= 640 ? 'lanczos3' : 'lanczos2',
      });
    }

    // Convert format
    let contentType: string;
    if (format === 'avif') {
      pipeline = pipeline.avif({ quality, effort: 2 }); // effort 2 = fast encode
      contentType = 'image/avif';
    } else {
      pipeline = pipeline.webp({ quality, effort: 3, smartSubsample: true }); // effort 3 = balanced speed/size
      contentType = 'image/webp';
    }

    const buffer = new Uint8Array(await pipeline.toBuffer());

    // Store in cache
    evictStaleEntries();
    cache.set(cacheKey, { buffer, contentType, timestamp: Date.now() });

    return new Response(buffer as BodyInit, {
      headers: {
        'Content-Type': contentType,
        // s-maxage tells Vercel's CDN to cache at the edge (not just browser)
        // stale-while-revalidate serves stale while refreshing in background
        'Cache-Control': 'public, s-maxage=31536000, max-age=31536000, stale-while-revalidate=86400, immutable',
        'X-Cache': 'MISS',
        'Vary': 'Accept',
        'CDN-Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate=86400',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Image optimization failed:', error);
    // Cache 502 errors for 5 min so a single broken upstream URL doesn't
    // burn Lambda CPU + bandwidth on every retry. Edge serves stale error
    // from cache; admin can re-deploy / invalidate when source is fixed.
    return NextResponse.json(
      { error: 'Image optimization failed' },
      {
        status: 502,
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'CDN-Cache-Control': 'public, max-age=300',
          'Vercel-CDN-Cache-Control': 'public, max-age=300',
        },
      },
    );
  }
}
