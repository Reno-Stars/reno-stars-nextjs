import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/admin/auth';
import { getS3Client, S3_BUCKET } from '@/lib/admin/s3';
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { db } from '@/lib/db';
import { batchUploadJobs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { batchZipKey } from '@/lib/batch/types';

export const maxDuration = 300;

/** Verify the job exists and is still pending. */
async function verifyPendingJob(jobId: string): Promise<{ error: string; status: number } | null> {
  const [job] = await db
    .select({ id: batchUploadJobs.id, status: batchUploadJobs.status })
    .from(batchUploadJobs)
    .where(eq(batchUploadJobs.id, jobId))
    .limit(1);

  if (!job) return { error: 'Job not found.', status: 404 };
  if (job.status !== 'pending') return { error: 'Job already started.', status: 409 };
  return null;
}

/**
 * POST — Initialize S3 multipart upload.
 * Returns { uploadId } to use for subsequent part uploads.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const isAuth = await validateSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { jobId } = await params;

  try {
    const jobError = await verifyPendingJob(jobId);
    if (jobError) {
      return NextResponse.json({ error: jobError.error }, { status: jobError.status });
    }

    const client = getS3Client();
    if (!client) {
      return NextResponse.json({ error: 'S3 not configured.' }, { status: 500 });
    }

    const { UploadId } = await client.send(
      new CreateMultipartUploadCommand({
        Bucket: S3_BUCKET,
        Key: batchZipKey(jobId),
        ContentType: 'application/zip',
      })
    );

    if (!UploadId) {
      return NextResponse.json({ error: 'Failed to init multipart upload.' }, { status: 500 });
    }

    return NextResponse.json({ uploadId: UploadId });
  } catch (error) {
    console.error('Multipart init error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload init failed.' },
      { status: 500 }
    );
  }
}

/**
 * PUT — Upload a single part.
 * Query params: ?uploadId=...&partNumber=...
 * Body: raw chunk data.
 * Returns { etag }.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const isAuth = await validateSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { jobId } = await params;
  const { searchParams } = new URL(request.url);
  const uploadId = searchParams.get('uploadId');
  const partNumberStr = searchParams.get('partNumber');

  if (!uploadId || !partNumberStr) {
    return NextResponse.json({ error: 'Missing uploadId or partNumber.' }, { status: 400 });
  }

  const partNumber = parseInt(partNumberStr, 10);
  if (isNaN(partNumber) || partNumber < 1) {
    return NextResponse.json({ error: 'Invalid partNumber.' }, { status: 400 });
  }

  try {
    // Skip DB verification per-chunk — job was verified on POST (init) and
    // will be verified again on PATCH (complete). Avoids ~100 DB queries for 1 GB.
    const client = getS3Client();
    if (!client) {
      return NextResponse.json({ error: 'S3 not configured.' }, { status: 500 });
    }

    const body = await request.arrayBuffer();
    if (body.byteLength === 0) {
      return NextResponse.json({ error: 'Empty chunk.' }, { status: 400 });
    }

    const { ETag } = await client.send(
      new UploadPartCommand({
        Bucket: S3_BUCKET,
        Key: batchZipKey(jobId),
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: new Uint8Array(body),
      })
    );

    return NextResponse.json({ etag: ETag });
  } catch (error) {
    console.error(`Part ${partNumber} upload error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Part upload failed.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH — Complete multipart upload.
 * Body JSON: { uploadId, parts: [{ partNumber, etag }] }
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

  // Parse body once — used for both complete and abort-on-failure.
  let uploadId: string | undefined;
  let parts: { partNumber: number; etag: string }[] | undefined;

  try {
    const body = (await request.json()) as {
      uploadId: unknown;
      parts: unknown;
    };
    if (typeof body.uploadId === 'string') uploadId = body.uploadId;
    if (Array.isArray(body.parts)) parts = body.parts;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!uploadId || !parts || parts.length === 0) {
    return NextResponse.json({ error: 'Invalid completion request.' }, { status: 400 });
  }

  // Validate each part has the required shape
  const validParts = parts.every(
    (p): p is { partNumber: number; etag: string } =>
      typeof p === 'object' && p !== null &&
      typeof p.partNumber === 'number' && p.partNumber >= 1 &&
      typeof p.etag === 'string' && p.etag.length > 0
  );
  if (!validParts) {
    return NextResponse.json({ error: 'Invalid part entries.' }, { status: 400 });
  }

  try {
    const jobError = await verifyPendingJob(jobId);
    if (jobError) {
      return NextResponse.json({ error: jobError.error }, { status: jobError.status });
    }

    const client = getS3Client();
    if (!client) {
      return NextResponse.json({ error: 'S3 not configured.' }, { status: 500 });
    }

    await client.send(
      new CompleteMultipartUploadCommand({
        Bucket: S3_BUCKET,
        Key: batchZipKey(jobId),
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts
            .sort((a, b) => a.partNumber - b.partNumber)
            .map((p) => ({ PartNumber: p.partNumber, ETag: p.etag })),
        },
      })
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Multipart complete error:', error);

    // Best-effort abort of the multipart upload
    try {
      const client = getS3Client();
      if (client && uploadId) {
        await client.send(
          new AbortMultipartUploadCommand({
            Bucket: S3_BUCKET,
            Key: batchZipKey(jobId),
            UploadId: uploadId,
          })
        );
      }
    } catch {
      // Best-effort abort
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload completion failed.' },
      { status: 500 }
    );
  }
}
