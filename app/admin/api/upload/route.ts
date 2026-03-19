import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/admin/auth';
import { getS3Client, S3_BUCKET, MIME_TO_EXT } from '@/lib/admin/s3';
import { MAX_IMAGE_SIZE, MAX_IMAGE_SIZE_LABEL, MAX_VIDEO_SIZE, MAX_VIDEO_SIZE_LABEL, ALLOWED_MEDIA_TYPES, ALLOWED_VIDEO_TYPES } from '@/lib/admin/upload-constants';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const PRESIGN_EXPIRY_SECONDS = 600; // 10 minutes (images)
const VIDEO_PRESIGN_EXPIRY_SECONDS = 3600; // 60 minutes (large video files)

/**
 * POST /admin/api/upload
 * Returns a presigned S3 PUT URL so the client can upload directly to S3,
 * bypassing Vercel's body size limit.
 *
 * Body: { fileName: string, fileSize: number, contentType: string, customKey?: string }
 * Response: { presignedUrl: string, publicUrl: string }
 *
 * Note: fileSize and contentType are client-reported. File size is validated
 * server-side before presigning. ContentLength is NOT included in the presigned
 * URL to avoid signature mismatches with R2 for large file uploads.
 */
export async function POST(request: NextRequest) {
  const isAuth = await validateSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fileName, fileSize, contentType, customKey } = body as {
      fileName: unknown;
      fileSize: unknown;
      contentType: unknown;
      customKey: unknown;
    };

    if (
      typeof fileName !== 'string' ||
      !fileName ||
      typeof fileSize !== 'number' ||
      fileSize === 0 ||
      typeof contentType !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid file metadata.' }, { status: 400 });
    }

    if (!ALLOWED_MEDIA_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, SVG, GIF, MP4, WebM, MOV.' },
        { status: 400 }
      );
    }

    const isVideo = ALLOWED_VIDEO_TYPES.has(contentType);
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${isVideo ? MAX_VIDEO_SIZE_LABEL : MAX_IMAGE_SIZE_LABEL}.` },
        { status: 400 }
      );
    }

    const client = getS3Client();
    if (!client) {
      return NextResponse.json(
        { error: 'S3 storage is not configured.' },
        { status: 500 }
      );
    }

    const publicBaseUrl = process.env.S3_PUBLIC_URL;
    if (!publicBaseUrl) {
      return NextResponse.json(
        { error: 'S3_PUBLIC_URL must be set.' },
        { status: 500 }
      );
    }

    // Build S3 key
    const ext =
      fileName.split('.').pop()?.toLowerCase() ||
      MIME_TO_EXT[contentType] ||
      'jpg';
    const sanitizedKey =
      typeof customKey === 'string'
        ? customKey.replace(/[^a-z0-9-]/g, '').slice(0, 200)
        : '';
    const key =
      sanitizedKey.length > 0
        ? `uploads/admin/${sanitizedKey}.${ext}`
        : `uploads/admin/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    // Note: ContentLength is intentionally omitted from the presigned URL.
    // Including it causes signature mismatches on R2 when browsers send
    // chunked uploads for large files. File size is validated above.
    const presignedUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: isVideo ? VIDEO_PRESIGN_EXPIRY_SECONDS : PRESIGN_EXPIRY_SECONDS }
    );

    return NextResponse.json({
      presignedUrl,
      publicUrl: `${publicBaseUrl}/${key}`,
    });
  } catch (error) {
    console.error('Upload presign error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL.' },
      { status: 500 }
    );
  }
}
