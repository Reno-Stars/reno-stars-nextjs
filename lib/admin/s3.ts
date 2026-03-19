import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

export const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

/** Default S3 bucket name. Override via S3_BUCKET env var. */
export const S3_BUCKET = process.env.S3_BUCKET || 'reno-stars';

let cachedClient: S3Client | null | undefined;

export function getS3Client(): S3Client | null {
  if (cachedClient !== undefined) return cachedClient;

  const endpoint = process.env.S3_ENDPOINT;
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;

  if (!endpoint || !accessKey || !secretKey) {
    cachedClient = null;
    return null;
  }

  cachedClient = new S3Client({
    endpoint,
    region: 'auto',
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    forcePathStyle: true,
    // Disable automatic checksums on presigned URLs. SDK v3.600+ defaults to
    // "WHEN_SUPPORTED" which embeds CRC32 in presigned URLs. Browsers can't
    // compute CRC32, so the checksum mismatches and R2/S3 resets the connection.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });

  return cachedClient;
}

/**
 * Extract the S3 key from a public URL (e.g. "https://pub-xxx.r2.dev/uploads/admin/foo.mp4"
 * → "uploads/admin/foo.mp4"). Returns null if the URL doesn't match the public base URL.
 */
function extractKeyFromUrl(url: string): string | null {
  const publicBase = process.env.S3_PUBLIC_URL;
  if (!publicBase || !url.startsWith(publicBase)) return null;
  // Strip the base URL + trailing slash
  return url.slice(publicBase.length).replace(/^\//, '');
}

/**
 * Delete an object from S3 by its public URL. Silently ignores failures
 * (the object may have already been deleted or the URL may be external).
 */
export async function deleteS3Object(publicUrl: string): Promise<void> {
  const key = extractKeyFromUrl(publicUrl);
  if (!key) return;

  const client = getS3Client();
  if (!client) return;

  try {
    await client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
  } catch (err) {
    console.error('Failed to delete S3 object:', key, err);
  }
}
