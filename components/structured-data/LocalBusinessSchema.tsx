import type { Company, GoogleReview, SocialLink, ServiceArea } from '@/lib/types';
import { getBaseUrl } from '@/lib/utils';
import { parseAddress } from './parse-address';

const BASE_URL = getBaseUrl();

// IMPORTANT: This is the canonical Organization node for the entire site
// (rendered in app/[locale]/layout.tsx on every page). Any other JSON-LD that
// describes the same business MUST NOT reuse `@id: ${BASE_URL}/#organization`,
// or Google will merge nodes by @id and flag conflicts (e.g. "Review has
// multiple aggregate ratings"). Page-level schemas should reference this node
// via `{ "@id": "${BASE_URL}/#organization" }` instead of redeclaring it.
interface LocalBusinessSchemaProps {
  company: Company;
  socialLinks: SocialLink[];
  areas: ServiceArea[];
  googleRating?: number;
  googleReviewCount?: number;
  reviews?: GoogleReview[];
}

export default function LocalBusinessSchema({ company, socialLinks, areas, googleRating, googleReviewCount, reviews }: LocalBusinessSchemaProps): React.ReactElement {
  const addressParts = parseAddress(company.address);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${BASE_URL}/#organization`,
    name: company.name,
    image: company.logo,
    url: BASE_URL,
    telephone: `+1-${company.phone}`,
    email: company.email,
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
    areaServed: areas.map((area) => ({
      '@type': 'City',
      name: area.name.en,
    })),
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
    sameAs: socialLinks.map((link) => link.url).filter((url) => url !== '#'),
    ...(googleRating && googleReviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: googleRating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: googleReviewCount,
        reviewCount: googleReviewCount,
      },
    }),
    ...(reviews && reviews.length > 0 && {
      review: reviews.map((r) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: r.authorName,
          ...(r.authorUri && { url: r.authorUri }),
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody: r.text,
        ...(r.publishTime && { datePublished: r.publishTime }),
      })),
    }),
    description:
      `Professional home renovation services in Metro Vancouver. Kitchen, bathroom, whole house renovations. Licensed, insured with ${company.liabilityCoverage} CGL insurance, active WCB coverage, and up to 3 years warranty.`,
    foundingDate: String(company.foundingYear),
    numberOfEmployees: company.teamSize,
    slogan: company.tagline,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
