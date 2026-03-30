import { getBaseUrl } from '@/lib/utils';
import { parseAddress } from './parse-address';
import type { Company, SocialLink, ServiceArea } from '@/lib/types';

interface OrganizationSchemaProps {
  company: Company;
  socialLinks?: SocialLink[];
  areas?: ServiceArea[];
}

export default function OrganizationSchema({ company, socialLinks, areas }: OrganizationSchemaProps) {
  const baseUrl = getBaseUrl();
  const addressParts = parseAddress(company.address);

  const sameAs = socialLinks
    ?.map((link) => link.url)
    .filter((url) => url !== '#');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: company.name,
    description:
      `Professional home renovation services in Metro Vancouver. Kitchen, bathroom, whole house renovations. Licensed, insured with ${company.liabilityCoverage} CGL insurance, active WCB coverage, and up to 3 years warranty.`,
    url: baseUrl,
    logo: company.logo,
    image: company.logo,
    telephone: company.phone,
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: addressParts.streetAddress,
      addressLocality: addressParts.locality,
      addressRegion: addressParts.region,
      postalCode: addressParts.postalCode,
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
    ...(areas && areas.length > 0 && {
      areaServed: areas.map((area) => ({
        '@type': 'City',
        name: area.name.en,
      })),
    }),
    ...(sameAs && sameAs.length > 0 && { sameAs }),
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
}
