'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { partners } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidUrl, validateTextLengths, MAX_SHORT_TEXT_LENGTH } from '@/lib/admin/form-utils';

interface PartnerData {
  nameEn: string;
  nameZh: string;
  logoUrl: string;
  websiteUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  isHiddenVisually: boolean;
}

function parsePartnerFormData(formData: FormData, defaultDisplayOrder = '0'): { data?: PartnerData; error?: string } {
  const nameEn = getString(formData, 'nameEn').trim();
  const nameZh = getString(formData, 'nameZh').trim();
  const logoUrl = getString(formData, 'logoUrl').trim();
  const websiteUrlRaw = getString(formData, 'websiteUrl').trim();
  const websiteUrl = websiteUrlRaw || null;
  const displayOrder = parseInt(getString(formData, 'displayOrder') || defaultDisplayOrder, 10);
  const isActive = formData.get('isActive') === 'on';
  const isHiddenVisually = formData.get('isHiddenVisually') === 'on';

  if (!nameEn || !nameZh) return { error: 'Partner name is required in both languages.' };
  const nameError = validateTextLengths({ nameEn, nameZh }, MAX_SHORT_TEXT_LENGTH);
  if (nameError) return { error: nameError };

  if (!logoUrl) return { error: 'Logo URL is required.' };
  if (!isValidUrl(logoUrl)) return { error: 'Invalid logo URL format.' };

  if (websiteUrl && !isValidUrl(websiteUrl)) return { error: 'Invalid website URL format.' };

  if (!Number.isFinite(displayOrder) || displayOrder < 0) {
    return { error: 'Display order must be a non-negative number.' };
  }

  return { data: { nameEn, nameZh, logoUrl, websiteUrl, displayOrder, isActive, isHiddenVisually } };
}

export async function createPartner(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  try {
    const result = parsePartnerFormData(formData, '0');
    if (result.error || !result.data) return { error: result.error ?? 'Invalid data.' };

    await db.insert(partners).values(result.data);

    revalidatePath('/admin/partners');
    updateTag('partners');
  } catch (error) {
    console.error('Failed to create partner:', error);
    return { error: 'Failed to create partner.' };
  }

  redirect('/admin/partners');
}

export async function updatePartner(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid partner ID.' };
  try {
    const result = parsePartnerFormData(formData);
    if (result.error || !result.data) return { error: result.error ?? 'Invalid data.' };

    const updated = await db.update(partners)
      .set({ ...result.data, updatedAt: new Date() })
      .where(eq(partners.id, id))
      .returning({ id: partners.id });
    if (updated.length === 0) return { error: 'Partner not found.' };

    revalidatePath('/admin/partners');
    updateTag('partners');
    return { success: true };
  } catch (error) {
    console.error('Failed to update partner:', error);
    return { error: 'Failed to update partner.' };
  }
}

export async function deletePartner(id: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid partner ID.' };
  try {
    const deleted = await db.delete(partners).where(eq(partners.id, id)).returning({ id: partners.id });
    if (deleted.length === 0) return { error: 'Partner not found.' };
    revalidatePath('/admin/partners');
    updateTag('partners');
    return {};
  } catch (error) {
    console.error('Failed to delete partner:', error);
    return { error: 'Failed to delete partner.' };
  }
}

export async function togglePartnerActive(id: string, current: boolean): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid partner ID.' };
  try {
    const updated = await db.update(partners)
      .set({ isActive: !current, updatedAt: new Date() })
      .where(eq(partners.id, id))
      .returning({ id: partners.id });
    if (updated.length === 0) return { error: 'Partner not found.' };
    revalidatePath('/admin/partners');
    updateTag('partners');
    return {};
  } catch (error) {
    console.error('Failed to toggle partner active:', error);
    return { error: 'Failed to toggle partner active.' };
  }
}

export async function togglePartnerHidden(id: string, current: boolean): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid partner ID.' };
  try {
    const updated = await db.update(partners)
      .set({ isHiddenVisually: !current, updatedAt: new Date() })
      .where(eq(partners.id, id))
      .returning({ id: partners.id });
    if (updated.length === 0) return { error: 'Partner not found.' };
    revalidatePath('/admin/partners');
    updateTag('partners');
    return {};
  } catch (error) {
    console.error('Failed to toggle partner visibility:', error);
    return { error: 'Failed to toggle partner visibility.' };
  }
}

export async function reorderPartners(orderedIds: string[]): Promise<{ error?: string }> {
  await requireAuth();

  if (orderedIds.length > 200) return { error: 'Too many items.' };
  if (new Set(orderedIds).size !== orderedIds.length) return { error: 'Duplicate IDs.' };
  for (const id of orderedIds) {
    if (!isValidUUID(id)) return { error: 'Invalid partner ID in list.' };
  }

  try {
    const now = new Date();
    await Promise.all(
      orderedIds.map((id, i) =>
        db.update(partners)
          .set({ displayOrder: i, updatedAt: now })
          .where(eq(partners.id, id))
      )
    );

    revalidatePath('/admin/partners');
    updateTag('partners');
    return {};
  } catch (error) {
    console.error('Failed to reorder partners:', error);
    return { error: 'Failed to reorder partners.' };
  }
}
