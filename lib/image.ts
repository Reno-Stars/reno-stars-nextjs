/** Responsive breakpoints for image srcSet generation (shared between component and API) */
export const SRCSET_WIDTHS = [320, 640, 828, 1080, 1200, 1920] as const;

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
