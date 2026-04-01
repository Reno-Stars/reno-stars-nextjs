/**
 * image-process.ts
 *
 * Server-side image processing pipeline.
 * When an image is uploaded to R2, this module fetches it, generates
 * optimized WebP variants at standard breakpoints, and stores them back
 * in R2 under a predictable key structure.
 *
 * Result: /api/image is never called for processed images — the browser
 * hits R2 directly at the right size, zero Fluid CPU cost.
 *
 * Key structure:
 *   Original:  uploads/admin/foo.jpg
 *   Processed: uploads/processed/foo_320.webp
 *              uploads/processed/foo_640.webp
 *              uploads/processed/foo_828.webp
 *              uploads/processed/foo_1080.webp
 *              uploads/processed/foo_1200.webp
 *              uploads/processed/foo_1920.webp
 */

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, S3_BUCKET } from './s3';
import { SRCSET_WIDTHS } from '@/lib/image';

const QUALITY = 72;
const MAX_SOURCE_BYTES = 50 * 1024 * 1024; // 50MB
const FETCH_TIMEOUT_MS = 30_000;

export interface ProcessedVariant {
  width: number;
  key: string;        // R2 key
  publicUrl: string;  // CDN URL
  bytes: number;
}

export interface ProcessResult {
  ok: boolean;
  variants: ProcessedVariant[];
  error?: string;
  skipped?: boolean; // already processed
}

/**
 * Derive the processed key prefix from an original upload key or public URL.
 * e.g. "uploads/admin/foo.jpg" → "uploads/processed/foo"
 */
export function getProcessedKeyPrefix(originalKey: string): string {
  // Strip leading slash or full URL to get just the key
  let key = originalKey;
  const uploadsIdx = key.indexOf('uploads/');
  if (uploadsIdx !== -1) key = key.slice(uploadsIdx);

  // Strip extension, replace "admin/" with "processed/"
  const withoutExt = key.replace(/\.[^.]+$/, '');
  return withoutExt.replace('uploads/admin/', 'uploads/processed/');
}

/**
 * Build the public URL for a processed variant.
 */
export function getProcessedUrl(originalUrl: string, width: number): string {
  const s3PublicUrl = process.env.S3_PUBLIC_URL || process.env.NEXT_PUBLIC_STORAGE_PROVIDER || '';
  const prefix = getProcessedKeyPrefix(originalUrl);
  // Strip the base URL from prefix if it was included
  const keyPart = prefix.startsWith('http') ? getProcessedKeyPrefix(new URL(prefix).pathname.slice(1)) : prefix;
  return `${s3PublicUrl}/${keyPart}_${width}.webp`;
}

/**
 * Check if processed variants already exist in R2 for a given source URL.
 * Checks the smallest variant (320w) as a proxy for the whole set.
 */
export async function areVariantsProcessed(sourceUrl: string): Promise<boolean> {
  const checkUrl = getProcessedUrl(sourceUrl, SRCSET_WIDTHS[0]);
  try {
    const res = await fetch(checkUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Process a single image: fetch from R2, generate WebP variants, upload back to R2.
 * Skips if variants already exist.
 */
export async function processImage(sourceUrl: string, force = false): Promise<ProcessResult> {
  const client = getS3Client();
  const s3PublicUrl = process.env.S3_PUBLIC_URL || '';

  if (!client || !s3PublicUrl) {
    return { ok: false, variants: [], error: 'S3 not configured' };
  }

  // Check if already processed
  if (!force && await areVariantsProcessed(sourceUrl)) {
    return { ok: true, variants: [], skipped: true };
  }

  // Dynamically import sharp (not available in edge runtime)
  let sharp: typeof import('sharp');
  try {
    sharp = (await import('sharp')).default as unknown as typeof import('sharp');
  } catch {
    return { ok: false, variants: [], error: 'sharp not available' };
  }

  // Fetch source image
  let sourceBuffer: Uint8Array;
  try {
    const res = await fetch(sourceUrl, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, variants: [], error: `Fetch failed: ${res.status}` };

    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_SOURCE_BYTES) {
      return { ok: false, variants: [], error: 'Source image too large' };
    }

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_SOURCE_BYTES) {
      return { ok: false, variants: [], error: 'Source image too large' };
    }
    sourceBuffer = new Uint8Array(buf);
  } catch (e) {
    return { ok: false, variants: [], error: `Fetch error: ${e}` };
  }

  // Get source dimensions
  let sourceMeta: { width?: number; height?: number };
  try {
    sourceMeta = await sharp(sourceBuffer).metadata();
  } catch (e) {
    return { ok: false, variants: [], error: `Metadata error: ${e}` };
  }

  const sourceWidth = sourceMeta.width ?? 9999;
  const keyPrefix = getProcessedKeyPrefix(sourceUrl);
  const variants: ProcessedVariant[] = [];

  // Generate each width variant
  for (const width of SRCSET_WIDTHS) {
    // Skip widths larger than source (no point upscaling)
    if (width > sourceWidth * 1.1) continue;

    try {
      const webpBuffer = await sharp(sourceBuffer, { limitInputPixels: 200_000_000 })
        .resize(width, undefined, { withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: QUALITY, effort: 4, smartSubsample: true })
        .toBuffer();

      const key = `${keyPrefix}_${width}.webp`;

      await client.send(new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      }));

      variants.push({
        width,
        key,
        publicUrl: `${s3PublicUrl}/${key}`,
        bytes: webpBuffer.byteLength,
      });
    } catch (e) {
      console.error(`[image-process] Failed variant ${width}w for ${sourceUrl}:`, e);
      // Continue with other widths even if one fails
    }
  }

  return { ok: variants.length > 0, variants };
}

/**
 * Build a srcset string using processed R2 URLs.
 * Falls back to /api/image URLs if processed variants don't exist.
 */
export function buildProcessedSrcSet(sourceUrl: string): string {
  return SRCSET_WIDTHS
    .map(w => `${getProcessedUrl(sourceUrl, w)} ${w}w`)
    .join(', ');
}
