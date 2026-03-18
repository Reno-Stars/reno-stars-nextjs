import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/admin/auth';
import { getS3Client } from '@/lib/admin/s3';
import { db } from '@/lib/db';
import { batchUploadJobs } from '@/lib/db/schema';
import { MAX_ZIP_SIZE } from '@/lib/batch/types';

export const maxDuration = 60;

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

    return NextResponse.json({ jobId: job.id });
  } catch (error) {
    console.error('Batch upload error:', error);
    return NextResponse.json(
      { error: 'Failed to create upload job. Please try again.' },
      { status: 500 }
    );
  }
}
