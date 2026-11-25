import { db } from '../index';
import { uncachedQuery } from '../cache-fallback';
import { services as servicesTable, serviceAreas as serviceAreasTable } from '../schema';

/**
 * Row timestamps the sitemap uses as honest per-page <lastmod> sources
 * (lib/sitemap/data.ts). Sitemap-only: no page reads these, so adding them
 * cannot change any rendered page. Uncached for the same reason as the slug
 * queries in projects.ts — the sitemap must mirror the DB.
 */
export async function getServiceDatesForSitemap(): Promise<{ slug: string; updatedAt: Date | null }[]> {
  return uncachedQuery('getServiceDatesForSitemap', async () => {
    return db.select({ slug: servicesTable.slug, updatedAt: servicesTable.updatedAt }).from(servicesTable);
  }, []);
}

export async function getServiceAreaDatesForSitemap(): Promise<{ slug: string; updatedAt: Date | null }[]> {
  return uncachedQuery('getServiceAreaDatesForSitemap', async () => {
    return db.select({ slug: serviceAreasTable.slug, updatedAt: serviceAreasTable.updatedAt }).from(serviceAreasTable);
  }, []);
}
