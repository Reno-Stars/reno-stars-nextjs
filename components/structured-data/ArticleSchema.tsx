import type { Company } from '@/lib/types';
import { getBaseUrl } from '@/lib/utils';

interface ArticleSchemaProps {
  company: Company;
  headline: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  url: string;
  image?: string;
  /** BCP-47 locale. When provided, emits `inLanguage` for locale targeting. */
  locale?: string;
}

export default function ArticleSchema({
  company,
  headline,
  description,
  datePublished,
  dateModified,
  authorName,
  url,
  image,
  locale,
}: ArticleSchemaProps): React.ReactElement {
  const resolvedAuthorName = authorName ?? `${company.name} Team`;
  const baseUrl = getBaseUrl();

  const absoluteUrl = `${baseUrl}${url}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${absoluteUrl}#article`,
    headline,
    description,
    url: absoluteUrl,
    ...(datePublished && { datePublished }),
    ...(dateModified ? { dateModified } : datePublished ? { dateModified: datePublished } : {}),
    author: {
      '@type': authorName ? 'Person' : 'Organization',
      name: resolvedAuthorName,
    },
    publisher: {
      '@type': 'Organization',
      name: company.name,
      logo: {
        '@type': 'ImageObject',
        url: company.logo,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl,
    },
    ...(image && {
      image: {
        '@type': 'ImageObject',
        url: image,
        width: 1200,
        height: 630,
      },
    }),
    ...(locale && { inLanguage: locale }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
