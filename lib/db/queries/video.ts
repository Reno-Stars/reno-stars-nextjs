import { and, eq, sql } from 'drizzle-orm';
import { db } from '../index';
import { uncachedQuery } from '../cache-fallback';
import {
  projectSites as sitesTable,
  projects as projectsTable,
} from '../schema';

export interface VideoWatchEntry {
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string | null;
  descriptionZh: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  uploadDate: Date | null;
  updatedAt: Date | null;
}

/**
 * Published projects/sites that have a hero (walkthrough) video AND a
 * thumbnail — the inventory behind the `/[locale]/videos/[slug]/` watch
 * pages and their sitemap entries. Thumbnail is required because Google
 * won't index a video without one. Uncached — sitemap-consumed, same
 * rationale as getProjectSlugsFromDb.
 */
export async function getVideoWatchEntriesFromDb(): Promise<VideoWatchEntry[]> {
  return uncachedQuery('getVideoWatchEntriesFromDb', async () => {
    const [siteRows, projectRows] = await Promise.all([
      db
        .select({
          slug: sitesTable.slug,
          titleEn: sitesTable.titleEn,
          titleZh: sitesTable.titleZh,
          descriptionEn: sitesTable.descriptionEn,
          descriptionZh: sitesTable.descriptionZh,
          videoUrl: sitesTable.heroVideoUrl,
          thumbnailUrl: sitesTable.heroImageUrl,
          uploadDate: sitesTable.publishedAt,
          createdAt: sitesTable.createdAt,
          updatedAt: sitesTable.updatedAt,
        })
        .from(sitesTable)
        .where(and(
          eq(sitesTable.isPublished, true),
          sql`${sitesTable.heroVideoUrl} IS NOT NULL AND ${sitesTable.heroVideoUrl} <> ''`,
          sql`${sitesTable.heroImageUrl} IS NOT NULL AND ${sitesTable.heroImageUrl} <> ''`,
        )),
      db
        .select({
          slug: projectsTable.slug,
          titleEn: projectsTable.titleEn,
          titleZh: projectsTable.titleZh,
          descriptionEn: projectsTable.descriptionEn,
          descriptionZh: projectsTable.descriptionZh,
          videoUrl: projectsTable.heroVideoUrl,
          thumbnailUrl: projectsTable.heroImageUrl,
          uploadDate: projectsTable.publishedAt,
          createdAt: projectsTable.createdAt,
          updatedAt: projectsTable.updatedAt,
        })
        .from(projectsTable)
        .where(and(
          eq(projectsTable.isPublished, true),
          sql`${projectsTable.heroVideoUrl} IS NOT NULL AND ${projectsTable.heroVideoUrl} <> ''`,
          sql`${projectsTable.heroImageUrl} IS NOT NULL AND ${projectsTable.heroImageUrl} <> ''`,
        )),
    ]);
    // Sites win on slug collision (same precedence as /projects/[slug]).
    const seen = new Set<string>();
    const merged: VideoWatchEntry[] = [];
    for (const r of [...siteRows, ...projectRows]) {
      if (seen.has(r.slug)) continue;
      seen.add(r.slug);
      merged.push({
        slug: r.slug,
        titleEn: r.titleEn,
        titleZh: r.titleZh,
        descriptionEn: r.descriptionEn,
        descriptionZh: r.descriptionZh,
        videoUrl: r.videoUrl!,
        thumbnailUrl: r.thumbnailUrl,
        uploadDate: r.uploadDate ?? r.createdAt,
        updatedAt: r.updatedAt,
      });
    }
    return merged;
  }, []);
}
