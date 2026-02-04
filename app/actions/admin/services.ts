'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { services } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString } from '@/lib/admin/form-utils';

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

    await db.update(services).set(data).where(eq(services.id, id));

    revalidatePath('/admin/services');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update service:', error);
    return { error: 'Failed to update service.' };
  }
}
