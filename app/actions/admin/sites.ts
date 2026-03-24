'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { projectSites, siteImagePairs, siteExternalProducts, SEO_META_TITLE_MAX, SEO_META_DESCRIPTION_MAX, SEO_FOCUS_KEYWORD_MAX } from '@/lib/db/schema';
import { eq, inArray, like } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidSlug, isValidUrl, validateTextLengths, MAX_TEXT_LENGTH, parseImagePairs } from '@/lib/admin/form-utils';
import { ensureUniqueSlug } from '@/lib/utils';
import { SPACE_TYPE_TO_ZH } from '@/lib/admin/constants';

const MAX_EXTERNAL_PRODUCTS = 50;

function parseExternalProducts(formData: FormData) {
  const products: { url: string; imageUrl: string | null; labelEn: string; labelZh: string; displayOrder: number }[] = [];
  let i = 0;
  while (formData.has(`siteExternalProducts[${i}].url`) && i < MAX_EXTERNAL_PRODUCTS) {
    const url = getString(formData, `siteExternalProducts[${i}].url`).trim();
    const labelEn = getString(formData, `siteExternalProducts[${i}].labelEn`).trim();
    if (!url || !labelEn) { i++; continue; }
    const labelZh = getString(formData, `siteExternalProducts[${i}].labelZh`).trim() || labelEn;
    const imageUrl = getString(formData, `siteExternalProducts[${i}].imageUrl`).trim() || null;
    products.push({ url, imageUrl, labelEn, labelZh, displayOrder: i });
    i++;
  }
  return products;
}

function getSiteData(formData: FormData) {
  const spaceTypeEn = getString(formData, 'spaceType').trim() || null;
  return {
    slug: getString(formData, 'slug').trim(),
    titleEn: getString(formData, 'titleEn').trim(),
    titleZh: getString(formData, 'titleZh').trim(),
    descriptionEn: getString(formData, 'descriptionEn').trim(),
    descriptionZh: getString(formData, 'descriptionZh').trim(),
    locationCity: getString(formData, 'locationCity') || null,
    heroImageUrl: getString(formData, 'heroImageUrl') || null,
    budgetRange: getString(formData, 'budgetRange') || null,
    durationEn: getString(formData, 'durationEn') || null,
    durationZh: getString(formData, 'durationZh') || null,
    spaceTypeEn,
    spaceTypeZh: (spaceTypeEn && SPACE_TYPE_TO_ZH[spaceTypeEn]) || spaceTypeEn,
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
    poNumber: getString(formData, 'poNumber') || null,
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
    const seoError = validateTextLengths({ metaTitleEn: data.metaTitleEn, metaTitleZh: data.metaTitleZh }, SEO_META_TITLE_MAX)
      || validateTextLengths({ metaDescriptionEn: data.metaDescriptionEn, metaDescriptionZh: data.metaDescriptionZh }, SEO_META_DESCRIPTION_MAX)
      || validateTextLengths({ focusKeywordEn: data.focusKeywordEn, focusKeywordZh: data.focusKeywordZh }, SEO_FOCUS_KEYWORD_MAX);
    if (seoError) return { error: seoError };

    // Ensure slug is unique (append -2, -3, etc. if collision)
    const conflictingSlugs = await db.select({ slug: projectSites.slug }).from(projectSites).where(like(projectSites.slug, `${data.slug}%`));
    data.slug = ensureUniqueSlug(data.slug, conflictingSlugs.map((r: { slug: string }) => r.slug));

    // Parse image pairs
    const pairData = parseImagePairs(formData, 'siteImagePairs');
    const invalidPairBeforeUrl = pairData.find((p) => p.beforeImageUrl && !isValidUrl(p.beforeImageUrl));
    if (invalidPairBeforeUrl) {
      return { error: `Before image URL is not valid: ${invalidPairBeforeUrl.beforeImageUrl?.slice(0, 60) ?? ''}` };
    }
    const invalidPairAfterUrl = pairData.find((p) => p.afterImageUrl && !isValidUrl(p.afterImageUrl));
    if (invalidPairAfterUrl) {
      return { error: `After image URL is not valid: ${invalidPairAfterUrl.afterImageUrl?.slice(0, 60) ?? ''}` };
    }

    // Parse external products
    const epData = parseExternalProducts(formData);
    const invalidEpUrl = epData.find((ep) => !isValidUrl(ep.url));
    if (invalidEpUrl) {
      return { error: `External product URL is not valid: ${invalidEpUrl.url.slice(0, 60)}` };
    }
    const invalidEpImgUrl = epData.find((ep) => ep.imageUrl && !isValidUrl(ep.imageUrl));
    if (invalidEpImgUrl) {
      return { error: `External product image URL is not valid: ${invalidEpImgUrl.imageUrl?.slice(0, 60) ?? ''}` };
    }

    // Insert site, then child records with rollback on failure
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
      if (epData.length > 0) {
        await db.insert(siteExternalProducts).values(
          epData.map((ep) => ({ ...ep, siteId: inserted.id }))
        );
      }
    } catch (childError) {
      // Clean up orphaned site record
      await db.delete(projectSites).where(eq(projectSites.id, inserted.id));
      throw childError;
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
  _prevState: { success?: boolean; error?: string; renamedSlug?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string; renamedSlug?: string }> {
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
    const seoError = validateTextLengths({ metaTitleEn: data.metaTitleEn, metaTitleZh: data.metaTitleZh }, SEO_META_TITLE_MAX)
      || validateTextLengths({ metaDescriptionEn: data.metaDescriptionEn, metaDescriptionZh: data.metaDescriptionZh }, SEO_META_DESCRIPTION_MAX)
      || validateTextLengths({ focusKeywordEn: data.focusKeywordEn, focusKeywordZh: data.focusKeywordZh }, SEO_FOCUS_KEYWORD_MAX);
    if (seoError) return { error: seoError };

    // Ensure slug is unique (exclude current site's own slug)
    const submittedSlug = data.slug;
    const currentSite = await db.select({ slug: projectSites.slug }).from(projectSites).where(eq(projectSites.id, id)).limit(1);
    const currentSlug = currentSite[0]?.slug;
    const conflictingSlugs = await db.select({ slug: projectSites.slug }).from(projectSites).where(like(projectSites.slug, `${data.slug}%`));
    data.slug = ensureUniqueSlug(data.slug, conflictingSlugs.map((r: { slug: string }) => r.slug), currentSlug);
    const renamedSlug = data.slug !== submittedSlug ? data.slug : undefined;

    // Parse image pairs
    const pairData = parseImagePairs(formData, 'siteImagePairs');
    const invalidPairBeforeUrl = pairData.find((p) => p.beforeImageUrl && !isValidUrl(p.beforeImageUrl));
    if (invalidPairBeforeUrl) {
      return { error: `Before image URL is not valid: ${invalidPairBeforeUrl.beforeImageUrl?.slice(0, 60) ?? ''}` };
    }
    const invalidPairAfterUrl = pairData.find((p) => p.afterImageUrl && !isValidUrl(p.afterImageUrl));
    if (invalidPairAfterUrl) {
      return { error: `After image URL is not valid: ${invalidPairAfterUrl.afterImageUrl?.slice(0, 60) ?? ''}` };
    }

    // Parse external products
    const epData = parseExternalProducts(formData);
    const invalidEpUrl = epData.find((ep) => !isValidUrl(ep.url));
    if (invalidEpUrl) {
      return { error: `External product URL is not valid: ${invalidEpUrl.url.slice(0, 60)}` };
    }
    const invalidEpImgUrl = epData.find((ep) => ep.imageUrl && !isValidUrl(ep.imageUrl));
    if (invalidEpImgUrl) {
      return { error: `External product image URL is not valid: ${invalidEpImgUrl.imageUrl?.slice(0, 60) ?? ''}` };
    }

    // Fetch existing child record IDs before modification
    const [existingPairs, existingEps] = await Promise.all([
      db.select({ id: siteImagePairs.id }).from(siteImagePairs).where(eq(siteImagePairs.siteId, id)),
      db.select({ id: siteExternalProducts.id }).from(siteExternalProducts).where(eq(siteExternalProducts.siteId, id)),
    ]);

    // Update site
    const updated = await db
      .update(projectSites)
      .set(data)
      .where(eq(projectSites.id, id))
      .returning({ id: projectSites.id });

    if (updated.length === 0) {
      return { error: 'Site not found.' };
    }

    // Insert new child records first (old data still exists as fallback if insert fails)
    if (pairData.length > 0) {
      await db.insert(siteImagePairs).values(
        pairData.map((pair) => ({ ...pair, siteId: id }))
      );
    }
    if (epData.length > 0) {
      await db.insert(siteExternalProducts).values(
        epData.map((ep) => ({ ...ep, siteId: id }))
      );
    }

    // Delete old child records (new data already safely inserted)
    const oldPairIds = existingPairs.map((r: { id: string }) => r.id);
    const oldEpIds = existingEps.map((r: { id: string }) => r.id);
    await Promise.all([
      oldPairIds.length > 0 ? db.delete(siteImagePairs).where(inArray(siteImagePairs.id, oldPairIds)) : Promise.resolve(),
      oldEpIds.length > 0 ? db.delete(siteExternalProducts).where(inArray(siteExternalProducts.id, oldEpIds)) : Promise.resolve(),
    ]);

    revalidatePath('/admin/sites');
    revalidatePath('/', 'layout');
    return { success: true, ...(renamedSlug ? { renamedSlug } : {}) };
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
    // Site deletion cascades to projects (which cascade to image pairs, scopes, external products)
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
