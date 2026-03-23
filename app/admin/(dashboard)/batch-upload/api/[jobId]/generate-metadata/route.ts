import { NextRequest, NextResponse } from 'next/server';
import { validateSession, isValidUUID } from '@/lib/admin/auth';
import { getServiceTypeMap } from '@/lib/db/queries';
import {
  generateSiteMetadata,
  generateProjectMetadata,
} from '@/lib/batch/batch-processor';

export const maxDuration = 30;

export async function POST(
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
    const {
      entityType,
      folderName,
      serviceType,
      notes,
      skipFolderName,
      zipBaseName,
    } = body as {
      entityType: 'site' | 'project';
      folderName: string;
      serviceType?: string | null;
      notes?: string | null;
      skipFolderName?: boolean;
      zipBaseName?: string;
    };

    if (!entityType || typeof folderName !== 'string' || !folderName) {
      return NextResponse.json({ error: 'Missing entityType or folderName.' }, { status: 400 });
    }
    if (folderName.length > 500) {
      return NextResponse.json({ error: 'folderName too long.' }, { status: 400 });
    }

    if (entityType !== 'site' && entityType !== 'project') {
      return NextResponse.json({ error: 'entityType must be "site" or "project".' }, { status: 400 });
    }

    if (entityType === 'site') {
      const result = await generateSiteMetadata(folderName, notes ?? null);
      return NextResponse.json({ metadata: result });
    }

    // Project
    const serviceTypeMap = await getServiceTypeMap();
    const result = await generateProjectMetadata(
      folderName,
      serviceType ?? null,
      notes ?? null,
      serviceTypeMap,
      skipFolderName ?? false,
      zipBaseName
    );
    return NextResponse.json({ metadata: result });
  } catch (error) {
    console.error('Generate metadata error:', error);
    return NextResponse.json(
      { error: 'AI metadata generation failed.' },
      { status: 500 }
    );
  }
}
