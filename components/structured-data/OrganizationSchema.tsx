import { getBaseUrl } from '@/lib/utils';
import type { Company } from '@/lib/types';

interface OrganizationSchemaProps {
  company: Company;
}

export function OrganizationSchema({ company }: OrganizationSchemaProps) {
  const baseUrl = getBaseUrl();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: company.name,
    description: company.tagline,
    url: baseUrl,
    logo: company.logo,
    image: company.logo,
    telephone: company.phone,
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '21300 Gordon Way, Unit 188',
      addressLocality: 'Richmond',
      addressRegion: 'BC',
      postalCode: 'V6W 1M2',
      addressCountry: 'CA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: company.geo.latitude,
      longitude: company.geo.longitude,
    },
    foundingDate: `${company.foundingYear}`,
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: company.teamSize,
    },
    areaServed: [
      { '@type': 'City', name: 'Vancouver' },
      { '@type': 'City', name: 'Richmond' },
      { '@type': 'City', name: 'Burnaby' },
      { '@type': 'City', name: 'Surrey' },
      { '@type': 'City', name: 'Coquitlam' },
      { '@type': 'City', name: 'North Vancouver' },
      { '@type': 'City', name: 'West Vancouver' },
      { '@type': 'City', name: 'Delta' },
      { '@type': 'City', name: 'Langley' },
      { '@type': 'City', name: 'New Westminster' },
    ],
    sameAs: [],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Renovation Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Kitchen Renovation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bathroom Renovation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Whole House Renovation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Commercial Renovation' } },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
