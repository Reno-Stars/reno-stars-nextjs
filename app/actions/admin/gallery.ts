'use server';

// NOTE: console.error is used for error logging until a structured logger is available.

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { galleryItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidUrl, validateTextLengths, MAX_SHORT_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { GALLERY_CATEGORIES, type GalleryCategory } from '@/lib/admin/gallery-categories';

interface GalleryItemData {
  imageUrl: string;
  titleEn: string | null;
  titleZh: string | null;
  category: GalleryCategory;
  displayOrder: number;
  isPublished: boolean;
}

function parseGalleryFormData(formData: FormData, defaultDisplayOrder = '0'): { data?: GalleryItemData; error?: string } {
  const imageUrl = getString(formData, 'imageUrl').trim();
  const titleEn = getString(formData, 'titleEn') || null;
  const titleZh = getString(formData, 'titleZh') || null;
  const categoryRaw = getString(formData, 'category');
  const displayOrder = parseInt(getString(formData, 'displayOrder') || defaultDisplayOrder, 10);
  const isPublished = formData.get('isPublished') === 'on';

  if (!imageUrl) return { error: 'Image URL is required.' };
  if (!isValidUrl(imageUrl)) return { error: 'Invalid image URL format.' };
  if (!GALLERY_CATEGORIES.includes(categoryRaw as GalleryCategory)) {
    return { error: 'Invalid category.' };
  }
  const category = categoryRaw as GalleryCategory;
  const titleError = validateTextLengths({ titleEn, titleZh }, MAX_SHORT_TEXT_LENGTH);
  if (titleError) return { error: titleError };
  if (!Number.isFinite(displayOrder) || displayOrder < 0) {
    return { error: 'Display order must be a non-negative number.' };
  }

  return { data: { imageUrl, titleEn, titleZh, category, displayOrder, isPublished } };
}

export async function createGalleryItem(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  try {
    const result = parseGalleryFormData(formData, '0');
    if (result.error || !result.data) return { error: result.error ?? 'Invalid data.' };

    await db.insert(galleryItems).values(result.data);

    revalidatePath('/admin/gallery');
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to create gallery item:', error);
    return { error: 'Failed to create gallery item.' };
  }

  redirect('/admin/gallery');
}

export async function updateGalleryItem(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid gallery item ID.' };
  try {
    const result = parseGalleryFormData(formData);
    if (result.error || !result.data) return { error: result.error ?? 'Invalid data.' };

    const updated = await db.update(galleryItems).set(result.data).where(eq(galleryItems.id, id)).returning({ id: galleryItems.id });
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

export async function deleteGalleryItem(id: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid gallery item ID.' };
  try {
    const deleted = await db.delete(galleryItems).where(eq(galleryItems.id, id)).returning({ id: galleryItems.id });
    if (deleted.length === 0) return { error: 'Gallery item not found.' };
    revalidatePath('/admin/gallery');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to delete gallery item:', error);
    return { error: 'Failed to delete gallery item.' };
  }
}

export async function reorderGalleryItems(
  orderedIds: string[]
): Promise<{ error?: string }> {
  await requireAuth();

  // Validate all IDs
  for (const id of orderedIds) {
    if (!isValidUUID(id)) return { error: 'Invalid gallery item ID in list.' };
  }

  try {
    // Update display order for each item
    await Promise.all(
      orderedIds.map((id, i) =>
        db.update(galleryItems)
          .set({ displayOrder: i })
          .where(eq(galleryItems.id, id))
      )
    );

    revalidatePath('/admin/gallery');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to reorder gallery items:', error);
    return { error: 'Failed to reorder gallery items.' };
  }
}
