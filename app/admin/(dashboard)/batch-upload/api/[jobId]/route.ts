import { NextRequest, NextResponse } from 'next/server';
import { validateSession, isValidUUID } from '@/lib/admin/auth';
import { db } from '@/lib/db';
import { batchUploadJobs } from '@/lib/db/schema';
import type { BatchJobStatus } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const maxDuration = 15;

/** If a non-terminal job started processing more than 15 minutes ago, treat it as timed out.
 * Client-orchestrated pipeline can take 5-10 min for large batches (AI + uploads). */
const STALE_PROCESSING_MS = 15 * 60 * 1000;

/** If a job is still pending (waiting for S3 upload) after 30 minutes, consider it abandoned. */
const STALE_PENDING_MS = 30 * 60 * 1000;

const TERMINAL_STATUSES: BatchJobStatus[] = ['completed', 'failed', 'partial'];

const VALID_STATUSES: Set<string> = new Set<BatchJobStatus>([
  'pending', 'extracting', 'uploading', 'generating', 'saving',
  'generating_blog', 'completed', 'partial', 'failed',
]);

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
    let stale = false;

    if (status === 'pending') {
      const elapsed = Date.now() - new Date(job.createdAt).getTime();
      if (elapsed > STALE_PENDING_MS) {
        status = 'failed';
        stepLabel = 'Upload abandoned';
        errors.push('__TIMEOUT_FAILED__');
        stale = true;
      }
    } else if (job.startedAt) {
      const elapsed = Date.now() - new Date(job.startedAt).getTime();
      if (elapsed > STALE_PROCESSING_MS) {
        const hasCreations = (job.createdSiteIds?.length ?? 0) > 0 || (job.createdProjectIds?.length ?? 0) > 0;
        status = hasCreations ? 'partial' : 'failed';
        stepLabel = hasCreations
          ? 'Processing timed out — partial data was saved'
          : 'Processing timed out';
        errors.push(hasCreations ? '__TIMEOUT_PARTIAL__' : '__TIMEOUT_FAILED__');
        errors.push(`__TIMEOUT_STEP__:${job.status}`);
        stale = true;
      }
    }

    // Persist terminal status so repeated polls don't re-compute staleness
    if (stale) {
      db.update(batchUploadJobs)
        .set({ status, currentStepLabel: stepLabel, errors, completedAt: new Date() })
        .where(eq(batchUploadJobs.id, jobId))
        .catch(() => { /* non-critical persistence */ });
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

/**
 * PATCH — Client-driven job progress updates.
 * The client orchestrates the pipeline and pushes status updates here.
 */
export async function PATCH(
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

  try {
    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (body.status) {
      if (!VALID_STATUSES.has(body.status)) {
        return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
      }
      update.status = body.status;
    }
    if (body.currentStepLabel !== undefined) {
      if (typeof body.currentStepLabel !== 'string' && body.currentStepLabel !== null) {
        return NextResponse.json({ error: 'currentStepLabel must be a string or null.' }, { status: 400 });
      }
      update.currentStepLabel = body.currentStepLabel;
    }
    if (typeof body.processedImages === 'number' && Number.isFinite(body.processedImages) && body.processedImages >= 0) {
      update.processedImages = body.processedImages;
    }
    if (typeof body.totalImages === 'number' && Number.isFinite(body.totalImages) && body.totalImages >= 0) {
      update.totalImages = body.totalImages;
    }

    // Validate ID arrays contain only valid UUID strings
    const idArrayFields = ['createdSiteIds', 'createdProjectIds', 'createdBlogPostIds'] as const;
    for (const field of idArrayFields) {
      if (Array.isArray(body[field])) {
        if (!body[field].every((v: unknown) => typeof v === 'string' && isValidUUID(v))) {
          return NextResponse.json({ error: `${field} must contain valid UUIDs.` }, { status: 400 });
        }
        update[field] = body[field];
      }
    }

    if (Array.isArray(body.errors)) {
      if (!body.errors.every((v: unknown) => typeof v === 'string')) {
        return NextResponse.json({ error: 'errors must contain strings.' }, { status: 400 });
      }
      update.errors = body.errors;
    }
    if (body.startedAt) {
      const d = new Date(body.startedAt);
      if (!isNaN(d.getTime())) update.startedAt = d;
    }
    if (body.completedAt) {
      const d = new Date(body.completedAt);
      if (!isNaN(d.getTime())) update.completedAt = d;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
    }

    await db.update(batchUploadJobs).set(update).where(eq(batchUploadJobs.id, jobId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Job PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update job.' }, { status: 500 });
  }
}
