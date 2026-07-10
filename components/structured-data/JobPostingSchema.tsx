import type { Company } from '@/lib/types';
import JsonLd from './JsonLd';
import { getBaseUrl } from '@/lib/utils';
import { parseAddress } from './parse-address';

interface JobPostingSchemaProps {
  company: Company;
  locale: string;
  /** Localized job title, e.g. "Renovation Worker". */
  title: string;
  /** Localized plain-text job description. */
  description: string;
  /** ISO date the posting went live (stable — don't regenerate per render). */
  datePosted: string;
  /** Monthly base pay in CAD, e.g. 4000. Omit to leave baseSalary out. */
  baseSalaryMonthCad?: number;
  /** Localized comma/semicolon list of skills — mirrors the page's duties. */
  skills: string;
  /** Localized qualifications sentence — mirrors the page's requirements. */
  qualifications: string;
}

/** Days a rendered posting stays valid — see validThrough note below. */
const VALID_THROUGH_DAYS = 180;

/**
 * schema.org JobPosting for the /careers page — makes the opening eligible for
 * the Google Jobs experience.
 *
 * validThrough is a rolling DATE (not datetime): today + VALID_THROUGH_DAYS,
 * truncated to YYYY-MM-DD. Date-only means every render on a given day emits the
 * IDENTICAL value, so the edge-cached HTML and a fresh origin render never
 * disagree (no structured-data churn), while it still rolls forward daily so the
 * evergreen posting never lapses. The careers page declares its own
 * `dynamic = 'force-dynamic'` (not relying on layout inheritance) so this
 * re-renders and can't freeze at a build-time value. datePosted stays FIXED.
 *
 * title / description / baseSalary / skills / qualifications are ALL sourced
 * from the careers translations (SSOT) so the schema matches the visible page
 * in every locale — Google flags schema/page content + salary mismatches.
 */
export default function JobPostingSchema({
  company,
  locale,
  title,
  description,
  datePosted,
  baseSalaryMonthCad,
  skills,
  qualifications,
}: JobPostingSchemaProps) {
  const baseUrl = getBaseUrl();
  const address = parseAddress(company.address);
  const validThrough = new Date(Date.now() + VALID_THROUGH_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description,
    datePosted,
    validThrough,
    ...(baseSalaryMonthCad
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'CAD',
            value: {
              '@type': 'QuantitativeValue',
              value: baseSalaryMonthCad,
              unitText: 'MONTH',
            },
          },
        }
      : {}),
    employmentType: ['FULL_TIME', 'PART_TIME'],
    hiringOrganization: {
      '@type': 'Organization',
      name: company.name,
      sameAs: baseUrl,
      logo: company.logo || undefined,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: address.streetAddress,
        addressLocality: address.locality,
        addressRegion: address.region,
        postalCode: address.postalCode,
        addressCountry: 'CA',
      },
    },
    skills,
    qualifications,
    directApply: true,
    url: `${baseUrl}/${locale}/careers/`,
  };

  return <JsonLd data={schema} />;
}
