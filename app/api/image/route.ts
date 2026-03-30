import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { SRCSET_WIDTHS } from '@/lib/image';

// Allowed origins for image URLs
const ALLOWED_HOSTS = [
  'reno-stars.com',
  'www.reno-stars.com',
  'pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev',
  'pub-c1ab6c279d0b4d818f91cee00ab3defe.r2.dev',
  'lh3.googleusercontent.com',
];

// Also allow MinIO/localhost in dev
const isDev = process.env.NODE_ENV === 'development';

const MAX_WIDTH = 1920;
const DEFAULT_QUALITY = 75;
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
    return ALLOWED_HOSTS.some(host => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const url = searchParams.get('url');
  const w = parseInt(searchParams.get('w') || '0', 10);
  const q = parseInt(searchParams.get('q') || String(DEFAULT_QUALITY), 10);
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
    const response = await fetch(url, {
      headers: { 'Accept': 'image/*' },
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    // Validate final URL after redirects to prevent SSRF via open redirects
    if (response.redirected && !isAllowedUrl(response.url)) {
      return NextResponse.json({ error: 'Redirected to disallowed host' }, { status: 403 });
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

    const arrayBuffer = await response.arrayBuffer();

    // Secondary size guard — Content-Length may be absent or spoofed
    if (arrayBuffer.byteLength > MAX_SOURCE_SIZE) {
      return NextResponse.json({ error: 'Source image too large' }, { status: 413 });
    }

    let pipeline = sharp(new Uint8Array(arrayBuffer));

    // Resize if width specified
    if (width > 0) {
      pipeline = pipeline.resize(width, undefined, {
        withoutEnlargement: true,
        fit: 'inside',
      });
    }

    // Convert format
    let contentType: string;
    if (format === 'avif') {
      pipeline = pipeline.avif({ quality });
      contentType = 'image/avif';
    } else {
      pipeline = pipeline.webp({ quality });
      contentType = 'image/webp';
    }

    const buffer = new Uint8Array(await pipeline.toBuffer());

    // Store in cache
    evictStaleEntries();
    cache.set(cacheKey, { buffer, contentType, timestamp: Date.now() });

    return new Response(buffer as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache': 'MISS',
        'Vary': 'Accept',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Image optimization failed' },
      { status: 502 },
    );
  }
}
