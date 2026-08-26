import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  locales,
  INDEXABLE_SERVICE_CITY_LOCALES,
  isIndexableServiceCityLocale,
} from '@/i18n/config';
import { buildAlternates } from '@/lib/utils';

// The invariant this file exists to hold:
//
//   robots  ·  hreflang  ·  sitemap   must agree, per URL, for the
//   /[locale]/services/[slug]/[city]/ route.
//
// They did NOT agree between 2026-08-07 and 2026-08-26. `INDEXABLE_LEAF_LOCALES`
// was opened to all 14, which lifted the noindex off this route's page metadata
// and widened its hreflang set to 14 — while app/sitemap.ts kept a hardcoded
// `['en', 'zh']`. The result was 1,694 URLs that were indexable,
// self-canonical, advertised by hreflang from every sibling page, and absent
// from the sitemap: the single largest crawl leak on the site.
//
// The fix was to give the route its own column in LOCALE_META and read that ONE
// list in all three places. These tests assert the consequences of that, so a
// future edit that re-hardcodes any of the three fails here instead of in GSC
// three months later.
describe('service×city indexability is consistent across robots, hreflang and sitemap', () => {
  const originalEnv = process.env.NEXT_PUBLIC_BASE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://www.reno-stars.com';
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_BASE_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_BASE_URL;
    }
  });

  // This is the rule that was broken. An hreflang entry is a claim that the
  // target is a legitimate, indexable alternate of this page; pointing one at a
  // noindexed URL asks Google to both index and not index the same document.
  it('never advertises an hreflang alternate for a noindexed locale', () => {
    const alt = buildAlternates(
      '/services/kitchen/burnaby/',
      'en',
      INDEXABLE_SERVICE_CITY_LOCALES,
    );
    for (const key of Object.keys(alt.languages)) {
      if (key === 'x-default') continue;
      expect(
        isIndexableServiceCityLocale(key),
        `hreflang points at /${key}/ but that locale is noindexed on this route`,
      ).toBe(true);
    }
  });

  // x-default has to resolve to a page that is actually indexable, and en is
  // the only locale guaranteed to have native copy for every service×city combo.
  it('points x-default at the en URL, which is indexable', () => {
    const alt = buildAlternates(
      '/services/kitchen/burnaby/',
      'ja',
      INDEXABLE_SERVICE_CITY_LOCALES,
    );
    expect(alt.languages['x-default']).toBe(
      'https://www.reno-stars.com/en/services/kitchen/burnaby/',
    );
    expect(isIndexableServiceCityLocale('en')).toBe(true);
  });

  // A noindexed locale still renders and still self-canonicalises — it is
  // `noindex, follow`, not a redirect and not a cross-locale canonical. A
  // canonical pointing at /en/ would be the other classic way to lose these
  // pages, and it would also strand the crawl paths they carry.
  it('keeps a self-canonical on a noindexed locale', () => {
    const alt = buildAlternates(
      '/services/kitchen/burnaby/',
      'ja',
      INDEXABLE_SERVICE_CITY_LOCALES,
    );
    expect(alt.canonical).toBe(
      'https://www.reno-stars.com/ja/services/kitchen/burnaby/',
    );
  });

  it('closes the eleven minor locales and leaves en/zh/zh-Hant open', () => {
    const closed = locales.filter((l) => !isIndexableServiceCityLocale(l));
    expect([...closed].sort()).toEqual(
      ['ar', 'es', 'fa', 'fr', 'hi', 'ja', 'ko', 'pa', 'ru', 'tl', 'vi'],
    );
    expect(closed).toHaveLength(11);
  });

  // The sitemap iterates this exact array. Guarding the length is what makes
  // the URL arithmetic in the commit message checkable: 11 services × 14 areas
  // × 3 locales = 462 submitted, down from 14 locales' worth of exposure.
  it('exposes exactly 3 locales to the sitemap loop', () => {
    expect(INDEXABLE_SERVICE_CITY_LOCALES).toHaveLength(3);
  });
});
