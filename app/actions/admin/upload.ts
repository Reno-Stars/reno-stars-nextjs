'use server';

import { requireAuth } from '@/lib/admin/auth';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, MIME_TO_EXT } from '@/lib/admin/s3';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

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
  // S3_PUBLIC_URL: The public-facing URL for the bucket (e.g., R2 public bucket URL or MinIO public URL).
  // Must be set for uploads to return accessible URLs.
  const publicUrl = process.env.S3_PUBLIC_URL;
  if (!publicUrl) {
    return { error: 'S3_PUBLIC_URL must be set to return public image URLs.' };
  }

  // Generate the S3 key: use customKey if provided, otherwise timestamp-random
  const ext = file.name.split('.').pop()?.toLowerCase() || MIME_TO_EXT[file.type] || 'jpg';
  const rawCustomKey = formData.get('customKey');
  const sanitizedKey = typeof rawCustomKey === 'string'
    ? rawCustomKey.replace(/[^a-z0-9-]/g, '').slice(0, 200)
    : '';
  const key = sanitizedKey.length > 0
    ? `uploads/admin/${sanitizedKey}.${ext}`
    : `uploads/admin/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );
    const url = `${publicUrl}/${key}`;
    return { url };
  } catch (error) {
    console.error('S3 upload failed:', error);
    return { error: 'Image upload failed. Please try again.' };
  }
}
