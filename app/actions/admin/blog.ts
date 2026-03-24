'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq, like } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidSlug, isValidUrl, validateTextLengths, MAX_TEXT_LENGTH, MAX_SHORT_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { ensureUniqueSlug } from '@/lib/utils';

function getBlogData(formData: FormData) {
  const isPublished = formData.get('isPublished') === 'on';
  const publishedAtStr = getString(formData, 'publishedAt');
  const parsedDate = publishedAtStr ? new Date(publishedAtStr) : null;
  const publishedAt = parsedDate && !isNaN(parsedDate.getTime())
    ? parsedDate
    : isPublished ? new Date() : null;

  // Handle projectId - can be empty string, 'null', or a UUID
  const projectIdRaw = getString(formData, 'projectId').trim();
  const projectId = projectIdRaw && projectIdRaw !== '' ? projectIdRaw : null;

  // Parse reading time
  const readingTimeStr = getString(formData, 'readingTimeMinutes');
  const readingTimeMinutes = readingTimeStr ? parseInt(readingTimeStr, 10) || null : null;

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
    // SEO fields
    metaTitleEn: getString(formData, 'metaTitleEn') || null,
    metaTitleZh: getString(formData, 'metaTitleZh') || null,
    metaDescriptionEn: getString(formData, 'metaDescriptionEn') || null,
    metaDescriptionZh: getString(formData, 'metaDescriptionZh') || null,
    focusKeywordEn: getString(formData, 'focusKeywordEn') || null,
    focusKeywordZh: getString(formData, 'focusKeywordZh') || null,
    seoKeywordsEn: getString(formData, 'seoKeywordsEn') || null,
    seoKeywordsZh: getString(formData, 'seoKeywordsZh') || null,
    readingTimeMinutes,
    isPublished,
    publishedAt,
    projectId,
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
    if (data.featuredImageUrl && !isValidUrl(data.featuredImageUrl)) {
      return { error: 'Featured image URL is not a valid URL.' };
    }
    if (data.projectId && !isValidUUID(data.projectId)) {
      return { error: 'Invalid project ID.' };
    }
    const shortTextError = validateTextLengths(
      { titleEn: data.titleEn, titleZh: data.titleZh, excerptEn: data.excerptEn, excerptZh: data.excerptZh, author: data.author }, MAX_SHORT_TEXT_LENGTH
    );
    if (shortTextError) return { error: shortTextError };
    const textError = validateTextLengths(
      { contentEn: data.contentEn, contentZh: data.contentZh }, MAX_TEXT_LENGTH
    );
    if (textError) return { error: textError };

    // Ensure slug is unique (append -2, -3, etc. if collision)
    const conflictingSlugs = await db.select({ slug: blogPosts.slug }).from(blogPosts).where(like(blogPosts.slug, `${data.slug}%`));
    data.slug = ensureUniqueSlug(data.slug, conflictingSlugs.map((r: { slug: string }) => r.slug));

    await db.insert(blogPosts).values(data);
    revalidatePath('/admin/blog');
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Failed to create blog post:', error);
    return { error: 'Failed to create blog post.' };
  }

  redirect('/admin/blog');
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
    if (data.featuredImageUrl && !isValidUrl(data.featuredImageUrl)) {
      return { error: 'Featured image URL is not a valid URL.' };
    }
    if (data.projectId && !isValidUUID(data.projectId)) {
      return { error: 'Invalid project ID.' };
    }
    const shortTextError = validateTextLengths(
      { titleEn: data.titleEn, titleZh: data.titleZh, excerptEn: data.excerptEn, excerptZh: data.excerptZh, author: data.author }, MAX_SHORT_TEXT_LENGTH
    );
    if (shortTextError) return { error: shortTextError };
    const textError = validateTextLengths(
      { contentEn: data.contentEn, contentZh: data.contentZh }, MAX_TEXT_LENGTH
    );
    if (textError) return { error: textError };

    // Ensure slug is unique (exclude current post's own slug)
    const currentPost = await db.select({ slug: blogPosts.slug }).from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    const currentSlug = currentPost[0]?.slug;
    const conflictingSlugs = await db.select({ slug: blogPosts.slug }).from(blogPosts).where(like(blogPosts.slug, `${data.slug}%`));
    data.slug = ensureUniqueSlug(data.slug, conflictingSlugs.map((r: { slug: string }) => r.slug), currentSlug);

    const updated = await db.update(blogPosts).set(data).where(eq(blogPosts.id, id)).returning({ id: blogPosts.id });
    if (updated.length === 0) {
      return { error: 'Blog post not found.' };
    }
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
    const updated = await db
      .update(blogPosts)
      .set({
        isPublished: !current,
        publishedAt: !current ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning({ id: blogPosts.id });
    if (updated.length === 0) {
      return { error: 'Blog post not found.' };
    }
    revalidatePath('/admin/blog');
    revalidatePath('/', 'layout');
    return {};
  } catch (error) {
    console.error('Failed to toggle published:', error);
    return { error: 'Failed to toggle published.' };
  }
}
