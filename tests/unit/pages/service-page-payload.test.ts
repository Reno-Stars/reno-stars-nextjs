import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Service pages must not hand whole DB rows to their client components.
 *
 * `ServiceDetailPage` and `ServiceLocationPage` are client components, so every
 * prop they receive is serialised into the page's RSC flight payload. Passing
 * full rows put the description / content / highlights / meta essays for 14
 * service areas, 11 services and EVERY published project — each in all 14
 * locales — into the HTML, to render link chips and one cost figure:
 *
 *   /en/services/kitchen/          2.68 MB  ->  0.53 MB
 *   /en/services/kitchen/burnaby/  4.46 MB  ->  0.83 MB
 *
 * This failure mode is invisible to every other check: the pages render
 * correctly, the types are satisfied, and the suite is green. Only the byte
 * count shows it, which is why the shape is pinned here in source. A byte
 * ceiling would be a better test, but it needs a built server; this catches the
 * specific regression — someone widening a prop back to the full row type.
 */

const read = (p: string) => readFileSync(p, 'utf8');

describe('service page flight payload', () => {
  it('ServiceDetailPage takes link-shaped props, not full rows', () => {
    const src = read('components/pages/ServiceDetailPage.tsx');
    expect(src).toMatch(/areas\?:\s*ServiceAreaLink\[\]/);
    expect(src).toMatch(/allServices\?:\s*ServiceLink\[\]/);
    expect(src).not.toMatch(/areas\?:\s*ServiceArea\[\]/);
    expect(src).not.toMatch(/allServices\?:\s*Service\[\]/);
  });

  it('ServiceLocationPage takes link-shaped props and no full project pool', () => {
    const src = read('components/pages/ServiceLocationPage.tsx');
    expect(src).toMatch(/areas\?:\s*ServiceAreaLink\[\]/);
    expect(src).toMatch(/services\?:\s*ServiceLink\[\]/);
    // The pool PROP is gone (the word still appears in the comment explaining
    // why), so assert on the declaration and the destructured signature.
    expect(src).not.toMatch(/projectPool\?:/);
    expect(src).not.toMatch(/projectPool\s*=\s*\[\]/);
    expect(src).toMatch(/relatedProjects\?:\s*LocalizedProject\[\]/);
  });

  it('the routes narrow their props before passing them', () => {
    const service = read('app/[locale]/services/[service-slug]/page.tsx');
    // Whole-array passes are what regressed before — `areas={areas}` etc.
    expect(service).not.toMatch(/areas=\{areas\}/);
    expect(service).not.toMatch(/allServices=\{services\}/);
    expect(service).toMatch(/areas=\{areas\.map\(/);

    const city = read('app/[locale]/services/[service-slug]/[city]/page.tsx');
    expect(city).not.toMatch(/areas=\{areas\}/);
    expect(city).not.toMatch(/services=\{services\}/);
    expect(city).not.toMatch(/projectPool=\{projectPool\}/);
    expect(city).toMatch(/relatedProjects=\{combo\.projects\}/);
  });

  it('the narrow types stay narrow', () => {
    const types = read('lib/types.ts');
    const areaLink = /export type ServiceAreaLink = \{([\s\S]*?)\};/.exec(types)?.[1] ?? '';
    const serviceLink = /export type ServiceLink = \{([\s\S]*?)\};/.exec(types)?.[1] ?? '';
    const keys = (block: string) =>
      [...block.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1]).sort();

    // Widening either of these silently re-inflates every service page.
    expect(keys(areaLink)).toEqual(['id', 'name', 'slug']);
    expect(keys(serviceLink)).toEqual(['showOnServicesPage', 'slug', 'title']);
  });
});
