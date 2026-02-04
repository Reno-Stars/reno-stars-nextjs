import type { Company, SocialLink, ServiceArea } from '@/lib/types';
import { getBaseUrl } from '@/lib/utils';

const BASE_URL = getBaseUrl();

// Parse address: "21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2"
function parseAddress(address: string): {
  streetAddress: string; locality: string; region: string; postalCode: string;
} {
  const parts = address.split(', ');
  const streetAddress = parts.slice(0, 2).join(', ');
  const locality = parts[2] || parts[0];
  const regionPostal = parts[3] || 'BC V6W 1M2';
  const [region, ...postalParts] = regionPostal.split(' ');
  const postalCode = postalParts.join(' ');
  return { streetAddress, locality, region, postalCode };
}

// Parse rating: "10/10" -> { value: 10, best: 10 }
function parseRating(rating: string): { value: number; best: number } {
  const match = rating.match(/^(\d+)\/(\d+)$/);
  if (match) {
    return { value: Number(match[1]), best: Number(match[2]) };
  }
  return { value: Number(rating) || 0, best: 10 };
}

interface LocalBusinessSchemaProps {
  company: Company;
  socialLinks: SocialLink[];
  areas: ServiceArea[];
}

export default function LocalBusinessSchema({ company, socialLinks, areas }: LocalBusinessSchemaProps): React.ReactElement {
  const addressParts = parseAddress(company.address);
  const ratingParts = parseRating(company.rating);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: company.name,
    image: company.logo,
    url: BASE_URL,
    telephone: `+1-${company.phone}`,
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
    areaServed: areas.map((area) => ({
      '@type': 'City',
      name: area.name.en,
    })),
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    sameAs: socialLinks.map((link) => link.url).filter((url) => url !== '#'),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingParts.value,
      bestRating: ratingParts.best,
      worstRating: 1,
      ratingCount: company.reviewCount,
      reviewCount: company.reviewCount,
    },
    description:
      `Professional home renovation services in Metro Vancouver. Kitchen, bathroom, whole house renovations. Licensed, insured with ${company.liabilityCoverage} liability coverage.`,
    foundingDate: String(company.foundingYear),
    numberOfEmployees: company.teamSize,
    slogan: company.tagline,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
