import { cache } from 'react';
import { asc, desc, eq, and, sql } from 'drizzle-orm';
import { db } from '../index';
import { safeQuery } from '../cache-fallback';
import { cachedQuery, cachedQueryWithArgs } from '../cache';
import { projectReviews, projects, testimonials } from '../schema';
import type { ProjectReviewDisplay, AreaReviewDisplay } from '../../project-reviews';
import type { HubProjectReviewRow, HubTestimonialRow } from '../../reviews-hub';

/**
 * Fetch verified client reviews linked to a project, oldest-last (newest
 * first). Plain react-cache (per-render dedupe) — the project detail page is
 * already edge-cached, the table is tiny, and an uncached read means a newly
 * seeded review appears on the next revalidation without extra tag plumbing.
 * safeQuery returns [] on DB errors so a hiccup can never 500 the page.
 */
export const getProjectReviews = cache(async (projectId: string): Promise<ProjectReviewDisplay[]> => {
  return safeQuery('getProjectReviews', async () => {
    const rows = await db
      .select({
        authorName: projectReviews.authorName,
        rating: projectReviews.rating,
        body: projectReviews.body,
        bodyLang: projectReviews.bodyLang,
        reviewDate: projectReviews.reviewDate,
        sourceUrl: projectReviews.sourceUrl,
      })
      .from(projectReviews)
      .where(eq(projectReviews.projectId, projectId))
      .orderBy(asc(projectReviews.reviewDate));

    // Newest first for display.
    return rows.reverse();
  }, []);
});

/**
 * Verified client reviews for an AREA page: reviews whose linked PUBLISHED
 * project sits in the given city (matched on projects.location_city, same
 * case-insensitive equality as getProjectsByAreaFromDb). A review duplicated
 * across a multi-project job (one row per project) is collapsed to one card.
 * Returns at most 3, newest first. Tagged `reviews:by-area` so admin review
 * mutations refresh every area page's data cache together.
 */
export const getReviewsByCityFromDb = cachedQueryWithArgs<string, AreaReviewDisplay[]>(
  async (cityName: string): Promise<AreaReviewDisplay[]> => {
    return safeQuery('getReviewsByCityFromDb', async () => {
      const rows = await db
        .select({
          authorName: projectReviews.authorName,
          rating: projectReviews.rating,
          body: projectReviews.body,
          bodyLang: projectReviews.bodyLang,
          reviewDate: projectReviews.reviewDate,
          sourceUrl: projectReviews.sourceUrl,
          projectSlug: projects.slug,
        })
        .from(projectReviews)
        .innerJoin(projects, eq(projectReviews.projectId, projects.id))
        .where(and(
          eq(projects.isPublished, true),
          sql`LOWER(${projects.locationCity}) = LOWER(${cityName})`,
        ))
        .orderBy(desc(projectReviews.reviewDate), asc(projectReviews.createdAt));

      // Collapse multi-project duplicates (same author + same verbatim body).
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
  },
  ['getReviewsByCityFromDb'],
  { tags: ['reviews:by-area'] },
);

/**
 * ALL project_reviews rows for the /reviews hub, joined to their linked
 * project (left join — unlinked reviews are included with projectSlug null).
 * A linked-but-unpublished project contributes its city but no public slug.
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
          projectSlug: projects.slug,
          isPublished: projects.isPublished,
          city: projects.locationCity,
        })
        .from(projectReviews)
        .leftJoin(projects, eq(projectReviews.projectId, projects.id))
        .orderBy(desc(projectReviews.reviewDate));

      return rows.map((row: typeof rows[number]) => ({
        authorName: row.authorName,
        rating: row.rating,
        body: row.body,
        bodyLang: row.bodyLang,
        reviewDate: row.reviewDate,
        sourceUrl: row.sourceUrl,
        projectSlug: row.isPublished ? row.projectSlug : null,
        city: row.city ?? null,
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
 * (textEs / textJa / textKo / textZhHant). Tagged `reviews:hub`.
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

      return rows.map((row: typeof rows[number]) => {
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
