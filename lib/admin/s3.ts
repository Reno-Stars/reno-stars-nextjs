import { S3Client } from '@aws-sdk/client-s3';

export const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/gif': 'gif',
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
  });

  return cachedClient;
}
