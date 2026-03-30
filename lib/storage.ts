export const PROD_ORIGIN = 'https://www.reno-stars.com';
const STORAGE_ORIGIN = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || '';
const WP_UPLOADS_PREFIX = '/wp-content/uploads/';

// Local dev storage (MinIO/localhost) — also rewrites relative paths
const isLocalStorage = STORAGE_ORIGIN.includes('localhost') ||
                       STORAGE_ORIGIN.includes('127.0.0.1') ||
                       STORAGE_ORIGIN.includes('minio');

/** Like getAssetUrl but returns undefined for falsy inputs. */
export function getOptionalAssetUrl(url: string | null | undefined): string | undefined {
  return url ? getAssetUrl(url) : undefined;
}

/**
 * Rewrite asset URLs to use the configured storage origin.
 *
 * When NEXT_PUBLIC_STORAGE_PROVIDER is set (local or production), rewrites
 * WordPress URLs like:
 *   https://www.reno-stars.com/wp-content/uploads/2025/04/foo.jpg
 * to storage URLs like:
 *   http://localhost:9000/reno-stars/uploads/2025/04/foo.jpg  (MinIO)
 *   https://pub-xxx.r2.dev/uploads/2025/04/foo.jpg            (R2)
 *
 * For local dev only, also prefixes relative paths (e.g. /logo.jpg → <STORAGE>/logo.jpg).
 *
 * When NEXT_PUBLIC_STORAGE_PROVIDER is unset, returns URLs unchanged.
 */
export function getAssetUrl(url: string): string {
  if (!STORAGE_ORIGIN) return url;

  // Rewrite wp-content URLs → <STORAGE>/uploads/...
  const idx = url.indexOf(WP_UPLOADS_PREFIX);
  if (idx !== -1) {
    const relativePath = url.slice(idx + WP_UPLOADS_PREFIX.length);
    return `${STORAGE_ORIGIN}/uploads/${relativePath}`;
  }

  // Prefix relative paths → <STORAGE>/logo.jpg (local dev only)
  if (isLocalStorage && url.startsWith('/')) {
    return `${STORAGE_ORIGIN}${url}`;
  }

  return url;
}

/**
 * The origin for assets — useful for CSP `img-src` / `media-src` directives
 * and Next.js image configuration.
 */
export const ASSET_ORIGIN = (() => {
  if (!STORAGE_ORIGIN) return PROD_ORIGIN;
  try {
    return new URL(STORAGE_ORIGIN).origin;
  } catch {
    console.error(`Invalid NEXT_PUBLIC_STORAGE_PROVIDER: "${STORAGE_ORIGIN}"`);
    return PROD_ORIGIN;
  }
})();
