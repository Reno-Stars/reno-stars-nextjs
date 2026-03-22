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
  duration?: string;
  budgetRange?: string;
  spaceType?: string;
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
  duration,
  budgetRange,
  spaceType,
}: ProjectSchemaProps): React.ReactElement {
  const baseUrl = getBaseUrl();
  const allImages = [image, ...images].filter(Boolean);
  const fullUrl = `${baseUrl}${url}`;

  const provider = {
    '@type': 'HomeAndConstructionBusiness' as const,
    name: company.name,
    url: baseUrl,
    telephone: `+1-${company.phone}`,
    ...(googleRating && googleReviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: googleRating,
        bestRating: 5,
        ratingCount: googleReviewCount,
      },
    }),
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: fullUrl,
    image: allImages,
    mainEntity: {
      '@type': 'Service',
      name,
      description,
      provider,
      ...(serviceType && { serviceType }),
      ...(location && {
        areaServed: {
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
      ...(allImages.length > 0 && {
        image: allImages[0],
      }),
      ...(budgetRange && {
        offers: {
          '@type': 'Offer',
          priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'CAD',
            name: budgetRange,
          },
        },
      }),
    },
    ...(duration && {
      timeRequired: duration,
    }),
    ...(spaceType && {
      about: {
        '@type': 'Thing',
        name: spaceType,
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
