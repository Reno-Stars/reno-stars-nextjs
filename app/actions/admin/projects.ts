'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import {
  projects,
  projectImages,
  projectScopes,
  projectExternalProducts,
  services as servicesTable,
  projectSites as sitesTable,
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidSlug, isValidUrl, validateTextLengths, MAX_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { ensureUniqueSlug } from '@/lib/utils';
import { SERVICE_TYPES, SERVICE_TYPE_TO_CATEGORY, SPACE_TYPE_TO_ZH, ServiceTypeKey } from '@/lib/admin/constants';

const MAX_IMAGES = 50;
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

function parseImages(formData: FormData) {
  const images: {
    imageUrl: string;
    altTextEn: string;
    altTextZh: string;
    isBefore: boolean;
    displayOrder: number;
  }[] = [];
  let i = 0;
  while (formData.has(`images[${i}].url`) && i < MAX_IMAGES) {
    const imageUrl = getString(formData, `images[${i}].url`).trim();
    if (!imageUrl) { i++; continue; }
    images.push({
      imageUrl,
      altTextEn: getString(formData, `images[${i}].altEn`),
      altTextZh: getString(formData, `images[${i}].altZh`),
      isBefore: formData.get(`images[${i}].isBefore`) === 'true',
      displayOrder: i,
    });
    i++;
  }
  return images;
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
  // Auto-derive category from service type
  const category = (serviceType in SERVICE_TYPE_TO_CATEGORY
    ? SERVICE_TYPE_TO_CATEGORY[serviceType as ServiceTypeKey]
    : { en: serviceType, zh: serviceType });
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
    serviceType: serviceType as typeof projects.$inferInsert['serviceType'],
    categoryEn: category.en,
    categoryZh: category.zh,
    locationCity: getString(formData, 'locationCity') || null,
    budgetRange: formatBudgetRange(budgetMin, budgetMax),
    durationEn: getString(formData, 'durationEn') || null,
    durationZh: getString(formData, 'durationZh') || null,
    spaceTypeEn: spaceTypeEn || null,
    spaceTypeZh: spaceTypeZh || null,
    heroImageUrl: getString(formData, 'heroImageUrl') || null,
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
    if (!(SERVICE_TYPES as readonly string[]).includes(data.serviceType as string)) {
      return { error: 'Invalid service type.' };
    }
    if (data.heroImageUrl && !isValidUrl(data.heroImageUrl)) {
      return { error: 'Hero image URL is not a valid URL.' };
    }
    const textError = validateTextLengths({
      descriptionEn: data.descriptionEn, descriptionZh: data.descriptionZh,
      challengeEn: data.challengeEn, challengeZh: data.challengeZh,
      solutionEn: data.solutionEn, solutionZh: data.solutionZh,
    }, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };

    const imgData = parseImages(formData);
    const invalidImgUrl = imgData.find((img) => !isValidUrl(img.imageUrl));
    if (invalidImgUrl) {
      return { error: `Image URL is not valid: ${invalidImgUrl.imageUrl.slice(0, 60)}` };
    }

    const epData = parseExternalProducts(formData);
    const invalidEpUrl = epData.find((ep) => !isValidUrl(ep.url));
    if (invalidEpUrl) {
      return { error: `External product URL is not valid: ${invalidEpUrl.url.slice(0, 60)}` };
    }
    const invalidEpImgUrl = epData.find((ep) => ep.imageUrl && !isValidUrl(ep.imageUrl));
    if (invalidEpImgUrl) {
      return { error: `External product image URL is not valid: ${invalidEpImgUrl.imageUrl!.slice(0, 60)}` };
    }

    // Look up serviceId
    const svcRows = await db
      .select({ id: servicesTable.id })
      .from(servicesTable)
      .where(eq(servicesTable.slug, data.serviceType as string))
      .limit(1);
    if (!svcRows[0]) {
      return { error: `Service type "${data.serviceType}" not found in database.` };
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
    const allSlugs = await db.select({ slug: projects.slug }).from(projects);
    data.slug = ensureUniqueSlug(data.slug, allSlugs.map((r: { slug: string }) => r.slug));

    const [inserted] = await db
      .insert(projects)
      .values({
        ...data,
        serviceId: svcRows[0].id,
        publishedAt: data.isPublished ? new Date() : null,
      })
      .returning({ id: projects.id });

    if (imgData.length > 0) {
      await db.insert(projectImages).values(
        imgData.map((img) => ({ ...img, projectId: inserted.id }))
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
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to create project:', error);
    return { error: 'Failed to create project.' };
  }

  redirect('/admin/projects');
}

export async function updateProject(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
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
    if (!(SERVICE_TYPES as readonly string[]).includes(data.serviceType as string)) {
      return { error: 'Invalid service type.' };
    }
    if (data.heroImageUrl && !isValidUrl(data.heroImageUrl)) {
      return { error: 'Hero image URL is not a valid URL.' };
    }
    const textError = validateTextLengths({
      descriptionEn: data.descriptionEn, descriptionZh: data.descriptionZh,
      challengeEn: data.challengeEn, challengeZh: data.challengeZh,
      solutionEn: data.solutionEn, solutionZh: data.solutionZh,
    }, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };

    const imgData = parseImages(formData);
    const invalidImgUrl = imgData.find((img) => !isValidUrl(img.imageUrl));
    if (invalidImgUrl) {
      return { error: `Image URL is not valid: ${invalidImgUrl.imageUrl.slice(0, 60)}` };
    }

    const epData = parseExternalProducts(formData);
    const invalidEpUrl = epData.find((ep) => !isValidUrl(ep.url));
    if (invalidEpUrl) {
      return { error: `External product URL is not valid: ${invalidEpUrl.url.slice(0, 60)}` };
    }
    const invalidEpImgUrl = epData.find((ep) => ep.imageUrl && !isValidUrl(ep.imageUrl));
    if (invalidEpImgUrl) {
      return { error: `External product image URL is not valid: ${invalidEpImgUrl.imageUrl!.slice(0, 60)}` };
    }

    const svcRows = await db
      .select({ id: servicesTable.id })
      .from(servicesTable)
      .where(eq(servicesTable.slug, data.serviceType as string))
      .limit(1);
    if (!svcRows[0]) {
      return { error: `Service type "${data.serviceType}" not found in database.` };
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
    const currentProject = await db.select({ slug: projects.slug }).from(projects).where(eq(projects.id, id)).limit(1);
    const currentSlug = currentProject[0]?.slug;
    const allSlugs = await db.select({ slug: projects.slug }).from(projects);
    data.slug = ensureUniqueSlug(data.slug, allSlugs.map((r: { slug: string }) => r.slug), currentSlug);

    const scopeData = parseScopes(formData);

    // Update project and related data atomically
    await db.transaction(async (tx: typeof db) => {
      await tx
        .update(projects)
        .set({ ...data, serviceId: svcRows[0].id })
        .where(eq(projects.id, id));

      // Delete and re-insert images
      await tx.delete(projectImages).where(eq(projectImages.projectId, id));
      if (imgData.length > 0) {
        await tx.insert(projectImages).values(
          imgData.map((img) => ({ ...img, projectId: id }))
        );
      }

      // Delete and re-insert scopes
      await tx.delete(projectScopes).where(eq(projectScopes.projectId, id));
      if (scopeData.length > 0) {
        await tx.insert(projectScopes).values(
          scopeData.map((s) => ({ ...s, projectId: id }))
        );
      }

      // Delete and re-insert external products
      await tx.delete(projectExternalProducts).where(eq(projectExternalProducts.projectId, id));
      if (epData.length > 0) {
        await tx.insert(projectExternalProducts).values(
          epData.map((ep) => ({ ...ep, projectId: id }))
        );
      }
    });

    revalidatePath('/admin/projects');
    revalidatePath('/', 'layout');
    return { success: true };
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
    revalidatePath('/', 'layout');
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
    revalidatePath('/', 'layout');
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
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to toggle published:', error);
    return { error: 'Failed to toggle published.' };
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
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to reorder projects:', error);
    return { error: 'Failed to reorder projects.' };
  }
}

