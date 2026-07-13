import { describe, it, expect } from 'vitest';
import {
  extractServiceCitySlice,
  isCombinedHeading,
  pickServiceAreaFaqs,
  firstParagraph,
  summarizeProjectCosts,
  pickComboProjects,
} from '@/lib/seo/combo-content';
import type { LocalizedProject, ServiceType } from '@/lib/types';

// Markdown shaped like a real area content_en: multiple ##-sectioned services
// plus generic city sections and an FAQ block.
const AREA_MD = `Intro paragraph about the city that belongs to no service.

## Kitchen Renovation in Richmond
Kitchen line one about cabinets and quartz.
Kitchen line two about layout.

## Bathroom Renovation Richmond BC
Bathroom copy about tile and waterproofing.

### Richmond Bathroom Project Pricing (Real Projects)
- Guest bath: $12K
- Ensuite: $28K

## Basement Renovation in Richmond
Basement copy about suites and egress.

## Richmond Neighbourhoods We Serve
Steveston, Brighouse, Terra Nova.

## Frequently Asked Questions — Richmond Renovations
Q: Do you handle permits? A: Yes.`;

describe('extractServiceCitySlice', () => {
  it('pulls only the kitchen section for a kitchen combo', () => {
    const slice = extractServiceCitySlice(AREA_MD, 'kitchen');
    expect(slice).toContain('## Kitchen Renovation in Richmond');
    expect(slice).toContain('cabinets and quartz');
    // must NOT bleed into the next (bathroom) section
    expect(slice).not.toContain('Bathroom Renovation Richmond BC');
    expect(slice).not.toContain('Neighbourhoods');
  });

  it('captures nested ### subsections within the matched ## section', () => {
    const slice = extractServiceCitySlice(AREA_MD, 'bathroom');
    expect(slice).toContain('## Bathroom Renovation Richmond BC');
    expect(slice).toContain('### Richmond Bathroom Project Pricing');
    expect(slice).toContain('Ensuite: $28K');
    // ends before the following ## basement section
    expect(slice).not.toContain('Basement Renovation in Richmond');
  });

  it('differs by service within the same city (no cross-service dup)', () => {
    const kitchen = extractServiceCitySlice(AREA_MD, 'kitchen')!;
    const bathroom = extractServiceCitySlice(AREA_MD, 'bathroom')!;
    expect(kitchen).not.toEqual(bathroom);
  });

  it('returns null when the city has no section for the service', () => {
    // No "cabinet" section in this fixture → framing fallback.
    expect(extractServiceCitySlice(AREA_MD, 'cabinet')).toBeNull();
  });

  it('returns null for a service with no matcher (specialty/mechanical)', () => {
    expect(extractServiceCitySlice(AREA_MD, 'poly-b-replacement')).toBeNull();
    expect(extractServiceCitySlice(AREA_MD, 'heat-pump-hvac')).toBeNull();
  });

  it('never selects an FAQ or neighbourhood heading', () => {
    // realtor has a matcher but no matching section here → null, not the FAQ.
    expect(extractServiceCitySlice(AREA_MD, 'realtor')).toBeNull();
  });

  it('handles empty / missing content', () => {
    expect(extractServiceCitySlice('', 'kitchen')).toBeNull();
    expect(extractServiceCitySlice(undefined, 'kitchen')).toBeNull();
    expect(extractServiceCitySlice(null, 'kitchen')).toBeNull();
  });

  it('does NOT clone the bathroom section for accessible-bathroom', () => {
    // accessible-bathroom/{city} and bathroom/{city} are separately-indexed URLs
    // targeting different keywords; reusing the same city bathroom slice made
    // them ~90% duplicate. accessible-bathroom now has no slice matcher → null
    // (it differentiates off its own aging-in-place intro + scoped FAQs).
    expect(extractServiceCitySlice(AREA_MD, 'accessible-bathroom')).toBeNull();
  });

  it('skips a COMBINED "Kitchen & Bathroom" heading (Vancouver flagship bug)', () => {
    // Vancouver's real content merges both services under one heading. Without a
    // guard, kitchen/vancouver and bathroom/vancouver got the IDENTICAL slice.
    const vanMd = `## Vancouver Building Permit Costs (2026)
Permit fee schedule and timelines for Vancouver.

## Kitchen Renovation & Bathroom Renovation in Vancouver
Vancouver kitchen and bathroom renovations account for the majority of our volume.
- Kitchen: cabinets, countertops, tile
- Bathroom: powder rooms, spa ensuites`;
    // The combined heading is skipped for BOTH services → neither clones it.
    expect(extractServiceCitySlice(vanMd, 'kitchen')).toBeNull();
    expect(extractServiceCitySlice(vanMd, 'bathroom')).toBeNull();
  });

  it('still selects a service-specific heading that only names one service', () => {
    const md = `## Kitchen Renovation & Bathroom Renovation in Metrotown
Combined blurb we do not want.

## Kitchen Renovation in Burnaby
Real single-service Burnaby kitchen copy about cabinets and quartz layout.`;
    const slice = extractServiceCitySlice(md, 'kitchen');
    expect(slice).toContain('## Kitchen Renovation in Burnaby');
    expect(slice).not.toContain('Metrotown');
  });
});

describe('isCombinedHeading', () => {
  it('flags headings that name two or more distinct services', () => {
    expect(isCombinedHeading('Kitchen Renovation & Bathroom Renovation in Vancouver')).toBe(true);
    expect(isCombinedHeading('Kitchen and Basement Packages')).toBe(true);
  });
  it('does not flag a single-service heading', () => {
    expect(isCombinedHeading('Kitchen Renovation in Richmond')).toBe(false);
    expect(isCombinedHeading('Bathroom Renovation Richmond BC')).toBe(false);
    expect(isCombinedHeading('Basement Suite Conversion in Surrey')).toBe(false);
    expect(isCombinedHeading('Commercial Renovation in Maple Ridge')).toBe(false);
  });
});

describe('pickServiceAreaFaqs', () => {
  const mk = (q: string, a = '') => ({ question: { en: q }, answer: { en: a } });
  // Shaped like a real city's area FAQ set (Richmond-style vocabulary).
  const richmond = [
    mk('Do you offer bilingual service for Richmond projects?', 'Yes, English and Mandarin.'),
    mk('How long does a typical kitchen renovation take in Richmond?', 'About 4-6 weeks.'),
    mk('How much does a bathroom renovation cost in Richmond?', '$12,000 to $45,000.'),
    mk('How much does a basement renovation cost in Richmond?', '$35,000+.'),
    mk('How do I choose the right renovation contractor in Richmond?', 'Check licensing.'),
  ];

  it('keeps service-specific + generic FAQs, drops other-service ones', () => {
    const kitchen = pickServiceAreaFaqs(richmond, 'kitchen');
    const qs = kitchen.map((f) => f.question.en);
    expect(qs).toContain('How long does a typical kitchen renovation take in Richmond?');
    // generic city FAQs survive (city context, differ cross-city)
    expect(qs).toContain('Do you offer bilingual service for Richmond projects?');
    expect(qs).toContain('How do I choose the right renovation contractor in Richmond?');
    // other-service FAQs are dropped
    expect(qs).not.toContain('How much does a bathroom renovation cost in Richmond?');
    expect(qs).not.toContain('How much does a basement renovation cost in Richmond?');
  });

  it('gives disjoint service-specific FAQs to same-city sibling combos', () => {
    const kitchenQ = pickServiceAreaFaqs(richmond, 'kitchen').map((f) => f.question.en);
    const bathroomQ = pickServiceAreaFaqs(richmond, 'bathroom').map((f) => f.question.en);
    expect(kitchenQ).toContain('How long does a typical kitchen renovation take in Richmond?');
    expect(bathroomQ).toContain('How much does a bathroom renovation cost in Richmond?');
    expect(kitchenQ).not.toContain('How much does a bathroom renovation cost in Richmond?');
    expect(bathroomQ).not.toContain('How long does a typical kitchen renovation take in Richmond?');
  });

  it('does not treat plain bathroom FAQs as accessible-bathroom content', () => {
    // accessible-bathroom matches accessibility vocabulary only → a plain
    // "bathroom cost" FAQ is an other-service FAQ here and is dropped, so the
    // page does not clone the bathroom combo's FAQ block.
    const qs = pickServiceAreaFaqs(richmond, 'accessible-bathroom').map((f) => f.question.en);
    expect(qs).not.toContain('How much does a bathroom renovation cost in Richmond?');
    expect(qs).toContain('Do you offer bilingual service for Richmond projects?');
  });

  it('keeps the FULL set for specialty services with no matcher', () => {
    // poly-b / critical-load-panel / heat-pump-hvac have no local data anywhere;
    // scoping would strip them to boilerplate, so they keep full city context.
    expect(pickServiceAreaFaqs(richmond, 'heat-pump-hvac')).toHaveLength(richmond.length);
    expect(pickServiceAreaFaqs(richmond, 'poly-b-replacement')).toHaveLength(richmond.length);
  });

  it('preserves original FAQ order', () => {
    const kitchen = pickServiceAreaFaqs(richmond, 'kitchen').map((f) => f.question.en);
    const bilingualIdx = kitchen.indexOf('Do you offer bilingual service for Richmond projects?');
    const kitchenIdx = kitchen.indexOf('How long does a typical kitchen renovation take in Richmond?');
    expect(bilingualIdx).toBeLessThan(kitchenIdx);
  });
});

describe('firstParagraph', () => {
  const LD = `## Kitchen Renovation\n\nWe design and build kitchens end to end. This is the first real paragraph.\n\nSecond paragraph should be ignored.`;

  it('returns the first prose paragraph, skipping headings', () => {
    const p = firstParagraph(LD);
    expect(p).toContain('We design and build kitchens');
    expect(p).not.toContain('Second paragraph');
    expect(p).not.toContain('##');
  });

  it('caps very long paragraphs with an ellipsis', () => {
    const long = `${'word '.repeat(200)}`;
    const p = firstParagraph(long, 100);
    expect(p.length).toBeLessThanOrEqual(101);
    expect(p.endsWith('…')).toBe(true);
  });

  it('handles empty input', () => {
    expect(firstParagraph('')).toBe('');
    expect(firstParagraph(undefined)).toBe('');
  });
});

describe('summarizeProjectCosts', () => {
  const mk = (budget?: string): LocalizedProject =>
    ({ budget_range: budget } as unknown as LocalizedProject);

  it('returns null below the minimum count', () => {
    expect(summarizeProjectCosts([mk('$10,000 – $20,000')], 2)).toBeNull();
    expect(summarizeProjectCosts([], 2)).toBeNull();
  });

  it('aggregates min / max / average across parseable ranges', () => {
    const s = summarizeProjectCosts([
      mk('$20,000 – $60,000'),
      mk('$15,000 – $45,000'),
      mk('no numbers here'),
    ], 2);
    expect(s).not.toBeNull();
    expect(s!.count).toBe(2); // the unparseable one is dropped
    expect(s!.allMin).toBe(15000);
    expect(s!.allMax).toBe(60000);
    // mids: 40000 and 30000 → avg 35000
    expect(s!.avg).toBe(35000);
  });

  it('treats a single-number range as lo === hi', () => {
    const s = summarizeProjectCosts([mk('$25,000'), mk('$35,000')], 2);
    expect(s!.allMin).toBe(25000);
    expect(s!.allMax).toBe(35000);
  });
});

describe('pickComboProjects', () => {
  const mk = (
    slug: string,
    city: string,
    service: ServiceType | undefined,
    featured = false,
  ): LocalizedProject =>
    ({ slug, location_city: city, service_type: service, featured } as unknown as LocalizedProject);

  const pool: LocalizedProject[] = [
    mk('rich-bath-1', 'Richmond', 'bathroom'),
    mk('rich-bath-2', 'Richmond', 'bathroom', true),
    mk('rich-kit-1', 'Richmond', 'kitchen'),
    mk('burn-kit-1', 'Burnaby', 'kitchen'),
    mk('van-whole-1', 'Vancouver', 'whole-house', true),
  ];

  it('returns exact city×service matches, featured first', () => {
    const r = pickComboProjects(pool, 'Richmond', 'bathroom' as ServiceType);
    expect(r.relation).toBe('exact');
    expect(r.projects.map((p) => p.slug)).toEqual(['rich-bath-2', 'rich-bath-1']);
  });

  it('falls back to same-service other-city when no local project', () => {
    // Surrey has no kitchen project → show kitchen projects from other cities.
    const r = pickComboProjects(pool, 'Surrey', 'kitchen' as ServiceType);
    expect(r.relation).toBe('same-service');
    expect(r.projects.every((p) => p.service_type === 'kitchen')).toBe(true);
  });

  it('falls back to same-city other-service when the service has no projects anywhere', () => {
    // No "cabinet" project exists → show Richmond's other work, labelled same-city.
    const r = pickComboProjects(pool, 'Richmond', 'cabinet' as ServiceType);
    expect(r.relation).toBe('same-city');
    expect(r.projects.every((p) => p.location_city === 'Richmond')).toBe(true);
  });

  it('matches city names case-insensitively', () => {
    const r = pickComboProjects(pool, 'richmond', 'bathroom' as ServiceType);
    expect(r.relation).toBe('exact');
  });

  it('falls back to featured work when neither city nor service matches', () => {
    const r = pickComboProjects(pool, 'Whistler', 'poly-b-replacement' as ServiceType);
    expect(r.relation).toBe('featured');
    expect(r.projects.length).toBeGreaterThan(0);
  });

  it('reports "none" for an empty pool', () => {
    const r = pickComboProjects([], 'Richmond', 'kitchen' as ServiceType);
    expect(r.relation).toBe('none');
    expect(r.projects).toEqual([]);
  });

  it('never returns more than the limit', () => {
    const r = pickComboProjects(pool, 'Richmond', 'bathroom' as ServiceType, 1);
    expect(r.projects.length).toBe(1);
  });
});
