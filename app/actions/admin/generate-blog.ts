'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import {
  blogPosts,
  projects as projectsTable,
  projectImagePairs as projectImagePairsTable,
  projectScopes as projectScopesTable,
  projectExternalProducts as projectExternalProductsTable,
  projectSites as sitesTable,
} from '@/lib/db/schema';
import type { DbProjectImagePair, DbProjectScope, DbProjectExternalProduct, DbProject } from '@/lib/db/schema';
import { eq, asc, inArray } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { ensureUniqueSlug } from '@/lib/utils';
import {
  generateBlogFromProjectData,
  generateBlogFromSiteData,
} from '@/lib/ai/blog-generator';

/**
 * Generate a blog post from a single project's data using AI.
 * Creates a draft (unpublished) blog post linked to the project.
 */
export async function generateBlogFromProject(
  projectId: string
): Promise<{ success?: boolean; blogPostId?: string; error?: string }> {
  await requireAuth();

  if (!isValidUUID(projectId)) {
    return { error: 'Invalid project ID.' };
  }

  try {
    // Fetch project and relations in parallel
    const [projectRows, imagePairs, scopes, externalProducts] = await Promise.all([
      db.select().from(projectsTable).where(eq(projectsTable.id, projectId)).limit(1) as Promise<DbProject[]>,
      db
        .select()
        .from(projectImagePairsTable)
        .where(eq(projectImagePairsTable.projectId, projectId))
        .orderBy(asc(projectImagePairsTable.displayOrder)) as Promise<DbProjectImagePair[]>,
      db
        .select()
        .from(projectScopesTable)
        .where(eq(projectScopesTable.projectId, projectId))
        .orderBy(asc(projectScopesTable.displayOrder)) as Promise<DbProjectScope[]>,
      db
        .select()
        .from(projectExternalProductsTable)
        .where(eq(projectExternalProductsTable.projectId, projectId))
        .orderBy(asc(projectExternalProductsTable.displayOrder)) as Promise<DbProjectExternalProduct[]>,
    ]);

    const project = projectRows[0];
    if (!project) {
      return { error: 'Project not found.' };
    }

    // Call AI to generate blog content
    const generated = await generateBlogFromProjectData({
      slug: project.slug,
      titleEn: project.titleEn,
      titleZh: project.titleZh,
      descriptionEn: project.descriptionEn,
      descriptionZh: project.descriptionZh,
      serviceType: project.serviceType,
      locationCity: project.locationCity,
      budgetRange: project.budgetRange,
      durationEn: project.durationEn,
      durationZh: project.durationZh,
      heroImageUrl: project.heroImageUrl,
      challengeEn: project.challengeEn,
      challengeZh: project.challengeZh,
      solutionEn: project.solutionEn,
      solutionZh: project.solutionZh,
      scopes: scopes.map((s) => ({ scopeEn: s.scopeEn, scopeZh: s.scopeZh })),
      externalProducts: externalProducts.map((ep) => ({
        url: ep.url,
        labelEn: ep.labelEn,
        labelZh: ep.labelZh,
      })),
      imagePairs: imagePairs.map((ip) => ({
        beforeImageUrl: ip.beforeImageUrl,
        beforeAltTextEn: ip.beforeAltTextEn,
        afterImageUrl: ip.afterImageUrl,
        afterAltTextEn: ip.afterAltTextEn,
      })),
    });

    // Ensure unique slug
    const allSlugs = await db.select({ slug: blogPosts.slug }).from(blogPosts);
    const slug = ensureUniqueSlug(
      generated.slug,
      allSlugs.map((r: { slug: string }) => r.slug)
    );

    // Insert draft blog post
    const inserted = await db
      .insert(blogPosts)
      .values({
        slug,
        titleEn: generated.titleEn,
        titleZh: generated.titleZh,
        contentEn: generated.contentEn,
        contentZh: generated.contentZh,
        excerptEn: generated.excerptEn,
        excerptZh: generated.excerptZh,
        metaTitleEn: generated.metaTitleEn,
        metaTitleZh: generated.metaTitleZh,
        metaDescriptionEn: generated.metaDescriptionEn,
        metaDescriptionZh: generated.metaDescriptionZh,
        focusKeywordEn: generated.focusKeywordEn,
        focusKeywordZh: generated.focusKeywordZh,
        seoKeywordsEn: generated.seoKeywordsEn,
        seoKeywordsZh: generated.seoKeywordsZh,
        readingTimeMinutes: generated.readingTimeMinutes,
        featuredImageUrl: project.heroImageUrl,
        projectId,
        isPublished: false,
        author: 'Reno Stars',
      })
      .returning({ id: blogPosts.id });

    revalidatePath('/admin/blog');

    return { success: true, blogPostId: inserted[0].id };
  } catch (error) {
    console.error('Failed to generate blog from project:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to generate blog post.';
    return { error: message };
  }
}

/**
 * Generate a blog post from a site (whole-house) and all its child projects using AI.
 * Creates a draft (unpublished) blog post linked to the first child project.
 */
export async function generateBlogFromSite(
  siteId: string
): Promise<{ success?: boolean; blogPostId?: string; error?: string }> {
  await requireAuth();

  if (!isValidUUID(siteId)) {
    return { error: 'Invalid site ID.' };
  }

  try {
    // Fetch site
    const siteRows = await db
      .select()
      .from(sitesTable)
      .where(eq(sitesTable.id, siteId))
      .limit(1);
    const site = siteRows[0];
    if (!site) {
      return { error: 'Site not found.' };
    }

    // Fetch all child projects
    const projectRows: DbProject[] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.siteId, siteId))
      .orderBy(asc(projectsTable.displayOrderInSite));

    if (projectRows.length === 0) {
      return { error: 'Site has no projects to generate a blog post from.' };
    }

    // Fetch relations for all projects in parallel
    const projectIds = projectRows.map((p) => p.id);
    const [imagePairs, scopes, externalProducts] = await Promise.all([
      db
        .select()
        .from(projectImagePairsTable)
        .where(inArray(projectImagePairsTable.projectId, projectIds))
        .orderBy(asc(projectImagePairsTable.displayOrder)) as Promise<DbProjectImagePair[]>,
      db
        .select()
        .from(projectScopesTable)
        .where(inArray(projectScopesTable.projectId, projectIds))
        .orderBy(asc(projectScopesTable.displayOrder)) as Promise<DbProjectScope[]>,
      db
        .select()
        .from(projectExternalProductsTable)
        .where(inArray(projectExternalProductsTable.projectId, projectIds))
        .orderBy(asc(projectExternalProductsTable.displayOrder)) as Promise<DbProjectExternalProduct[]>,
    ]);

    // Group relations by projectId
    const imagePairsByProject = new Map<string, DbProjectImagePair[]>();
    for (const ip of imagePairs) {
      const arr = imagePairsByProject.get(ip.projectId) ?? [];
      arr.push(ip);
      imagePairsByProject.set(ip.projectId, arr);
    }
    const scopesByProject = new Map<string, DbProjectScope[]>();
    for (const s of scopes) {
      const arr = scopesByProject.get(s.projectId) ?? [];
      arr.push(s);
      scopesByProject.set(s.projectId, arr);
    }
    const epByProject = new Map<string, DbProjectExternalProduct[]>();
    for (const ep of externalProducts) {
      const arr = epByProject.get(ep.projectId) ?? [];
      arr.push(ep);
      epByProject.set(ep.projectId, arr);
    }

    // Build project data array
    const projectDataArray = projectRows.map((p) => {
      const pImagePairs = imagePairsByProject.get(p.id) ?? [];
      const pScopes = scopesByProject.get(p.id) ?? [];
      const pProducts = epByProject.get(p.id) ?? [];
      return {
        slug: p.slug,
        titleEn: p.titleEn,
        titleZh: p.titleZh,
        descriptionEn: p.descriptionEn,
        descriptionZh: p.descriptionZh,
        serviceType: p.serviceType,
        locationCity: p.locationCity,
        budgetRange: p.budgetRange,
        durationEn: p.durationEn,
        durationZh: p.durationZh,
        heroImageUrl: p.heroImageUrl,
        challengeEn: p.challengeEn,
        challengeZh: p.challengeZh,
        solutionEn: p.solutionEn,
        solutionZh: p.solutionZh,
        scopes: pScopes.map((s) => ({ scopeEn: s.scopeEn, scopeZh: s.scopeZh })),
        externalProducts: pProducts.map((ep) => ({
          url: ep.url,
          labelEn: ep.labelEn,
          labelZh: ep.labelZh,
        })),
        imagePairs: pImagePairs.map((ip) => ({
          beforeImageUrl: ip.beforeImageUrl,
          beforeAltTextEn: ip.beforeAltTextEn,
          afterImageUrl: ip.afterImageUrl,
          afterAltTextEn: ip.afterAltTextEn,
        })),
      };
    });

    // Call AI to generate blog content
    const generated = await generateBlogFromSiteData(
      {
        slug: site.slug,
        titleEn: site.titleEn,
        titleZh: site.titleZh,
        descriptionEn: site.descriptionEn,
        descriptionZh: site.descriptionZh,
        locationCity: site.locationCity,
        heroImageUrl: site.heroImageUrl,
      },
      projectDataArray
    );

    // Ensure unique slug
    const allSlugs = await db.select({ slug: blogPosts.slug }).from(blogPosts);
    const slug = ensureUniqueSlug(
      generated.slug,
      allSlugs.map((r: { slug: string }) => r.slug)
    );

    // Insert draft blog post (link to first child project for product display)
    const inserted = await db
      .insert(blogPosts)
      .values({
        slug,
        titleEn: generated.titleEn,
        titleZh: generated.titleZh,
        contentEn: generated.contentEn,
        contentZh: generated.contentZh,
        excerptEn: generated.excerptEn,
        excerptZh: generated.excerptZh,
        metaTitleEn: generated.metaTitleEn,
        metaTitleZh: generated.metaTitleZh,
        metaDescriptionEn: generated.metaDescriptionEn,
        metaDescriptionZh: generated.metaDescriptionZh,
        focusKeywordEn: generated.focusKeywordEn,
        focusKeywordZh: generated.focusKeywordZh,
        seoKeywordsEn: generated.seoKeywordsEn,
        seoKeywordsZh: generated.seoKeywordsZh,
        readingTimeMinutes: generated.readingTimeMinutes,
        featuredImageUrl: site.heroImageUrl ?? projectRows[0].heroImageUrl,
        projectId: projectRows[0].id,
        isPublished: false,
        author: 'Reno Stars',
      })
      .returning({ id: blogPosts.id });

    revalidatePath('/admin/blog');

    return { success: true, blogPostId: inserted[0].id };
  } catch (error) {
    console.error('Failed to generate blog from site:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to generate blog post.';
    return { error: message };
  }
}
