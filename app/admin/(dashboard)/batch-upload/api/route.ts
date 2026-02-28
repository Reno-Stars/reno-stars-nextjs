import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/admin/auth';
import { getS3Client, S3_BUCKET } from '@/lib/admin/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { db } from '@/lib/db';
import { batchUploadJobs } from '@/lib/db/schema';

export const maxDuration = 60;

const MAX_ZIP_SIZE = 100 * 1024 * 1024; // 100 MB

export async function POST(request: NextRequest) {
  const isAuth = await validateSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const generateBlog = formData.get('generateBlog') === 'true';

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (file.size > MAX_ZIP_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100 MB.' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      return NextResponse.json(
        { error: 'Only .zip files are accepted.' },
        { status: 400 }
      );
    }

    // Create job row
    const [job] = await db
      .insert(batchUploadJobs)
      .values({
        fileName: file.name,
        fileSizeBytes: file.size,
        options: { generateBlog },
        status: 'pending',
      })
      .returning({ id: batchUploadJobs.id });

    // Upload ZIP to S3 temp location
    const client = getS3Client();
    if (!client) {
      return NextResponse.json(
        { error: 'S3 storage is not configured.' },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    await client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: `temp/batch/${job.id}.zip`,
        Body: buffer,
        ContentType: 'application/zip',
      })
    );

    return NextResponse.json({ jobId: job.id });
  } catch (error) {
    console.error('Batch upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed.' },
      { status: 500 }
    );
  }
}
