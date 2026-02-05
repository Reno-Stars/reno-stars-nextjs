'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { testimonials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, validateTextLengths, MAX_TEXT_LENGTH } from '@/lib/admin/form-utils';

function getTestimonialData(formData: FormData) {
  const rawRating = parseInt(getString(formData, 'rating'), 10);
  return {
    name: getString(formData, 'name').trim(),
    textEn: getString(formData, 'textEn').trim(),
    textZh: getString(formData, 'textZh').trim(),
    rating: rawRating,
    location: getString(formData, 'location') || null,
    isFeatured: formData.get('isFeatured') === 'on',
    verified: formData.get('verified') === 'on',
  };
}

export async function createTestimonial(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  try {
    const data = getTestimonialData(formData);
    if (!data.name || !data.textEn || !data.textZh) {
      return { error: 'Name and text are required.' };
    }
    if (!Number.isFinite(data.rating) || data.rating < 1 || data.rating > 5) {
      return { error: 'Rating must be between 1 and 5.' };
    }
    const textError = validateTextLengths({ textEn: data.textEn, textZh: data.textZh }, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };
    await db.insert(testimonials).values(data);
    revalidatePath('/admin/testimonials');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to create testimonial:', error);
    return { error: 'Failed to create testimonial.' };
  }
}

export async function updateTestimonial(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid testimonial ID.' };
  try {
    const data = getTestimonialData(formData);
    if (!data.name || !data.textEn || !data.textZh) {
      return { error: 'Name and text are required.' };
    }
    if (!Number.isFinite(data.rating) || data.rating < 1 || data.rating > 5) {
      return { error: 'Rating must be between 1 and 5.' };
    }
    const textError = validateTextLengths({ textEn: data.textEn, textZh: data.textZh }, MAX_TEXT_LENGTH);
    if (textError) return { error: textError };
    const updated = await db.update(testimonials).set(data).where(eq(testimonials.id, id)).returning({ id: testimonials.id });
    if (updated.length === 0) {
      return { error: 'Testimonial not found.' };
    }
    revalidatePath('/admin/testimonials');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update testimonial:', error);
    return { error: 'Failed to update testimonial.' };
  }
}

export async function deleteTestimonial(id: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid testimonial ID.' };
  try {
    await db.delete(testimonials).where(eq(testimonials.id, id));
    revalidatePath('/admin/testimonials');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to delete testimonial:', error);
    return { error: 'Failed to delete testimonial.' };
  }
}

export async function toggleTestimonialFeatured(id: string, current: boolean): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid testimonial ID.' };
  try {
    const updated = await db.update(testimonials).set({ isFeatured: !current }).where(eq(testimonials.id, id)).returning({ id: testimonials.id });
    if (updated.length === 0) {
      return { error: 'Testimonial not found.' };
    }
    revalidatePath('/admin/testimonials');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to toggle featured:', error);
    return { error: 'Failed to toggle featured.' };
  }
}
