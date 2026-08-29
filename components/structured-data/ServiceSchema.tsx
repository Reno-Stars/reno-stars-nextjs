import type { Company } from '@/lib/types';
import { e164 } from '@/lib/phone';
import JsonLd from './JsonLd';
import { getBaseUrl } from '@/lib/utils';
import { parseAddress } from './parse-address';

interface ServiceSchemaProps {
  company: Company;
  serviceName: string;
  serviceDescription?: string;
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
  const hasFullAddress = addressParts.streetAddress && addressParts.locality
    && addressParts.region && addressParts.postalCode;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${absoluteUrl}#service`,
    name: serviceName,
    serviceType: serviceName,
    ...(serviceDescription && { description: serviceDescription }),
    provider: {
      '@type': 'HomeAndConstructionBusiness',
      name: company.name,
      url: baseUrl,
      telephone: e164(company.phone),
      // Only emit address when all four PostalAddress sub-fields are present.
      // A fabricated postalCode in a rated Service node suppresses stars in SERP —
      // the same class of defect already fixed in ProjectSchema. Keep them in sync.
      ...(hasFullAddress && {
        address: {
          '@type': 'PostalAddress',
          streetAddress: addressParts.streetAddress,
          addressLocality: addressParts.locality,
          addressRegion: addressParts.region,
          postalCode: addressParts.postalCode,
          addressCountry: 'CA',
        },
      }),
    },
    url: absoluteUrl,
  };

  if (image) {
    schema.image = image;
  }

  // NOTE: inLanguage is intentionally NOT set. It is a CreativeWork property
  // and is invalid on a Service node. Page language is conveyed via
  // <html lang> + hreflang, not a schema field.

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
    const min = Number(priceRange.min);
    const max = Number(priceRange.max);
    if (!isNaN(min) && !isNaN(max) && max >= min) {
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
              minPrice: min,
              maxPrice: max,
            },
          },
        ],
      };
    }
  }

  return (
    <JsonLd data={schema} />
  );
}
