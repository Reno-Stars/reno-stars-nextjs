/**
 * Area + service-city pages must not declare a second business.
 *
 * Before 2026-09-24 each /areas/<city>/ and /services/<s>/<city>/ page emitted
 * a LocalBusiness named "Reno Stars - <City>" carrying the Richmond office
 * address and its own aggregateRating — a phantom branch per city at the one
 * real location. There is ONE business; city pages now describe the service
 * offered in that city and point at the layout Organization by @id.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import LocalBusinessSchema from '@/components/structured-data/LocalBusinessSchema';
import AreaServiceSchema from '@/components/structured-data/AreaServiceSchema';
import ServiceSchema from '@/components/structured-data/ServiceSchema';
import { getBaseUrl } from '@/lib/utils';
import type { Company, ServiceArea, SocialLink } from '@/lib/types';

const company = {
  name: 'Reno Stars',
  logo: 'https://example.com/logo.png',
  phone: '778-960-7999',
  email: 'info@reno-stars.com',
  address: '21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2',
  geo: { latitude: 49.16627, longitude: -123.13382 },
  liabilityCoverage: '$5M',
  teamSize: 17,
  tagline: 'Where Renovation Starts',
} as unknown as Company;
const socialLinks: SocialLink[] = [];
const areas: ServiceArea[] = [{ slug: 'burnaby', name: { en: 'Burnaby', zh: '本拿比' } } as unknown as ServiceArea];
const legacyRating = { googleRating: 4.9, googleReviewCount: 69 } as Record<string, unknown>;
const ORG_ID = `${getBaseUrl()}/#organization`;

function extractJsonLd(html: string): Array<Record<string, unknown>> {
  const matches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) ?? [];
  return matches.map((s) => JSON.parse(s.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '').replace(/\\u003c/g, '<')));
}

function allNodes(roots: unknown[]): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];
  const visit = (v: unknown) => {
    if (Array.isArray(v)) return v.forEach(visit);
    if (v && typeof v === 'object') {
      out.push(v as Record<string, unknown>);
      Object.values(v as Record<string, unknown>).forEach(visit);
    }
  };
  roots.forEach(visit);
  return out;
}

const BUSINESS_TYPES = ['LocalBusiness', 'HomeAndConstructionBusiness', 'Organization'];
const isBusiness = (n: Record<string, unknown>) =>
  ([] as unknown[]).concat(n['@type'] ?? []).some((t) => BUSINESS_TYPES.includes(t as string));

const layout = <LocalBusinessSchema company={company} socialLinks={socialLinks} areas={areas} googleRating={4.9} googleReviewCount={69} />;

function assertSingleBusiness(html: string) {
  const nodes = allNodes(extractJsonLd(html));
  const businesses = nodes.filter(isBusiness);
  expect(businesses.map((b) => b['@id'])).toEqual([ORG_ID]);
  // Exactly one PostalAddress on the page — the main business's.
  expect(nodes.filter((n) => n['@type'] === 'PostalAddress')).toHaveLength(1);
  expect(nodes.filter((n) => 'aggregateRating' in n)).toHaveLength(1);
  expect(JSON.stringify(nodes)).not.toMatch(/Reno Stars - /);
}

describe('AreaServiceSchema (areas/[city])', () => {
  const render = () => extractJsonLd(renderToStaticMarkup(
    <AreaServiceSchema company={company} areaName="Burnaby" areaSlug="burnaby" locale="en" services={['Kitchen Renovation', 'Bathroom Renovation']} {...legacyRating} />,
  ));

  it('emits a Service provided by the main business, scoped to the City', () => {
    const [node] = render();
    expect(node['@type']).toBe('Service');
    expect(node.provider).toEqual({ '@id': ORG_ID });
    expect(node.areaServed).toMatchObject({ '@type': 'City', name: 'Burnaby' });
    expect(node.url).toBe(`${getBaseUrl()}/en/areas/burnaby/`);
    expect(node['@id']).toBe(`${getBaseUrl()}/en/areas/burnaby/#service`);
    expect(node).not.toHaveProperty('address');
    expect(node).not.toHaveProperty('aggregateRating');
    const offers = (node.hasOfferCatalog as { itemListElement: Array<{ itemOffered: { name: string } }> }).itemListElement;
    expect(offers.map((o) => o.itemOffered.name)).toEqual(['Kitchen Renovation in Burnaby', 'Bathroom Renovation in Burnaby']);
  });

  it('area page composition declares exactly one business, one address, one rating', () => {
    assertSingleBusiness(renderToStaticMarkup(
      <>
        {layout}
        <AreaServiceSchema company={company} areaName="Burnaby" areaSlug="burnaby" locale="en" services={['Kitchen Renovation']} />
      </>,
    ));
  });
});

describe('service-city page (services/[slug]/[city])', () => {
  it('composition declares exactly one business and the Service references it', () => {
    const html = renderToStaticMarkup(
      <>
        {layout}
        <ServiceSchema company={company} serviceName="Kitchen Renovation in Burnaby" location="Burnaby" areaServed={['Burnaby']} url="/en/services/kitchen/burnaby/" serviceRadiusKm={50} {...legacyRating} />
      </>,
    );
    assertSingleBusiness(html);
    const service = extractJsonLd(html).find((n) => n['@type'] === 'Service')!;
    expect(service.provider).toEqual({ '@id': ORG_ID });
  });

  it('the page mounts only the Service schema — no separate per-city business component', () => {
    const root = path.resolve(__dirname, '../../../..');
    const src = readFileSync(path.join(root, 'app/[locale]/services/[service-slug]/[city]/page.tsx'), 'utf8');
    expect(src).not.toMatch(/<(LocalBusinessAreaSchema|AreaServiceSchema)\b/);
    expect(existsSync(path.join(root, 'components/structured-data/LocalBusinessAreaSchema.tsx'))).toBe(false);
  });
});
