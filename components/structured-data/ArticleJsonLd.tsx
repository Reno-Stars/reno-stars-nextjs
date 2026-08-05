import type { Company } from '@/lib/types';
import JsonLd from './JsonLd';
import { getBaseUrl } from '@/lib/utils';

interface ArticleJsonLdProps {
  company: Company;
  headline: string;
  description?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  url: string;
  image?: string;
  locale?: string;
}

/**
 * Renders a pure Article JSON-LD schema (not BlogPosting).
 * Use this alongside the BlogPosting schema when a page needs to be
 * recognized as both an Article and a BlogPosting in structured data.
 *
 * Per Schema.org: Article is the parent type; BlogPosting is a more specific
 * subtype. Some SEO tools and AI search engines recognize Article more readily
 * when the headline and description match the page's H1 and meta description.
 */
export default function ArticleJsonLd({
  company,
  headline,
  description,
  datePublished,
  dateModified,
  authorName,
  url,
  image,
  locale,
}: ArticleJsonLdProps): React.ReactElement {
  const resolvedAuthorName = authorName ?? `${company.name} Team`;
  const baseUrl = getBaseUrl();
  const absoluteUrl = `${baseUrl}${url}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url: absoluteUrl,
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    author: {
      '@type': 'Organization',
      name: resolvedAuthorName,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: company.name,
      logo: {
        '@type': 'ImageObject',
        url: company.logo,
      },
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

  return <JsonLd data={schema} />;
}
