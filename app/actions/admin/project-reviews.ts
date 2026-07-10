'use server';

import { updateTag } from 'next/cache';
import { db } from '@/lib/db';
import { projectReviews, projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidUrl, validateTextLengths, MAX_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { revalidatePathAllLocales } from '@/lib/seo/revalidate-paths';

/**
 * Admin CRUD for project-linked verified client reviews (project_reviews).
 *
 * Reviews are verbatim quotes from real, verified clients (see the schema
 * comment on `projectReviews`) — the admin UI exists so the owner can link a
 * new verified review without a DB seed, not to author marketing copy.
 */

const AUTHOR_NAME_MAX = 120;
const SOURCE_URL_MAX = 500;
const REVIEW_LANGS = ['en', 'zh'];

interface ReviewInput {
  authorName: string;
  rating: number;
  body: string;
  bodyLang: string;
  reviewDate: string;
  sourceUrl: string | null;
  ownerResponse: string | null;
}

/**
 * Parse + validate the review fields from the admin form.
 * `reviewDate` accepts 'YYYY-MM' (month picker) or 'YYYY-MM-DD' and is
 * normalized to the 1st of the month — the table stores month precision only.
 */
function parseReviewData(formData: FormData): { data?: ReviewInput; error?: string } {
  const authorName = getString(formData, 'authorName').trim();
  if (!authorName) return { error: 'Author name is required.' };
  if (authorName.length > AUTHOR_NAME_MAX) {
    return { error: `Author name must be at most ${AUTHOR_NAME_MAX} characters.` };
  }

  const rating = parseInt(getString(formData, 'rating'), 10);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: 'Rating must be a whole number between 1 and 5.' };
  }

  const body = getString(formData, 'body').trim();
  if (!body) return { error: 'Review text is required.' };

  const bodyLang = getString(formData, 'bodyLang').trim();
  if (!REVIEW_LANGS.includes(bodyLang)) {
    return { error: 'Review language must be "en" or "zh".' };
  }

  const rawDate = getString(formData, 'reviewDate').trim();
  const dateMatch = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(rawDate);
  if (!dateMatch) return { error: 'Review date must be in YYYY-MM format.' };
  const month = parseInt(dateMatch[2], 10);
  if (month < 1 || month > 12) return { error: 'Review date month must be between 01 and 12.' };
  const reviewDate = `${dateMatch[1]}-${dateMatch[2]}-01`;

  const sourceUrlRaw = getString(formData, 'sourceUrl').trim();
  if (sourceUrlRaw && !isValidUrl(sourceUrlRaw)) {
    return { error: 'Source URL is not a valid URL.' };
  }
  if (sourceUrlRaw.length > SOURCE_URL_MAX) {
    return { error: `Source URL must be at most ${SOURCE_URL_MAX} characters.` };
  }

  const ownerResponse = getString(formData, 'ownerResponse').trim() || null;
  const textError = validateTextLengths({ body, ownerResponse }, MAX_TEXT_LENGTH);
  if (textError) return { error: textError };

  return {
    data: {
      authorName,
      rating,
      body,
      bodyLang,
      reviewDate,
      sourceUrl: sourceUrlRaw || null,
      ownerResponse,
    },
  };
}

/**
 * Refresh every surface a review change touches. Reviews render only on the
 * project detail page (VerifiedGoogleReviews card + Review JSON-LD in
 * ProjectSchema), which reads UNTAGGED getProjectReviews / getProjectsFromDb
 * (handoff 5c#1) — so the path revalidation is what actually refreshes it; the
 * per-slug tag is fired for parity with the other project mutations. Never
 * triggers a deploy.
 */
function revalidateReviewedProject(slug: string): void {
  updateTag(`project:${slug}`);
  revalidatePathAllLocales(`/projects/${slug}`);
}

/** Look up the parent project's slug for a review id (for revalidation). */
async function getReviewProjectSlug(reviewId: string): Promise<string | null> {
  const rows = await db
    .select({ slug: projects.slug })
    .from(projectReviews)
    .innerJoin(projects, eq(projectReviews.projectId, projects.id))
    .where(eq(projectReviews.id, reviewId))
    .limit(1);
  return rows[0]?.slug ?? null;
}

export async function createProjectReview(
  projectId: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(projectId)) return { error: 'Invalid project ID.' };

  try {
    const { data, error } = parseReviewData(formData);
    if (error || !data) return { error };

    const projectRows = await db
      .select({ id: projects.id, slug: projects.slug })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    if (!projectRows[0]) return { error: 'Project not found.' };

    await db.insert(projectReviews).values({ ...data, projectId });

    revalidateReviewedProject(projectRows[0].slug);
    return { success: true };
  } catch (error) {
    console.error('Failed to create project review:', error);
    return { error: 'Failed to create review.' };
  }
}

export async function updateProjectReview(
  reviewId: string,
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();
  if (!isValidUUID(reviewId)) return { error: 'Invalid review ID.' };

  try {
    const { data, error } = parseReviewData(formData);
    if (error || !data) return { error };

    const slug = await getReviewProjectSlug(reviewId);
    if (!slug) return { error: 'Review not found.' };

    // `source` is intentionally not editable — it stays as created.
    await db.update(projectReviews).set(data).where(eq(projectReviews.id, reviewId));

    revalidateReviewedProject(slug);
    return { success: true };
  } catch (error) {
    console.error('Failed to update project review:', error);
    return { error: 'Failed to update review.' };
  }
}

export async function deleteProjectReview(reviewId: string): Promise<{ error?: string }> {
  await requireAuth();
  if (!isValidUUID(reviewId)) return { error: 'Invalid review ID.' };

  try {
    // Capture the parent project's slug before deleting (needed to revalidate).
    const slug = await getReviewProjectSlug(reviewId);
    if (!slug) return { error: 'Review not found.' };

    await db.delete(projectReviews).where(eq(projectReviews.id, reviewId));

    revalidateReviewedProject(slug);
    return {};
  } catch (error) {
    console.error('Failed to delete project review:', error);
    return { error: 'Failed to delete review.' };
  }
}
