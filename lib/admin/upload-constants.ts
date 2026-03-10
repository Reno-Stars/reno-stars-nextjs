/** Maximum image upload size in bytes (50 MB). */
export const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

/** Human-readable max size label. */
export const MAX_IMAGE_SIZE_LABEL = '50 MB';

/** Allowed MIME types for image uploads. */
export const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
]);
