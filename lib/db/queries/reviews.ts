import { cache } from 'react';
import { asc, eq } from 'drizzle-orm';
import { db } from '../index';
import { safeQuery } from '../cache-fallback';
import { projectReviews } from '../schema';
import type { ProjectReviewDisplay } from '../../project-reviews';

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
