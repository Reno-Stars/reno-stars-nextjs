import { getBaseUrl, SITE_NAME } from '@/lib/utils';

export default function WebSiteSchema(): React.ReactElement {
  const baseUrl = getBaseUrl();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: baseUrl,
    name: SITE_NAME,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/en/projects/?search={search_term_string}`,
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
