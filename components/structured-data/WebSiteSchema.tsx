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
    // Match alternateName on the Organization node so Google reconciles brand
    // variants ("reno star" sing., "RenoStars", "renostars") with this site.
    alternateName: ['Reno Stars', 'Reno Star', 'RenoStars', 'Renostars'],
    inLanguage: locale,
    publisher: { '@id': `${baseUrl}/#organization` },
    // SearchAction target uses `?service=` because that's the actual
    // searchParam the /[locale]/projects/page.tsx handles (it whitelists
    // against known service categories before passing to the client).
    // Pre-fix the target was `?search={search_term_string}` which the
    // route ignores — so the asserted SearchAction was non-functional.
    // Audit caught 2026-05-30T23:00Z while staging daily branch.
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/${locale}/projects/?service={search_term_string}`,
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
