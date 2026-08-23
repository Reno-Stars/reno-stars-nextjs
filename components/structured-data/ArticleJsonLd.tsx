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
    // Marks this Article as the primary content of the WebPage so Google
    // resolves it to the correct URL rather than treating it as a standalone
    // piece. BlogPosting (the subtype) carries this automatically; plain
    // Article needs it asserted explicitly. Required for the dual-Article+
    // BlogPosting pattern to pass Google's rich-result validation.
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

  return <JsonLd data={schema} />;
}
