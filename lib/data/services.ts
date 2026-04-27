import type { Service, Locale, LocalizedService } from '../types';
import { pickLocale, pickLocaleOptional } from '../utils';

export function getLocalizedService(service: Service, locale: Locale): LocalizedService {
  return {
    slug: service.slug,
    title: pickLocale(service.title, locale),
    description: pickLocale(service.description, locale),
    long_description: pickLocaleOptional(service.long_description, locale),
    icon: service.icon,
    image: service.image,
    tags: pickLocaleOptional(service.tags, locale),
    benefits: pickLocaleOptional(service.benefits, locale),
  };
}

// Whole House category (for Sites displayed as projects in listings)
export const WHOLE_HOUSE_CATEGORY = { en: 'Whole House', zh: '全屋' };
