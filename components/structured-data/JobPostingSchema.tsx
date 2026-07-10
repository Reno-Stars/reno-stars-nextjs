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
}

/**
 * schema.org JobPosting for the /careers page — makes the opening eligible
 * for the Google Jobs experience.
 *
 * validThrough is a ROLLING date (~6 months from render). The careers page is
 * force-dynamic (re-rendered per request), so every crawl sees a future date —
 * the evergreen posting never expires, which is what Google's "Missing field
 * validThrough" recommendation wants without the risk of a static date silently
 * lapsing. (datePosted stays FIXED — it's the real posting day.)
 *
 * No baseSalary: the owner publishes "competitive, based on experience" rather
 * than a figure, and fabricating a range is not allowed. This stays a
 * non-critical GSC suggestion until the owner provides a real pay range.
 */
export default function JobPostingSchema({ company, locale, title, description, datePosted }: JobPostingSchemaProps) {
  const baseUrl = getBaseUrl();
  const address = parseAddress(company.address);
  const validThrough = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description,
    datePosted,
    validThrough,
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
    skills: 'Demolition, tiling, drywall, painting, flooring, finishing carpentry',
    qualifications: 'Renovation or construction experience preferred; Mandarin or Cantonese speaking is a strong asset; legally eligible to work in Canada.',
    directApply: true,
    url: `${baseUrl}/${locale}/careers/`,
  };

  return (
    <JsonLd data={schema} />
  );
}
