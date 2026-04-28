import type { Service, Locale, LocalizedService, Localized } from '../types';
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

// Whole House category (for Sites displayed as projects in listings).
// Localized<string> shape so /ja/, /ko/, /es/ category filter cards
// render in the user's language.
export const WHOLE_HOUSE_CATEGORY: Localized<string> = {
  en: 'Whole House',
  zh: '全屋',
  ja: '家全体',
  ko: '주택 전체',
  es: 'Casa completa',
};
