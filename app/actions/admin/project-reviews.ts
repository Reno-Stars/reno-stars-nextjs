'use server';

import { updateTag } from 'next/cache';
import { db } from '@/lib/db';
import { projectReviews, projects, serviceAreas } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireAuth, isValidUUID } from '@/lib/admin/auth';
import { getString, isValidUrl, validateTextLengths, MAX_TEXT_LENGTH } from '@/lib/admin/form-utils';
import { revalidatePathAllLocalesNoPurge, purgeCloudflarePagesAllLocales } from '@/lib/seo/revalidate-paths';
import { REVIEW_SOURCES, REVIEW_BODY_LANGS } from '@/lib/project-reviews';

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
const DEFAULT_SOURCE = 'google';

interface ReviewInput {
  authorName: string;
  rating: number;
  body: string;
  bodyLang: string;
  reviewDate: string;
  source: string;
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
  if (!REVIEW_BODY_LANGS.includes(bodyLang)) {
    return { error: 'Review language must be a supported site locale.' };
  }

  // Review platform. Empty defaults to 'google' (the historical + common case);
  // any other value must be one of the known platforms so the card can render
  // it correctly (Google branding only for 'google').
  const sourceRaw = getString(formData, 'source').trim() || DEFAULT_SOURCE;
  if (!(REVIEW_SOURCES as readonly string[]).includes(sourceRaw)) {
    return { error: 'Review source is not a supported platform.' };
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
      source: sourceRaw,
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
  serviceType: string | null;
}

/** Fetch the linked project (for validation + revalidation targets). */
async function getProjectForReview(projectId: string): Promise<LinkedProject | null> {
  const rows = await db
    .select({ id: projects.id, slug: projects.slug, locationCity: projects.locationCity, serviceType: projects.serviceType })
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
 * - the project's SERVICE page ("What our {service} clients say", tagged
 *   `reviews:by-service` + path-purged — the page is force-dynamic, so the
 *   path call matters only for the Cloudflare edge copy; service_type IS the
 *   service slug),
 * - the /reviews hub, both city AND type groupings (one query feeds both,
 *   tagged `reviews:hub` + path-purged).
 * Never triggers a deploy.
 */
async function revalidateReviewSurfaces(linked: Array<LinkedProject | null>): Promise<void> {
  // Dedupe the target projects (create passes one; update passes old + new).
  const seenIds = new Set<string>();
  const uniqueProjects: LinkedProject[] = [];
  for (const project of linked) {
    if (!project || seenIds.has(project.id)) continue;
    seenIds.add(project.id);
    uniqueProjects.push(project);
  }

  // Collect every relative path this change touches; the CF edge purge is
  // issued ONCE for the whole deduped set at the end instead of one call per
  // path (efficiency #26). '/reviews' (both city + type hub groupings) always
  // refreshes.
  const relPaths = new Set<string>(['/reviews']);
  for (const project of uniqueProjects) {
    updateTag(`project:${project.slug}`);
    relPaths.add(`/projects/${project.slug}`);
    if (project.serviceType) relPaths.add(`/services/${project.serviceType}`);
  }

  // Resolve all the projects' city → area slugs in ONE `IN` query instead of a
  // serial per-project lookup (efficiency #26).
  const cities = Array.from(
    new Set(uniqueProjects.map((p) => p.locationCity).filter((c): c is string => Boolean(c))),
  );
  if (cities.length > 0) {
    const areaRows = await db
      .select({ slug: serviceAreas.slug, nameEn: serviceAreas.nameEn })
      .from(serviceAreas)
      .where(sql`LOWER(${serviceAreas.nameEn}) IN (${sql.join(cities.map((c) => sql`LOWER(${c})`), sql`, `)})`);
    for (const area of areaRows) relPaths.add(`/areas/${area.slug}`);
  }

  // ISR origin revalidation per touched path (all locales) — cheap, in-process.
  for (const rel of relPaths) revalidatePathAllLocalesNoPurge(rel);
  updateTag('reviews:by-area');
  updateTag('reviews:by-service');
  updateTag('reviews:hub');

  // ONE batched Cloudflare purge for every touched path across all locales
  // (purgeCloudflareUrls chunks into ≤30-URL calls; no-op without a CF token).
  // The edge cache keys carry a trailing slash (next.config `trailingSlash:true`),
  // so purge the trailing-slash form of each path — otherwise the purge targets
  // `/en/reviews` while the cached HTML lives under `/en/reviews/` and the CF
  // exact-key match misses, leaving the hub + linked project/service/area pages
  // stale for the ≤5min s-maxage window. Mirrors revalidatePathAllLocales /
  // revalidateProjectSurfaces, which already purge the `/…/` form.
  purgeCloudflarePagesAllLocales(
    Array.from(relPaths, (rel) => (rel.endsWith('/') ? rel : `${rel}/`)),
  );
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
      serviceType: projects.serviceType,
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
      ? { id: row.projectId, slug: row.slug, locationCity: row.locationCity, serviceType: row.serviceType }
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

    // `source` IS editable now (defaults to google) so the platform branding
    // on the card can be corrected without a DB edit (#29).
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
