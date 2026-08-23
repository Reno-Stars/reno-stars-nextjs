import type { Company } from '@/lib/types';
import { e164 } from '@/lib/phone';
import JsonLd from './JsonLd';
import { getBaseUrl } from '@/lib/utils';
import { parseAddress } from './parse-address';
import {
  formatReviewerName,
  type ProjectReviewDisplay,
} from '@/lib/project-reviews';

interface ProjectSchemaProps {
  company: Company;
  name: string;
  description: string;
  image: string;
  images?: string[];
  location?: string;
  serviceType?: string;
  url: string;
  googleRating?: number;
  googleReviewCount?: number;
  duration?: string;
  budgetRange?: string;
  spaceType?: string;
  /** BCP-47 locale code (e.g. 'en', 'zh'). When provided, emits
   *  Schema.org `inLanguage` on the WebPage node so Google can match
   *  the project page to localized SERPs. Extends the i18n-aware
   *  schema cluster shipped earlier on this daily branch (FAQ, Article,
   *  HowTo, Breadcrumb, ContactPage, LocalBusiness). Optional for
   *  backwards compatibility — 2 in-tree callers updated in same commit. */
  locale?: string;
  /** Verified client reviews linked to THIS project (project_reviews table).
   *  Emitted as Schema.org Review objects on the mainEntity Service. No
   *  aggregateRating is derived from these — the provider keeps the
   *  business-wide Google aggregate it already carried. */
  reviews?: ProjectReviewDisplay[];
}

export default function ProjectSchema({
  company,
  name,
  description,
  image,
  images = [],
  location,
  serviceType,
  url,
  googleRating,
  googleReviewCount,
  duration,
  budgetRange,
  spaceType,
  locale,
  reviews,
}: ProjectSchemaProps): React.ReactElement {
  const baseUrl = getBaseUrl();
  const allImages = [image, ...images].filter(Boolean);
  const fullUrl = `${baseUrl}${url}`;

  const addressParts = parseAddress(company.address);

  // `HomeAndConstructionBusiness` is a `LocalBusiness` subtype, so Google
  // requires `address` on it — and enforces that especially hard when the
  // node carries an `aggregateRating`, since an unaddressed rated business is
  // the classic "invalid structured data" / star-suppression pattern. This
  // node previously emitted only name/url/telephone + aggregateRating, which
  // flagged all 65 project pages. Shape mirrors ServiceSchema's provider
  // exactly (same parsed PostalAddress sub-fields); deliberately NO `@id` —
  // page-level schemas must not restate the layout org node's @id, guarded by
  // tests/unit/components/structured-data/no-duplicate-ids.test.tsx.
  // Emit `address` ONLY when the parse produced a real street + locality.
  //
  // `parseAddress('')` does NOT return an empty address — it returns blank
  // streetAddress/locality but the HARDCODED fallback `region: 'BC'`,
  // `postalCode: 'V6W 1M2'`. And `COMPANY_FALLBACK.address` IS `''`
  // (lib/db/queries/company.ts), served by withFallback whenever the
  // getCompanyFromDb cache misses and that one query errors — while projects
  // still render from their own warm cache. Emitting unconditionally would
  // therefore publish a rated LocalBusiness with a blank street and a
  // FABRICATED postal code, and because these pages are ISR-cached on a 7-day
  // floor, a single blip bakes that into 65 projects x 14 locales for a week.
  //
  // An absent address re-opens the original "rated business with no address"
  // defect for that render — but a WRONG address is worse than a missing one:
  // it is unfalsifiable from the page and it is exactly the fabrication class
  // this schema pass exists to remove. Same defensive coupling as
  // LocalBusinessSchema's hasAggregateRating guard.
  // The test for "real" is whether parseAddress needed ANY of its fallbacks.
  // It expects "street, unit, city, REGION POSTAL" — four comma segments — and
  // silently substitutes when they are missing: `locality` falls back to
  // parts[0] (the STREET), and regionPostal falls back to the literal
  // 'BC V6W 1M2'. So a partial value like '21300 Gordon Way' yields
  // locality === streetAddress AND an invented postal code — checking only that
  // the fields are non-empty is not enough, which a regression test caught.
  // Requiring all four segments is the only condition under which every emitted
  // sub-field came from the data.
  const hasRealAddress = company.address.split(', ').length >= 4;

  const provider = {
    '@type': 'HomeAndConstructionBusiness' as const,
    name: company.name,
    url: baseUrl,
    telephone: e164(company.phone),
    ...(hasRealAddress && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: addressParts.streetAddress,
        addressLocality: addressParts.locality,
        addressRegion: addressParts.region,
        postalCode: addressParts.postalCode,
        addressCountry: 'CA',
      },
    }),
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
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: fullUrl,
    ...(locale && { inLanguage: locale }),
    // Hero image at WebPage root level — Google reads this for the rich result
    // even when images is passed as an array for OG metadata. The nested
    // mainEntity.Service.image remains as a secondary signal.
    ...(allImages.length > 0 && { image: allImages[0] }),
    mainEntity: {
      '@type': 'Service',
      name,
      description,
      provider,
      ...(serviceType && { serviceType }),
      ...(location && {
        areaServed: {
          '@type': 'Place',
          name: location,
          address: {
            '@type': 'PostalAddress',
            addressLocality: location,
            addressRegion: 'BC',
            addressCountry: 'CA',
          },
        },
      }),
      // All images live here too — Service image is what Google's rich-result
      // tooling historically read; WebPage image is the authoritative root.
      ...(allImages.length > 0 && { image: allImages }),
      ...(budgetRange && {
        offers: {
          '@type': 'Offer',
          priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'CAD',
            name: budgetRange,
          },
        },
      }),
      // Verified client reviews for THIS project. Author name is abbreviated
      // to first name + last initial (matches the on-page card); reviewBody
      // is the verbatim quote. Deliberately NO aggregateRating here.
      //
      // `datePublished` is intentionally omitted. `project_reviews.review_date`
      // is month-precision — every row stores the 1st of the month as a
      // placeholder — and Schema.org types `datePublished` as `Date`
      // (xsd:date), which requires a full YYYY-MM-DD. The previous code
      // emitted a bare 'YYYY-MM', which Google's Rich Results Test and
      // Semrush both reject as invalid (8 project pages flagged). Padding it
      // to 'YYYY-MM-01' would validate but would assert a specific day we do
      // not know, so we omit instead: `datePublished` is optional on Review
      // and omitting it costs no rich-result eligibility.
      ...(reviews && reviews.length > 0 && {
        review: reviews.map((r) => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: formatReviewerName(r.authorName),
          },
          reviewBody: r.body,
          ...(r.bodyLang && { inLanguage: r.bodyLang }),
          reviewRating: {
            '@type': 'Rating',
            ratingValue: r.rating,
            bestRating: 5,
            worstRating: 1,
          },
        })),
      }),
    },
    ...(duration && {
      timeRequired: duration,
    }),
    ...(spaceType && {
      about: {
        '@type': 'Thing',
        name: spaceType,
      },
    }),
  };

  return (
    <JsonLd data={schema} />
  );
}
