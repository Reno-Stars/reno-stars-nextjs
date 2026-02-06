/**
 * Shared constants for admin forms and server actions.
 */

/** Valid service types for projects */
export const SERVICE_TYPES = ['kitchen', 'bathroom', 'whole-house', 'basement', 'cabinet', 'commercial'] as const;
export type ServiceTypeKey = (typeof SERVICE_TYPES)[number];

/** Service type to category mapping (auto-derived) */
export const SERVICE_TYPE_TO_CATEGORY: Record<ServiceTypeKey, { en: string; zh: string }> = {
  kitchen: { en: 'Kitchen', zh: '厨房' },
  bathroom: { en: 'Bathroom', zh: '卫浴' },
  'whole-house': { en: 'Whole House', zh: '全屋' },
  basement: { en: 'Basement', zh: '地下室' },
  cabinet: { en: 'Cabinet', zh: '橱柜' },
  commercial: { en: 'Commercial', zh: '商业' },
};

/** Space types for projects */
export const SPACE_TYPES = [
  { en: 'Condo', zh: '公寓' },
  { en: 'House', zh: '独立屋' },
  { en: 'Townhouse', zh: '联排别墅' },
  { en: 'Apartment', zh: '公寓楼' },
  { en: 'Commercial', zh: '商业' },
] as const;

/** Space type EN to ZH mapping */
export const SPACE_TYPE_TO_ZH: Record<string, string> = Object.fromEntries(
  SPACE_TYPES.map(({ en, zh }) => [en, zh])
);
