/**
 * POST /admin/api/process-image
 * Triggered after an image upload completes.
 * Generates WebP variants at all srcset widths and stores them in R2.
 *
 * Body: { url: string, force?: boolean }
 * Response: { ok: boolean, variants: ProcessedVariant[], skipped?: boolean, error?: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/admin/auth';
import { processImage } from '@/lib/admin/image-process';

export const maxDuration = 60; // sharp processing can be slow for large images

export async function POST(request: NextRequest) {
  const isAuth = await validateSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let url: string;
  let force: boolean;
  try {
    const body = await request.json();
    url = body.url;
    force = body.force === true;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  // Only allow R2 URLs
  const s3PublicUrl = process.env.S3_PUBLIC_URL || '';
  if (!url.startsWith(s3PublicUrl)) {
    return NextResponse.json({ error: 'URL not from configured R2 bucket' }, { status: 400 });
  }

  const result = await processImage(url, force);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
