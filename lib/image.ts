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
  return `/api/image/?url=${encodeURIComponent(src)}&w=${width}&q=${quality}&f=${format}`;
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

// Hosts whose in-content <img> originals we may route through the WebP optimizer.
// SSOT for image hostnames — the /api/image route allowlist derives from this
// same base array (see ALLOWED_IMAGE_HOSTS below), so the two can't drift.
// Only images we control: R2 buckets + www/apex.
const OPTIMIZABLE_IMG_HOSTS: readonly string[] = [
  'pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev',
  'pub-c1ab6c279d0b4d818f91cee00ab3defe.r2.dev',
  'www.reno-stars.com',
  'reno-stars.com',
];

/**
 * Full allowlist for the /api/image optimizer route: our own hosts plus
 * route-only extras that the optimizer may FETCH but that the in-content
 * rewrite (optimizeContentImages) must NOT proxy. Keeping the extras out of
 * OPTIMIZABLE_IMG_HOSTS preserves the rewrite behavior exactly.
 */
export const ALLOWED_IMAGE_HOSTS: readonly string[] = [
  ...OPTIMIZABLE_IMG_HOSTS,
  // Route-only: Google review avatars (lh3) are resized by /api/image before
  // being mirrored to R2 — they're never rewritten inside content HTML.
  'lh3.googleusercontent.com',
];

/** Optimized display props for a fixed-size <img>: src + optional srcSet/sizes. */
export interface DisplayVariant {
  src: string;
  srcSet?: string;
  sizes?: string;
}

/**
 * Build src/srcSet/sizes for a small fixed-display-size <img> (review avatars,
 * partner logos): routes allowed-host images through the WebP optimizer at two
 * widths (1x/2x of the display size) so they ship as a few-KB WebP with a 1-yr
 * immutable cache instead of the raw uncached original. Returns the raw src
 * unchanged for malformed URLs, non-allowlisted hosts, and — when
 * svgPassthrough is set — .svg paths (vector, already tiny; sharp would
 * rasterize them). SSOT consumed by GoogleAvatar and PartnersSection so the
 * allowlist/fallback logic can't drift between them.
 */
export function buildDisplayVariant(src: string, opts: {
  widths: [number, number];
  sizes: string;
  quality?: number;
  svgPassthrough?: boolean;
}): DisplayVariant {
  let parsed: URL;
  try {
    parsed = new URL(src);
  } catch {
    return { src }; // malformed URL — use raw
  }
  if (opts.svgPassthrough && parsed.pathname.toLowerCase().endsWith('.svg')) return { src };
  if (!ALLOWED_IMAGE_HOSTS.includes(parsed.hostname)) return { src };
  const quality = opts.quality ?? DEFAULT_QUALITY;
  const [w1, w2] = opts.widths;
  return {
    src: buildOptimizedUrl(src, w2, quality),
    srcSet: `${buildOptimizedUrl(src, w1, quality)} ${w1}w, ${buildOptimizedUrl(src, w2, quality)} ${w2}w`,
    sizes: opts.sizes,
  };
}

/**
 * Rewrite in-content `<img>` srcs (raw-HTML blog/service/area bodies) to the WebP
 * optimizer. Content HTML is injected via dangerouslySetInnerHTML, so its images
 * otherwise bypass OptimizedImage and ship as raw multi-hundred-KB PNG/JPEG — bad
 * for Core Web Vitals and image SEO. Only our own hosts are rewritten; external,
 * data-URI, already-proxied, and pre-processed srcs are left untouched. Preserves
 * every other attribute (alt / width / height / loading).
 */
export function optimizeContentImages(html: string, width = 1200): string {
  let imgIndex = 0;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    // Lazy-load in-content images from the SECOND one on: when a post has no
    // featured hero, the first content image can be the LCP element and must
    // not be deferred. decoding=async is safe on all of them.
    const isFirst = imgIndex++ === 0;
    let out = tag;
    if (!isFirst && !/\sloading=/i.test(out)) out = out.replace(/^<img\b/i, '<img loading="lazy"');
    if (!/\sdecoding=/i.test(out)) out = out.replace(/^<img\b/i, '<img decoding="async"');
    const m = out.match(/\ssrc="([^"]+)"/i);
    if (!m) return out;
    const src = m[1];
    if (src.startsWith('/api/image') || src.startsWith('data:') || src.includes('/uploads/processed/')) return out;
    let hostname: string;
    try { hostname = new URL(src, 'https://www.reno-stars.com').hostname; } catch { return out; }
    if (!OPTIMIZABLE_IMG_HOSTS.includes(hostname)) return out;
    return out.replace(/\ssrc="[^"]+"/i, ` src="${buildOptimizedUrl(src, width)}"`);
  });
}
