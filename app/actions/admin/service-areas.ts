'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { serviceAreas, contactSubmissions } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidSlug, validateTextLengths, MAX_SHORT_TEXT_LENGTH, MAX_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { ensureUniqueSlug } from '@/lib/utils';

export async function createServiceArea(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  try {
    const slug = getString(formData, 'slug').trim().toLowerCase();
    const nameEn = getString(formData, 'nameEn').trim();
    const nameZh = getString(formData, 'nameZh').trim();
    const descriptionEn = getString(formData, 'descriptionEn') || null;
    const descriptionZh = getString(formData, 'descriptionZh') || null;
    const displayOrder = parseInt(getString(formData, 'displayOrder') || '0', 10);
    const isActive = formData.get('isActive') === 'on';

    if (!slug) return { error: 'Slug is required.' };
    if (!isValidSlug(slug)) return { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' };
    if (!nameEn || !nameZh) return { error: 'Names are required.' };
    const nameError = validateTextLengths({ nameEn, nameZh }, MAX_SHORT_TEXT_LENGTH);
    if (nameError) return { error: nameError };
    const descError = validateTextLengths({ descriptionEn, descriptionZh }, MAX_TEXT_LENGTH);
    if (descError) return { error: descError };
    if (!Number.isFinite(displayOrder) || displayOrder < 0) {
      return { error: 'Display order must be a non-negative number.' };
    }

    const existingSlugs = await db.select({ slug: serviceAreas.slug }).from(serviceAreas);
    const uniqueSlug = ensureUniqueSlug(slug, existingSlugs.map((r: { slug: string }) => r.slug));

    await db.insert(serviceAreas).values({
      slug: uniqueSlug,
      nameEn,
      nameZh,
      descriptionEn,
      descriptionZh,
      displayOrder,
      isActive,
    });

    revalidatePath('/admin/service-areas');
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to create service area:', error);
    return { error: 'Failed to create service area.' };
  }

  redirect('/admin/service-areas');
}

export async function deleteServiceArea(id: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid service area ID.' };
  try {
    const [{ value: refCount }] = await db
      .select({ value: count() })
      .from(contactSubmissions)
      .where(eq(contactSubmissions.preferredAreaId, id));
    if (refCount > 0) {
      return { error: `Cannot delete: ${refCount} contact(s) reference this area.` };
    }

    const deleted = await db.delete(serviceAreas).where(eq(serviceAreas.id, id)).returning({ id: serviceAreas.id });
    if (deleted.length === 0) return { error: 'Service area not found.' };
    revalidatePath('/admin/service-areas');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to delete service area:', error);
    return { error: 'Failed to delete service area.' };
  }
}

export async function updateServiceArea(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid service area ID.' };
  try {
    const data = {
      nameEn: getString(formData, 'nameEn').trim(),
      nameZh: getString(formData, 'nameZh').trim(),
      descriptionEn: getString(formData, 'descriptionEn') || null,
      descriptionZh: getString(formData, 'descriptionZh') || null,
      displayOrder: parseInt(getString(formData, 'displayOrder'), 10),
      isActive: formData.get('isActive') === 'on',
      updatedAt: new Date(),
    };

    if (!data.nameEn || !data.nameZh) return { error: 'Names are required.' };
    const nameError = validateTextLengths({ nameEn: data.nameEn, nameZh: data.nameZh }, MAX_SHORT_TEXT_LENGTH);
    if (nameError) return { error: nameError };
    const descError = validateTextLengths({ descriptionEn: data.descriptionEn, descriptionZh: data.descriptionZh }, MAX_TEXT_LENGTH);
    if (descError) return { error: descError };
    if (!Number.isFinite(data.displayOrder) || data.displayOrder < 0) {
      return { error: 'Display order must be a non-negative number.' };
    }

    const updated = await db.update(serviceAreas).set(data).where(eq(serviceAreas.id, id)).returning({ id: serviceAreas.id });
    if (updated.length === 0) return { error: 'Service area not found.' };

    revalidatePath('/admin/service-areas');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update service area:', error);
    return { error: 'Failed to update service area.' };
  }
}

export async function toggleServiceAreaActive(id: string, current: boolean): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid service area ID.' };
  try {
    const updated = await db.update(serviceAreas).set({ isActive: !current, updatedAt: new Date() }).where(eq(serviceAreas.id, id)).returning({ id: serviceAreas.id });
    if (updated.length === 0) return { error: 'Service area not found.' };
    revalidatePath('/admin/service-areas');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to toggle service area active:', error);
    return { error: 'Failed to toggle service area active.' };
  }
}
