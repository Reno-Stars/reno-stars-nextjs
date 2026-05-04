'use server';

// NOTE: console.error is used for error logging until a structured logger is available.

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { designs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidUrl, validateTextLengths, MAX_SHORT_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { triggerDeploy } from '@/lib/deploy-hook';

interface DesignItemData {
  imageUrl: string;
  titleEn: string | null;
  titleZh: string | null;
  displayOrder: number;
  isPublished: boolean;
}

async function parseDesignFormData(formData: FormData, defaultDisplayOrder = '0'): Promise<{ data?: DesignItemData; error?: string }> {
  const imageUrl = getString(formData, 'imageUrl').trim();
  const titleEn = getString(formData, 'titleEn') || null;
  const titleZh = getString(formData, 'titleZh') || null;
  const displayOrder = parseInt(getString(formData, 'displayOrder') || defaultDisplayOrder, 10);
  const isPublished = formData.get('isPublished') === 'on';

  if (!imageUrl) return { error: 'Image URL is required.' };
  if (!isValidUrl(imageUrl)) return { error: 'Invalid image URL format.' };

  const titleError = validateTextLengths({ titleEn, titleZh }, MAX_SHORT_TEXT_LENGTH);
  if (titleError) return { error: titleError };
  if (!Number.isFinite(displayOrder) || displayOrder < 0) {
    return { error: 'Display order must be a non-negative number.' };
  }

  return { data: { imageUrl, titleEn, titleZh, displayOrder, isPublished } };
}

export async function createDesignItem(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  try {
    const result = await parseDesignFormData(formData, '0');
    if (result.error || !result.data) return { error: result.error ?? 'Invalid data.' };

    await db.insert(designs).values(result.data);

    revalidatePath('/admin/designs');
    triggerDeploy('designs');
    updateTag('designs');
  } catch (error) {
    console.error('Failed to create design item:', error);
    return { error: 'Failed to create design item.' };
  }

  redirect('/admin/designs');
}

export async function updateDesignItem(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid design item ID.' };
  try {
    const result = await parseDesignFormData(formData);
    if (result.error || !result.data) return { error: result.error ?? 'Invalid data.' };

    const updated = await db.update(designs).set(result.data).where(eq(designs.id, id)).returning({ id: designs.id });
    if (updated.length === 0) return { error: 'Design item not found.' };

    revalidatePath('/admin/designs');
    triggerDeploy('designs');
    updateTag('designs');
    return { success: true };
  } catch (error) {
    console.error('Failed to update design item:', error);
    return { error: 'Failed to update design item.' };
  }
}

export async function toggleDesignItemPublished(id: string, current: boolean): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid design item ID.' };
  try {
    const updated = await db.update(designs).set({ isPublished: !current }).where(eq(designs.id, id)).returning({ id: designs.id });
    if (updated.length === 0) return { error: 'Design item not found.' };
    revalidatePath('/admin/designs');
    triggerDeploy('designs');
    updateTag('designs');
    return {};
  } catch (error) {
    console.error('Failed to toggle design item published:', error);
    return { error: 'Failed to toggle design item published.' };
  }
}

export async function deleteDesignItem(id: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid design item ID.' };
  try {
    const deleted = await db.delete(designs).where(eq(designs.id, id)).returning({ id: designs.id });
    if (deleted.length === 0) return { error: 'Design item not found.' };
    revalidatePath('/admin/designs');
    triggerDeploy('designs');
    updateTag('designs');
    return {};
  } catch (error) {
    console.error('Failed to delete design item:', error);
    return { error: 'Failed to delete design item.' };
  }
}

export async function reorderDesignItems(
  orderedIds: string[]
): Promise<{ error?: string }> {
  await requireAuth();

  if (orderedIds.length > 200) return { error: 'Too many items.' };
  if (new Set(orderedIds).size !== orderedIds.length) return { error: 'Duplicate IDs.' };
  for (const id of orderedIds) {
    if (!isValidUUID(id)) return { error: 'Invalid design item ID in list.' };
  }

  try {
    await Promise.all(
      orderedIds.map((id, i) =>
        db.update(designs)
          .set({ displayOrder: i })
          .where(eq(designs.id, id))
      )
    );

    revalidatePath('/admin/designs');
    triggerDeploy('designs');
    updateTag('designs');
    return {};
  } catch (error) {
    console.error('Failed to reorder design items:', error);
    return { error: 'Failed to reorder design items.' };
  }
}
