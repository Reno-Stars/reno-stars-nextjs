import { getBaseUrl, SITE_NAME } from '@/lib/utils';

interface WebSiteSchemaProps {
  locale?: string;
}

export default function WebSiteSchema({ locale = 'en' }: WebSiteSchemaProps): React.ReactElement {
  const baseUrl = getBaseUrl();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: baseUrl,
    name: SITE_NAME,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/${locale}/projects/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
