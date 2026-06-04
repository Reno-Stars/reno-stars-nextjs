import { describe, it, expect } from 'vitest';
import {
  listingCardChanged,
  BLOG_CARD_FIELDS,
  BLOG_CARD_LOCALIZED,
  PROJECT_CARD_FIELDS,
  SITE_CARD_FIELDS,
} from '@/lib/admin/listing-cache';

describe('listingCardChanged', () => {
  const baseBlog = {
    slug: 'kitchen-reno-tips',
    isPublished: true,
    publishedAt: new Date('2026-01-01T00:00:00Z'),
    titleEn: 'Kitchen Reno Tips',
    titleZh: '厨房装修贴士',
    excerptEn: 'A short intro.',
    excerptZh: '简短介绍。',
    featuredImageUrl: 'https://img/x.jpg',
    contentEn: 'long body...',
    contentZh: '正文...',
    metaTitleEn: 'SEO title',
    seoKeywordsEn: 'kitchen, reno',
    localizations: { titleJa: 'キッチン', contentJa: '本文...', metaTitleJa: 'メタ' },
  };

  it('returns true when the previous row is unknown (fail-safe)', () => {
    expect(listingCardChanged(undefined, baseBlog, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(true);
    expect(listingCardChanged(null, baseBlog, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(true);
  });

  it('returns false for a pure content-body edit (not card-visible)', () => {
    const next = { ...baseBlog, contentEn: 'COMPLETELY NEW BODY', contentZh: '全新正文' };
    expect(listingCardChanged(baseBlog, next, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(false);
  });

  it('returns false for a meta/SEO-only edit', () => {
    const next = { ...baseBlog, metaTitleEn: 'New SEO Title', seoKeywordsEn: 'a, b, c' };
    expect(listingCardChanged(baseBlog, next, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(false);
  });

  it('returns false when only a non-card translation (contentJa) changes', () => {
    const next = { ...baseBlog, localizations: { titleJa: 'キッチン', contentJa: 'DIFFERENT BODY', metaTitleJa: 'メタ' } };
    expect(listingCardChanged(baseBlog, next, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(false);
  });

  it('returns false when only a non-card localized meta field (metaTitleJa) changes', () => {
    // `metaTitleJa` starts with "meta", not "title"/"excerpt" — must NOT match.
    const next = { ...baseBlog, localizations: { titleJa: 'キッチン', contentJa: '本文...', metaTitleJa: 'NEW META' } };
    expect(listingCardChanged(baseBlog, next, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(false);
  });

  it('returns true when the title changes', () => {
    const next = { ...baseBlog, titleEn: 'Renamed Title' };
    expect(listingCardChanged(baseBlog, next, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(true);
  });

  it('returns true when the excerpt changes', () => {
    const next = { ...baseBlog, excerptZh: '新的介绍' };
    expect(listingCardChanged(baseBlog, next, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(true);
  });

  it('returns true when the featured image changes', () => {
    const next = { ...baseBlog, featuredImageUrl: 'https://img/new.jpg' };
    expect(listingCardChanged(baseBlog, next, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(true);
  });

  it('returns true when the slug changes', () => {
    const next = { ...baseBlog, slug: 'kitchen-reno-tips-2' };
    expect(listingCardChanged(baseBlog, next, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(true);
  });

  it('returns true when publish state changes', () => {
    const next = { ...baseBlog, isPublished: false };
    expect(listingCardChanged(baseBlog, next, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(true);
  });

  it('returns true when a card translation (titleJa) changes', () => {
    const next = { ...baseBlog, localizations: { titleJa: '新キッチン', contentJa: '本文...', metaTitleJa: 'メタ' } };
    expect(listingCardChanged(baseBlog, next, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(true);
  });

  it('returns true when a card translation is newly added (titleKo)', () => {
    const next = { ...baseBlog, localizations: { titleJa: 'キッチン', contentJa: '本文...', metaTitleJa: 'メタ', titleKo: '주방' } };
    expect(listingCardChanged(baseBlog, next, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(true);
  });

  it('treats equal Dates as unchanged (not reference equality)', () => {
    const next = { ...baseBlog, publishedAt: new Date('2026-01-01T00:00:00Z') };
    expect(listingCardChanged(baseBlog, next, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(false);
  });

  it('detects a publishedAt date change', () => {
    const next = { ...baseBlog, publishedAt: new Date('2026-02-02T00:00:00Z') };
    expect(listingCardChanged(baseBlog, next, BLOG_CARD_FIELDS, BLOG_CARD_LOCALIZED)).toBe(true);
  });

  it('treats null / undefined / empty-string as equivalent "no value"', () => {
    expect(listingCardChanged({ excerptEn: null }, { excerptEn: '' }, ['excerptEn'])).toBe(false);
    expect(listingCardChanged({ excerptEn: undefined }, { excerptEn: null }, ['excerptEn'])).toBe(false);
    expect(listingCardChanged({ excerptEn: null }, { excerptEn: 'now has text' }, ['excerptEn'])).toBe(true);
  });

  it('handles missing localizations objects', () => {
    expect(listingCardChanged({ titleEn: 'A' }, { titleEn: 'A' }, ['titleEn'], ['title'])).toBe(false);
  });

  describe('project card fields', () => {
    const baseProject = {
      slug: 'burnaby-kitchen', isPublished: true, featured: false,
      titleEn: 'Burnaby Kitchen', titleZh: '本拿比厨房',
      excerptEn: 'x', excerptZh: 'x', heroImageUrl: 'h.jpg', heroVideoUrl: null,
      locationCity: 'Burnaby', badgeEn: null, badgeZh: null, budgetRange: '$50k',
      durationEn: '6 weeks', durationZh: '6周', spaceTypeEn: 'Kitchen', spaceTypeZh: '厨房',
      descriptionEn: 'desc', metaTitleEn: 'meta', dynamicBlocks: [{ a: 1 }],
    };
    it('skips listing for a description / dynamic-blocks / meta edit', () => {
      const next = { ...baseProject, descriptionEn: 'new desc', metaTitleEn: 'new meta', dynamicBlocks: [{ a: 2 }] };
      expect(listingCardChanged(baseProject, next, PROJECT_CARD_FIELDS)).toBe(false);
    });
    it('busts listing when the hero image or featured flag changes', () => {
      expect(listingCardChanged(baseProject, { ...baseProject, heroImageUrl: 'new.jpg' }, PROJECT_CARD_FIELDS)).toBe(true);
      expect(listingCardChanged(baseProject, { ...baseProject, featured: true }, PROJECT_CARD_FIELDS)).toBe(true);
    });
  });

  describe('site card fields', () => {
    const baseSite = {
      slug: 's', isPublished: true, showAsProject: true, featured: false,
      titleEn: 'T', titleZh: 'T', excerptEn: null, excerptZh: null,
      heroImageUrl: 'h', heroVideoUrl: null, locationCity: 'Van',
      badgeEn: null, badgeZh: null, budgetRange: null,
      durationEn: null, durationZh: null, spaceTypeEn: null, spaceTypeZh: null,
      descriptionEn: 'd', seoKeywordsEn: 'k',
    };
    it('skips listing for description / seo edits', () => {
      const next = { ...baseSite, descriptionEn: 'new', seoKeywordsEn: 'new keys' };
      expect(listingCardChanged(baseSite, next, SITE_CARD_FIELDS)).toBe(false);
    });
    it('busts listing when showAsProject toggles', () => {
      expect(listingCardChanged(baseSite, { ...baseSite, showAsProject: false }, SITE_CARD_FIELDS)).toBe(true);
    });
  });
});
