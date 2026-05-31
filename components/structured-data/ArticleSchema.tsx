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
  /**
   * Optional list of focus + supporting keywords for the article. Emitted as
   * Schema.org `keywords` (BlogPosting/Article). Already populated to
   * `<meta name="keywords">` for the blog/[slug] route via Next.js Metadata,
   * but JSON-LD `keywords` is a stronger signal for AI search engines'
   * topical-clustering (Perplexity, Claude Search, Google AI Overview).
   * Pass the pre-split + pre-trimmed string array — the schema emits an
   * array, not the comma-joined string.
   */
  keywords?: string[];
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
  keywords,
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
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl,
    },
    // Speakable spec: marks the article's headline + lead paragraph as
    // voice-readable. Targets the BlogPostPage hero h1 + excerpt p that
    // render under <article> at the top of every blog post route. Voice
    // assistants (Google Assistant, Alexa via Bing partnership) use this
    // to pick which content to read aloud when a user asks for a query
    // matching the blog topic. Eligibility for the Speakable rich-result
    // doesn't cost anything to assert, and matches the existing rendered
    // HTML structure of components/pages/BlogPostPage.tsx.
    speakable: {
      '@type': 'SpeakableSpecification',
      xpath: [
        '/html/head/title',
        "//*[@id='article-headline']",
        "//*[@id='article-lead']",
      ],
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
    ...(keywords && keywords.length > 0 && { keywords }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
