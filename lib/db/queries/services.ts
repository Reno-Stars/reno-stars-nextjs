import { cache } from 'react';
import { asc, eq, inArray } from 'drizzle-orm';
import { db } from '../index';
import { safeQuery } from '../cache-fallback';
import { cachedQuery, cachedQueryPerSlug } from '../cache';
import {
  services as servicesTable,
  serviceTags as serviceTagsTable,
  serviceBenefits as serviceBenefitsTable,
} from '../schema';
import { groupBy, sortByDisplayOrder, buildLocalizedArray } from '../map-helpers';
import { getOptionalAssetUrl } from '../../storage';
import { WHOLE_HOUSE_CATEGORY } from '../../data/services';
import { buildLocalized, buildLocalizedOptional } from '../../utils';
import type { Service } from '../../types';

/**
 * Fetch services from DB, mapped to the `Service` type with bilingual content.
 */
const fetchServices = async (): Promise<Service[]> => {
  return safeQuery('getServicesFromDb', async () => {
  const rows = await db
    .select()
    .from(servicesTable)
    .orderBy(asc(servicesTable.displayOrder));

  // Batch-fetch all tags and benefits for all services
  const serviceIds = rows.map((r: typeof servicesTable.$inferSelect) => r.id);
  const [allTags, allBenefits] = serviceIds.length > 0
    ? await Promise.all([
        db.select().from(serviceTagsTable).where(inArray(serviceTagsTable.serviceId, serviceIds)),
        db.select().from(serviceBenefitsTable).where(inArray(serviceBenefitsTable.serviceId, serviceIds)),
      ])
    : [[], []];
  const tagsByService = groupBy(allTags, (t: typeof serviceTagsTable.$inferSelect) => t.serviceId);
  const benefitsByService = groupBy(allBenefits, (b: typeof serviceBenefitsTable.$inferSelect) => b.serviceId);

  return rows.map((row: typeof servicesTable.$inferSelect) => {
    const tags = sortByDisplayOrder(tagsByService.get(row.id) ?? []);
    const benefits = sortByDisplayOrder(benefitsByService.get(row.id) ?? []);
    return {
      slug: row.slug,
      title: buildLocalized('title', row.titleEn, row.titleZh, row.localizations),
      description: buildLocalized('description', row.descriptionEn, row.descriptionZh, row.localizations),
      long_description: buildLocalizedOptional('longDescription', row.longDescriptionEn, row.longDescriptionZh, row.localizations),
      icon: getOptionalAssetUrl(row.iconUrl),
      image: getOptionalAssetUrl(row.imageUrl),
      tags: tags.length > 0
        ? buildLocalizedArray(tags, 'tagEn', 'tagZh', 'tag')
        : undefined,
      benefits: benefits.length > 0
        ? buildLocalizedArray(benefits, 'benefitEn', 'benefitZh', 'benefit')
        : undefined,
      showOnServicesPage: row.showOnServicesPage,
      isProjectType: row.isProjectType,
    };
  });
  }, []);
};
export const getServicesFromDb = cachedQuery(fetchServices, ['getServicesFromDb'], { tags: ['services'] });
export const getServicesForNav = cachedQuery(fetchServices, ['getServicesForNav'], { tags: ['nav:globals'] });

/**
 * Fetch a slug → { en, zh } title map from the services table.
 * Used as the dynamic replacement for the old hardcoded serviceTypeToCategory.
 */
export const getServiceTypeMap = cache(async (): Promise<Record<string, import('../../types').Localized<string>>> => {
  const services = await getServicesFromDb();
  const map: Record<string, import('../../types').Localized<string>> = {};
  for (const s of services) {
    if (s.isProjectType === false) continue;
    // Carry full Localized shape (en, zh, ja, ko, es) so /xx/projects/ filter
    // cards and category labels render in the user's language. Was {en, zh} only.
    map[s.slug] = s.title;
  }
  return map;
});

/**
 * Fetch the raw `dynamic_blocks` for a service category slug. Returns
 * `[]` if the service has none, or for synthetic categories ("All",
 * "whole-house") that don't map to a service row. Cached per-slug.
 */
export const getServiceBlocksBySlug = cachedQueryPerSlug(
  async (slug: string): Promise<unknown[]> => {
    return safeQuery('getServiceBlocksBySlug', async () => {
      const rows = await db
        .select({ dynamicBlocks: servicesTable.dynamicBlocks })
        .from(servicesTable)
        .where(eq(servicesTable.slug, slug))
        .limit(1);
      const row = rows[0];
      if (!row) return [];
      return Array.isArray(row.dynamicBlocks) ? row.dynamicBlocks : [];
    }, []);
  },
  'getServiceBlocksBySlug',
);

/**
 * Get the service type → category name mapping from the DB.
 * Replaces the old hardcoded `serviceTypeToCategory`.
 * Includes 'whole-house' for Sites displayed as projects.
 */
export const getServiceTypeToCategory = cache(async (): Promise<Record<string, import('../../types').Localized<string>>> => {
  const map = { ...await getServiceTypeMap() };
  // Ensure whole-house is always present (for Sites displayed as projects)
  if (!map['whole-house']) {
    map['whole-house'] = WHOLE_HOUSE_CATEGORY;
  }
  return map;
});

/**
 * Get localized category list for project filtering.
 * Includes "All" and "Whole House" (for Sites), plus all service types from DB.
 * Each category includes a `serviceType` matching the service_type field on projects.
 */
export const getCategoriesLocalized = cache(async (): Promise<({ serviceType: string } & import('../../types').Localized<string>)[]> => {
  const serviceTypeToCategory = await getServiceTypeToCategory();
  const otherCategories = Object.entries(serviceTypeToCategory)
    .filter(([key]) => key !== 'whole-house')
    .map(([key, value]) => ({ serviceType: key, ...value }));

  return [
    { serviceType: 'All', en: 'All', zh: '全部', ja: 'すべて', ko: '전체', es: 'Todos' },
    { serviceType: 'whole-house', ...WHOLE_HOUSE_CATEGORY },
    ...otherCategories,
  ];
});

/**
 * Get category slugs for routing (excludes "All").
 */
export const getCategorySlugs = cache(async (): Promise<string[]> => {
  const categories = await getCategoriesLocalized();
  return categories
    .filter((c) => c.serviceType !== 'All')
    .map((c) => c.serviceType);
});

/** Fetch all services (admin — includes all fields + tags). */
export async function getAllServicesAdmin() {
  const rows = await db.select().from(servicesTable).orderBy(asc(servicesTable.displayOrder));
  const serviceIds = rows.map((r: typeof servicesTable.$inferSelect) => r.id);
  const allTags = serviceIds.length > 0
    ? await db.select().from(serviceTagsTable).where(inArray(serviceTagsTable.serviceId, serviceIds))
    : [];
  const tagsByService = groupBy(allTags, (t: typeof serviceTagsTable.$inferSelect) => t.serviceId);
  return rows.map((row: typeof servicesTable.$inferSelect) => ({
    ...row,
    tags: sortByDisplayOrder(tagsByService.get(row.id) ?? []),
  }));
}
