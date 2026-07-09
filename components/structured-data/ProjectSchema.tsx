import type { Company } from '@/lib/types';
import { e164 } from '@/lib/phone';
import JsonLd from './JsonLd';
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
  /** BCP-47 locale code (e.g. 'en', 'zh'). When provided, emits
   *  Schema.org `inLanguage` on the WebPage node so Google can match
   *  the project page to localized SERPs. Extends the i18n-aware
   *  schema cluster shipped earlier on this daily branch (FAQ, Article,
   *  HowTo, Breadcrumb, ContactPage, LocalBusiness). Optional for
   *  backwards compatibility — 2 in-tree callers updated in same commit. */
  locale?: string;
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
  locale,
}: ProjectSchemaProps): React.ReactElement {
  const baseUrl = getBaseUrl();
  const allImages = [image, ...images].filter(Boolean);
  const fullUrl = `${baseUrl}${url}`;

  const provider = {
    '@type': 'HomeAndConstructionBusiness' as const,
    name: company.name,
    url: baseUrl,
    telephone: e164(company.phone),
    ...(googleRating && googleReviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: googleRating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: googleReviewCount,
        reviewCount: googleReviewCount,
      },
    }),
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: fullUrl,
    ...(locale && { inLanguage: locale }),
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
    <JsonLd data={schema} />
  );
}
