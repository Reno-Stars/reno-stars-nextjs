import { NextRequest, NextResponse } from 'next/server';
import { validateSession, isValidUUID } from '@/lib/admin/auth';
import { generateBlogFromSite, generateBlogFromProject } from '@/app/actions/admin/generate-blog';

export const maxDuration = 60;

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
    const { entityType, entityId } = body as {
      entityType: 'site' | 'project';
      entityId: string;
    };

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'Missing entityType or entityId.' }, { status: 400 });
    }

    if (entityType !== 'site' && entityType !== 'project') {
      return NextResponse.json({ error: 'entityType must be "site" or "project".' }, { status: 400 });
    }

    if (!isValidUUID(entityId)) {
      return NextResponse.json({ error: 'Invalid entityId.' }, { status: 400 });
    }

    const generator = entityType === 'site' ? generateBlogFromSite : generateBlogFromProject;
    const result = await generator(entityId);

    if (result.blogPostId) {
      return NextResponse.json({ blogPostId: result.blogPostId });
    }

    return NextResponse.json(
      { error: result.error || 'Blog generation failed.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Generate blog error:', error);
    return NextResponse.json(
      { error: 'Blog generation failed.' },
      { status: 500 }
    );
  }
}
