import { NextRequest, NextResponse } from 'next/server';
import { validateSession, isValidUUID } from '@/lib/admin/auth';
import { db } from '@/lib/db';
import { projectSites, siteImagePairs, siteExternalProducts } from '@/lib/db/schema';
import { getServiceTypeMap } from '@/lib/db/queries';
import { ensureUniqueSlug, formatSlug } from '@/lib/utils';
import { SPACE_TYPE_TO_ZH } from '@/lib/admin/constants';
import {
  fallbackSiteData,
  getExistingSlugs,
  cleanupOrphanedSite,
  saveProjectFromUrls,
  parseProductsFile,
  type SaveProjectInput,
} from '@/lib/batch/batch-processor';
import type { SiteDescription, ProjectDescription } from '@/lib/ai/content-optimizer';
import type { BatchError } from '@/lib/batch/types';

export const maxDuration = 30;

interface SaveSiteBody {
  site: {
    folderName: string;
    heroImageUrl: string | null;
    imagePairs: { index: number; beforeUrl: string | null; afterUrl: string | null }[];
    productsText: string | null;
    productImageUrls: Record<number, string>;
    aiMetadata: SiteDescription | null;
  };
  projects: {
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
  let siteId: string | null = null;

  try {
    const body = await request.json();

    if (!body.site || typeof body.site.folderName !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid site data.' }, { status: 400 });
    }
    if (!Array.isArray(body.projects)) {
      return NextResponse.json({ error: 'Missing projects array.' }, { status: 400 });
    }
    for (const p of body.projects) {
      if (!p || typeof p !== 'object' || !('project' in p) ||
          !p.project || typeof p.project !== 'object' || !('folderName' in p.project) ||
          typeof p.project.folderName !== 'string') {
        return NextResponse.json({ error: 'Invalid project data in array.' }, { status: 400 });
      }
    }

    const { site, projects, zipBaseName } = body as SaveSiteBody;

    const serviceTypeMap = await getServiceTypeMap();
    const siteData = site.aiMetadata ?? fallbackSiteData(site.folderName);

    const existingSiteSlugs = await getExistingSlugs('sites');
    const siteSlug = ensureUniqueSlug(
      formatSlug(siteData.slug || site.folderName),
      existingSiteSlugs
    );

    const [insertedSite] = await db
      .insert(projectSites)
      .values({
        slug: siteSlug,
        titleEn: siteData.titleEn,
        titleZh: siteData.titleZh,
        descriptionEn: siteData.descriptionEn,
        descriptionZh: siteData.descriptionZh,
        locationCity: siteData.locationCity || null,
        heroImageUrl: site.heroImageUrl,
        badgeEn: siteData.badgeEn || null,
        badgeZh: siteData.badgeZh || null,
        excerptEn: siteData.excerptEn || null,
        excerptZh: siteData.excerptZh || null,
        metaTitleEn: siteData.metaTitleEn || null,
        metaTitleZh: siteData.metaTitleZh || null,
        metaDescriptionEn: siteData.metaDescriptionEn || null,
        metaDescriptionZh: siteData.metaDescriptionZh || null,
        focusKeywordEn: siteData.focusKeywordEn || null,
        focusKeywordZh: siteData.focusKeywordZh || null,
        seoKeywordsEn: siteData.seoKeywordsEn || null,
        seoKeywordsZh: siteData.seoKeywordsZh || null,
        budgetRange: siteData.budgetRange || null,
        durationEn: siteData.durationEn || null,
        durationZh: siteData.durationZh || null,
        spaceTypeEn: siteData.spaceTypeEn || null,
        spaceTypeZh: (siteData.spaceTypeEn && SPACE_TYPE_TO_ZH[siteData.spaceTypeEn]) || null,
        poNumber: siteData.poNumber || null,
        showAsProject: true,
        featured: false,
        isPublished: false,
      })
      .returning({ id: projectSites.id });

    siteId = insertedSite.id;

    // Insert site-level image pairs (batched)
    const sitePairValues = site.imagePairs
      .map((pair, pairIdx) => {
        if (!pair.beforeUrl && !pair.afterUrl) return null;
        return {
          siteId: siteId!,
          beforeImageUrl: pair.beforeUrl,
          beforeAltTextEn: pair.beforeUrl ? `${siteData.titleEn} - Before ${pairIdx + 1}` : null,
          beforeAltTextZh: pair.beforeUrl ? `${siteData.titleZh} - 改造前 ${pairIdx + 1}` : null,
          afterImageUrl: pair.afterUrl,
          afterAltTextEn: pair.afterUrl ? `${siteData.titleEn} - After ${pairIdx + 1}` : null,
          afterAltTextZh: pair.afterUrl ? `${siteData.titleZh} - 改造后 ${pairIdx + 1}` : null,
          displayOrder: pairIdx,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);

    if (sitePairValues.length > 0) {
      try {
        await db.insert(siteImagePairs).values(sitePairValues);
      } catch (error) {
        errors.push({
          message: `Site image pairs for "${site.folderName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'warning',
        });
      }
    }

    // Insert site-level external products
    if (site.productsText) {
      const parsedProducts = parseProductsFile(site.productsText);
      if (parsedProducts.length > 0) {
        try {
          await db.insert(siteExternalProducts).values(
            parsedProducts.map((ep, idx) => ({
              siteId: siteId!,
              url: ep.url,
              imageUrl: site.productImageUrls[idx + 1] ?? ep.imageUrl,
              labelEn: ep.labelEn,
              labelZh: ep.labelZh,
              displayOrder: idx,
            }))
          );
        } catch (error) {
          errors.push({
            message: `External products for "${site.folderName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'warning',
          });
        }
      }
    }

    // Save child projects
    const existingProjectSlugs = await getExistingSlugs('projects');
    let projectsCreated = 0;
    // siteId is guaranteed non-null here (set by insert above)
    const confirmedSiteId: string = siteId!;

    for (let pIdx = 0; pIdx < projects.length; pIdx++) {
      const { project, aiMetadata } = projects[pIdx];
      try {
        const projectId = await saveProjectFromUrls({
          project,
          aiProject: aiMetadata,
          siteId: confirmedSiteId,
          displayOrder: pIdx,
          existingProjectSlugs,
          errors,
          serviceTypeMap,
          zipBaseName,
        });
        createdProjectIds.push(projectId);
        projectsCreated++;
      } catch (error) {
        errors.push({
          message: `Project "${project.folderName}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'critical',
        });
      }
    }

    // Cleanup orphaned site
    if (projectsCreated === 0 && sitePairValues.length === 0) {
      await cleanupOrphanedSite(confirmedSiteId);
      siteId = null;
      errors.push({
        message: `Site "${site.folderName}" removed: all child projects failed.`,
        severity: 'critical',
      });
    }

    return NextResponse.json({
      siteId,
      projectIds: createdProjectIds,
      errors: errors.map((e) => ({ message: e.message, severity: e.severity })),
    });
  } catch (error) {
    if (siteId) {
      await cleanupOrphanedSite(siteId);
    }
    return NextResponse.json(
      {
        siteId: null,
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
