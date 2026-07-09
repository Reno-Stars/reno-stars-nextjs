import type { Company } from '@/lib/types';
import { e164 } from '@/lib/phone';
import JsonLd from './JsonLd';
import { getBaseUrl } from '@/lib/utils';
import { parseAddress } from './parse-address';
import { OPENING_HOURS } from '@/lib/company-config';

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
    // Multi-typed: per-area facet of the org marked as LocalBusiness so
    // literal @type checks pass on area pages.
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': `${baseUrl}/#${areaSlug}-business`,
    name: `${company.name} - ${areaName}`,
    description: `Professional home renovation services in ${areaName}. Kitchen, bathroom, whole house renovations by ${company.name}.`,
    url: `${baseUrl}/${locale}/areas/${areaSlug}/`,
    telephone: e164(company.phone),
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
        // Both fields are needed: ratingCount drives the sitelink rich-result
        // eligibility, reviewCount drives the ⭐-on-SERP rendering. Setting
        // them equal because every Google rating is also a review on GBP.
        ratingCount: googleReviewCount,
        reviewCount: googleReviewCount,
      },
    }),
    priceRange: '$$',
    // Hours SSOT lives in lib/company-config.ts and must mirror the GBP listing.
    openingHoursSpecification: OPENING_HOURS,
  };

  return (
    <JsonLd data={schema} />
  );
}
