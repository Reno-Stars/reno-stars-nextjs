import type { Company } from '@/lib/types';
import { getBaseUrl } from '@/lib/utils';
import { parseAddress } from './parse-address';

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
  /** Optional representative image URL (absolute). Adds to Service for richer SERP. */
  image?: string;
  url: string;
  googleRating?: number;
  googleReviewCount?: number;
}

export default function ServiceSchema({
  company,
  serviceName,
  serviceDescription,
  location,
  areaServed,
  priceRange,
  image,
  url,
  googleRating,
  googleReviewCount,
}: ServiceSchemaProps): React.ReactElement {
  const baseUrl = getBaseUrl();
  const absoluteUrl = `${baseUrl}${url}`;
  const addressParts = parseAddress(company.address);

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
      // Split address into proper PostalAddress sub-fields per Schema.org spec.
      // Previously the full company.address string was crammed into streetAddress,
      // which breaks structured-address parsing. Now each part lives in its own field.
      address: {
        '@type': 'PostalAddress',
        streetAddress: addressParts.streetAddress,
        addressLocality: addressParts.locality,
        addressRegion: addressParts.region,
        postalCode: addressParts.postalCode,
        addressCountry: 'CA',
      },
    },
    url: absoluteUrl,
  };

  if (image) {
    schema.image = image;
  }

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

  if (googleRating && googleReviewCount) {
    (schema.provider as Record<string, unknown>).aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: googleRating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: googleReviewCount,
      reviewCount: googleReviewCount,
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
