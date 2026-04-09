import type { Company } from '@/lib/types';
import { getBaseUrl } from '@/lib/utils';

interface ServiceSchemaProps {
  company: Company;
  serviceName: string;
  serviceDescription: string;
  location?: string;
  areaServed?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  url: string;
}

export default function ServiceSchema({
  company,
  serviceName,
  serviceDescription,
  location,
  areaServed,
  priceRange,
  url,
}: ServiceSchemaProps): React.ReactElement {
  const baseUrl = getBaseUrl();
  const absoluteUrl = `${baseUrl}${url}`;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${absoluteUrl}#service`,
    name: serviceName,
    serviceType: serviceName,
    description: serviceDescription,
    provider: {
      '@type': 'HomeAndConstructionBusiness',
      name: company.name,
      url: baseUrl,
      telephone: `+1-${company.phone}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: company.address,
        addressRegion: 'BC',
        addressCountry: 'CA',
      },
    },
    url: absoluteUrl,
  };

  if (areaServed && areaServed.length > 0) {
    schema.areaServed = areaServed.map((city) => ({
      '@type': 'City',
      name: city,
    }));
  } else if (location) {
    schema.areaServed = {
      '@type': 'City',
      name: location,
    };
  }

  if (priceRange) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: `${serviceName} Services`,
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: location ? `${serviceName} in ${location}` : serviceName,
          },
          priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'CAD',
            minPrice: priceRange.min,
            maxPrice: priceRange.max,
          },
        },
      ],
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
