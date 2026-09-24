import type { Company } from '@/lib/types';
import JsonLd from './JsonLd';
import { getBaseUrl } from '@/lib/utils';
import { organizationRef } from './ids';

interface AreaServiceSchemaProps {
  company: Company;
  areaName: string;
  areaSlug: string;
  locale: string;
  services: string[];
}

/**
 * Renovation services offered in one city (areas/[city] pages).
 *
 * Replaces LocalBusinessAreaSchema (removed 2026-09-24), which declared a
 * separate LocalBusiness "Reno Stars - <City>" per city at the Richmond office
 * address — a phantom branch for every service area when there is one real
 * location. This node is a Service provided by the canonical business
 * (referenced by @id, never redeclared) with the city as areaServed, so the
 * page still states "Reno Stars serves <City>" without inventing an office.
 * No address, geo, hours or aggregateRating: those belong to the one business
 * node in the layout.
 */
export default function AreaServiceSchema({
  company,
  areaName,
  areaSlug,
  locale,
  services,
}: AreaServiceSchemaProps): React.ReactElement {
  const pageUrl = `${getBaseUrl()}/${locale}/areas/${areaSlug}/`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${pageUrl}#service`,
    name: `Home Renovation in ${areaName}`,
    serviceType: 'Home Renovation',
    description: `Kitchen, bathroom, basement and whole-house renovation services in ${areaName} by ${company.name}.`,
    url: pageUrl,
    provider: organizationRef(),
    areaServed: {
      '@type': 'City',
      name: areaName,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Metro Vancouver',
      },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Renovation Services in ${areaName}`,
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: `${service} in ${areaName}`,
        },
      })),
    },
  };

  return <JsonLd data={schema} />;
}
