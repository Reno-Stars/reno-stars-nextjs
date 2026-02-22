'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { trustBadges } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, validateTextLengths, MAX_SHORT_TEXT_LENGTH } from '@/lib/admin/form-utils';

export async function createTrustBadge(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  try {
    const badgeEn = getString(formData, 'badgeEn').trim();
    const badgeZh = getString(formData, 'badgeZh').trim();
    const displayOrder = parseInt(getString(formData, 'displayOrder'), 10);
    const isActive = formData.get('isActive') === 'on';

    if (!badgeEn || !badgeZh) return { error: 'Badge text is required in both languages.' };
    const textError = validateTextLengths({ badgeEn, badgeZh }, MAX_SHORT_TEXT_LENGTH);
    if (textError) return { error: textError };
    if (!Number.isFinite(displayOrder) || displayOrder < 0) {
      return { error: 'Display order must be a non-negative number.' };
    }

    await db.insert(trustBadges).values({ badgeEn, badgeZh, displayOrder, isActive });

    revalidatePath('/admin/trust-badges');
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to create trust badge:', error);
    return { error: 'Failed to create trust badge.' };
  }
  redirect('/admin/trust-badges');
}

export async function reorderTrustBadges(orderedIds: string[]): Promise<{ error?: string }> {
  await requireAuth();

  if (orderedIds.length > 200) return { error: 'Too many items.' };
  if (new Set(orderedIds).size !== orderedIds.length) return { error: 'Duplicate IDs.' };
  for (const id of orderedIds) {
    if (!isValidUUID(id)) return { error: 'Invalid trust badge ID in list.' };
  }

  try {
    // trustBadges table has no updatedAt column (unlike services/serviceAreas/faqs)
    await Promise.all(
      orderedIds.map((id, i) =>
        db.update(trustBadges)
          .set({ displayOrder: i })
          .where(eq(trustBadges.id, id))
      )
    );

    revalidatePath('/admin/trust-badges');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to reorder trust badges:', error);
    return { error: 'Failed to reorder trust badges.' };
  }
}

export async function deleteTrustBadge(id: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid trust badge ID.' };
  try {
    const deleted = await db.delete(trustBadges).where(eq(trustBadges.id, id)).returning({ id: trustBadges.id });
    if (deleted.length === 0) return { error: 'Trust badge not found.' };
    revalidatePath('/admin/trust-badges');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to delete trust badge:', error);
    return { error: 'Failed to delete trust badge.' };
  }
}

export async function updateTrustBadge(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid trust badge ID.' };
  try {
    const badgeEn = getString(formData, 'badgeEn').trim();
    const badgeZh = getString(formData, 'badgeZh').trim();
    const displayOrder = parseInt(getString(formData, 'displayOrder'), 10);
    const isActive = formData.get('isActive') === 'on';

    if (!badgeEn || !badgeZh) return { error: 'Badge text is required in both languages.' };
    const textError = validateTextLengths({ badgeEn, badgeZh }, MAX_SHORT_TEXT_LENGTH);
    if (textError) return { error: textError };
    if (!Number.isFinite(displayOrder) || displayOrder < 0) {
      return { error: 'Display order must be a non-negative number.' };
    }

    const updated = await db.update(trustBadges).set({
      badgeEn, badgeZh, displayOrder, isActive,
    }).where(eq(trustBadges.id, id)).returning({ id: trustBadges.id });
    if (updated.length === 0) return { error: 'Trust badge not found.' };

    revalidatePath('/admin/trust-badges');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update trust badge:', error);
    return { error: 'Failed to update trust badge.' };
  }
}

export async function toggleTrustBadgeActive(id: string, current: boolean): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid trust badge ID.' };
  try {
    const updated = await db.update(trustBadges).set({ isActive: !current }).where(eq(trustBadges.id, id)).returning({ id: trustBadges.id });
    if (updated.length === 0) return { error: 'Trust badge not found.' };
    revalidatePath('/admin/trust-badges');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to toggle trust badge active:', error);
    return { error: 'Failed to toggle trust badge active.' };
  }
}
