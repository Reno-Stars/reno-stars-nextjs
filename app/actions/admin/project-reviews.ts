'use server';

import { updateTag } from 'next/cache';
import { db } from '@/lib/db';
import { projectReviews, projects, serviceAreas } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidUrl, validateTextLengths, MAX_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { revalidatePathAllLocales } from '@/lib/seo/revalidate-paths';

/**
 * Admin CRUD for verified client reviews (project_reviews).
 *
 * Reviews are verbatim quotes from real, verified clients (see the schema
 * comment on `projectReviews`) — the admin UI exists so the owner can link a
 * new verified review without a DB seed, not to author marketing copy.
 *
 * `projectId` is optional (reviews-hub upgrade): an unlinked review surfaces
 * only on /reviews; a linked review also renders on its project page and on
 * the project's city area page.
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
 * Parse the optional project link from the form. '' → unlinked (null).
 */
function parseProjectId(formData: FormData): { projectId: string | null; error?: string } {
  const raw = getString(formData, 'projectId').trim();
  if (!raw) return { projectId: null };
  if (!isValidUUID(raw)) return { projectId: null, error: 'Invalid project ID.' };
  return { projectId: raw };
}

interface LinkedProject {
  id: string;
  slug: string;
  locationCity: string | null;
}

/** Fetch the linked project (for validation + revalidation targets). */
async function getProjectForReview(projectId: string): Promise<LinkedProject | null> {
  const rows = await db
    .select({ id: projects.id, slug: projects.slug, locationCity: projects.locationCity })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Refresh every surface a review change touches:
 * - the linked project's detail page (VerifiedGoogleReviews + Review JSON-LD;
 *   reads UNTAGGED getProjectReviews, so the PATH revalidation refreshes it),
 * - the project's city AREA page ("What {city} clients say", tagged
 *   `reviews:by-area` + path-purged via the service_areas slug lookup),
 * - the /reviews hub (tagged `reviews:hub` + path-purged).
 * Never triggers a deploy.
 */
async function revalidateReviewSurfaces(linked: Array<LinkedProject | null>): Promise<void> {
  const seen = new Set<string>();
  for (const project of linked) {
    if (!project || seen.has(project.id)) continue;
    seen.add(project.id);
    updateTag(`project:${project.slug}`);
    revalidatePathAllLocales(`/projects/${project.slug}`);
    if (project.locationCity) {
      const areaRows = await db
        .select({ slug: serviceAreas.slug })
        .from(serviceAreas)
        .where(sql`LOWER(${serviceAreas.nameEn}) = LOWER(${project.locationCity})`)
        .limit(1);
      if (areaRows[0]) revalidatePathAllLocales(`/areas/${areaRows[0].slug}`);
    }
  }
  updateTag('reviews:by-area');
  updateTag('reviews:hub');
  revalidatePathAllLocales('/reviews');
}

/**
 * Look up a review's current linked project (null when unlinked) and whether
 * the review row exists at all — a LEFT join, so unlinked reviews are found.
 */
async function getReviewLink(reviewId: string): Promise<{ exists: boolean; project: LinkedProject | null }> {
  const rows = await db
    .select({
      reviewId: projectReviews.id,
      projectId: projects.id,
      slug: projects.slug,
      locationCity: projects.locationCity,
    })
    .from(projectReviews)
    .leftJoin(projects, eq(projectReviews.projectId, projects.id))
    .where(eq(projectReviews.id, reviewId))
    .limit(1);
  const row = rows[0];
  if (!row) return { exists: false, project: null };
  return {
    exists: true,
    project: row.projectId && row.slug
      ? { id: row.projectId, slug: row.slug, locationCity: row.locationCity }
      : null,
  };
}

export async function createProjectReview(
  _prevState: { success?: boolean; error?: string },
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  await requireAuth();

  try {
    const { data, error } = parseReviewData(formData);
    if (error || !data) return { error };
    const { projectId, error: projectIdError } = parseProjectId(formData);
    if (projectIdError) return { error: projectIdError };

    let project: LinkedProject | null = null;
    if (projectId) {
      project = await getProjectForReview(projectId);
      if (!project) return { error: 'Project not found.' };
    }

    await db.insert(projectReviews).values({ ...data, projectId });

    await revalidateReviewSurfaces([project]);
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
    const { projectId, error: projectIdError } = parseProjectId(formData);
    if (projectIdError) return { error: projectIdError };

    const { exists, project: oldProject } = await getReviewLink(reviewId);
    if (!exists) return { error: 'Review not found.' };

    let newProject: LinkedProject | null = null;
    if (projectId) {
      newProject = await getProjectForReview(projectId);
      if (!newProject) return { error: 'Project not found.' };
    }

    // `source` is intentionally not editable — it stays as created.
    await db.update(projectReviews).set({ ...data, projectId }).where(eq(projectReviews.id, reviewId));

    // Refresh both the previous and the new link targets (re-link/unlink).
    await revalidateReviewSurfaces([oldProject, newProject]);
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
    // Capture the linked project before deleting (needed to revalidate).
    const { exists, project } = await getReviewLink(reviewId);
    if (!exists) return { error: 'Review not found.' };

    await db.delete(projectReviews).where(eq(projectReviews.id, reviewId));

    await revalidateReviewSurfaces([project]);
    return {};
  } catch (error) {
    console.error('Failed to delete project review:', error);
    return { error: 'Failed to delete review.' };
  }
}
