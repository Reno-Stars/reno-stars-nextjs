'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import {
  projects,
  projectImages,
  projectScopes,
  services as servicesTable,
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidSlug } from '@/lib/admin/form-utils';

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

    // Look up serviceId
    const svcRows = await db
      .select({ id: servicesTable.id })
      .from(servicesTable)
      .where(eq(servicesTable.slug, data.serviceType as string))
      .limit(1);

    const [inserted] = await db
      .insert(projects)
      .values({
        ...data,
        serviceId: svcRows[0]?.id ?? null,
        publishedAt: data.isPublished ? new Date() : null,
      })
      .returning({ id: projects.id });

    const imgData = parseImages(formData);
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

    const svcRows = await db
      .select({ id: servicesTable.id })
      .from(servicesTable)
      .where(eq(servicesTable.slug, data.serviceType as string))
      .limit(1);

    const imgData = parseImages(formData);
    const scopeData = parseScopes(formData);

    // Wrap in transaction to avoid data loss if insert fails after delete
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.transaction(async (tx: any) => {
      await tx
        .update(projects)
        .set({ ...data, serviceId: svcRows[0]?.id ?? null })
        .where(eq(projects.id, id));

      await tx.delete(projectImages).where(eq(projectImages.projectId, id));
      await tx.delete(projectScopes).where(eq(projectScopes.projectId, id));

      if (imgData.length > 0) {
        await tx.insert(projectImages).values(
          imgData.map((img) => ({ ...img, projectId: id }))
        );
      }

      if (scopeData.length > 0) {
        await tx.insert(projectScopes).values(
          scopeData.map((s) => ({ ...s, projectId: id }))
        );
      }
    });

    revalidatePath('/admin/projects');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update project:', error);
    return { error: 'Failed to update project.' };
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
    await db.update(projects).set({ featured: !current, updatedAt: new Date() }).where(eq(projects.id, id));
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
    await db
      .update(projects)
      .set({
        isPublished: !current,
        publishedAt: !current ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id));
    revalidatePath('/admin/projects');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to toggle published:', error);
    return { error: 'Failed to toggle published.' };
  }
}
