import type { Company } from '@/lib/types';
import JsonLd from './JsonLd';
import { getBaseUrl } from '@/lib/utils';
import { parseAddress } from './parse-address';

const BASE_URL = getBaseUrl();

interface ContactPageSchemaProps {
  company: Company;
  areaNames: string[];
  locale?: string;
}

export default function ContactPageSchema({ company, areaNames, locale = 'en' }: ContactPageSchemaProps) {
  const addr = parseAddress(company.address);

  // inLanguage declares the natural language of the ContactPage so Google
  // can match it to localized SERPs (e.g. show the /zh/contact/ schema
  // signal to zh-CN searchers, not the /en/ one). Completes the
  // i18n-aware schema cluster: FAQ ✅ Article ✅ HowTo ✅ Breadcrumb ✅
  // ContactPage (THIS COMMIT). The `availableLanguage` ['English',
  // 'Chinese'] inside contactPoint stays — it describes the LANGUAGES
  // SUPPORTED by customer service; `inLanguage` describes the language
  // of THIS DOCUMENT instance. Distinct Schema.org properties with
  // different semantics.
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${company.name}`,
    url: `${BASE_URL}/${locale}/contact/`,
    inLanguage: locale,
    mainEntity: {
      '@type': 'HomeAndConstructionBusiness',
      name: company.name,
      image: company.logo,
      url: BASE_URL,
      telephone: `+1${company.phone.replace(/\D/g, '')}`,
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
        telephone: `+1${company.phone.replace(/\D/g, '')}`,
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
    <JsonLd data={schema} />
  );
}
