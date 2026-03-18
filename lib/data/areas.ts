import type { ServiceArea, Locale, LocalizedArea } from '../types';

export function getLocalizedArea(area: ServiceArea, locale: Locale): LocalizedArea {
  return {
    id: area.id,
    slug: area.slug,
    name: area.name[locale],
    description: area.description?.[locale],
    content: area.content?.[locale],
    highlights: area.highlights?.[locale],
    metaTitle: area.metaTitle?.[locale],
    metaDescription: area.metaDescription?.[locale],
  };
}
