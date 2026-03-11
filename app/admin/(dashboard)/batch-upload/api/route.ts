import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/admin/auth';
import { getS3Client, S3_BUCKET } from '@/lib/admin/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { db } from '@/lib/db';
import { batchUploadJobs } from '@/lib/db/schema';

export const maxDuration = 60;

const MAX_ZIP_SIZE = 1024 * 1024 * 1024; // 1 GB
const PRESIGN_EXPIRY_SECONDS = 1800; // 30 minutes

export async function POST(request: NextRequest) {
  const isAuth = await validateSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fileName, fileSize, generateBlog, mode } = body as {
      fileName: unknown;
      fileSize: unknown;
      generateBlog: unknown;
      mode: unknown;
    };

    if (typeof fileName !== 'string' || !fileName || typeof fileSize !== 'number' || fileSize === 0) {
      return NextResponse.json({ error: 'Invalid file metadata.' }, { status: 400 });
    }

    if (fileSize > MAX_ZIP_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 1 GB.' },
        { status: 400 }
      );
    }

    if (!fileName.toLowerCase().endsWith('.zip')) {
      return NextResponse.json(
        { error: 'Only .zip files are accepted.' },
        { status: 400 }
      );
    }

    // Check S3 before creating a DB row to avoid orphans
    const client = getS3Client();
    if (!client) {
      return NextResponse.json(
        { error: 'S3 storage is not configured.' },
        { status: 500 }
      );
    }

    // Create job row
    const [job] = await db
      .insert(batchUploadJobs)
      .values({
        fileName,
        fileSizeBytes: fileSize,
        options: {
          generateBlog: !!generateBlog,
          mode: mode === 'standalone' ? 'standalone' : 'sites',
        },
        status: 'pending',
      })
      .returning({ id: batchUploadJobs.id });

    // Generate presigned URL for direct S3 upload
    const presignedUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: `temp/batch/${job.id}.zip`,
        ContentType: 'application/zip',
      }),
      { expiresIn: PRESIGN_EXPIRY_SECONDS }
    );

    return NextResponse.json({ jobId: job.id, presignedUrl });
  } catch (error) {
    console.error('Batch upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed.' },
      { status: 500 }
    );
  }
}
