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
}: ArticleSchemaProps): React.ReactElement {
  const resolvedAuthorName = authorName ?? `${company.name} Team`;
  const baseUrl = getBaseUrl();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url: `${baseUrl}${url}`,
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
      '@id': `${baseUrl}${url}`,
    },
    ...(image && {
      image: {
        '@type': 'ImageObject',
        url: image,
        width: 1200,
        height: 630,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
