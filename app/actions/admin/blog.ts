'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { blogPosts } from '@/lib/db/schema';
import { eq, like, sql } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidSlug, isValidUrl, validateTextLengths, MAX_TEXT_LENGTH, MAX_SHORT_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { parseLocalizations } from '@/lib/admin/parse-localizations';
import { ensureUniqueSlug } from '@/lib/utils';
import { refreshBlogPost } from '@/lib/seo/blog-revalidate';
import { listingCardChanged, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED } from '@/lib/admin/listing-cache';
import { blogChangedLocales } from '@/lib/admin/locale-invalidation';
import { locales } from '@/i18n/config';

function getBlogData(formData: FormData) {
  const isPublished = formData.get('isPublished') === 'on';
  const publishedAtStr = getString(formData, 'publishedAt');
  const parsedDate = publishedAtStr ? new Date(publishedAtStr) : null;
  // Only the explicit form value. Callers decide the fallback: create defaults
  // to now(); update PRESERVES the row's existing published_at. Defaulting to
  // now() here reset an April post's publication date to the edit date on
  // every re-save with a blank field (2026-07-10 forensics: BlogPosting
  // datePublished jumped to 2026-06-22 on bathtub-renovation-cost-vancouver),
  // making schema/OG dates fake-fresh — a signal Google devalues.
  const publishedAt = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null;

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

    // New post with no explicit date: published now means published_at = now.
    if (!data.publishedAt && data.isPublished) data.publishedAt = new Date();

    // Ensure slug is unique (append -2, -3, etc. if collision)
    const conflictingSlugs = await db.select({ slug: blogPosts.slug }).from(blogPosts).where(like(blogPosts.slug, `${data.slug}%`));
    data.slug = ensureUniqueSlug(data.slug, conflictingSlugs.map((r: { slug: string }) => r.slug));

    const localizations = parseLocalizations(formData);
    await db.insert(blogPosts).values({
      ...data,
      ...(Object.keys(localizations).length > 0 ? { localizations } : {}),
    });
    updateTag('blog:listing');
    updateTag(`blog:${data.slug}`);
    revalidatePath('/admin/blog');
    if (data.isPublished) refreshBlogPost(data.slug);
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

    // Ensure slug is unique (exclude current post's own slug). Also load every
    // field that affects the rendered page so we can compute (a) whether the
    // broad `blog:listing` tag needs busting and (b) exactly which locales'
    // pages changed — so a single-locale edit doesn't regenerate all 14.
    const currentPost = await db.select({
      slug: blogPosts.slug,
      isPublished: blogPosts.isPublished,
      publishedAt: blogPosts.publishedAt,
      titleEn: blogPosts.titleEn,
      titleZh: blogPosts.titleZh,
      excerptEn: blogPosts.excerptEn,
      excerptZh: blogPosts.excerptZh,
      contentEn: blogPosts.contentEn,
      contentZh: blogPosts.contentZh,
      metaTitleEn: blogPosts.metaTitleEn,
      metaTitleZh: blogPosts.metaTitleZh,
      metaDescriptionEn: blogPosts.metaDescriptionEn,
      metaDescriptionZh: blogPosts.metaDescriptionZh,
      seoKeywordsEn: blogPosts.seoKeywordsEn,
      seoKeywordsZh: blogPosts.seoKeywordsZh,
      featuredImageUrl: blogPosts.featuredImageUrl,
      author: blogPosts.author,
      readingTimeMinutes: blogPosts.readingTimeMinutes,
      projectId: blogPosts.projectId,
      metaOverrides: blogPosts.metaOverrides,
      localizations: blogPosts.localizations,
    }).from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    const currentSlug = currentPost[0]?.slug;
    const conflictingSlugs = await db.select({ slug: blogPosts.slug }).from(blogPosts).where(like(blogPosts.slug, `${data.slug}%`));
    data.slug = ensureUniqueSlug(data.slug, conflictingSlugs.map((r: { slug: string }) => r.slug), currentSlug);

    // No explicit form date → PRESERVE the original publication date. Falling
    // back to now() here is what turned re-saves into fake-fresh datePublished
    // resets (see getBlogData comment). now() only applies on a genuine
    // first-publish (previously unpublished with no date on record).
    if (!data.publishedAt) {
      data.publishedAt = currentPost[0]?.publishedAt ?? (data.isPublished ? new Date() : null);
    }

    // Stamp content_updated_at on this genuine admin content edit. This is the
    // ONLY writer of the column — lib/blog-dates.ts trusts it as the honest
    // BlogPosting `dateModified` source precisely because bulk/translation/cron
    // scripts (which poison the wholesale `updated_at`) never touch it. Reuse
    // data.updatedAt so both columns share one instant. dateModified still only
    // surfaces when this is meaningfully later than published_at (24h gate in
    // resolveBlogDates), so a same-session publish+edit stays quiet while a real
    // later edit lights up. createBlogPost deliberately leaves it NULL: a brand-
    // new post has no post-publication edit to advertise yet.
    const localizations = parseLocalizations(formData);
    const updated = await db.update(blogPosts).set({ ...data, localizations, contentUpdatedAt: data.updatedAt }).where(eq(blogPosts.id, id)).returning({ id: blogPosts.id });
    if (updated.length === 0) {
      return { error: 'Blog post not found.' };
    }
    // Determine which locales' rendered pages actually changed. An EN edit hits
    // every locale that falls back to EN; an MT backfill of one locale hits only
    // that locale; metadata-only edits hit a subset. metaOverrides isn't edited
    // here, so carry it forward unchanged for the diff.
    const newRow = { ...data, localizations, metaOverrides: currentPost[0]?.metaOverrides };
    const changedLocales = blogChangedLocales(currentPost[0] ?? {}, newRow);

    // Invalidate only the changed locales' detail pages (narrow per-locale tag).
    // All 14 → one broad bust; a subset → per-locale busts.
    if (changedLocales.length >= locales.length) {
      updateTag(`blog:${data.slug}`);
    } else {
      for (const loc of changedLocales) updateTag(`blog:${data.slug}:${loc}`);
    }
    // Slug rename → every locale of the old URL must be invalidated (broad).
    if (currentSlug && currentSlug !== data.slug) updateTag(`blog:${currentSlug}`);

    // The broad listing tag (home page + index + RSS feed) only needs busting
    // when a card-visible field changed — not on pure content/meta edits.
    const listingChanged = listingCardChanged(
      currentPost[0],
      newRow,
      BLOG_CARD_FIELDS,
      BLOG_CARD_LOCALIZED,
    );
    if (listingChanged) updateTag('blog:listing');
    revalidatePath('/admin/blog');
    if (data.isPublished) refreshBlogPost(data.slug, { listingChanged, locales: changedLocales });
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
    // Capture slug before delete so we can revalidate the public URL.
    const existing = await db.select({ slug: blogPosts.slug }).from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    const slug = existing[0]?.slug;
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    updateTag('blog:listing');
    if (slug) updateTag(`blog:${slug}`);
    revalidatePath('/admin/blog');
    if (slug) refreshBlogPost(slug);
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
        // Publication date is HISTORY, not a status flag — an unpublish/
        // republish cycle must not reset it (fake-fresh datePublished in the
        // BlogPosting schema; see lib/blog-dates.ts). Republish keeps the
        // original date, stamping now() only on a true first publish;
        // unpublish leaves it untouched.
        ...(!current ? { publishedAt: sql`COALESCE(${blogPosts.publishedAt}, now())` } : {}),
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning({ id: blogPosts.id, slug: blogPosts.slug });
    if (updated.length === 0) {
      return { error: 'Blog post not found.' };
    }
    updateTag('blog:listing');
    if (updated[0]?.slug) updateTag(`blog:${updated[0].slug}`);
    revalidatePath('/admin/blog');
    if (updated[0]?.slug) refreshBlogPost(updated[0].slug);
    return {};
  } catch (error) {
    console.error('Failed to toggle published:', error);
    return { error: 'Failed to toggle published.' };
  }
}
