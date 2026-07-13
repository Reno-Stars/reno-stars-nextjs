import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Company, ServiceArea, LocalizedService } from '@/lib/types';

// The area page pulls in Next runtime internals (navigation Link, the image
// optimizer) and several heavy child sections that are irrelevant to what this
// test asserts — the ORDER of two same-page sections. Stub them to trivial DOM
// so the render stays self-contained. next-intl is globally mocked in
// tests/setup.ts to echo the translation KEY, so:
//   - the new AreaServiceCityLinks band heading is the key 'renovationServicesIn'
//   - the "Our Services in {area}" card-grid heading is 'areas.servicesInArea'
// AreaServiceCityLinks itself is kept REAL (only its Link is stubbed) so the
// band's real markup participates in the ordering.
vi.mock('@/navigation', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));
vi.mock('@/components/OptimizedImage', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => React.createElement('img', { alt: props.alt, src: props.src }),
}));
vi.mock('@/components/CTASection', () => ({ default: () => null }));
vi.mock('@/components/VisualBreadcrumb', () => ({ default: () => null }));
vi.mock('@/components/BenefitList', () => ({ default: () => null }));
vi.mock('@/components/home/FaqSection', () => ({ default: () => null }));
vi.mock('@/components/areas/AreaClientReviews', () => ({ default: () => null }));

import AreaPage from '@/components/pages/AreaPage';

function svc(slug: string, title: string): LocalizedService {
  return { slug, title, description: `${title} desc` };
}

const AREA: ServiceArea = {
  id: 'area-burnaby',
  slug: 'burnaby',
  name: { en: 'Burnaby', zh: '本拿比' },
};

const SERVICES: LocalizedService[] = [
  svc('kitchen', 'Kitchen Renovation'),
  svc('bathroom', 'Bathroom Renovation'),
];

const company = { phone: '778-960-7999', email: 'info@reno-stars.com' } as unknown as Company;

function render(): string {
  return renderToStaticMarkup(
    <AreaPage
      locale="en"
      area={AREA}
      allAreas={[AREA]}
      company={company}
      services={SERVICES}
      faqs={[]}
      areaProjects={[]}
    />,
  );
}

describe('AreaPage — hub-link band precedes the services card grid (finding: first-link-counts)', () => {
  it('renders the AreaServiceCityLinks band BEFORE the "Our Services in {area}" card grid', () => {
    const html = render();

    const bandIdx = html.indexOf('renovationServicesIn');
    const cardGridIdx = html.indexOf('areas.servicesInArea');

    // Both sections must exist on the page.
    expect(bandIdx).toBeGreaterThanOrEqual(0);
    expect(cardGridIdx).toBeGreaterThanOrEqual(0);

    // The band's exact-match "{Service} in {City}" anchors point at the SAME
    // /services/{service}/{city} combo URLs the card grid links. Under Google's
    // first-link-counts heuristic only the first link to a URL is credited its
    // anchor text, so the band MUST come first for its exact-match anchor (the
    // whole SEO rationale of the band) to be the one attributed to each spoke.
    expect(bandIdx).toBeLessThan(cardGridIdx);
  });

  it('links each service to its /services/{service}/{city} combo from BOTH sections (equity preserved, not removed)', () => {
    const html = render();
    for (const s of SERVICES) {
      // Two links per combo URL: one from the band, one from the card grid.
      const occurrences = html.split(`href="/services/${s.slug}/burnaby"`).length - 1;
      expect(occurrences).toBe(2);
    }
  });
});
