import type { ServiceArea, Locale, LocalizedArea } from '../types';

export function getLocalizedArea(area: ServiceArea, locale: Locale): LocalizedArea {
  return {
    slug: area.slug,
    name: area.name[locale],
    description: area.description?.[locale],
  };
}
