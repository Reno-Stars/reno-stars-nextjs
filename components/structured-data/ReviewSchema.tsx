import type { Company, Testimonial } from '@/lib/types';
import type { Locale } from '@/i18n/config';
import { getBaseUrl } from '@/lib/utils';

interface ReviewSchemaProps {
  company: Company;
  testimonials: Testimonial[];
  locale: Locale;
}

export default function ReviewSchema({
  company,
  testimonials,
  locale,
}: ReviewSchemaProps): React.ReactElement {
  const baseUrl = getBaseUrl();

  const reviews = testimonials.map((t) => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: t.name,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: t.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: t.text[locale],
    ...(t.location && {
      locationCreated: {
        '@type': 'Place',
        name: t.location,
      },
    }),
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${baseUrl}/#organization`,
    name: company.name,
    url: baseUrl,
    telephone: `+1-${company.phone}`,
    review: reviews,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: company.rating.split('/')[0],
      bestRating: company.rating.split('/')[1] || '10',
      worstRating: 1,
      ratingCount: company.reviewCount,
      reviewCount: testimonials.length,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
