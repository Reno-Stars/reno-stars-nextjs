import type { Service, ServiceType, Locale, LocalizedService } from '../types';

export function getLocalizedService(service: Service, locale: Locale): LocalizedService {
  return {
    slug: service.slug,
    title: service.title[locale],
    description: service.description[locale],
    long_description: service.long_description?.[locale],
    icon: service.icon,
    image: service.image,
  };
}

// Map service types to category names
export const serviceTypeToCategory: Record<ServiceType, { en: string; zh: string }> = {
  kitchen: { en: 'Kitchen', zh: '厨房' },
  bathroom: { en: 'Bathroom', zh: '卫浴' },
  'whole-house': { en: 'Whole House', zh: '全屋' },
  basement: { en: 'Basement', zh: '地下室' },
  cabinet: { en: 'Cabinet', zh: '橱柜' },
  commercial: { en: 'Commercial', zh: '商业' },
};

// Derived inverse mapping — kept in sync with serviceTypeToCategory automatically
export const categoryToServiceType: Record<string, ServiceType> = Object.entries(
  serviceTypeToCategory
).reduce((acc, [serviceType, { en, zh }]) => {
  acc[en] = serviceType as ServiceType;
  acc[zh] = serviceType as ServiceType;
  return acc;
}, {} as Record<string, ServiceType>);
