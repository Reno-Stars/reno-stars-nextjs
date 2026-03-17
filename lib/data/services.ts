import type { Service, Locale, LocalizedService } from '../types';
import { getServiceTypeMap } from '../db/queries';

export function getLocalizedService(service: Service, locale: Locale): LocalizedService {
  return {
    slug: service.slug,
    title: service.title[locale],
    description: service.description[locale],
    long_description: service.long_description?.[locale],
    icon: service.icon,
    image: service.image,
    tags: service.tags?.[locale],
  };
}

// Whole House category (for Sites displayed as projects in listings)
export const WHOLE_HOUSE_CATEGORY = { en: 'Whole House', zh: '全屋' };

/**
 * Get the service type → category name mapping from the DB.
 * Replaces the old hardcoded `serviceTypeToCategory`.
 * Includes 'whole-house' for Sites displayed as projects.
 */
export async function getServiceTypeToCategory(): Promise<Record<string, { en: string; zh: string }>> {
  const map = await getServiceTypeMap();
  // Ensure whole-house is always present (for Sites displayed as projects)
  if (!map['whole-house']) {
    map['whole-house'] = WHOLE_HOUSE_CATEGORY;
  }
  return map;
}

/**
 * Get the inverse mapping: category name → service slug.
 */
export async function getCategoryToServiceType(): Promise<Record<string, string>> {
  const map = await getServiceTypeToCategory();
  const inverse: Record<string, string> = {};
  for (const [slug, { en, zh }] of Object.entries(map)) {
    inverse[en] = slug;
    inverse[zh] = slug;
  }
  return inverse;
}
