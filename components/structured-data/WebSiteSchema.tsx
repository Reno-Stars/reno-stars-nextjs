import { getBaseUrl, SITE_NAME } from '@/lib/utils';

interface WebSiteSchemaProps {
  locale?: string;
}

export default function WebSiteSchema({ locale = 'en' }: WebSiteSchemaProps): React.ReactElement {
  const baseUrl = getBaseUrl();

  // The @id anchors this WebSite node to the canonical Organization
  // (#organization) for entity-graph resolution. Without @id, Google can't
  // link WebSite ↔ Organization in its knowledge graph.
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: SITE_NAME,
    inLanguage: locale,
    publisher: { '@id': `${baseUrl}/#organization` },
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
