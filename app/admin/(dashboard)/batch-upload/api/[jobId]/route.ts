import { NextRequest, NextResponse } from 'next/server';
import { validateSession, isValidUUID } from '@/lib/admin/auth';
import { db } from '@/lib/db';
import { batchUploadJobs } from '@/lib/db/schema';
import type { BatchJobStatus } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/** If a non-terminal job started processing more than 2 minutes ago, treat it as timed out.
 * Vercel Hobby plan has 60s function timeout; extra buffer for clock skew. */
const STALE_PROCESSING_MS = 2 * 60 * 1000;

/** If a job is still pending (waiting for S3 upload) after 30 minutes, consider it abandoned. */
const STALE_PENDING_MS = 30 * 60 * 1000;

const TERMINAL_STATUSES: BatchJobStatus[] = ['completed', 'failed', 'partial'];

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

  // Detect stale jobs: pending jobs abandoned after 30 min, or
  // processing jobs that timed out after 2 min (Vercel 60s + buffer).
  let status: BatchJobStatus = job.status;
  let stepLabel = job.currentStepLabel;
  const errors: string[] = [...(job.errors ?? [])];

  if (!TERMINAL_STATUSES.includes(status)) {
    if (status === 'pending') {
      // Pending = waiting for S3 upload. Use createdAt since startedAt isn't set yet.
      const elapsed = Date.now() - new Date(job.createdAt).getTime();
      if (elapsed > STALE_PENDING_MS) {
        status = 'failed';
        stepLabel = 'Upload abandoned';
        errors.push('__TIMEOUT_FAILED__');
      }
    } else if (job.startedAt) {
      // Processing started but didn't finish within the timeout window.
      const elapsed = Date.now() - new Date(job.startedAt).getTime();
      if (elapsed > STALE_PROCESSING_MS) {
        const hasCreations = (job.createdSiteIds?.length ?? 0) > 0 || (job.createdProjectIds?.length ?? 0) > 0;
        status = hasCreations ? 'partial' : 'failed';
        stepLabel = hasCreations
          ? 'Processing timed out — partial data was saved'
          : 'Processing timed out';
        errors.push(hasCreations ? '__TIMEOUT_PARTIAL__' : '__TIMEOUT_FAILED__');
        errors.push(`__TIMEOUT_STEP__:${job.status}`);
      }
    }
  }

  return NextResponse.json({
    id: job.id,
    status,
    fileName: job.fileName,
    totalImages: job.totalImages,
    processedImages: job.processedImages,
    currentStepLabel: stepLabel,
    createdSiteIds: job.createdSiteIds ?? [],
    createdProjectIds: job.createdProjectIds ?? [],
    createdBlogPostIds: job.createdBlogPostIds ?? [],
    errors,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
  });
}
