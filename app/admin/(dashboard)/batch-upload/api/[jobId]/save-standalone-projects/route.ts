import { NextRequest, NextResponse } from 'next/server';
import { validateSession, isValidUUID } from '@/lib/admin/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getServiceTypeMap, ensureStandaloneSite } from '@/lib/db/queries';
import {
  getExistingSlugs,
  saveProjectFromUrls,
  type SaveProjectInput,
} from '@/lib/batch/batch-processor';
import type { ProjectDescription } from '@/lib/ai/content-optimizer';
import type { BatchError } from '@/lib/batch/types';

export const maxDuration = 30;

interface SaveStandaloneBody {
  items: {
    project: SaveProjectInput;
    aiMetadata: ProjectDescription | null;
  }[];
  zipBaseName?: string;
}

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

  const errors: BatchError[] = [];
  const createdProjectIds: string[] = [];

  try {
    const body = await request.json();

    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 20) {
      return NextResponse.json({ error: 'Provide 1-20 items.' }, { status: 400 });
    }
    for (const i of body.items) {
      if (!i || typeof i !== 'object' || !('project' in i) ||
          !i.project || typeof i.project !== 'object' || !('folderName' in i.project) ||
          typeof i.project.folderName !== 'string') {
        return NextResponse.json({ error: 'Invalid project data in items.' }, { status: 400 });
      }
    }

    const { items, zipBaseName } = body as SaveStandaloneBody;

    const serviceTypeMap = await getServiceTypeMap();
    const standaloneSiteId = await ensureStandaloneSite();

    // Get next display order
    const [maxRow] = await db
      .select({ max: sql<number>`coalesce(max(${projects.displayOrderInSite}), -1)` })
      .from(projects)
      .where(eq(projects.siteId, standaloneSiteId));
    let nextDisplayOrder = Number(maxRow?.max ?? -1) + 1;

    const existingProjectSlugs = await getExistingSlugs('projects');

    for (const { project, aiMetadata } of items) {
      try {
        const projectId = await saveProjectFromUrls({
          project,
          aiProject: aiMetadata,
          siteId: standaloneSiteId,
          displayOrder: nextDisplayOrder++,
          existingProjectSlugs,
          errors,
          serviceTypeMap,
          zipBaseName,
        });
        createdProjectIds.push(projectId);
      } catch (error) {
        errors.push({
          message: `Project "${project.folderName}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'critical',
        });
      }
    }

    return NextResponse.json({
      projectIds: createdProjectIds,
      errors: errors.map((e) => ({ message: e.message, severity: e.severity })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        projectIds: createdProjectIds,
        errors: [
          ...errors.map((e) => ({ message: e.message, severity: e.severity })),
          { message: error instanceof Error ? error.message : 'Unknown error', severity: 'critical' as const },
        ],
      },
      { status: 500 }
    );
  }
}
