'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { projectSites, projects, siteImagePairs } from '@/lib/db/schema';
import { eq, count, inArray } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidSlug, isValidUrl, validateTextLengths, MAX_TEXT_LENGTH, parseImagePairs } from '@/lib/admin/form-utils';
import { ensureUniqueSlug } from '@/lib/utils';

function getSiteData(formData: FormData) {
  return {
    slug: getString(formData, 'slug').trim(),
    titleEn: getString(formData, 'titleEn').trim(),
    titleZh: getString(formData, 'titleZh').trim(),
    descriptionEn: getString(formData, 'descriptionEn').trim(),
    descriptionZh: getString(formData, 'descriptionZh').trim(),
    locationCity: getString(formData, 'locationCity') || null,
    heroImageUrl: getString(formData, 'heroImageUrl') || null,
    badgeEn: getString(formData, 'badgeEn') || null,
    badgeZh: getString(formData, 'badgeZh') || null,
    excerptEn: getString(formData, 'excerptEn') || null,
    excerptZh: getString(formData, 'excerptZh') || null,
    metaTitleEn: getString(formData, 'metaTitleEn') || null,
    metaTitleZh: getString(formData, 'metaTitleZh') || null,
    metaDescriptionEn: getString(formData, 'metaDescriptionEn') || null,
    metaDescriptionZh: getString(formData, 'metaDescriptionZh') || null,
    focusKeywordEn: getString(formData, 'focusKeywordEn') || null,
    focusKeywordZh: getString(formData, 'focusKeywordZh') || null,
    seoKeywordsEn: getString(formData, 'seoKeywordsEn') || null,
    seoKeywordsZh: getString(formData, 'seoKeywordsZh') || null,
    showAsProject: formData.get('showAsProject') === 'on',
    featured: formData.get('featured') === 'on',
    isPublished: formData.get('isPublished') === 'on',
    updatedAt: new Date(),
  };
}

export async function createSite(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();

  try {
    const data = getSiteData(formData);
    if (!data.slug || !data.titleEn || !data.titleZh) {
      return { error: 'Slug and titles are required.' };
    }
    if (!isValidSlug(data.slug)) {
      return { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' };
    }
    if (data.heroImageUrl && !isValidUrl(data.heroImageUrl)) {
      return { error: 'Hero image URL is not a valid URL.' };
    }
    const textError = validateTextLengths({
      descriptionEn: data.descriptionEn,
      descriptionZh: data.descriptionZh,
    }, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };

    // Ensure slug is unique (append -2, -3, etc. if collision)
    const allSlugs = await db.select({ slug: projectSites.slug }).from(projectSites);
    data.slug = ensureUniqueSlug(data.slug, allSlugs.map((r: { slug: string }) => r.slug));

    // Parse image pairs
    const pairData = parseImagePairs(formData, 'siteImagePairs');
    const invalidPairBeforeUrl = pairData.find((p) => p.beforeImageUrl && !isValidUrl(p.beforeImageUrl));
    if (invalidPairBeforeUrl) {
      return { error: `Before image URL is not valid: ${invalidPairBeforeUrl.beforeImageUrl!.slice(0, 60)}` };
    }
    const invalidPairAfterUrl = pairData.find((p) => p.afterImageUrl && !isValidUrl(p.afterImageUrl));
    if (invalidPairAfterUrl) {
      return { error: `After image URL is not valid: ${invalidPairAfterUrl.afterImageUrl!.slice(0, 60)}` };
    }

    // Insert site, then image pairs with rollback on failure
    const [inserted] = await db.insert(projectSites).values({
      ...data,
      publishedAt: data.isPublished ? new Date() : null,
    }).returning({ id: projectSites.id });

    try {
      if (pairData.length > 0) {
        await db.insert(siteImagePairs).values(
          pairData.map((pair) => ({ ...pair, siteId: inserted.id }))
        );
      }
    } catch (pairError) {
      // Clean up orphaned site record
      await db.delete(projectSites).where(eq(projectSites.id, inserted.id));
      throw pairError;
    }

    revalidatePath('/admin/sites');
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to create site:', error);
    return { error: 'Failed to create site.' };
  }

  redirect('/admin/sites');
}

export async function updateSite(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid site ID.' };

  try {
    const data = getSiteData(formData);
    if (!data.slug || !data.titleEn || !data.titleZh) {
      return { error: 'Slug and titles are required.' };
    }
    if (!isValidSlug(data.slug)) {
      return { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' };
    }
    if (data.heroImageUrl && !isValidUrl(data.heroImageUrl)) {
      return { error: 'Hero image URL is not a valid URL.' };
    }
    const textError = validateTextLengths({
      descriptionEn: data.descriptionEn,
      descriptionZh: data.descriptionZh,
    }, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };

    // Ensure slug is unique (exclude current site's own slug)
    const currentSite = await db.select({ slug: projectSites.slug }).from(projectSites).where(eq(projectSites.id, id)).limit(1);
    const currentSlug = currentSite[0]?.slug;
    const allSlugs = await db.select({ slug: projectSites.slug }).from(projectSites);
    data.slug = ensureUniqueSlug(data.slug, allSlugs.map((r: { slug: string }) => r.slug), currentSlug);

    // Parse image pairs
    const pairData = parseImagePairs(formData, 'siteImagePairs');
    const invalidPairBeforeUrl = pairData.find((p) => p.beforeImageUrl && !isValidUrl(p.beforeImageUrl));
    if (invalidPairBeforeUrl) {
      return { error: `Before image URL is not valid: ${invalidPairBeforeUrl.beforeImageUrl!.slice(0, 60)}` };
    }
    const invalidPairAfterUrl = pairData.find((p) => p.afterImageUrl && !isValidUrl(p.afterImageUrl));
    if (invalidPairAfterUrl) {
      return { error: `After image URL is not valid: ${invalidPairAfterUrl.afterImageUrl!.slice(0, 60)}` };
    }

    // Fetch existing image pair IDs before modification
    const existingPairs = await db.select({ id: siteImagePairs.id }).from(siteImagePairs).where(eq(siteImagePairs.siteId, id));

    // Update site
    const updated = await db
      .update(projectSites)
      .set(data)
      .where(eq(projectSites.id, id))
      .returning({ id: projectSites.id });

    if (updated.length === 0) {
      return { error: 'Site not found.' };
    }

    // Insert new image pairs first (old data still exists as fallback if insert fails)
    if (pairData.length > 0) {
      await db.insert(siteImagePairs).values(
        pairData.map((pair) => ({ ...pair, siteId: id }))
      );
    }

    // Delete old image pairs (new data already safely inserted)
    const oldPairIds = existingPairs.map((r: { id: string }) => r.id);
    if (oldPairIds.length > 0) {
      await db.delete(siteImagePairs).where(inArray(siteImagePairs.id, oldPairIds));
    }

    revalidatePath('/admin/sites');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update site:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { error: process.env.NODE_ENV === 'development' ? `Failed to update site: ${errorMessage}` : 'Failed to update site.' };
  }
}

export async function deleteSite(id: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid site ID.' };

  try {
    // Check if site has any projects - cannot delete if projects exist
    const projectCount = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.siteId, id));

    if (projectCount[0] && projectCount[0].count > 0) {
      return { error: `Cannot delete site with ${projectCount[0].count} project(s). Delete or reassign projects first.` };
    }

    await db.delete(projectSites).where(eq(projectSites.id, id));
    revalidatePath('/admin/sites');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to delete site:', error);
    return { error: 'Failed to delete site.' };
  }
}

/** Generic toggle function for site boolean fields */
async function toggleSiteField(
  id: string,
  field: 'isPublished' | 'showAsProject' | 'featured',
  current: boolean
): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid site ID.' };

  try {
    const now = new Date();
    const updateData: Partial<typeof projectSites.$inferInsert> = {
      [field]: !current,
      updatedAt: now,
      // Also update publishedAt when toggling isPublished
      ...(field === 'isPublished' ? { publishedAt: !current ? now : null } : {}),
    };

    const updated = await db
      .update(projectSites)
      .set(updateData)
      .where(eq(projectSites.id, id))
      .returning({ id: projectSites.id });

    if (updated.length === 0) {
      return { error: 'Site not found.' };
    }

    revalidatePath('/admin/sites');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error(`Failed to toggle ${field}:`, error);
    return { error: `Failed to toggle ${field}.` };
  }
}

export async function toggleSitePublished(id: string, current: boolean): Promise<{ error?: string }> {
  return toggleSiteField(id, 'isPublished', current);
}

export async function toggleSiteShowAsProject(id: string, current: boolean): Promise<{ error?: string }> {
  return toggleSiteField(id, 'showAsProject', current);
}

export async function toggleSiteFeatured(id: string, current: boolean): Promise<{ error?: string }> {
  return toggleSiteField(id, 'featured', current);
}
