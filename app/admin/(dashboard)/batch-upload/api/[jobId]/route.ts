import { NextRequest, NextResponse } from 'next/server';
import { validateSession, isValidUUID } from '@/lib/admin/auth';
import { db } from '@/lib/db';
import { batchUploadJobs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
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

  const [job] = await db
    .select()
    .from(batchUploadJobs)
    .where(eq(batchUploadJobs.id, jobId))
    .limit(1);

  if (!job) {
    return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    fileName: job.fileName,
    totalImages: job.totalImages,
    processedImages: job.processedImages,
    currentStepLabel: job.currentStepLabel,
    createdSiteIds: job.createdSiteIds ?? [],
    createdProjectIds: job.createdProjectIds ?? [],
    createdBlogPostIds: job.createdBlogPostIds ?? [],
    errors: job.errors ?? [],
    startedAt: job.startedAt,
    completedAt: job.completedAt,
  });
}
