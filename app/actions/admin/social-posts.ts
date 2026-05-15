'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import {
  socialMediaPosts,
  blogPosts,
  projects as projectsTable,
  projectImagePairs as projectImagePairsTable,
  projectScopes as projectScopesTable,
  projectExternalProducts as projectExternalProductsTable,
  projectSites as sitesTable,
  siteImagePairs as siteImagePairsTable,
} from '@/lib/db/schema';
import { triggerDeploy } from '@/lib/deploy-hook';
import type { DbProject, DbProjectImagePair, DbProjectScope, DbProjectExternalProduct } from '@/lib/db/schema';
import { eq, asc, inArray } from 'drizzle-orm';
import { groupBy } from '@/lib/db/queries';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, validateTextLengths, MAX_TEXT_LENGTH, MAX_SHORT_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { z } from 'zod';
import {
  generateSocialPostsFromBlog,
  generateSocialPostsFromProject,
  generateSocialPostsFromSite,
  type SocialPostGeneration,
} from '@/lib/ai/social-post-generator';

// ============================================================================
// Helpers
// ============================================================================

const VALID_SOCIAL_POST_STATUSES = ['draft', 'ready', 'published'] as const;
type SocialPostStatus = typeof VALID_SOCIAL_POST_STATUSES[number];

const selectedImageUrlsSchema = z.array(z.string().url()).max(50);

const PUBLISHED_URL_PLATFORMS = [
  'instagram',
  'facebook',
  'xiaohongshu',
  'tiktok',
  'youtube',
  'linkedin',
  'twitter',
  'reddit',
  'google_posts',
] as const;
const publishedUrlsSchema = z.record(
  z.enum(PUBLISHED_URL_PLATFORMS),
  z.string().url(),
);

function getSocialPostData(formData: FormData) {
  const rawStatus = getString(formData, 'status') || 'draft';
  if (!(VALID_SOCIAL_POST_STATUSES as readonly string[]).includes(rawStatus)) {
    return { error: 'Invalid status.' } as const;
  }
  const status = rawStatus as SocialPostStatus;
  const scheduledAtStr = getString(formData, 'scheduledAt');
  const scheduledAt = scheduledAtStr ? new Date(scheduledAtStr) : null;

  // Parse source FK — only one should be set
  const blogPostId = getString(formData, 'blogPostId') || null;
  const projectId = getString(formData, 'projectId') || null;
  const siteId = getString(formData, 'siteId') || null;

  // Parse and validate selected image URLs from JSON
  let selectedImageUrls: string[] = [];
  const selectedImagesRaw = getString(formData, 'selectedImageUrls');
  if (selectedImagesRaw) {
    try {
      const parsed = JSON.parse(selectedImagesRaw);
      const validated = selectedImageUrlsSchema.safeParse(parsed);
      if (!validated.success) {
        return { error: 'Invalid image selection. Please re-select images and try again.' };
      }
      selectedImageUrls = validated.data;
    } catch (err) {
      console.error('Failed to parse selectedImageUrls JSON:', err);
      return { error: 'Invalid image selection. Please re-select images and try again.' };
    }
  }

  // Validate text field lengths
  const titleEn = getString(formData, 'titleEn').trim();
  const titleZh = getString(formData, 'titleZh').trim();
  const instagramCaptionEn = getString(formData, 'instagramCaptionEn') || null;
  const instagramCaptionZh = getString(formData, 'instagramCaptionZh') || null;
  const instagramHashtagsEn = getString(formData, 'instagramHashtagsEn') || null;
  const instagramHashtagsZh = getString(formData, 'instagramHashtagsZh') || null;
  const facebookCaptionEn = getString(formData, 'facebookCaptionEn') || null;
  const facebookCaptionZh = getString(formData, 'facebookCaptionZh') || null;
  const facebookHashtagsEn = getString(formData, 'facebookHashtagsEn') || null;
  const facebookHashtagsZh = getString(formData, 'facebookHashtagsZh') || null;
  const xiaohongshuCaptionZh = getString(formData, 'xiaohongshuCaptionZh') || null;
  const xiaohongshuCaptionEn = getString(formData, 'xiaohongshuCaptionEn') || null;
  const xiaohongshuTopicTagsZh = getString(formData, 'xiaohongshuTopicTagsZh') || null;
  const notes = getString(formData, 'notes') || null;

  // Per-platform live post URLs. The social-media-poster cron records these
  // after publishing; admins can also edit them by hand. Stored as JSONB
  // { platform: url } in `social_media_posts.published_urls`. Form sends
  // either the JSON blob ("publishedUrls") or individual fields
  // ("publishedUrl.instagram", "publishedUrl.x", etc.) — we accept both.
  let publishedUrls: Record<string, string> = {};
  const publishedUrlsRaw = getString(formData, 'publishedUrls');
  if (publishedUrlsRaw) {
    try {
      const parsed = JSON.parse(publishedUrlsRaw);
      const validated = publishedUrlsSchema.safeParse(parsed);
      if (!validated.success) {
        return { error: 'Invalid published URLs. Each value must be a full URL on a supported platform.' } as const;
      }
      publishedUrls = validated.data;
    } catch (err) {
      console.error('Failed to parse publishedUrls JSON:', err);
      return { error: 'Invalid published URLs JSON.' } as const;
    }
  } else {
    const collected: Record<string, string> = {};
    for (const platform of PUBLISHED_URL_PLATFORMS) {
      const v = getString(formData, `publishedUrl.${platform}`).trim();
      if (v) collected[platform] = v;
    }
    if (Object.keys(collected).length > 0) {
      const validated = publishedUrlsSchema.safeParse(collected);
      if (!validated.success) {
        return { error: 'Invalid published URL — each must be a full URL.' } as const;
      }
      publishedUrls = validated.data;
    }
  }

  const shortTextError = validateTextLengths({ titleEn, titleZh }, MAX_SHORT_TEXT_LENGTH);
  if (shortTextError) return { error: shortTextError } as const;

  const textError = validateTextLengths({
    instagramCaptionEn, instagramCaptionZh, instagramHashtagsEn, instagramHashtagsZh,
    facebookCaptionEn, facebookCaptionZh, facebookHashtagsEn, facebookHashtagsZh,
    xiaohongshuCaptionZh, xiaohongshuCaptionEn, xiaohongshuTopicTagsZh, notes,
  }, MAX_TEXT_LENGTH);
  if (textError) return { error: textError } as const;

  return {
    titleEn,
    titleZh,
    instagramCaptionEn,
    instagramCaptionZh,
    instagramHashtagsEn,
    instagramHashtagsZh,
    facebookCaptionEn,
    facebookCaptionZh,
    facebookHashtagsEn,
    facebookHashtagsZh,
    xiaohongshuCaptionZh,
    xiaohongshuCaptionEn,
    xiaohongshuTopicTagsZh,
    selectedImageUrls,
    blogPostId,
    projectId,
    siteId,
    status,
    scheduledAt: scheduledAt && !isNaN(scheduledAt.getTime()) ? scheduledAt : null,
    notes,
    publishedUrls,
    updatedAt: new Date(),
  };
}

// ============================================================================
// CRUD Actions
// ============================================================================

export async function createSocialMediaPost(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  try {
    const data = getSocialPostData(formData);
    if ('error' in data) return { error: data.error };
    if (!data.titleEn || !data.titleZh) {
      return { error: 'Campaign title is required in both languages.' };
    }
    // Validate source FKs
    if (data.blogPostId && !isValidUUID(data.blogPostId)) return { error: 'Invalid blog post ID.' };
    if (data.projectId && !isValidUUID(data.projectId)) return { error: 'Invalid project ID.' };
    if (data.siteId && !isValidUUID(data.siteId)) return { error: 'Invalid site ID.' };

    await db.insert(socialMediaPosts).values({
      ...data,
      publishedAt: data.status === 'published' ? new Date() : null,
    });
    revalidatePath('/admin/social-posts');
    triggerDeploy('social-posts');
  } catch (error) {
    console.error('Failed to create social media post:', error);
    return { error: 'Failed to create social media post.' };
  }

  redirect('/admin/social-posts');
}

export async function updateSocialMediaPost(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid social media post ID.' };
  try {
    const data = getSocialPostData(formData);
    if ('error' in data) return { error: data.error };
    if (!data.titleEn || !data.titleZh) {
      return { error: 'Campaign title is required in both languages.' };
    }
    if (data.blogPostId && !isValidUUID(data.blogPostId)) return { error: 'Invalid blog post ID.' };
    if (data.projectId && !isValidUUID(data.projectId)) return { error: 'Invalid project ID.' };
    if (data.siteId && !isValidUUID(data.siteId)) return { error: 'Invalid site ID.' };

    // Preserve publishedAt if already published; only set new timestamp on first publish
    let publishedAt: Date | undefined;
    if (data.status === 'published') {
      const existing = await db.select({ publishedAt: socialMediaPosts.publishedAt })
        .from(socialMediaPosts).where(eq(socialMediaPosts.id, id)).limit(1);
      publishedAt = existing[0]?.publishedAt ?? new Date();
    }
    // When changing away from published, don't null out publishedAt (preserve historical date)

    const updated = await db
      .update(socialMediaPosts)
      .set({
        ...data,
        ...(publishedAt !== undefined ? { publishedAt } : {}),
      })
      .where(eq(socialMediaPosts.id, id))
      .returning({ id: socialMediaPosts.id });
    if (updated.length === 0) {
      return { error: 'Social media post not found.' };
    }
    revalidatePath('/admin/social-posts');
    triggerDeploy('social-posts');
    return { success: true };
  } catch (error) {
    console.error('Failed to update social media post:', error);
    return { error: 'Failed to update social media post.' };
  }
}

export async function deleteSocialMediaPost(id: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid social media post ID.' };
  try {
    const deleted = await db.delete(socialMediaPosts).where(eq(socialMediaPosts.id, id))
      .returning({ id: socialMediaPosts.id });
    if (deleted.length === 0) return { error: 'Social media post not found.' };
    revalidatePath('/admin/social-posts');
    triggerDeploy('social-posts');
    return {};
  } catch (error) {
    console.error('Failed to delete social media post:', error);
    return { error: 'Failed to delete social media post.' };
  }
}

export async function updateSocialPostStatus(
  id: string,
  status: string
): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid social media post ID.' };
  if (!(VALID_SOCIAL_POST_STATUSES as readonly string[]).includes(status)) {
    return { error: 'Invalid status.' };
  }
  const validStatus = status as SocialPostStatus;
  try {
    // For publish, preserve existing publishedAt or set new; for other statuses, don't null it out
    let publishedAt: Date | undefined;
    if (validStatus === 'published') {
      const existing = await db.select({ publishedAt: socialMediaPosts.publishedAt })
        .from(socialMediaPosts).where(eq(socialMediaPosts.id, id)).limit(1);
      publishedAt = existing[0]?.publishedAt ?? new Date();
    }

    const updated = await db
      .update(socialMediaPosts)
      .set({
        status: validStatus,
        updatedAt: new Date(),
        ...(publishedAt !== undefined ? { publishedAt } : {}),
      })
      .where(eq(socialMediaPosts.id, id))
      .returning({ id: socialMediaPosts.id });
    if (updated.length === 0) {
      return { error: 'Social media post not found.' };
    }
    revalidatePath('/admin/social-posts');
    triggerDeploy('social-posts');
    return {};
  } catch (error) {
    console.error('Failed to update status:', error);
    return { error: 'Failed to update status.' };
  }
}

// ============================================================================
// AI Generation Actions — return content for form population (no DB insert)
// ============================================================================

export type GeneratedSocialContent = SocialPostGeneration;

type GenerateResult = { success: true; data: GeneratedSocialContent } | { success?: false; error: string };

export async function generateSocialPostFromBlog(
  blogPostId: string
): Promise<GenerateResult> {
  await requireAuth();
  if (!isValidUUID(blogPostId)) return { error: 'Invalid blog post ID.' };

  try {
    const rows = await db.select().from(blogPosts).where(eq(blogPosts.id, blogPostId)).limit(1);
    const blog = rows[0];
    if (!blog) return { error: 'Blog post not found.' };

    const generated = await generateSocialPostsFromBlog({
      titleEn: blog.titleEn,
      titleZh: blog.titleZh,
      excerptEn: blog.excerptEn,
      excerptZh: blog.excerptZh,
      contentEn: blog.contentEn,
      contentZh: blog.contentZh,
      featuredImageUrl: blog.featuredImageUrl,
    });

    return { success: true, data: generated };
  } catch (error) {
    console.error('Failed to generate social post from blog:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate social media posts.';
    return { error: message };
  }
}

export async function generateSocialPostFromProject(
  projectId: string
): Promise<GenerateResult> {
  await requireAuth();
  if (!isValidUUID(projectId)) return { error: 'Invalid project ID.' };

  try {
    const [projectRows, imagePairs, scopes, externalProducts] = await Promise.all([
      db.select().from(projectsTable).where(eq(projectsTable.id, projectId)).limit(1) as Promise<DbProject[]>,
      db.select().from(projectImagePairsTable).where(eq(projectImagePairsTable.projectId, projectId))
        .orderBy(asc(projectImagePairsTable.displayOrder)) as Promise<DbProjectImagePair[]>,
      db.select().from(projectScopesTable).where(eq(projectScopesTable.projectId, projectId))
        .orderBy(asc(projectScopesTable.displayOrder)) as Promise<DbProjectScope[]>,
      db.select().from(projectExternalProductsTable).where(eq(projectExternalProductsTable.projectId, projectId))
        .orderBy(asc(projectExternalProductsTable.displayOrder)) as Promise<DbProjectExternalProduct[]>,
    ]);

    const project = projectRows[0];
    if (!project) return { error: 'Project not found.' };

    const generated = await generateSocialPostsFromProject({
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
      externalProducts: externalProducts.map((ep) => ({ url: ep.url, labelEn: ep.labelEn, labelZh: ep.labelZh })),
      imagePairs: imagePairs.map((ip) => ({
        beforeImageUrl: ip.beforeImageUrl,
        beforeAltTextEn: ip.beforeAltTextEn,
        afterImageUrl: ip.afterImageUrl,
        afterAltTextEn: ip.afterAltTextEn,
      })),
    });

    return { success: true, data: generated };
  } catch (error) {
    console.error('Failed to generate social post from project:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate social media posts.';
    return { error: message };
  }
}

export async function generateSocialPostFromSite(
  siteId: string
): Promise<GenerateResult> {
  await requireAuth();
  if (!isValidUUID(siteId)) return { error: 'Invalid site ID.' };

  try {
    const siteRows = await db.select().from(sitesTable).where(eq(sitesTable.id, siteId)).limit(1);
    const site = siteRows[0];
    if (!site) return { error: 'Site not found.' };

    const projectRows: DbProject[] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.siteId, siteId))
      .orderBy(asc(projectsTable.displayOrderInSite));

    // Fetch relations for all child projects
    const projectIds = projectRows.map((p) => p.id);
    const [imagePairs, scopes, externalProducts] = await Promise.all([
      projectIds.length > 0
        ? db.select().from(projectImagePairsTable).where(inArray(projectImagePairsTable.projectId, projectIds)) as Promise<DbProjectImagePair[]>
        : Promise.resolve([] as DbProjectImagePair[]),
      projectIds.length > 0
        ? db.select().from(projectScopesTable).where(inArray(projectScopesTable.projectId, projectIds)) as Promise<DbProjectScope[]>
        : Promise.resolve([] as DbProjectScope[]),
      projectIds.length > 0
        ? db.select().from(projectExternalProductsTable).where(inArray(projectExternalProductsTable.projectId, projectIds)) as Promise<DbProjectExternalProduct[]>
        : Promise.resolve([] as DbProjectExternalProduct[]),
    ]);

    // Group by projectId
    const ipByProject = groupBy(imagePairs, (ip) => ip.projectId);
    const scopesByProject = groupBy(scopes, (s) => s.projectId);
    const epByProject = groupBy(externalProducts, (ep) => ep.projectId);

    const projectDataArray = projectRows.map((p) => ({
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
      scopes: (scopesByProject.get(p.id) ?? []).map((s) => ({ scopeEn: s.scopeEn, scopeZh: s.scopeZh })),
      externalProducts: (epByProject.get(p.id) ?? []).map((ep) => ({ url: ep.url, labelEn: ep.labelEn, labelZh: ep.labelZh })),
      imagePairs: (ipByProject.get(p.id) ?? []).map((ip) => ({
        beforeImageUrl: ip.beforeImageUrl,
        beforeAltTextEn: ip.beforeAltTextEn,
        afterImageUrl: ip.afterImageUrl,
        afterAltTextEn: ip.afterAltTextEn,
      })),
    }));

    const generated = await generateSocialPostsFromSite(
      {
        slug: site.slug,
        titleEn: site.titleEn,
        titleZh: site.titleZh,
        descriptionEn: site.descriptionEn,
        descriptionZh: site.descriptionZh,
        locationCity: site.locationCity,
        heroImageUrl: site.heroImageUrl,
        budgetRange: site.budgetRange,
        durationEn: site.durationEn,
        durationZh: site.durationZh,
      },
      projectDataArray
    );

    return { success: true, data: generated };
  } catch (error) {
    console.error('Failed to generate social post from site:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate social media posts.';
    return { error: message };
  }
}

// ============================================================================
// Source images helper
// ============================================================================

const VALID_SOURCE_TYPES = ['blog', 'project', 'site'] as const;

export async function getSourceImages(
  sourceType: 'blog' | 'project' | 'site',
  sourceId: string
): Promise<{ urls: string[]; error?: string }> {
  await requireAuth();
  if (!(VALID_SOURCE_TYPES as readonly string[]).includes(sourceType)) return { urls: [], error: 'Invalid source type.' };
  if (!isValidUUID(sourceId)) return { urls: [], error: 'Invalid ID.' };

  try {
    const urls: string[] = [];

    if (sourceType === 'blog') {
      const rows = await db.select({ featuredImageUrl: blogPosts.featuredImageUrl }).from(blogPosts).where(eq(blogPosts.id, sourceId)).limit(1);
      if (rows[0]?.featuredImageUrl) urls.push(rows[0].featuredImageUrl);
    } else if (sourceType === 'project') {
      const [projectRows, imagePairs] = await Promise.all([
        db.select({ heroImageUrl: projectsTable.heroImageUrl }).from(projectsTable).where(eq(projectsTable.id, sourceId)).limit(1),
        db.select({ beforeImageUrl: projectImagePairsTable.beforeImageUrl, afterImageUrl: projectImagePairsTable.afterImageUrl })
          .from(projectImagePairsTable).where(eq(projectImagePairsTable.projectId, sourceId))
          .orderBy(asc(projectImagePairsTable.displayOrder)),
      ]);
      if (projectRows[0]?.heroImageUrl) urls.push(projectRows[0].heroImageUrl);
      for (const ip of imagePairs) {
        if (ip.afterImageUrl) urls.push(ip.afterImageUrl);
        if (ip.beforeImageUrl) urls.push(ip.beforeImageUrl);
      }
    } else if (sourceType === 'site') {
      const [siteRows, siteImagePairRows] = await Promise.all([
        db.select({ heroImageUrl: sitesTable.heroImageUrl }).from(sitesTable).where(eq(sitesTable.id, sourceId)).limit(1),
        db.select({ beforeImageUrl: siteImagePairsTable.beforeImageUrl, afterImageUrl: siteImagePairsTable.afterImageUrl })
          .from(siteImagePairsTable).where(eq(siteImagePairsTable.siteId, sourceId)),
      ]);
      const projectRows: { id: string; heroImageUrl: string | null }[] = await db
        .select({ id: projectsTable.id, heroImageUrl: projectsTable.heroImageUrl })
        .from(projectsTable).where(eq(projectsTable.siteId, sourceId));
      if (siteRows[0]?.heroImageUrl) urls.push(siteRows[0].heroImageUrl);
      for (const sip of siteImagePairRows) {
        if (sip.afterImageUrl) urls.push(sip.afterImageUrl);
        if (sip.beforeImageUrl) urls.push(sip.beforeImageUrl);
      }
      for (const p of projectRows) {
        if (p.heroImageUrl) urls.push(p.heroImageUrl);
      }
      // Also fetch project-level image pairs for child projects
      const childProjectIds = projectRows.map((p) => p.id);
      if (childProjectIds.length > 0) {
        const projectImagePairRows = await db
          .select({ beforeImageUrl: projectImagePairsTable.beforeImageUrl, afterImageUrl: projectImagePairsTable.afterImageUrl })
          .from(projectImagePairsTable)
          .where(inArray(projectImagePairsTable.projectId, childProjectIds))
          .orderBy(asc(projectImagePairsTable.displayOrder));
        for (const pip of projectImagePairRows) {
          if (pip.afterImageUrl) urls.push(pip.afterImageUrl);
          if (pip.beforeImageUrl) urls.push(pip.beforeImageUrl);
        }
      }
    }

    return { urls: [...new Set(urls)] };
  } catch (error) {
    console.error('Failed to get source images:', error);
    return { urls: [], error: 'Failed to fetch images.' };
  }
}
