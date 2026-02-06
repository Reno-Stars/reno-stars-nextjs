import type { Company } from '@/lib/types';
import { getBaseUrl } from '@/lib/utils';

interface ProjectSchemaProps {
  company: Company;
  name: string;
  description: string;
  image: string;
  images?: string[];
  location?: string;
  serviceType?: string;
  url: string;
  googleRating?: number;
  googleReviewCount?: number;
}

export default function ProjectSchema({
  company,
  name,
  description,
  image,
  images = [],
  location,
  serviceType,
  url,
  googleRating,
  googleReviewCount,
}: ProjectSchemaProps): React.ReactElement {
  const baseUrl = getBaseUrl();
  const allImages = [image, ...images].filter(Boolean);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name,
    description,
    image: allImages,
    url: `${baseUrl}${url}`,
    creator: {
      '@type': 'HomeAndConstructionBusiness',
      name: company.name,
      url: baseUrl,
      telephone: `+1-${company.phone}`,
    },
    ...(location && {
      contentLocation: {
        '@type': 'Place',
        name: location,
        address: {
          '@type': 'PostalAddress',
          addressLocality: location,
          addressRegion: 'BC',
          addressCountry: 'CA',
        },
      },
    }),
    ...(serviceType && {
      about: {
        '@type': 'Service',
        name: serviceType,
      },
    }),
    provider: {
      '@type': 'HomeAndConstructionBusiness',
      name: company.name,
      ...(googleRating && googleReviewCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: googleRating,
          bestRating: 5,
          ratingCount: googleReviewCount,
        },
      }),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
