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
  const parentProjectId = getString(formData, 'parentProjectId').trim();
  const childDisplayOrderStr = getString(formData, 'childDisplayOrder').trim();
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
    isWholeHouse: formData.get('isWholeHouse') === 'on',
    parentProjectId: parentProjectId && isValidUUID(parentProjectId) ? parentProjectId : null,
    childDisplayOrder: childDisplayOrderStr ? parseInt(childDisplayOrderStr, 10) || 0 : 0,
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

    // Whole House validation: cannot have a parent
    if (data.isWholeHouse && data.parentProjectId) {
      return { error: 'A Whole House container cannot have a parent project.' };
    }

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

    // Validate parent project exists if specified
    if (data.parentProjectId) {
      const parentRows = await db
        .select({ id: projects.id, isWholeHouse: projects.isWholeHouse })
        .from(projects)
        .where(eq(projects.id, data.parentProjectId))
        .limit(1);
      if (!parentRows[0]) {
        return { error: 'Parent project not found.' };
      }
      if (!parentRows[0].isWholeHouse) {
        return { error: 'Parent project must be a Whole House container.' };
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

    // Whole House validation: cannot have a parent
    if (data.isWholeHouse && data.parentProjectId) {
      return { error: 'A Whole House container cannot have a parent project.' };
    }

    // Circular reference check: parent cannot be self or a descendant
    if (data.parentProjectId) {
      if (data.parentProjectId === id) {
        return { error: 'A project cannot be its own parent.' };
      }
      // Check if the proposed parent is a child of this project (circular)
      const childrenRows = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.parentProjectId, id));
      if (childrenRows.some((c: { id: string }) => c.id === data.parentProjectId)) {
        return { error: 'Cannot set a child project as the parent (circular reference).' };
      }
    }

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

    // Validate parent project exists if specified
    if (data.parentProjectId) {
      const parentRows = await db
        .select({ id: projects.id, isWholeHouse: projects.isWholeHouse })
        .from(projects)
        .where(eq(projects.id, data.parentProjectId))
        .limit(1);
      if (!parentRows[0]) {
        return { error: 'Parent project not found.' };
      }
      if (!parentRows[0].isWholeHouse) {
        return { error: 'Parent project must be a Whole House container.' };
      }
    }

    // Ensure slug is unique (exclude current project's own slug)
    const currentProject = await db.select({ slug: projects.slug }).from(projects).where(eq(projects.id, id)).limit(1);
    const currentSlug = currentProject[0]?.slug;
    const allSlugs = await db.select({ slug: projects.slug }).from(projects);
    data.slug = ensureUniqueSlug(data.slug, allSlugs.map((r: { slug: string }) => r.slug), currentSlug);

    const scopeData = parseScopes(formData);

    // Wrap in transaction to avoid data loss if insert fails after delete
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.transaction(async (tx: any) => {
      await tx
        .update(projects)
        .set({ ...data, serviceId: svcRows[0].id })
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

export async function toggleWholeHouse(id: string, current: boolean): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid project ID.' };
  try {
    // If turning ON whole house, check project doesn't have a parent
    if (!current) {
      const projectRows = await db
        .select({ parentProjectId: projects.parentProjectId })
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);
      if (projectRows[0]?.parentProjectId) {
        return { error: 'Cannot make a child project into a Whole House container. Unlink it first.' };
      }
    }
    // If turning OFF whole house, unlink all children
    if (current) {
      await db
        .update(projects)
        .set({ parentProjectId: null, updatedAt: new Date() })
        .where(eq(projects.parentProjectId, id));
    }
    const updated = await db
      .update(projects)
      .set({ isWholeHouse: !current, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning({ id: projects.id });
    if (updated.length === 0) {
      return { error: 'Project not found.' };
    }
    revalidatePath('/admin/projects');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to toggle whole house:', error);
    return { error: 'Failed to toggle whole house.' };
  }
}

export async function linkChildToParent(
  childId: string,
  parentId: string,
  displayOrder: number = 0
): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(childId)) return { error: 'Invalid child project ID.' };
  if (!isValidUUID(parentId)) return { error: 'Invalid parent project ID.' };
  if (childId === parentId) return { error: 'A project cannot be its own child.' };

  try {
    // Verify parent is a whole house container
    const parentRows = await db
      .select({ isWholeHouse: projects.isWholeHouse })
      .from(projects)
      .where(eq(projects.id, parentId))
      .limit(1);
    if (!parentRows[0]) {
      return { error: 'Parent project not found.' };
    }
    if (!parentRows[0].isWholeHouse) {
      return { error: 'Parent project must be a Whole House container.' };
    }

    // Verify child is not a whole house container
    const childRows = await db
      .select({ isWholeHouse: projects.isWholeHouse })
      .from(projects)
      .where(eq(projects.id, childId))
      .limit(1);
    if (!childRows[0]) {
      return { error: 'Child project not found.' };
    }
    if (childRows[0].isWholeHouse) {
      return { error: 'A Whole House container cannot be a child project.' };
    }

    await db
      .update(projects)
      .set({ parentProjectId: parentId, childDisplayOrder: displayOrder, updatedAt: new Date() })
      .where(eq(projects.id, childId));

    revalidatePath('/admin/projects');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to link child to parent:', error);
    return { error: 'Failed to link projects.' };
  }
}

export async function unlinkChildFromParent(childId: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(childId)) return { error: 'Invalid project ID.' };

  try {
    const updated = await db
      .update(projects)
      .set({ parentProjectId: null, childDisplayOrder: 0, updatedAt: new Date() })
      .where(eq(projects.id, childId))
      .returning({ id: projects.id });
    if (updated.length === 0) {
      return { error: 'Project not found.' };
    }
    revalidatePath('/admin/projects');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to unlink child from parent:', error);
    return { error: 'Failed to unlink project.' };
  }
}
