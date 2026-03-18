import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/admin/auth';
import { getS3Client, S3_BUCKET } from '@/lib/admin/s3';
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
      { error: 'Failed to initialize upload. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * PUT — Get a presigned URL for uploading a single part directly to S3.
 * Query params: ?uploadId=...&partNumber=...&contentLength=...
 * Returns { presignedUrl }.
 *
 * The client then PUTs the chunk body directly to S3 via the presigned URL,
 * bypassing Vercel's 4.5 MB body size limit.
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
  const contentLengthStr = searchParams.get('contentLength');

  if (!uploadId || !partNumberStr || !contentLengthStr) {
    return NextResponse.json({ error: 'Missing uploadId, partNumber, or contentLength.' }, { status: 400 });
  }

  const partNumber = parseInt(partNumberStr, 10);
  if (isNaN(partNumber) || partNumber < 1) {
    return NextResponse.json({ error: 'Invalid partNumber.' }, { status: 400 });
  }

  const contentLength = parseInt(contentLengthStr, 10);
  if (isNaN(contentLength) || contentLength < 1) {
    return NextResponse.json({ error: 'Invalid contentLength.' }, { status: 400 });
  }

  try {
    const client = getS3Client();
    if (!client) {
      return NextResponse.json({ error: 'S3 not configured.' }, { status: 500 });
    }

    const presignedUrl = await getSignedUrl(
      client,
      new UploadPartCommand({
        Bucket: S3_BUCKET,
        Key: batchZipKey(jobId),
        UploadId: uploadId,
        PartNumber: partNumber,
        ContentLength: contentLength,
      }),
      { expiresIn: 600 } // 10 minutes
    );

    return NextResponse.json({ presignedUrl });
  } catch (error) {
    console.error(`Part ${partNumber} presign error:`, error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH — Complete multipart upload.
 * Body JSON: { uploadId, totalParts }
 *
 * ETags are retrieved server-side via ListPartsCommand because browsers
 * cannot read the ETag header from cross-origin S3 responses (CORS).
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

  let uploadId: string | undefined;
  let totalParts: number | undefined;

  try {
    const body = (await request.json()) as {
      uploadId: unknown;
      totalParts: unknown;
    };
    if (typeof body.uploadId === 'string') uploadId = body.uploadId;
    if (typeof body.totalParts === 'number') totalParts = body.totalParts;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!uploadId || !totalParts || totalParts < 1) {
    return NextResponse.json({ error: 'Missing uploadId or totalParts.' }, { status: 400 });
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

    const key = batchZipKey(jobId);

    // Retrieve all uploaded parts with their ETags from S3.
    // Max 1000 parts per call; with 10 MB chunks and 1 GB max ZIP, we need at most ~100.
    const { Parts: s3Parts } = await client.send(
      new ListPartsCommand({
        Bucket: S3_BUCKET,
        Key: key,
        UploadId: uploadId,
        MaxParts: 1000,
      })
    );

    if (!s3Parts || s3Parts.length !== totalParts) {
      return NextResponse.json(
        { error: `Expected ${totalParts} parts but found ${s3Parts?.length ?? 0} on S3.` },
        { status: 400 }
      );
    }

    await client.send(
      new CompleteMultipartUploadCommand({
        Bucket: S3_BUCKET,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: s3Parts
            .sort((a, b) => (a.PartNumber ?? 0) - (b.PartNumber ?? 0))
            .map((p) => ({ PartNumber: p.PartNumber, ETag: p.ETag })),
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
      { error: 'Failed to complete upload. Please try again.' },
      { status: 500 }
    );
  }
}
