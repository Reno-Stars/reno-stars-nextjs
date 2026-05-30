import type { Company, GoogleReview, SocialLink, ServiceArea } from '@/lib/types';
import type { Locale } from '@/i18n/config';
import { getBaseUrl } from '@/lib/utils';
import { parseAddress } from './parse-address';
import { COMPANY_STATS } from '@/lib/company-config';

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
  /** Pre-resolved localized business description from layout's loaded
   *  i18n messages. When omitted we fall back to an EN string so the
   *  schema remains valid even on pages that haven't wired this up. */
  description?: string;
  /** Page locale. When supplied, each Review's `reviewBody` is rendered
   *  in the matching locale via `review.translations?.[locale] ?? review.text`,
   *  keeping structured-data review text consistent with the visible
   *  testimonials marquee (PR #83 schema + Stage 2 read-path). Optional —
   *  when omitted, the EN source text is emitted. */
  locale?: Locale;
}

export default function LocalBusinessSchema({ company, socialLinks, areas, googleRating, googleReviewCount, reviews, description, locale }: LocalBusinessSchemaProps): React.ReactElement {
  const addressParts = parseAddress(company.address);

  const schema = {
    '@context': 'https://schema.org',
    // Multi-typed: HomeAndConstructionBusiness IS-A LocalBusiness IS-A Organization
    // per Schema.org. Listing all three keeps the most-specific type while
    // satisfying literal @type checks for "Organization" and "LocalBusiness"
    // without duplicating the entity into separate nodes.
    '@type': ['Organization', 'LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': `${BASE_URL}/#organization`,
    name: company.name,
    // alternateName: brand-variant capture so Google reconciles user queries
    // for the singular "Reno Star", concatenated "RenoStars", and lowercase
    // "renostars" with this entity. GSC 2026-05-04 showed "reno star" (sing.)
    // ranking pos 7 with 99 imp / 12 clicks — should be pos 1 since brand.
    alternateName: ['Reno Stars', 'Reno Star', 'RenoStars', 'Renostars'],
    image: company.logo,
    url: BASE_URL,
    telephone: `+1${company.phone.replace(/\D/g, '')}`,
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
    // Schema.org requires openingHoursSpecification to be an array even when
    // there is only one time slot — Google's Rich Results validator flags
    // the singular-object form as a structured-data error.
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    // sameAs: social profiles + Google Business Profile (GBP). GBP URL via
    // place_id is the strongest entity-graph signal — it links the
    // Organization schema directly to the GBP listing for knowledge-graph
    // consolidation. Place ID is the same one used for Places API reviews.
    sameAs: [
      ...socialLinks.map((link) => link.url).filter((url) => url !== '#'),
      ...(process.env.GOOGLE_PLACE_ID
        ? [`https://www.google.com/maps/place/?q=place_id:${process.env.GOOGLE_PLACE_ID}`]
        : []),
    ],
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
        // reviewBody follows the visible testimonial text: use the locale
        // translation when available, fall back to the EN source. Keeps the
        // JSON-LD locale-consistent with the rendered marquee on each
        // /[locale]/* path. translations map is populated by pnpm reviews:cache.
        reviewBody: (locale && r.translations?.[locale]) ?? r.text,
        ...(r.publishTime && { datePublished: r.publishTime }),
      })),
    }),
    description: description
      ?? `Professional home renovation services in Metro Vancouver. Kitchen, bathroom, whole house renovations. Licensed, insured with ${company.liabilityCoverage} CGL insurance, active WCB coverage, and up to 3 years warranty.`,
    // schema.org foundingDate = legal incorporation year, NOT aggregate
    // team experience. The "20+ years" stat on the marketing site reflects
    // team-level renovation experience (foundingYear in company-config.ts);
    // schema must use the corporate incorporation year for entity honesty.
    foundingDate: String(COMPANY_STATS.companyFoundingYear),
    numberOfEmployees: company.teamSize,
    slogan: company.tagline,
    // knowsAbout: topical-expertise signal for AI search engines (Perplexity,
    // Claude Search, ChatGPT Search, Google AI Overview). Lists the topical
    // entities this organization has demonstrated expertise in. Combined with
    // the existing services + reviews + project portfolio, this gives AI
    // citation engines explicit hooks to map "vancouver kitchen renovation
    // contractor" → this entity. Topics are the same noun-phrases that anchor
    // the cost-guide cluster, blog cluster, and service-detail pages — so the
    // AI engine's verification crawl finds matching deep content for each
    // claim. Order matches commercial-intent volume.
    knowsAbout: [
      'Kitchen Renovation',
      'Bathroom Renovation',
      'Whole-House Renovation',
      'Basement Renovation',
      'Basement Suite Conversion',
      'Cabinet Refinishing',
      'Commercial Renovation',
      'Heritage Home Renovation',
      'Multi-Family Renovation',
      'Vancouver Building Permits',
      'BC Building Code Compliance',
      'Energy-Efficient Home Renovation',
      'Renovation Cost Estimation',
      'Renovation Financing',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
