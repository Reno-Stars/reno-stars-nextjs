'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { serviceAreas } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, validateTextLengths, MAX_SHORT_TEXT_LENGTH, MAX_TEXT_LENGTH } from '@/lib/admin/form-utils';

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
