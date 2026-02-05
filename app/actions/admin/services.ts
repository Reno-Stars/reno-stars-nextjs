'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { services } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidUrl, validateTextLengths, MAX_TEXT_LENGTH, MAX_SHORT_TEXT_LENGTH } from '@/lib/admin/form-utils';

export async function updateService(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid service ID.' };

  try {
    const data = {
      titleEn: getString(formData, 'titleEn').trim(),
      titleZh: getString(formData, 'titleZh').trim(),
      descriptionEn: getString(formData, 'descriptionEn').trim(),
      descriptionZh: getString(formData, 'descriptionZh').trim(),
      longDescriptionEn: getString(formData, 'longDescriptionEn') || null,
      longDescriptionZh: getString(formData, 'longDescriptionZh') || null,
      iconName: getString(formData, 'iconName') || null,
      imageUrl: getString(formData, 'imageUrl') || null,
      updatedAt: new Date(),
    };

    if (!data.titleEn || !data.titleZh) {
      return { error: 'Titles are required.' };
    }
    const titleError = validateTextLengths(
      { titleEn: data.titleEn, titleZh: data.titleZh }, MAX_SHORT_TEXT_LENGTH
    );
    if (titleError) return { error: titleError };
    if (data.imageUrl && !isValidUrl(data.imageUrl)) {
      return { error: 'Image URL is not a valid URL.' };
    }
    const textError = validateTextLengths({
      descriptionEn: data.descriptionEn, descriptionZh: data.descriptionZh,
      longDescriptionEn: data.longDescriptionEn, longDescriptionZh: data.longDescriptionZh,
    }, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };

    const updated = await db.update(services).set(data).where(eq(services.id, id)).returning({ id: services.id });
    if (updated.length === 0) {
      return { error: 'Service not found.' };
    }

    revalidatePath('/admin/services');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update service:', error);
    return { error: 'Failed to update service.' };
  }
}
