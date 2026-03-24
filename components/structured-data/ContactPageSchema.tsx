import type { Company } from '@/lib/types';
import { getBaseUrl } from '@/lib/utils';
import { parseAddress } from './parse-address';

const BASE_URL = getBaseUrl();

interface ContactPageSchemaProps {
  company: Company;
  areaNames: string[];
}

export default function ContactPageSchema({ company, areaNames }: ContactPageSchemaProps) {
  const addr = parseAddress(company.address);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${company.name}`,
    url: `${BASE_URL}/contact/`,
    mainEntity: {
      '@type': 'HomeAndConstructionBusiness',
      name: company.name,
      image: company.logo,
      url: BASE_URL,
      telephone: `+1-${company.phone}`,
      email: company.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: addr.streetAddress,
        addressLocality: addr.locality,
        addressRegion: addr.region,
        postalCode: addr.postalCode,
        addressCountry: 'CA',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: `+1-${company.phone}`,
        email: company.email,
        contactType: 'customer service',
        availableLanguage: ['English', 'Chinese'],
      },
      areaServed: areaNames.map((name) => ({
        '@type': 'City',
        name,
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
