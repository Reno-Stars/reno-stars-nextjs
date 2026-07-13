import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// The navigation Link pulls in Next runtime internals that don't resolve under
// the plain jsdom transform — stub it to a trivial <a>. next-intl is globally
// mocked in tests/setup.ts to echo the translation KEY, so the heading text is
// the key 'renovationServicesIn' and each link's anchor text is 'serviceInArea'.
vi.mock('@/navigation', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ children, ...props }: any) => React.createElement('a', props, children),
}));

import AreaServiceCityLinks from '@/components/areas/AreaServiceCityLinks';
import type { LocalizedService } from '@/lib/types';

function svc(slug: string, title: string): LocalizedService {
  return { slug, title, description: `${title} desc` };
}

const SERVICES: LocalizedService[] = [
  svc('kitchen', 'Kitchen Renovation'),
  svc('bathroom', 'Bathroom Renovation'),
  svc('basement', 'Basement Renovations'),
  svc('whole-house', 'Whole House Renovation'),
];

function count(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

describe('AreaServiceCityLinks', () => {
  it('renders one combo link per service pointing at /services/{service}/{city}', () => {
    const html = renderToStaticMarkup(
      <AreaServiceCityLinks services={SERVICES} cityName="Burnaby" citySlug="burnaby" />,
    );
    for (const s of SERVICES) {
      expect(html).toContain(`href="/services/${s.slug}/burnaby"`);
    }
    // Exactly one anchor per service — no extra/duplicate/dropped links.
    expect(count(html, 'href="/services/')).toBe(SERVICES.length);
  });

  it('uses the localized serviceInArea anchor key for every link and a city heading', () => {
    const html = renderToStaticMarkup(
      <AreaServiceCityLinks services={SERVICES} cityName="Burnaby" citySlug="burnaby" />,
    );
    // Global next-intl mock echoes the KEY, so anchor text is the key string.
    expect(count(html, 'serviceInArea')).toBe(SERVICES.length);
    expect(html).toContain('renovationServicesIn');
    expect(html).toContain('renovationServicesInSubtitle');
  });

  it('links exactly the services it is given — no hardcoded service list', () => {
    const html = renderToStaticMarkup(
      <AreaServiceCityLinks services={[svc('cabinet', 'Cabinet Refacing')]} cityName="Delta" citySlug="delta" />,
    );
    expect(count(html, 'href="/services/')).toBe(1);
    expect(html).toContain('href="/services/cabinet/delta"');
  });

  it('renders nothing when there are no services', () => {
    const html = renderToStaticMarkup(
      <AreaServiceCityLinks services={[]} cityName="Burnaby" citySlug="burnaby" />,
    );
    expect(html).toBe('');
  });
});
