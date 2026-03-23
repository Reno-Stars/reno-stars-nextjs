import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/admin/auth';
import { db } from '@/lib/db';
import { batchUploadJobs } from '@/lib/db/schema';
import { MAX_ZIP_SIZE } from '@/lib/batch/types';

export const maxDuration = 15;

export async function POST(request: NextRequest) {
  const isAuth = await validateSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fileName, fileSize, generateBlog, mode, totalImages } = body as {
      fileName: unknown;
      fileSize: unknown;
      generateBlog: unknown;
      mode: unknown;
      totalImages: unknown;
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

    // Create job row (client-orchestrated: no S3 check needed)
    const [job] = await db
      .insert(batchUploadJobs)
      .values({
        fileName,
        fileSizeBytes: fileSize,
        totalImages: typeof totalImages === 'number' ? totalImages : 0,
        options: {
          generateBlog: !!generateBlog,
          mode: mode === 'standalone' ? 'standalone' : 'sites',
        },
        status: 'pending',
        startedAt: new Date(),
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
