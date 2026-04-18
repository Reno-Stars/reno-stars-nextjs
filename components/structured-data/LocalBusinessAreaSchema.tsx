import type { Company } from '@/lib/types';
import { getBaseUrl } from '@/lib/utils';
import { parseAddress } from './parse-address';

interface LocalBusinessAreaSchemaProps {
  company: Company;
  areaName: string;
  areaSlug: string;
  locale: string;
  services: string[];
  googleRating?: number;
  googleReviewCount?: number;
}

export default function LocalBusinessAreaSchema({
  company,
  areaName,
  areaSlug,
  locale,
  services,
  googleRating,
  googleReviewCount,
}: LocalBusinessAreaSchemaProps): React.ReactElement {
  const baseUrl = getBaseUrl();

  const addressParts = parseAddress(company.address);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${baseUrl}/#${areaSlug}-business`,
    name: `${company.name} - ${areaName}`,
    description: `Professional home renovation services in ${areaName}. Kitchen, bathroom, whole house renovations by ${company.name}.`,
    url: `${baseUrl}/${locale}/areas/${areaSlug}/`,
    telephone: `+1-${company.phone}`,
    email: company.email,
    image: company.logo,
    address: {
      '@type': 'PostalAddress',
      streetAddress: addressParts.streetAddress,
      addressLocality: addressParts.locality,
      addressRegion: addressParts.region,
      postalCode: addressParts.postalCode,
      addressCountry: 'CA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: company.geo.latitude,
      longitude: company.geo.longitude,
    },
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
    ...(googleRating && googleReviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: googleRating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: googleReviewCount,
      },
    }),
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
