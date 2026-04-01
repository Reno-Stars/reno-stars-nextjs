/** Responsive breakpoints for image srcSet generation (shared between component and API) */
export const SRCSET_WIDTHS = [320, 640, 828, 1080, 1200, 1920] as const;

/**
 * R2 public URL base — set via NEXT_PUBLIC_STORAGE_PROVIDER env var.
 * Used to detect R2 URLs and build processed variant paths.
 */
const R2_BASE = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_STORAGE_PROVIDER || '')
  : '';

/**
 * Check if a URL points to our R2 bucket (eligible for pre-processed variants).
 */
export function isR2Url(url: string): boolean {
  return R2_BASE.length > 0 && url.startsWith(R2_BASE);
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
    const processedPath = pathWithoutExt.replace('/uploads/admin/', '/uploads/processed/');
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
