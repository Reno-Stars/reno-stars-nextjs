'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import {
  projects,
  projectImages,
  projectScopes,
  services as servicesTable,
  houses as housesTable,
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidSlug, isValidUrl, validateTextLengths, MAX_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { ensureUniqueSlug } from '@/lib/utils';

const MAX_IMAGES = 50;
const MAX_SCOPES = 50;
const VALID_SERVICE_TYPES = ['kitchen', 'bathroom', 'whole-house', 'basement', 'cabinet', 'commercial'] as const;

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

function getProjectData(formData: FormData) {
  const serviceType = getString(formData, 'serviceType');
  const houseId = getString(formData, 'houseId').trim();
  const displayOrderInHouseStr = getString(formData, 'displayOrderInHouse').trim();
  return {
    slug: getString(formData, 'slug').trim(),
    titleEn: getString(formData, 'titleEn').trim(),
    titleZh: getString(formData, 'titleZh').trim(),
    descriptionEn: getString(formData, 'descriptionEn').trim(),
    descriptionZh: getString(formData, 'descriptionZh').trim(),
    serviceType: serviceType as typeof projects.$inferInsert['serviceType'],
    categoryEn: getString(formData, 'categoryEn') || null,
    categoryZh: getString(formData, 'categoryZh') || null,
    locationCity: getString(formData, 'locationCity') || null,
    budgetRange: getString(formData, 'budgetRange') || null,
    durationEn: getString(formData, 'durationEn') || null,
    durationZh: getString(formData, 'durationZh') || null,
    spaceTypeEn: getString(formData, 'spaceTypeEn') || null,
    spaceTypeZh: getString(formData, 'spaceTypeZh') || null,
    heroImageUrl: getString(formData, 'heroImageUrl') || null,
    challengeEn: getString(formData, 'challengeEn') || null,
    challengeZh: getString(formData, 'challengeZh') || null,
    solutionEn: getString(formData, 'solutionEn') || null,
    solutionZh: getString(formData, 'solutionZh') || null,
    badgeEn: getString(formData, 'badgeEn') || null,
    badgeZh: getString(formData, 'badgeZh') || null,
    featured: formData.get('featured') === 'on',
    isPublished: formData.get('isPublished') === 'on',
    houseId: houseId && isValidUUID(houseId) ? houseId : null,
    displayOrderInHouse: displayOrderInHouseStr ? parseInt(displayOrderInHouseStr, 10) || 0 : 0,
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
    if (!(VALID_SERVICE_TYPES as readonly string[]).includes(data.serviceType as string)) {
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

    // Look up serviceId
    const svcRows = await db
      .select({ id: servicesTable.id })
      .from(servicesTable)
      .where(eq(servicesTable.slug, data.serviceType as string))
      .limit(1);
    if (!svcRows[0]) {
      return { error: `Service type "${data.serviceType}" not found in database.` };
    }

    // Validate house exists if specified
    if (data.houseId) {
      const houseRows = await db
        .select({ id: housesTable.id })
        .from(housesTable)
        .where(eq(housesTable.id, data.houseId))
        .limit(1);
      if (!houseRows[0]) {
        return { error: 'House not found.' };
      }
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

    revalidatePath('/admin/projects');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to create project:', error);
    return { error: 'Failed to create project.' };
  }
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
    if (!(VALID_SERVICE_TYPES as readonly string[]).includes(data.serviceType as string)) {
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

    const svcRows = await db
      .select({ id: servicesTable.id })
      .from(servicesTable)
      .where(eq(servicesTable.slug, data.serviceType as string))
      .limit(1);
    if (!svcRows[0]) {
      return { error: `Service type "${data.serviceType}" not found in database.` };
    }

    // Validate house exists if specified
    if (data.houseId) {
      const houseRows = await db
        .select({ id: housesTable.id })
        .from(housesTable)
        .where(eq(housesTable.id, data.houseId))
        .limit(1);
      if (!houseRows[0]) {
        return { error: 'House not found.' };
      }
    }

    // Ensure slug is unique (exclude current project's own slug)
    const currentProject = await db.select({ slug: projects.slug }).from(projects).where(eq(projects.id, id)).limit(1);
    const currentSlug = currentProject[0]?.slug;
    const allSlugs = await db.select({ slug: projects.slug }).from(projects);
    data.slug = ensureUniqueSlug(data.slug, allSlugs.map((r: { slug: string }) => r.slug), currentSlug);

    const scopeData = parseScopes(formData);

    // Update project and related data
    // Note: Not using transaction as Neon HTTP driver has limited transaction support.
    // For admin operations, sequential updates are acceptable.
    await db
      .update(projects)
      .set({ ...data, serviceId: svcRows[0].id })
      .where(eq(projects.id, id));

    // Delete and re-insert images
    await db.delete(projectImages).where(eq(projectImages.projectId, id));
    if (imgData.length > 0) {
      await db.insert(projectImages).values(
        imgData.map((img) => ({ ...img, projectId: id }))
      );
    }

    // Delete and re-insert scopes
    await db.delete(projectScopes).where(eq(projectScopes.projectId, id));
    if (scopeData.length > 0) {
      await db.insert(projectScopes).values(
        scopeData.map((s) => ({ ...s, projectId: id }))
      );
    }

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

