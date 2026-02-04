'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidSlug } from '@/lib/admin/form-utils';

function getBlogData(formData: FormData) {
  const isPublished = formData.get('isPublished') === 'on';
  const publishedAtStr = getString(formData, 'publishedAt');
  const parsedDate = publishedAtStr ? new Date(publishedAtStr) : null;
  const publishedAt = parsedDate && !isNaN(parsedDate.getTime())
    ? parsedDate
    : isPublished ? new Date() : null;
  return {
    slug: getString(formData, 'slug').trim(),
    titleEn: getString(formData, 'titleEn').trim(),
    titleZh: getString(formData, 'titleZh').trim(),
    excerptEn: getString(formData, 'excerptEn') || null,
    excerptZh: getString(formData, 'excerptZh') || null,
    contentEn: getString(formData, 'contentEn').trim(),
    contentZh: getString(formData, 'contentZh').trim(),
    featuredImageUrl: getString(formData, 'featuredImageUrl') || null,
    author: getString(formData, 'author') || null,
    seoKeywords: getString(formData, 'seoKeywords') || null,
    isPublished,
    publishedAt,
    updatedAt: new Date(),
  };
}

export async function createBlogPost(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  try {
    const data = getBlogData(formData);
    if (!data.slug || !data.titleEn || !data.titleZh || !data.contentEn || !data.contentZh) {
      return { error: 'Slug, titles, and content are required.' };
    }
    if (!isValidSlug(data.slug)) {
      return { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' };
    }
    await db.insert(blogPosts).values(data);
    revalidatePath('/admin/blog');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to create blog post:', error);
    return { error: 'Failed to create blog post.' };
  }
}

export async function updateBlogPost(
  id: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid blog post ID.' };
  try {
    const data = getBlogData(formData);
    if (!data.slug || !data.titleEn || !data.titleZh || !data.contentEn || !data.contentZh) {
      return { error: 'Slug, titles, and content are required.' };
    }
    if (!isValidSlug(data.slug)) {
      return { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' };
    }
    await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
    revalidatePath('/admin/blog');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to update blog post:', error);
    return { error: 'Failed to update blog post.' };
  }
}

export async function deleteBlogPost(id: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid blog post ID.' };
  try {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    revalidatePath('/admin/blog');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to delete blog post:', error);
    return { error: 'Failed to delete blog post.' };
  }
}

export async function toggleBlogPostPublished(id: string, current: boolean): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(id)) return { error: 'Invalid blog post ID.' };
  try {
    await db
      .update(blogPosts)
      .set({
        isPublished: !current,
        publishedAt: !current ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id));
    revalidatePath('/admin/blog');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to toggle published:', error);
    return { error: 'Failed to toggle published.' };
  }
}
