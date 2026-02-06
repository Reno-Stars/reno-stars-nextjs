import type { Company, GooglePlaceRating } from '@/lib/types';
import { getBaseUrl } from '@/lib/utils';

interface ReviewSchemaProps {
  company: Company;
  googleReviews: GooglePlaceRating;
}

export default function ReviewSchema({
  company,
  googleReviews,
}: ReviewSchemaProps): React.ReactElement | null {
  if (googleReviews.reviews.length === 0) return null;

  const baseUrl = getBaseUrl();

  const reviews = googleReviews.reviews.map((r) => ({
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: r.authorName,
      ...(r.authorUri && { url: r.authorUri }),
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: r.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: r.text,
    ...(r.publishTime && { datePublished: r.publishTime }),
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
      ratingValue: googleReviews.rating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: googleReviews.userRatingCount,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
