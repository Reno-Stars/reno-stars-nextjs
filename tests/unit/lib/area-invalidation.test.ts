import { describe, it, expect } from 'vitest';
import { areaTag, faqTag, faqAffectedTags, faqTagsForAreas } from '@/lib/admin/area-invalidation';
import { listingCardChanged, SERVICE_AREA_LIST_FIELDS } from '@/lib/admin/listing-cache';

describe('areaTag', () => {
  it('builds the narrow per-city tag', () => {
    expect(areaTag('burnaby')).toBe('area:burnaby');
  });
});

describe('faqTag', () => {
  it('uses the broad `faqs` tag for a global FAQ (no area)', () => {
    expect(faqTag(null)).toBe('faqs');
    expect(faqTag(undefined)).toBe('faqs');
  });
  it('uses a per-area tag for an area-scoped FAQ', () => {
    expect(faqTag('area-uuid-1')).toBe('faqs:area:area-uuid-1');
  });
});

describe('faqAffectedTags', () => {
  it('returns a single tag when the area is unchanged', () => {
    expect(faqAffectedTags('a1', 'a1')).toEqual(['faqs:area:a1']);
  });
  it('returns a single `faqs` tag for a global FAQ edited in place', () => {
    expect(faqAffectedTags(null, null)).toEqual(['faqs']);
  });
  it('busts BOTH endpoints when a FAQ moves between areas', () => {
    const tags = faqAffectedTags('a1', 'a2');
    expect(tags).toEqual(['faqs:area:a1', 'faqs:area:a2']);
  });
  it('busts both the area and the global surface when a FAQ moves area -> global', () => {
    expect(faqAffectedTags('a1', null)).toEqual(['faqs:area:a1', 'faqs']);
  });
  it('busts both surfaces when a FAQ moves global -> area', () => {
    expect(faqAffectedTags(null, 'a2')).toEqual(['faqs', 'faqs:area:a2']);
  });
});

describe('faqTagsForAreas', () => {
  it('dedupes a batch spanning several areas + the global set', () => {
    const tags = faqTagsForAreas(['a1', 'a1', 'a2', null, null]);
    expect(tags).toEqual(['faqs:area:a1', 'faqs:area:a2', 'faqs']);
  });
  it('returns an empty array for no FAQs', () => {
    expect(faqTagsForAreas([])).toEqual([]);
  });
});

describe('service-area listing gate (SERVICE_AREA_LIST_FIELDS)', () => {
  const base = {
    slug: 'burnaby',
    nameEn: 'Burnaby',
    nameZh: '本拿比',
    isActive: true,
    displayOrder: 3,
    descriptionEn: 'A description.',
    contentEn: 'Body content.',
    metaTitleEn: 'SEO title',
    metaDescriptionEn: 'SEO description',
  };

  it('does NOT bust broadly for a description / content / meta-only edit', () => {
    const next = {
      ...base,
      descriptionEn: 'New description.',
      contentEn: 'New body.',
      metaTitleEn: 'New SEO title',
      metaDescriptionEn: 'New SEO description',
    };
    expect(listingCardChanged(base, next, SERVICE_AREA_LIST_FIELDS)).toBe(false);
  });

  it('busts broadly when the display name changes (nav link text)', () => {
    expect(listingCardChanged(base, { ...base, nameEn: 'Burnaby BC' }, SERVICE_AREA_LIST_FIELDS)).toBe(true);
    expect(listingCardChanged(base, { ...base, nameZh: '本拿比市' }, SERVICE_AREA_LIST_FIELDS)).toBe(true);
  });

  it('busts broadly when active state or order changes', () => {
    expect(listingCardChanged(base, { ...base, isActive: false }, SERVICE_AREA_LIST_FIELDS)).toBe(true);
    expect(listingCardChanged(base, { ...base, displayOrder: 1 }, SERVICE_AREA_LIST_FIELDS)).toBe(true);
  });
});
