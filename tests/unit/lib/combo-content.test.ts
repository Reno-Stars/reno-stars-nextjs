import { describe, it, expect } from 'vitest';
import {
  extractServiceCitySlice,
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

  it('reuses the bathroom section for accessible-bathroom', () => {
    const slice = extractServiceCitySlice(AREA_MD, 'accessible-bathroom');
    expect(slice).toContain('## Bathroom Renovation Richmond BC');
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
