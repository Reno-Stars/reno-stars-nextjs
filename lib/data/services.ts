import type { Service, Locale, LocalizedService } from '../types';

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
