/**
 * Shared constants for admin forms and server actions.
 */

import scopesData from '@/lib/data/service-scopes.json';

/** Space types for projects */
export const SPACE_TYPES = [
  { en: 'Condo', zh: '公寓' },
  { en: 'House', zh: '独立屋' },
  { en: 'Townhouse', zh: '联排别墅' },
  { en: 'Apartment', zh: '公寓楼' },
  { en: 'Commercial', zh: '商业' },
] as const;

/** Slug of the container site for standalone (non-whole-house) projects */
export const STANDALONE_SITE_SLUG = 'individual-projects';

/** Space type EN to ZH mapping */
export const SPACE_TYPE_TO_ZH: Record<string, string> = Object.fromEntries(
  SPACE_TYPES.map(({ en, zh }) => [en, zh])
);

/** Lightweight service area option for admin dropdowns */
export interface AreaOption {
  id: string;
  nameEn: string;
  nameZh: string;
}

/** All available service scopes per service type slug, loaded from JSON. */
export const SERVICE_SCOPES: Record<string, { en: string; zh: string }[]> =
  scopesData as Record<string, { en: string; zh: string }[]>;

/** All unique scopes across all service types (deduplicated by EN name). */
export const ALL_SCOPES: { en: string; zh: string }[] = (() => {
  const seen = new Set<string>();
  return Object.values(SERVICE_SCOPES).flat().filter((s) => {
    if (seen.has(s.en)) return false;
    seen.add(s.en);
    return true;
  });
})();

/** EN→ZH lookup for all scopes across all service types. */
export const SCOPE_EN_TO_ZH: ReadonlyMap<string, string> = new Map(
  ALL_SCOPES.map((s) => [s.en, s.zh])
);
