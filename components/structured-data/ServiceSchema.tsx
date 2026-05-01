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
  /** Service-area radius in km centred on company.geo. When set, emits a
   *  GeoCircle alongside the City `areaServed` list — Google reads both as
   *  complementary geographic-coverage signals for local pack eligibility. */
  serviceRadiusKm?: number;
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
  serviceRadiusKm,
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

  // Build areaServed: prefer the City list, fall back to single location.
  // When serviceRadiusKm is provided, append a GeoCircle node so Google
  // gets both City names AND a geo-bounded radius signal.
  const cityNodes = areaServed && areaServed.length > 0
    ? areaServed.map((city) => ({ '@type': 'City', name: city }))
    : location ? [{ '@type': 'City', name: location }] : [];

  const geoCircle = serviceRadiusKm
    ? {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: company.geo.latitude,
          longitude: company.geo.longitude,
        },
        // Schema.org expects geoRadius in metres for unambiguous interpretation.
        geoRadius: serviceRadiusKm * 1000,
      }
    : null;

  const areaServedNodes = geoCircle ? [...cityNodes, geoCircle] : cityNodes;
  if (areaServedNodes.length > 0) {
    schema.areaServed = areaServedNodes.length === 1 ? areaServedNodes[0] : areaServedNodes;
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
