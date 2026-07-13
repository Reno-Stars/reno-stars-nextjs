import { cache } from 'react';
import { asc, desc, eq, and, sql, type SQL } from 'drizzle-orm';
import { db } from '../index';
import { safeQuery, withFallback } from '../cache-fallback';
import { cachedQuery, cachedQueryWithArgs } from '../cache';
import { projectReviews, projects, testimonials } from '../schema';
import type { ProjectReviewDisplay, AreaReviewDisplay } from '../../project-reviews';
import type { HubProjectReviewRow, HubTestimonialRow } from '../../reviews-hub';
import { isFabricatedTestimonial } from '../../reviews-hub';

/**
 * Fetch verified client reviews linked to a project, newest first. Plain
 * react-cache (per-render dedupe) — the project detail page is already
 * edge-cached, the table is tiny, and an uncached read means a newly seeded
 * review appears on the next revalidation without extra tag plumbing.
 *
 * `withFallback(cache(...))` is the SAME poison-fallback-safe wrapper the
 * cachedQuery* helpers apply: `safeQuery` THROWS a DbQueryError on a DB error
 * (so nothing is ever cached as poison), and this outer `withFallback` converts
 * that throw back into `[]` for THIS render. Without it a DB hiccup would 500
 * the whole /projects/<slug>/ page (correctness fix #15).
 */
export const getProjectReviews = withFallback(
  cache(async (projectId: string): Promise<ProjectReviewDisplay[]> => {
    return safeQuery('getProjectReviews', async () => {
      return db
        .select({
          authorName: projectReviews.authorName,
          rating: projectReviews.rating,
          body: projectReviews.body,
          bodyLang: projectReviews.bodyLang,
          reviewDate: projectReviews.reviewDate,
          sourceUrl: projectReviews.sourceUrl,
          source: projectReviews.source,
        })
        .from(projectReviews)
        .where(eq(projectReviews.projectId, projectId))
        // Newest first, with a stable `asc(id)` tie-break so reviews sharing a
        // month-precision date keep a deterministic order across cache regens.
        .orderBy(desc(projectReviews.reviewDate), asc(projectReviews.id));
    }, []);
  }),
);

/**
 * Shared fetch behind getReviewsByCityFromDb + getReviewsByServiceType — the
 * two had byte-identical bodies apart from their WHERE clause. Selects verified
 * client reviews whose linked PUBLISHED project matches `whereClause`, newest
 * first with an `asc(id)` tie-break, collapses multi-project duplicates (same
 * author + verbatim body, e.g. one row per project on a multi-room job) and
 * returns at most 3. `safeQuery` throws on DB error so the caller's
 * `withFallback` (via cachedQueryWithArgs) serves [] uncached.
 */
async function fetchLinkedReviews(label: string, whereClause: SQL): Promise<AreaReviewDisplay[]> {
  return safeQuery(label, async () => {
    const rows = await db
      .select({
        authorName: projectReviews.authorName,
        rating: projectReviews.rating,
        body: projectReviews.body,
        bodyLang: projectReviews.bodyLang,
        reviewDate: projectReviews.reviewDate,
        sourceUrl: projectReviews.sourceUrl,
        source: projectReviews.source,
        projectSlug: projects.slug,
      })
      .from(projectReviews)
      .innerJoin(projects, eq(projectReviews.projectId, projects.id))
      .where(whereClause)
      .orderBy(desc(projectReviews.reviewDate), asc(projectReviews.id));

    const seen = new Set<string>();
    const unique: AreaReviewDisplay[] = [];
    for (const row of rows) {
      const key = `${row.authorName.trim().toLowerCase()}|${row.body.trim()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(row);
      if (unique.length >= 3) break;
    }
    return unique;
  }, []);
}

/**
 * Verified client reviews for an AREA page: reviews whose linked PUBLISHED
 * project sits in the given city (matched on projects.location_city, same
 * case-insensitive equality as getProjectsByAreaFromDb). Returns at most 3,
 * newest first. Tagged `reviews:by-area` so admin review mutations refresh
 * every area page's data cache together.
 */
export const getReviewsByCityFromDb = cachedQueryWithArgs<string, AreaReviewDisplay[]>(
  async (cityName: string): Promise<AreaReviewDisplay[]> => {
    return fetchLinkedReviews(
      'getReviewsByCityFromDb',
      and(
        eq(projects.isPublished, true),
        sql`LOWER(${projects.locationCity}) = LOWER(${cityName})`,
      ) as SQL,
    );
  },
  ['getReviewsByCityFromDb'],
  { tags: ['reviews:by-area'] },
);

/**
 * Verified client reviews for a SERVICE page: reviews whose linked PUBLISHED
 * project has the given service_type (exact match — service_type values are
 * canonical services.slug values validated on write, unlike the free-text city
 * names getReviewsByCityFromDb has to LOWER()). Same at-most-3-newest contract.
 * Tagged `reviews:by-service` so review AND project mutations refresh every
 * service page's data cache together.
 */
export const getReviewsByServiceType = cachedQueryWithArgs<string, AreaReviewDisplay[]>(
  async (serviceType: string): Promise<AreaReviewDisplay[]> => {
    return fetchLinkedReviews(
      'getReviewsByServiceType',
      and(
        eq(projects.isPublished, true),
        eq(projects.serviceType, serviceType),
      ) as SQL,
    );
  },
  ['getReviewsByServiceType'],
  { tags: ['reviews:by-service'] },
);

/**
 * ALL project_reviews rows for the /reviews hub, joined to their linked
 * project (left join — unlinked reviews are included with projectSlug null).
 * A linked-but-unpublished project contributes its city but no public slug.
 * Ordered newest-first with an `asc(id)` tie-break so the dedupe survivor of an
 * identical-date multi-project review is deterministic (correctness fix #1).
 * Tagged `reviews:hub` so admin review mutations refresh the hub.
 */
export const getHubProjectReviews = cachedQuery(
  async (): Promise<HubProjectReviewRow[]> => {
    return safeQuery('getHubProjectReviews', async () => {
      const rows = await db
        .select({
          authorName: projectReviews.authorName,
          rating: projectReviews.rating,
          body: projectReviews.body,
          bodyLang: projectReviews.bodyLang,
          reviewDate: projectReviews.reviewDate,
          sourceUrl: projectReviews.sourceUrl,
          source: projectReviews.source,
          projectSlug: projects.slug,
          isPublished: projects.isPublished,
          city: projects.locationCity,
          serviceType: projects.serviceType,
        })
        .from(projectReviews)
        .leftJoin(projects, eq(projectReviews.projectId, projects.id))
        .orderBy(desc(projectReviews.reviewDate), asc(projectReviews.id));

      return rows.map((row: typeof rows[number]) => ({
        authorName: row.authorName,
        rating: row.rating,
        body: row.body,
        bodyLang: row.bodyLang,
        reviewDate: row.reviewDate,
        sourceUrl: row.sourceUrl,
        source: row.source,
        projectSlug: row.isPublished ? row.projectSlug : null,
        city: row.city ?? null,
        // Like `city`, a linked-but-unpublished project still contributes its
        // service type (the group renders; the card just has no slug link).
        serviceType: row.serviceType ?? null,
      }));
    }, []);
  },
  ['getHubProjectReviews'],
  { tags: ['reviews:hub'] },
);

/** Flat localizations keys used by the legacy testimonials rows. */
const TESTIMONIAL_LOCALIZATION_KEYS: Record<string, string> = {
  'zh-Hant': 'textZhHant',
  es: 'textEs',
  ja: 'textJa',
  ko: 'textKo',
};

/**
 * Legacy testimonials rows for the /reviews hub (the table is deprecated but
 * its rows still hold client quotes worth surfacing until it is dropped).
 * Translations are assembled from text_zh + the flat localizations jsonb
 * (textEs / textJa / textKo / textZhHant).
 *
 * The 3 fabricated seed placeholders (Sarah M./David L./Jennifer K. — invented
 * names + generic quotes) are EXCLUDED here so the hub never presents them as
 * "verbatim reviews from real clients" (data-integrity fix #6). Tagged
 * `reviews:hub`.
 */
export const getTestimonialsForHub = cachedQuery(
  async (): Promise<HubTestimonialRow[]> => {
    return safeQuery('getTestimonialsForHub', async () => {
      const rows = await db
        .select({
          name: testimonials.name,
          rating: testimonials.rating,
          textEn: testimonials.textEn,
          textZh: testimonials.textZh,
          location: testimonials.location,
          localizations: testimonials.localizations,
        })
        .from(testimonials)
        .orderBy(asc(testimonials.createdAt));

      return rows
        .filter((row: typeof rows[number]) => !isFabricatedTestimonial(row.name, row.textEn))
        .map((row: typeof rows[number]) => {
          const translations: Partial<Record<string, string>> = {};
          if (row.textZh) translations.zh = row.textZh;
          for (const [locale, key] of Object.entries(TESTIMONIAL_LOCALIZATION_KEYS)) {
            const value = row.localizations?.[key];
            if (typeof value === 'string' && value) translations[locale] = value;
          }
          return {
            name: row.name,
            rating: row.rating,
            textEn: row.textEn,
            location: row.location,
            translations,
          };
        });
    }, []);
  },
  ['getTestimonialsForHub'],
  { tags: ['reviews:hub'] },
);
