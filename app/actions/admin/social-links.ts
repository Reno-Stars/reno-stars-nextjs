'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { db } from '@/lib/db';
import { socialLinks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidUrl, validateTextLengths, MAX_SHORT_TEXT_LENGTH } from '@/lib/admin/form-utils';

export async function updateSocialLink(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid social link ID.' };
  try {
    const url = getString(formData, 'url').trim();
    const label = getString(formData, 'label').trim();
    const displayOrder = parseInt(getString(formData, 'displayOrder'), 10);
    const isActive = formData.get('isActive') === 'on';

    if (!url) return { error: 'URL is required.' };
    if (!isValidUrl(url)) return { error: 'Invalid URL format.' };
    const textError = validateTextLengths({ label }, MAX_SHORT_TEXT_LENGTH);
    if (textError) return { error: textError };
    if (!Number.isFinite(displayOrder) || displayOrder < 0) {
      return { error: 'Display order must be a non-negative number.' };
    }

    const updated = await db
      .update(socialLinks)
      .set({ url, label: label || null, displayOrder, isActive, })
      .where(eq(socialLinks.id, id))
      .returning({ id: socialLinks.id });

    if (updated.length === 0) return { error: 'Social link not found.' };

    revalidatePath('/admin/social-links');
    updateTag('social-links');
    return { success: true };
  } catch (error) {
    console.error('Failed to update social link:', error);
    return { error: 'Failed to update social link.' };
  }
}

export async function deleteSocialLink(id: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid social link ID.' };
  try {
    const deleted = await db
      .delete(socialLinks)
      .where(eq(socialLinks.id, id))
      .returning({ id: socialLinks.id });

    if (deleted.length === 0) return { error: 'Social link not found.' };

    revalidatePath('/admin/social-links');
    updateTag('social-links');
    return {};
  } catch (error) {
    console.error('Failed to delete social link:', error);
    return { error: 'Failed to delete social link.' };
  }
}

export async function toggleSocialLinkActive(
  id: string,
  current: boolean
): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid social link ID.' };
  try {
    const updated = await db
      .update(socialLinks)
      .set({ isActive: !current })
      .where(eq(socialLinks.id, id))
      .returning({ id: socialLinks.id });

    if (updated.length === 0) return { error: 'Social link not found.' };

    revalidatePath('/admin/social-links');
    updateTag('social-links');
    return {};
  } catch (error) {
    console.error('Failed to toggle social link active:', error);
    return { error: 'Failed to toggle social link active.' };
  }
}
