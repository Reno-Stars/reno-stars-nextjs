'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { faqs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, validateTextLengths, MAX_TEXT_LENGTH } from '@/lib/admin/form-utils';

function parseServiceAreaId(formData: FormData): string | null {
  const raw = getString(formData, 'serviceAreaId').trim();
  if (!raw) return null;
  if (!isValidUUID(raw)) return null;
  return raw;
}

export async function createFaq(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  try {
    const questionEn = getString(formData, 'questionEn').trim();
    const questionZh = getString(formData, 'questionZh').trim();
    const answerEn = getString(formData, 'answerEn').trim();
    const answerZh = getString(formData, 'answerZh').trim();
    const displayOrder = parseInt(getString(formData, 'displayOrder') || '0', 10);
    const isActive = formData.get('isActive') === 'on';

    if (!questionEn || !questionZh) return { error: 'Question is required in both languages.' };
    if (!answerEn || !answerZh) return { error: 'Answer is required in both languages.' };
    const textError = validateTextLengths({ answerEn, answerZh }, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };
    if (!Number.isFinite(displayOrder) || displayOrder < 0) {
      return { error: 'Display order must be a non-negative number.' };
    }

    const serviceAreaId = parseServiceAreaId(formData);

    await db.insert(faqs).values({
      questionEn, questionZh, answerEn, answerZh, serviceAreaId, displayOrder, isActive,
    });

    revalidatePath('/admin/faqs');
    updateTag('faqs');
  } catch (error) {
    console.error('Failed to create FAQ:', error);
    return { error: 'Failed to create FAQ.' };
  }

  redirect('/admin/faqs');
}

export async function reorderFaqs(orderedIds: string[]): Promise<{ error?: string }> {
  await requireAuth();

  if (orderedIds.length > 200) return { error: 'Too many items.' };
  if (new Set(orderedIds).size !== orderedIds.length) return { error: 'Duplicate IDs.' };
  for (const id of orderedIds) {
    if (!isValidUUID(id)) return { error: 'Invalid FAQ ID in list.' };
  }

  try {
    const now = new Date();
    await Promise.all(
      orderedIds.map((id, i) =>
        db.update(faqs)
          .set({ displayOrder: i, updatedAt: now })
          .where(eq(faqs.id, id))
      )
    );

    revalidatePath('/admin/faqs');
    updateTag('faqs');
    return {};
  } catch (error) {
    console.error('Failed to reorder FAQs:', error);
    return { error: 'Failed to reorder FAQs.' };
  }
}

export async function updateFaq(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid FAQ ID.' };
  try {
    const questionEn = getString(formData, 'questionEn').trim();
    const questionZh = getString(formData, 'questionZh').trim();
    const answerEn = getString(formData, 'answerEn').trim();
    const answerZh = getString(formData, 'answerZh').trim();
    const displayOrder = parseInt(getString(formData, 'displayOrder'), 10);
    const isActive = formData.get('isActive') === 'on';

    if (!questionEn || !questionZh) return { error: 'Question is required in both languages.' };
    if (!answerEn || !answerZh) return { error: 'Answer is required in both languages.' };
    const textError = validateTextLengths({ answerEn, answerZh }, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };
    if (!Number.isFinite(displayOrder) || displayOrder < 0) {
      return { error: 'Display order must be a non-negative number.' };
    }

    const serviceAreaId = parseServiceAreaId(formData);

    const updated = await db.update(faqs).set({
      questionEn, questionZh, answerEn, answerZh, serviceAreaId, displayOrder, isActive,
      updatedAt: new Date(),
    }).where(eq(faqs.id, id)).returning({ id: faqs.id });
    if (updated.length === 0) return { error: 'FAQ not found.' };

    revalidatePath('/admin/faqs');
    updateTag('faqs');
    return { success: true };
  } catch (error) {
    console.error('Failed to update FAQ:', error);
    return { error: 'Failed to update FAQ.' };
  }
}

export async function toggleFaqActive(id: string, current: boolean): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid FAQ ID.' };
  try {
    const updated = await db.update(faqs).set({ isActive: !current, updatedAt: new Date() }).where(eq(faqs.id, id)).returning({ id: faqs.id });
    if (updated.length === 0) return { error: 'FAQ not found.' };
    revalidatePath('/admin/faqs');
    updateTag('faqs');
    return {};
  } catch (error) {
    console.error('Failed to toggle FAQ active:', error);
    return { error: 'Failed to toggle FAQ active.' };
  }
}

export async function deleteFaq(id: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid FAQ ID.' };
  try {
    const deleted = await db.delete(faqs).where(eq(faqs.id, id)).returning({ id: faqs.id });
    if (deleted.length === 0) return { error: 'FAQ not found.' };
    revalidatePath('/admin/faqs');
    updateTag('faqs');
    return {};
  } catch (error) {
    console.error('Failed to delete FAQ:', error);
    return { error: 'Failed to delete FAQ.' };
  }
}
