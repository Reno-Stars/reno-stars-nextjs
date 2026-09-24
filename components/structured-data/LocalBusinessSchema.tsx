import type { Company, SocialLink, ServiceArea } from '@/lib/types';
import { e164 } from '@/lib/phone';
import JsonLd from './JsonLd';
import { SCHEMA_AVAILABLE_LANGUAGES } from '@/i18n/config';
import { getBaseUrl } from '@/lib/utils';
import { parseAddress } from './parse-address';
import { COMPANY_STATS, OPENING_HOURS, BRAND_ALTERNATE_NAMES } from '@/lib/company-config';
import { organizationId } from './ids';

const BASE_URL = getBaseUrl();

// IMPORTANT: This is the canonical Organization node for the entire site
// (rendered in app/[locale]/layout.tsx on every page). Any other JSON-LD that
// describes the same business MUST NOT reuse `@id: ${BASE_URL}/#organization`,
// or Google will merge nodes by @id and flag conflicts (e.g. "Review has
// multiple aggregate ratings"). Page-level schemas should reference this node
// via `organizationRef()` from ./ids instead of redeclaring it.
interface LocalBusinessSchemaProps {
  company: Company;
  socialLinks: SocialLink[];
  areas: ServiceArea[];
  googleRating?: number;
  googleReviewCount?: number;
  /** Pre-resolved localized business description from layout's loaded
   *  i18n messages. When omitted we fall back to an EN string so the
   *  schema remains valid even on pages that haven't wired this up. */
  description?: string;
}

export default function LocalBusinessSchema({ company, socialLinks, areas, googleRating, googleReviewCount, description }: LocalBusinessSchemaProps): React.ReactElement {
  const addressParts = parseAddress(company.address);

  // aggregateRating is emitted ONLY here — never on Service / Project /
  // area nodes — so a page carries one rating for the one business. Its
  // source is the Google Business Profile (Places API). Google does not show
  // review stars for a LocalBusiness/Organization about itself ("self-serving
  // reviews", Sept 2019), so this is an entity signal only, not a rich-result
  // play. Omitted when the Places fetch returned a zeroed rating/count.
  //
  // `review[]` is deliberately NOT emitted: those are Google Maps reviews,
  // i.e. collected by a third party, and Google's review-snippet policy
  // disallows marking up reviews the business did not collect itself
  // (removed 2026-09-24). The visible testimonials marquee is unaffected.
  const hasAggregateRating = Boolean(googleRating && googleReviewCount);

  const schema = {
    '@context': 'https://schema.org',
    // Multi-typed: HomeAndConstructionBusiness IS-A LocalBusiness IS-A Organization
    // per Schema.org. Listing all three keeps the most-specific type while
    // satisfying literal @type checks for "Organization" and "LocalBusiness"
    // without duplicating the entity into separate nodes.
    '@type': ['Organization', 'LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': organizationId(),
    // NOTE: inLanguage is intentionally NOT set here. It is a CreativeWork
    // property and is invalid on Organization/LocalBusiness nodes (Semrush
    // and Google Rich Results flag it as an unknown property). Document
    // language for these entity nodes is conveyed via <html lang> + hreflang,
    // not a schema field. `availableLanguage` inside contactPoint below is
    // SERVICE-language and is a different, valid signal.
    name: company.name,
    // Brand variants incl. the Chinese trade name — SSOT in lib/company-config.
    alternateName: BRAND_ALTERNATE_NAMES,
    image: company.logo,
    url: BASE_URL,
    telephone: e164(company.phone),
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
    // Hours SSOT lives in lib/company-config.ts and must mirror the GBP listing.
    openingHoursSpecification: OPENING_HOURS,
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
    ...(hasAggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: googleRating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: googleReviewCount,
        reviewCount: googleReviewCount,
      },
    }),
    description: description
      ?? `Professional home renovation services in Metro Vancouver. Kitchen, bathroom, whole house renovations. Licensed, insured with ${company.liabilityCoverage} CGL insurance, active WCB coverage, and up to ${COMPANY_STATS.warrantyYears} years warranty.`,
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
      // Additional services from DB (accessible-bathroom, poly-b-replacement,
      // critical-load-panel, heat-pump-hvac, flooring — confirmed via
      // services table slugs, 2026-08-30 audit)
      'Accessible Bathroom Renovation',
      'Poly-B Pipe Replacement',
      'Critical Load Panel Upgrade',
      'Heat Pump HVAC',
      'Flooring Installation',
    ],
    // contactPoint: explicit "how to reach customer service" entry for AI
    // engines + Google knowledge-graph. Distinct from the top-level
    // `telephone` / `email` fields because contactPoint can scope by
    // contactType (customer service, sales, technical support, etc.) and
    // by availableLanguage. availableLanguage (SCHEMA_AVAILABLE_LANGUAGES,
    // from i18n/config.ts) is a staffing fact derived from
    // `LOCALE_META.nativeSupport` — which languages customer service can
    // actually answer in — deliberately NOT the set of locales the site is
    // translated into; those are different claims and conflating them tells
    // Google the business offers service it cannot deliver.
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: e164(company.phone),
        email: company.email,
        contactType: 'customer service',
        areaServed: 'CA',
        availableLanguage: SCHEMA_AVAILABLE_LANGUAGES,
      },
    ],
  };

  return (
    <JsonLd data={schema} />
  );
}
