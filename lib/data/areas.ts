import type { ServiceArea, Locale, LocalizedArea } from '../types';
import { pickLocale, pickLocaleOptional } from '../utils';

export function getLocalizedArea(area: ServiceArea, locale: Locale): LocalizedArea {
  return {
    id: area.id,
    slug: area.slug,
    name: pickLocale(area.name, locale),
    description: pickLocaleOptional(area.description, locale),
    content: pickLocaleOptional(area.content, locale),
    highlights: pickLocaleOptional(area.highlights, locale),
    metaTitle: pickLocaleOptional(area.metaTitle, locale),
    metaDescription: pickLocaleOptional(area.metaDescription, locale),
  };
}
