import type { Company } from '@/lib/types';
import { getBaseUrl } from '@/lib/utils';

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

  // Parse address for structured data
  const addressParts = company.address.split(', ');
  const streetAddress = addressParts.slice(0, 2).join(', ');
  const locality = addressParts[2] || 'Richmond';
  const regionPostal = addressParts[3] || 'BC V6W 1M2';
  const [region, ...postalParts] = regionPostal.split(' ');
  const postalCode = postalParts.join(' ');

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
      streetAddress,
      addressLocality: locality,
      addressRegion: region,
      postalCode,
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
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
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
