import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { validateSession, isValidUUID } from '@/lib/admin/auth';
import { getS3Client, S3_BUCKET } from '@/lib/admin/s3';
import { PRESIGN_BATCH_SIZE } from '@/lib/batch/types';

export const maxDuration = 15;

/** Allowed image MIME types for upload */
const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

/** Allowed image file extensions */
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']);

/** Only allow safe characters in S3 keys (alphanumeric, hyphens, dots, slashes) */
const S3_KEY_PATTERN = /^uploads\/admin\/[a-z0-9._\-\/]+$/i;

/** Validate that an S3 key is safe (no path traversal, correct prefix, allowed chars, image extension) */
function isValidS3Key(key: string): boolean {
  if (typeof key !== 'string' || key.length === 0 || key.length > 512) return false;
  if (key.includes('..') || key.includes('//') || key.includes('\\')) return false;
  if (!S3_KEY_PATTERN.test(key)) return false;
  const ext = key.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) return false;
  return true;
}

interface PresignItem {
  s3Key: string;
  contentType: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const isAuth = await validateSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { jobId } = await params;
  if (!isValidUUID(jobId)) {
    return NextResponse.json({ error: 'Invalid job ID.' }, { status: 400 });
  }

  const client = getS3Client();
  if (!client) {
    return NextResponse.json({ error: 'S3 not configured.' }, { status: 500 });
  }

  const s3PublicUrl = process.env.S3_PUBLIC_URL;
  if (!s3PublicUrl) {
    return NextResponse.json({ error: 'S3_PUBLIC_URL not configured.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const items: PresignItem[] = body.items;

    if (!Array.isArray(items) || items.length === 0 || items.length > PRESIGN_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Provide 1-${PRESIGN_BATCH_SIZE} items.` },
        { status: 400 }
      );
    }

    // Validate all items have required string properties
    for (const item of items) {
      if (typeof item.s3Key !== 'string' || typeof item.contentType !== 'string') {
        return NextResponse.json(
          { error: 'Each item must have string s3Key and contentType.' },
          { status: 400 }
        );
      }
      if (!isValidS3Key(item.s3Key)) {
        return NextResponse.json(
          { error: `Invalid S3 key: must start with "uploads/admin/" and be an image file.` },
          { status: 400 }
        );
      }
      if (!ALLOWED_CONTENT_TYPES.has(item.contentType)) {
        return NextResponse.json(
          { error: `Invalid content type: ${item.contentType}` },
          { status: 400 }
        );
      }
    }

    const results = await Promise.all(
      items.map(async (item) => {
        const presignedUrl = await getSignedUrl(
          client,
          new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: item.s3Key,
            ContentType: item.contentType,
          }),
          { expiresIn: 600 }
        );
        return {
          s3Key: item.s3Key,
          presignedUrl,
          publicUrl: `${s3PublicUrl}/${item.s3Key}`,
        };
      })
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Presign batch error:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URLs.' },
      { status: 500 }
    );
  }
}
