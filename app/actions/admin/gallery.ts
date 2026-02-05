'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { galleryItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidUrl, validateTextLengths, MAX_SHORT_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { GALLERY_CATEGORIES, type GalleryCategory } from '@/lib/admin/gallery-categories';

export async function updateGalleryItem(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid gallery item ID.' };
  try {
    const imageUrl = getString(formData, 'imageUrl').trim();
    const titleEn = getString(formData, 'titleEn') || null;
    const titleZh = getString(formData, 'titleZh') || null;
    const category = getString(formData, 'category') as GalleryCategory;
    const displayOrder = parseInt(getString(formData, 'displayOrder'), 10);
    const isPublished = formData.get('isPublished') === 'on';

    if (!imageUrl) return { error: 'Image URL is required.' };
    if (!isValidUrl(imageUrl)) return { error: 'Invalid image URL format.' };
    if (!GALLERY_CATEGORIES.includes(category)) return { error: 'Invalid category.' };
    const titleError = validateTextLengths({ titleEn, titleZh }, MAX_SHORT_TEXT_LENGTH);
    if (titleError) return { error: titleError };
    if (!Number.isFinite(displayOrder) || displayOrder < 0) {
      return { error: 'Display order must be a non-negative number.' };
    }

    const updated = await db.update(galleryItems).set({
      imageUrl, titleEn, titleZh, category, displayOrder, isPublished,
    }).where(eq(galleryItems.id, id)).returning({ id: galleryItems.id });
    if (updated.length === 0) return { error: 'Gallery item not found.' };

    revalidatePath('/admin/gallery');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update gallery item:', error);
    return { error: 'Failed to update gallery item.' };
  }
}

export async function toggleGalleryItemPublished(id: string, current: boolean): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid gallery item ID.' };
  try {
    const updated = await db.update(galleryItems).set({ isPublished: !current }).where(eq(galleryItems.id, id)).returning({ id: galleryItems.id });
    if (updated.length === 0) return { error: 'Gallery item not found.' };
    revalidatePath('/admin/gallery');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to toggle gallery item published:', error);
    return { error: 'Failed to toggle gallery item published.' };
  }
}
