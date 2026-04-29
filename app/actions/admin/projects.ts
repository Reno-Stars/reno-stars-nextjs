'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import {
  projects,
  projectImagePairs,
  projectScopes,
  projectExternalProducts,
  services as servicesTable,
  projectSites as sitesTable,
  SEO_META_TITLE_MAX,
  SEO_META_DESCRIPTION_MAX,
  SEO_FOCUS_KEYWORD_MAX,
} from '@/lib/db/schema';
import { eq, and, inArray, sql, like } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidSlug, isValidUrl, validateTextLengths, MAX_TEXT_LENGTH, parseImagePairs, validatePairUrls, validateExternalProductUrls } from '@/lib/admin/form-utils';
import { ensureUniqueSlug } from '@/lib/utils';
import { SPACE_TYPE_TO_ZH } from '@/lib/admin/constants';

const MAX_SCOPES = 50;
const MAX_EXTERNAL_PRODUCTS = 20;

// Format budget range from min/max
// Coerces negative values to 0 since budgets cannot be negative
function formatBudgetRange(min: string, max: string): string | null {
  const minNum = Math.max(0, parseInt(min, 10));
  const maxNum = Math.max(0, parseInt(max, 10));
  if (isNaN(minNum) && isNaN(maxNum)) return null;
  if (isNaN(minNum)) return `$${maxNum.toLocaleString()}`;
  if (isNaN(maxNum)) return `$${minNum.toLocaleString()}+`;
  const lo = Math.min(minNum, maxNum);
  const hi = Math.max(minNum, maxNum);
  return `$${lo.toLocaleString()} - $${hi.toLocaleString()}`;
}

function parseScopes(formData: FormData) {
  const scopes: { scopeEn: string; scopeZh: string; displayOrder: number }[] = [];
  let i = 0;
  while (formData.has(`scopes[${i}].en`) && i < MAX_SCOPES) {
    const en = getString(formData, `scopes[${i}].en`);
    const zh = getString(formData, `scopes[${i}].zh`);
    if (en.trim()) {
      scopes.push({ scopeEn: en, scopeZh: zh || en, displayOrder: i });
    }
    i++;
  }
  return scopes;
}

function parseExternalProducts(formData: FormData) {
  const products: { url: string; imageUrl: string | null; labelEn: string; labelZh: string; displayOrder: number }[] = [];
  let i = 0;
  while (formData.has(`externalProducts[${i}].url`) && i < MAX_EXTERNAL_PRODUCTS) {
    const url = getString(formData, `externalProducts[${i}].url`).trim();
    const labelEn = getString(formData, `externalProducts[${i}].labelEn`).trim();
    if (!url || !labelEn) { i++; continue; }
    const labelZh = getString(formData, `externalProducts[${i}].labelZh`).trim() || labelEn;
    const imageUrl = getString(formData, `externalProducts[${i}].imageUrl`).trim() || null;
    products.push({ url, imageUrl, labelEn, labelZh, displayOrder: i });
    i++;
  }
  return products;
}

function getProjectData(formData: FormData) {
  const serviceType = getString(formData, 'serviceType');
  const siteId = getString(formData, 'siteId').trim();
  const displayOrderInSiteStr = getString(formData, 'displayOrderInSite').trim();
  // Category will be derived from DB lookup during insert/update
  // Budget min/max to range string
  const budgetMin = getString(formData, 'budgetMin').trim();
  const budgetMax = getString(formData, 'budgetMax').trim();
  // Space type EN to ZH
  const spaceTypeEn = getString(formData, 'spaceType').trim();
  const spaceTypeZh = SPACE_TYPE_TO_ZH[spaceTypeEn] || spaceTypeEn;
  return {
    slug: getString(formData, 'slug').trim(),
    titleEn: getString(formData, 'titleEn').trim(),
    titleZh: getString(formData, 'titleZh').trim(),
    descriptionEn: getString(formData, 'descriptionEn').trim(),
    descriptionZh: getString(formData, 'descriptionZh').trim(),
    serviceType,
    categoryEn: '', // Will be derived from service DB lookup
    categoryZh: '', // Will be derived from service DB lookup
    locationCity: getString(formData, 'locationCity') || null,
    budgetRange: formatBudgetRange(budgetMin, budgetMax),
    durationEn: getString(formData, 'durationEn') || null,
    durationZh: getString(formData, 'durationZh') || null,
    spaceTypeEn: spaceTypeEn || null,
    spaceTypeZh: spaceTypeZh || null,
    heroImageUrl: getString(formData, 'heroImageUrl') || null,
    heroVideoUrl: getString(formData, 'heroVideoUrl') || null,
    challengeEn: getString(formData, 'challengeEn') || null,
    challengeZh: getString(formData, 'challengeZh') || null,
    solutionEn: getString(formData, 'solutionEn') || null,
    solutionZh: getString(formData, 'solutionZh') || null,
    badgeEn: getString(formData, 'badgeEn') || null,
    badgeZh: getString(formData, 'badgeZh') || null,
    // SEO fields
    metaTitleEn: getString(formData, 'metaTitleEn') || null,
    metaTitleZh: getString(formData, 'metaTitleZh') || null,
    metaDescriptionEn: getString(formData, 'metaDescriptionEn') || null,
    metaDescriptionZh: getString(formData, 'metaDescriptionZh') || null,
    focusKeywordEn: getString(formData, 'focusKeywordEn') || null,
    focusKeywordZh: getString(formData, 'focusKeywordZh') || null,
    seoKeywordsEn: getString(formData, 'seoKeywordsEn') || null,
    seoKeywordsZh: getString(formData, 'seoKeywordsZh') || null,
    excerptEn: getString(formData, 'excerptEn') || null,
    excerptZh: getString(formData, 'excerptZh') || null,
    poNumber: getString(formData, 'poNumber') || null,
    featured: formData.get('featured') === 'on',
    isPublished: formData.get('isPublished') === 'on',
    siteId: siteId && isValidUUID(siteId) ? siteId : '',
    displayOrderInSite: displayOrderInSiteStr ? parseInt(displayOrderInSiteStr, 10) || 0 : 0,
    updatedAt: new Date(),
  };
}

export async function createProject(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();

  try {
    const data = getProjectData(formData);
    if (!data.slug || !data.titleEn || !data.titleZh) {
      return { error: 'Slug and titles are required.' };
    }
    if (!isValidSlug(data.slug)) {
      return { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' };
    }
    if (data.heroImageUrl && !isValidUrl(data.heroImageUrl)) {
      return { error: 'Hero image URL is not a valid URL.' };
    }
    if (data.heroVideoUrl && !isValidUrl(data.heroVideoUrl)) {
      return { error: 'Hero video URL is not a valid URL.' };
    }
    const textError = validateTextLengths({
      descriptionEn: data.descriptionEn, descriptionZh: data.descriptionZh,
      challengeEn: data.challengeEn, challengeZh: data.challengeZh,
      solutionEn: data.solutionEn, solutionZh: data.solutionZh,
    }, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };
    const seoError = validateTextLengths({ metaTitleEn: data.metaTitleEn, metaTitleZh: data.metaTitleZh }, SEO_META_TITLE_MAX)
      || validateTextLengths({ metaDescriptionEn: data.metaDescriptionEn, metaDescriptionZh: data.metaDescriptionZh }, SEO_META_DESCRIPTION_MAX)
      || validateTextLengths({ focusKeywordEn: data.focusKeywordEn, focusKeywordZh: data.focusKeywordZh }, SEO_FOCUS_KEYWORD_MAX);
    if (seoError) return { error: seoError };

    // Parse and validate image pairs
    const pairData = parseImagePairs(formData, 'imagePairs');
    const pairError = validatePairUrls(pairData);
    if (pairError) return { error: pairError };

    const epData = parseExternalProducts(formData);
    const epError = validateExternalProductUrls(epData);
    if (epError) return { error: epError };

    // Look up serviceId and derive category from DB (serviceType may be empty)
    let serviceId: string | null = null;
    if (data.serviceType) {
      const svcRows = await db
        .select({ id: servicesTable.id, titleEn: servicesTable.titleEn, titleZh: servicesTable.titleZh })
        .from(servicesTable)
        .where(eq(servicesTable.slug, data.serviceType))
        .limit(1);
      if (!svcRows[0]) {
        return { error: `Service type "${data.serviceType}" not found in database.` };
      }
      serviceId = svcRows[0].id;
      data.categoryEn = svcRows[0].titleEn;
      data.categoryZh = svcRows[0].titleZh;
    }

    // Site is required - validate it exists
    if (!data.siteId) {
      return { error: 'Site is required. Please select a project site.' };
    }
    const siteRows = await db
      .select({ id: sitesTable.id })
      .from(sitesTable)
      .where(eq(sitesTable.id, data.siteId))
      .limit(1);
    if (!siteRows[0]) {
      return { error: 'Site not found. Please select a valid project site.' };
    }

    // Ensure slug is unique (append -2, -3, etc. if collision)
    // Retry on unique constraint violation (race condition between check and insert)
    const baseSlug = data.slug; // preserve original slug for retries
    const conflictingSlugs = await db.select({ slug: projects.slug }).from(projects).where(like(projects.slug, `${baseSlug}%`));
    data.slug = ensureUniqueSlug(baseSlug, conflictingSlugs.map((r: { slug: string }) => r.slug));

    // Place new project at the end of the site's project list
    const [maxRow] = await db
      .select({ max: sql<number>`coalesce(max(${projects.displayOrderInSite}), -1)` })
      .from(projects)
      .where(eq(projects.siteId, data.siteId));
    data.displayOrderInSite = (maxRow?.max ?? -1) + 1;

    let inserted: { id: string } | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        [inserted] = await db
          .insert(projects)
          .values({
            ...data,
            serviceType: data.serviceType || null,
            serviceId,
            publishedAt: data.isPublished ? new Date() : null,
          })
          .returning({ id: projects.id });
        break;
      } catch (err) {
        const code = (err as { code?: string })?.code;
        const isUniqueViolation = code === '23505';
        if (!isUniqueViolation || attempt === 2) throw err;
        // Re-fetch conflicting slugs and retry from the original base slug
        const freshSlugs = await db.select({ slug: projects.slug }).from(projects).where(like(projects.slug, `${baseSlug}%`));
        data.slug = ensureUniqueSlug(baseSlug, freshSlugs.map((r: { slug: string }) => r.slug));
      }
    }
    if (!inserted) throw new Error('Failed to insert project after retries');

    // Insert image pairs
    if (pairData.length > 0) {
      await db.insert(projectImagePairs).values(
        pairData.map((pair) => ({ ...pair, projectId: inserted.id }))
      );
    }

    const scopeData = parseScopes(formData);
    if (scopeData.length > 0) {
      await db.insert(projectScopes).values(
        scopeData.map((s) => ({ ...s, projectId: inserted.id }))
      );
    }

    if (epData.length > 0) {
      await db.insert(projectExternalProducts).values(
        epData.map((ep) => ({ ...ep, projectId: inserted.id }))
      );
    }

    revalidatePath('/admin/projects');
  } catch (error) {
    console.error('Failed to create project:', error);
    return { error: 'Failed to create project.' };
  }

  redirect('/admin/projects');
}

export async function updateProject(
  id: string,
  _prevState: { success?: boolean; error?: string; renamedSlug?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string; renamedSlug?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid project ID.' };

  try {
    const data = getProjectData(formData);
    if (!data.slug || !data.titleEn || !data.titleZh) {
      return { error: 'Slug and titles are required.' };
    }
    if (!isValidSlug(data.slug)) {
      return { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' };
    }
    if (data.heroImageUrl && !isValidUrl(data.heroImageUrl)) {
      return { error: 'Hero image URL is not a valid URL.' };
    }
    if (data.heroVideoUrl && !isValidUrl(data.heroVideoUrl)) {
      return { error: 'Hero video URL is not a valid URL.' };
    }
    const textError = validateTextLengths({
      descriptionEn: data.descriptionEn, descriptionZh: data.descriptionZh,
      challengeEn: data.challengeEn, challengeZh: data.challengeZh,
      solutionEn: data.solutionEn, solutionZh: data.solutionZh,
    }, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };
    const seoError = validateTextLengths({ metaTitleEn: data.metaTitleEn, metaTitleZh: data.metaTitleZh }, SEO_META_TITLE_MAX)
      || validateTextLengths({ metaDescriptionEn: data.metaDescriptionEn, metaDescriptionZh: data.metaDescriptionZh }, SEO_META_DESCRIPTION_MAX)
      || validateTextLengths({ focusKeywordEn: data.focusKeywordEn, focusKeywordZh: data.focusKeywordZh }, SEO_FOCUS_KEYWORD_MAX);
    if (seoError) return { error: seoError };

    // Parse and validate image pairs
    const pairData = parseImagePairs(formData, 'imagePairs');
    const pairError = validatePairUrls(pairData);
    if (pairError) return { error: pairError };

    const epData = parseExternalProducts(formData);
    const epError = validateExternalProductUrls(epData);
    if (epError) return { error: epError };

    // Look up serviceId and derive category from DB (serviceType may be empty)
    let updateServiceId: string | null = null;
    if (data.serviceType) {
      const svcRows = await db
        .select({ id: servicesTable.id, titleEn: servicesTable.titleEn, titleZh: servicesTable.titleZh })
        .from(servicesTable)
        .where(eq(servicesTable.slug, data.serviceType as string))
        .limit(1);
      if (!svcRows[0]) {
        return { error: `Service type "${data.serviceType}" not found in database.` };
      }
      updateServiceId = svcRows[0].id;
      data.categoryEn = svcRows[0].titleEn;
      data.categoryZh = svcRows[0].titleZh;
    }

    // Site is required - validate it exists
    if (!data.siteId) {
      return { error: 'Site is required. Please select a project site.' };
    }
    const siteRows = await db
      .select({ id: sitesTable.id })
      .from(sitesTable)
      .where(eq(sitesTable.id, data.siteId))
      .limit(1);
    if (!siteRows[0]) {
      return { error: 'Site not found. Please select a valid project site.' };
    }

    // Ensure slug is unique (exclude current project's own slug)
    // Retry on unique constraint violation (race condition between check and update)
    const baseSlug = data.slug; // preserve original slug for retries
    const currentProject = await db.select({ slug: projects.slug }).from(projects).where(eq(projects.id, id)).limit(1);
    const currentSlug = currentProject[0]?.slug;
    const conflictingSlugs = await db.select({ slug: projects.slug }).from(projects).where(like(projects.slug, `${baseSlug}%`));
    data.slug = ensureUniqueSlug(baseSlug, conflictingSlugs.map((r: { slug: string }) => r.slug), currentSlug);
    let renamedSlug = data.slug !== baseSlug ? data.slug : undefined;

    const scopeData = parseScopes(formData);

    // Fetch existing related record IDs before modification
    const [existingPairs, existingScopes, existingEps] = await Promise.all([
      db.select({ id: projectImagePairs.id }).from(projectImagePairs).where(eq(projectImagePairs.projectId, id)),
      db.select({ id: projectScopes.id }).from(projectScopes).where(eq(projectScopes.projectId, id)),
      db.select({ id: projectExternalProducts.id }).from(projectExternalProducts).where(eq(projectExternalProducts.projectId, id)),
    ]);

    // Update project (retry on unique slug violation)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await db
          .update(projects)
          .set({ ...data, serviceType: data.serviceType || null, serviceId: updateServiceId })
          .where(eq(projects.id, id));
        break;
      } catch (err) {
        const code = (err as { code?: string })?.code;
        const isUniqueViolation = code === '23505';
        if (!isUniqueViolation || attempt === 2) throw err;
        const freshSlugs = await db.select({ slug: projects.slug }).from(projects).where(like(projects.slug, `${baseSlug}%`));
        data.slug = ensureUniqueSlug(baseSlug, freshSlugs.map((r: { slug: string }) => r.slug), currentSlug);
        renamedSlug = data.slug !== baseSlug ? data.slug : undefined;
      }
    }

    // Insert new related data first (old data still exists as fallback if insert fails)
    if (pairData.length > 0) {
      await db.insert(projectImagePairs).values(
        pairData.map((pair) => ({ ...pair, projectId: id }))
      );
    }
    if (scopeData.length > 0) {
      await db.insert(projectScopes).values(
        scopeData.map((s) => ({ ...s, projectId: id }))
      );
    }
    if (epData.length > 0) {
      await db.insert(projectExternalProducts).values(
        epData.map((ep) => ({ ...ep, projectId: id }))
      );
    }

    // Delete old related data (new data already safely inserted)
    const oldPairIds = existingPairs.map((r: { id: string }) => r.id);
    const oldScopeIds = existingScopes.map((r: { id: string }) => r.id);
    const oldEpIds = existingEps.map((r: { id: string }) => r.id);
    await Promise.all([
      oldPairIds.length > 0 ? db.delete(projectImagePairs).where(inArray(projectImagePairs.id, oldPairIds)) : Promise.resolve(),
      oldScopeIds.length > 0 ? db.delete(projectScopes).where(inArray(projectScopes.id, oldScopeIds)) : Promise.resolve(),
      oldEpIds.length > 0 ? db.delete(projectExternalProducts).where(inArray(projectExternalProducts.id, oldEpIds)) : Promise.resolve(),
    ]);

    revalidatePath('/admin/projects');
    return { success: true, ...(renamedSlug ? { renamedSlug } : {}) };
  } catch (error) {
    console.error('Failed to update project:', error);
    // Return more specific error message in development
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { error: process.env.NODE_ENV === 'development' ? `Failed to update project: ${errorMessage}` : 'Failed to update project.' };
  }
}

export async function deleteProject(id: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid project ID.' };
  try {
    await db.delete(projects).where(eq(projects.id, id));
    revalidatePath('/admin/projects');
    return {};
  } catch (error) {
    console.error('Failed to delete project:', error);
    return { error: 'Failed to delete project.' };
  }
}

export async function toggleProjectFeatured(id: string, current: boolean): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid project ID.' };
  try {
    const updated = await db.update(projects).set({ featured: !current, updatedAt: new Date() }).where(eq(projects.id, id)).returning({ id: projects.id });
    if (updated.length === 0) {
      return { error: 'Project not found.' };
    }
    revalidatePath('/admin/projects');
    return {};
  } catch (error) {
    console.error('Failed to toggle featured:', error);
    return { error: 'Failed to toggle featured.' };
  }
}

export async function toggleProjectPublished(id: string, current: boolean): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid project ID.' };
  try {
    const updated = await db
      .update(projects)
      .set({
        isPublished: !current,
        publishedAt: !current ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning({ id: projects.id });
    if (updated.length === 0) {
      return { error: 'Project not found.' };
    }
    revalidatePath('/admin/projects');
    return {};
  } catch (error) {
    console.error('Failed to toggle published:', error);
    return { error: 'Failed to toggle published.' };
  }
}

export async function moveProjectToSite(
  projectId: string,
  targetSiteId: string
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(projectId)) return { error: 'Invalid project ID.' };
  if (!isValidUUID(targetSiteId)) return { error: 'Invalid target site ID.' };

  try {
    // Verify project exists and get current siteId
    const [project] = await db
      .select({ id: projects.id, siteId: projects.siteId })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    if (!project) return { error: 'Project not found.' };
    if (project.siteId === targetSiteId) return { error: 'Project is already in this site.' };

    // Verify target site exists
    const [targetSite] = await db
      .select({ id: sitesTable.id })
      .from(sitesTable)
      .where(eq(sitesTable.id, targetSiteId))
      .limit(1);
    if (!targetSite) return { error: 'Target site not found.' };

    // Place at end of target site
    const [maxRow] = await db
      .select({ max: sql<number>`coalesce(max(${projects.displayOrderInSite}), -1)` })
      .from(projects)
      .where(eq(projects.siteId, targetSiteId));
    const newOrder = (maxRow?.max ?? -1) + 1;

    await db
      .update(projects)
      .set({ siteId: targetSiteId, displayOrderInSite: newOrder, updatedAt: new Date() })
      .where(eq(projects.id, projectId));

    revalidatePath('/admin/sites');
    return { success: true };
  } catch (error) {
    console.error('Failed to move project:', error);
    return { error: 'Failed to move project.' };
  }
}

export async function reorderProjectsInSite(
  siteId: string,
  projectIds: string[]
): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(siteId)) return { error: 'Invalid site ID.' };

  try {
    // Validate all IDs first
    const validIds = projectIds.filter((id) => isValidUUID(id));
    if (validIds.length === 0) return { error: 'No valid project IDs provided.' };

    // Update display order — scoped to the specified site for safety
    const now = new Date();
    await Promise.all(
      validIds.map((projectId, index) =>
        db
          .update(projects)
          .set({ displayOrderInSite: index, updatedAt: now })
          .where(and(eq(projects.id, projectId), eq(projects.siteId, siteId)))
      )
    );

    revalidatePath('/admin/sites');
    return {};
  } catch (error) {
    console.error('Failed to reorder projects:', error);
    return { error: 'Failed to reorder projects.' };
  }
}

