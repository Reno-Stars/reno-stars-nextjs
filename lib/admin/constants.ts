/**
 * Shared constants for admin forms and server actions.
 */

/** Valid service types for projects (room-level only, whole-house is represented by Sites) */
export const SERVICE_TYPES = ['kitchen', 'bathroom', 'basement', 'cabinet', 'commercial'] as const;
export type ServiceTypeKey = (typeof SERVICE_TYPES)[number];

/** Service type to category mapping (auto-derived) */
export const SERVICE_TYPE_TO_CATEGORY: Record<ServiceTypeKey, { en: string; zh: string }> = {
  kitchen: { en: 'Kitchen', zh: '厨房' },
  bathroom: { en: 'Bathroom', zh: '卫浴' },
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

/** Slug of the container site for standalone (non-whole-house) projects */
export const STANDALONE_SITE_SLUG = 'individual-projects';

/** Space type EN to ZH mapping */
export const SPACE_TYPE_TO_ZH: Record<string, string> = Object.fromEntries(
  SPACE_TYPES.map(({ en, zh }) => [en, zh])
);

/** Default service scopes per service type (used by batch upload and optionally for new projects) */
export const DEFAULT_SCOPES: Record<ServiceTypeKey, { en: string; zh: string }[]> = {
  kitchen: [
    { en: 'Cabinet Installation', zh: '橱柜安装' },
    { en: 'Countertop Replacement', zh: '台面更换' },
    { en: 'Backsplash Tiling', zh: '后挡板瓷砖' },
    { en: 'Plumbing', zh: '水管工程' },
    { en: 'Lighting', zh: '灯光照明' },
  ],
  bathroom: [
    { en: 'Tile Work', zh: '瓷砖工程' },
    { en: 'Vanity Installation', zh: '洗手台安装' },
    { en: 'Shower/Tub', zh: '淋浴/浴缸' },
    { en: 'Plumbing', zh: '水管工程' },
    { en: 'Lighting', zh: '灯光照明' },
  ],
  basement: [
    { en: 'Framing', zh: '框架结构' },
    { en: 'Drywall', zh: '石膏板' },
    { en: 'Flooring', zh: '地板铺设' },
    { en: 'Electrical', zh: '电气工程' },
    { en: 'Plumbing', zh: '水管工程' },
  ],
  cabinet: [
    { en: 'Custom Cabinetry', zh: '定制橱柜' },
    { en: 'Hardware Installation', zh: '五金安装' },
    { en: 'Finishing', zh: '表面处理' },
  ],
  commercial: [
    { en: 'Space Planning', zh: '空间规划' },
    { en: 'Flooring', zh: '地板铺设' },
    { en: 'Electrical', zh: '电气工程' },
    { en: 'Finishing', zh: '装修收尾' },
  ],
};
