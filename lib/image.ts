/**
 * Responsive breakpoints for image srcSet generation (shared between component and API).
 *
 * Why no 1920w: image-process.ts skips widths larger than the source × 1.1 to avoid
 * upscaling. Most R2 source images are < 2112px wide, so the 1920w variant doesn't get
 * generated, but srcSet was advertising it anyway → 404s on high-DPI devices that picked
 * 1920w → broken-image flash before the onError fallback could fire (reported by 红兔子
 * via WeChat 2026-05-09). Dropping 1920w means high-DPI mobile picks 1200w max, which
 * still gives 400 effective px on a 3x screen — plenty for a 100vw mobile hero. If a
 * future image actually needs 1920w, upload a higher-res source and regenerate variants
 * via scripts/process-all-images.ts, then add the width back here.
 */
export const SRCSET_WIDTHS = [320, 640, 828, 1080, 1200] as const;

/**
 * R2 public URL base — set via NEXT_PUBLIC_STORAGE_PROVIDER env var.
 * Used to detect R2 URLs and build processed variant paths.
 */
const R2_BASE = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_STORAGE_PROVIDER || '')
  : '';

/**
 * Check if a URL points to our R2 bucket AND is an admin-uploaded image
 * that has pre-processed WebP variants available.
 * Only uploads/admin/ and uploads/designs/ paths are processed.
 *
 * Detection is robust: matches when (a) R2_BASE env is set and the URL
 * starts with it, OR (b) the URL hostname pattern matches Cloudflare R2
 * public hosts (pub-*.r2.dev, *.r2.cloudflarestorage.com). Pattern-based
 * fallback ensures processed-variant routing works even when the env var
 * isn't deployed correctly — was the root cause of /api/image being used
 * for every R2 image, driving Vercel Fast Origin Transfer way over quota.
 */
export function isR2Url(url: string): boolean {
  if (!url) return false;
  const hasUploadPath = url.includes('/uploads/admin/')
    || url.includes('/uploads/designs/')
    || url.includes('/uploads/processed/');
  if (!hasUploadPath) return false;
  if (R2_BASE && url.startsWith(R2_BASE)) return true;
  // Hostname-based fallback: matches R2 public host patterns
  return /^https?:\/\/(pub-[a-z0-9]+\.r2\.dev|[a-z0-9]+\.r2\.cloudflarestorage\.com)/i.test(url);
}

/**
 * Build the R2 URL for a pre-processed WebP variant.
 * Preserves the original URL's path prefix (with or without /reno-stars/).
 * e.g. https://pub-xxx.r2.dev/reno-stars/uploads/admin/foo.jpg → https://pub-xxx.r2.dev/reno-stars/uploads/processed/foo_828.webp
 *      https://pub-xxx.r2.dev/uploads/admin/foo.jpg             → https://pub-xxx.r2.dev/uploads/processed/foo_828.webp
 */
export function buildProcessedUrl(src: string, width: number): string {
  if (!isR2Url(src)) return buildOptimizedUrl(src, width);
  try {
    const parsed = new URL(src);
    const pathWithoutExt = parsed.pathname.replace(/\.[^.]+$/, '');
    // Both /uploads/admin/ and /uploads/designs/ get processed variants
    // written to /uploads/processed/. Earlier this only rewrote admin paths,
    // so design images 404'd with no fallback.
    const processedPath = pathWithoutExt.replace(/\/uploads\/(admin|designs)\//, '/uploads/processed/');
    return `${parsed.origin}${processedPath}_${width}.webp`;
  } catch {
    return buildOptimizedUrl(src, width);
  }
}

/**
 * Build a srcset string using pre-processed R2 WebP variants.
 * Falls back to /api/image for non-R2 URLs.
 */
export function buildProcessedSrcSet(src: string, quality = DEFAULT_QUALITY): string {
  if (!isR2Url(src)) return buildSrcSet(src, quality);
  return SRCSET_WIDTHS
    .map(w => `${buildProcessedUrl(src, w)} ${w}w`)
    .join(', ');
}

/** Default quality: 70 for good balance between size and quality */
export const DEFAULT_QUALITY = 70;

export function buildOptimizedUrl(src: string, width: number, quality = DEFAULT_QUALITY, format: 'webp' | 'avif' = 'webp'): string {
  return `/api/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}&f=${format}`;
}

export function buildSrcSet(src: string, quality = DEFAULT_QUALITY): string {
  return SRCSET_WIDTHS
    .map(w => `${buildOptimizedUrl(src, w, quality)} ${w}w`)
    .join(', ');
}

/** Build the optimized URL for use in <link rel="preload"> tags */
export function buildPreloadUrl(src: string, width = 828, quality = DEFAULT_QUALITY): string {
  return buildOptimizedUrl(src, width, quality);
}
