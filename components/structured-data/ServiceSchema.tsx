import type { Company } from '@/lib/types';
import JsonLd from './JsonLd';
import { getBaseUrl, toPlainTextSummary } from '@/lib/utils';
import { organizationRef } from './ids';

/** JSON-LD description budget. Callers pass markdown long_description. */
const DESCRIPTION_MAX_CHARS = 300;

interface ServiceSchemaProps {
  company: Company;
  serviceName: string;
  /** May be markdown (service long_description) — it is reduced to plain
   *  text and truncated to ~300 chars here, so no caller can leak syntax. */
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
  serviceRadiusKm,
}: ServiceSchemaProps): React.ReactElement {
  const baseUrl = getBaseUrl();
  const absoluteUrl = `${baseUrl}${url}`;
  const description = serviceDescription ? toPlainTextSummary(serviceDescription, DESCRIPTION_MAX_CHARS) : '';

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${absoluteUrl}#service`,
    name: serviceName,
    serviceType: serviceName,
    ...(description && { description }),
    // Reference the layout's canonical business node instead of redeclaring
    // a HomeAndConstructionBusiness (with the office address) per page.
    provider: organizationRef(),
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

  // No aggregateRating here: it lives only on the layout Organization
  // (LocalBusinessSchema). Repeating it per Service was a duplicate rating
  // for the same business on every service page.

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
    <JsonLd data={schema} />
  );
}
