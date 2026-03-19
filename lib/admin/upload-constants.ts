/** Maximum image upload size in bytes (50 MB). */
export const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

/** Human-readable max size label. */
export const MAX_IMAGE_SIZE_LABEL = '50 MB';

/** Maximum video upload size in bytes (1 GB). */
export const MAX_VIDEO_SIZE = 1024 * 1024 * 1024;

/** Human-readable max video size label. */
export const MAX_VIDEO_SIZE_LABEL = '1 GB';

/** Allowed MIME types for image uploads. */
export const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
]);

/** Allowed MIME types for video uploads. */
export const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

/** Combined allowed MIME types for image + video uploads. */
export const ALLOWED_MEDIA_TYPES = new Set([
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
]);
