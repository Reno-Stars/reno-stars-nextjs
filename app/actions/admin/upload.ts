'use server';

import { requireAuth } from '@/lib/admin/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

function getS3Client() {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;

  if (!endpoint || !accessKey || !secretKey) {
    return null;
  }

  return new S3Client({
    endpoint,
    region: 'auto',
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    forcePathStyle: true,
  });
}

export async function uploadImage(
  _prevState: { url?: string; error?: string },
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  await requireAuth();

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'No file selected.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File too large. Maximum size is 5 MB.' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, SVG, GIF.' };
  }

  const client = getS3Client();
  if (!client) {
    return { error: 'S3 storage is not configured. Set S3_ENDPOINT, S3_ACCESS_KEY, and S3_SECRET_KEY in .env.local.' };
  }

  const bucket = process.env.S3_BUCKET || 'reno-stars';
  const storageOrigin = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || '';

  // Generate a unique filename with original extension
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const key = `uploads/admin/${timestamp}-${random}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  // Build the public URL
  const url = storageOrigin ? `${storageOrigin}/${key}` : `/${key}`;

  return { url };
}
