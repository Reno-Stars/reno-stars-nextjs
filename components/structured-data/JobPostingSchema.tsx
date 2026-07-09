import type { Company } from '@/lib/types';
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
 * for the Google Jobs experience. No baseSalary: Google recommends it but we
 * don't publish figures, and omitting is valid (never fabricate a range).
 * No validThrough: the posting is evergreen; adding one would silently
 * expire the rich result.
 */
export default function JobPostingSchema({ company, locale, title, description, datePosted }: JobPostingSchemaProps) {
  const baseUrl = getBaseUrl();
  const address = parseAddress(company.address);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description,
    datePosted,
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
    // Metro Vancouver job sites — the role isn't tied to one address.
    applicantLocationRequirements: {
      '@type': 'City',
      name: 'Metro Vancouver',
    },
    skills: 'Demolition, tiling, drywall, painting, flooring, finishing carpentry',
    qualifications: 'Renovation or construction experience preferred; Mandarin or Cantonese speaking is a strong asset; legally eligible to work in Canada.',
    directApply: true,
    url: `${baseUrl}/${locale}/careers/`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
