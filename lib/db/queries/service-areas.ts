import { and, asc, eq } from 'drizzle-orm';
import { db } from '../index';
import { safeQuery } from '../cache-fallback';
import { cachedQuery, cachedQueryPerSlug } from '../cache';
import { serviceAreas as serviceAreasTable } from '../schema';
import { parseNewlineList, buildSingleRowLocalizedArray } from '../map-helpers';
import { buildLocalized, buildLocalizedOptional } from '../../utils';
import type { ServiceArea } from '../../types';

/** Fetch active service areas ordered by display_order. */
export function mapServiceAreaRow(row: typeof serviceAreasTable.$inferSelect): ServiceArea {
  const highlightsEn = parseNewlineList(row.highlightsEn);
  const highlightsZh = parseNewlineList(row.highlightsZh);

  return {
    id: row.id,
    slug: row.slug,
    name: buildLocalized('name', row.nameEn, row.nameZh, row.localizations),
    description: buildLocalizedOptional('description', row.descriptionEn, row.descriptionZh, row.localizations),
    content: buildLocalizedOptional('content', row.contentEn, row.contentZh, row.localizations),
    highlights: buildSingleRowLocalizedArray(row, highlightsEn, highlightsZh, 'highlights'),
    metaTitle: buildLocalizedOptional('metaTitle', row.metaTitleEn, row.metaTitleZh, row.localizations),
    metaDescription: buildLocalizedOptional('metaDescription', row.metaDescriptionEn, row.metaDescriptionZh, row.localizations),
  };
}

const fetchServiceAreas = async (): Promise<ServiceArea[]> => {
  return safeQuery('getServiceAreasFromDb', async () => {
    const rows = await db
      .select()
      .from(serviceAreasTable)
      .where(eq(serviceAreasTable.isActive, true))
      .orderBy(asc(serviceAreasTable.displayOrder));

    return rows.map(mapServiceAreaRow);
  }, []);
};
export const getServiceAreasFromDb = cachedQuery(fetchServiceAreas, ['getServiceAreasFromDb'], { tags: ['service-areas'] });
export const getServiceAreasForNav = cachedQuery(fetchServiceAreas, ['getServiceAreasForNav'], { tags: ['nav:globals'] });

/**
 * A single service area by slug, cached PER-SLUG. An area-page detail read
 * goes through this instead of slicing the shared `getServiceAreasFromDb`
 * blob, so a content/meta edit to ONE city busts only that city's page
 * (`area:${slug}`) rather than all ~180 area pages. The broad `service-areas`
 * tag is also attached so list-level changes (rename / reorder / toggle /
 * add / delete) still refresh every detail page. Mirrors the blog per-slug
 * pattern from #107.
 */
export const getServiceAreaBySlugFromDb = cachedQueryPerSlug<ServiceArea | null>(
  async (slug: string): Promise<ServiceArea | null> => {
    return safeQuery('getServiceAreaBySlugFromDb', async () => {
      const rows = await db
        .select()
        .from(serviceAreasTable)
        .where(and(eq(serviceAreasTable.isActive, true), eq(serviceAreasTable.slug, slug)))
        .limit(1);
      return rows[0] ? mapServiceAreaRow(rows[0]) : null;
    }, null);
  },
  'getServiceAreaBySlugFromDb',
  { broadTags: ['service-areas'], tagPrefix: 'area' },
);

/** Fetch all service areas (admin — includes inactive). */
export async function getAllServiceAreasAdmin(): Promise<(typeof serviceAreasTable.$inferSelect)[]> {
  return db.select().from(serviceAreasTable).orderBy(asc(serviceAreasTable.displayOrder));
}
