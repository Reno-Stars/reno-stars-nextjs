import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { validateSession, isValidUUID } from '@/lib/admin/auth';
import { processBatchUpload } from '@/lib/batch/batch-processor';

export const maxDuration = 300;

export async function POST(
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

  // Use after() to run processing after the response is sent.
  // This ensures the function lifetime extends beyond the response on Vercel.
  after(async () => {
    try {
      await processBatchUpload(jobId);
    } catch (error) {
      console.error(`Batch processing failed for job ${jobId}:`, error);
    }
  });

  return NextResponse.json({ started: true });
}
