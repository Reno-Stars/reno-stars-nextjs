import { describe, it, expect, vi } from 'vitest';

/**
 * The service×city section's default lastmod is the page's own inputs (service
 * row, area row, projects of that service in that city — DI-12 #2). The override
 * table moves ONE URL's lastmod without touching its en / zh siblings or any
 * other city, and the test-A table freezes 14 URLs. These tests pin exactly
 * that, and that every key is well-formed so a typo cannot become a no-op.
 */

const LOCALES = ['en', 'zh', 'zh-Hant', 'ja'] as const;

vi.mock('@/i18n/config', () => ({
  locales: LOCALES,
  INDEXABLE_LEAF_LOCALES: ['en', 'zh'],
  INDEXABLE_SERVICE_CITY_LOCALES: ['en', 'zh', 'zh-Hant'],
}));
vi.mock('@/lib/awards', () => ({ HAS_AWARDS: false }));
vi.mock('@/lib/utils', () => ({
  getBaseUrl: () => 'https://www.reno-stars.com',
  LOCALE_TO_DB_SUFFIX: { ja: 'Ja' },
}));
vi.mock('@/lib/blog-dates', () => ({
  resolveBlogDates: () => ({ datePublished: '2026-01-01T00:00:00.000Z', dateModified: null }),
}));

const CITY_STAMP = new Date('2026-06-02T07:37:24.452Z');
const SERVICE_ROW = new Date('2026-03-01T00:00:00.000Z');
vi.mock('@/lib/db/queries', () => ({
  getProjectSlugsFromDb: async () => [
    { slug: 'p-surrey', updatedAt: CITY_STAMP, heroImageUrl: null, locationCity: 'Surrey', serviceType: 'kitchen' },
    { slug: 'p-langley', updatedAt: CITY_STAMP, heroImageUrl: null, locationCity: 'Langley', serviceType: 'kitchen' },
  ],
  getSiteSlugsFromDb: async () => [],
  getBlogPostSlugsFromDb: async () => [],
  getServiceAreasFromDb: async () => [
    { slug: 'surrey', name: { en: 'Surrey' } },
    { slug: 'langley', name: { en: 'Langley' } },
  ],
  getCategorySlugs: async () => [],
  getServicesFromDb: async () => [
    { slug: 'kitchen', showOnServicesPage: true },
    { slug: 'critical-load-panel', showOnServicesPage: true },
  ],
  getVideoWatchEntriesFromDb: async () => [],
  getServiceDatesForSitemap: async () => [
    { slug: 'kitchen', updatedAt: SERVICE_ROW },
    { slug: 'critical-load-panel', updatedAt: SERVICE_ROW },
  ],
  getServiceAreaDatesForSitemap: async () => [],
}));

const lastmodOf = (entries: { url: string; lastModified?: string | Date }[], path: string) => {
  const e = entries.find((x) => x.url === `https://www.reno-stars.com/${path}/`);
  expect(e, `${path} missing from the section`).toBeDefined();
  return String(e!.lastModified);
};

describe('service×city lastmod overrides', () => {
  it('every key is <locale>/services/<service>/<city> for an indexable locale, with an ISO value', async () => {
    const { SERVICE_CITY_LASTMOD_OVERRIDES } = await import('@/lib/sitemap/lastmod-overrides');
    const keys = Object.keys(SERVICE_CITY_LASTMOD_OVERRIDES);
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      const m = /^(en|zh|zh-Hant)\/services\/[a-z0-9-]+\/[a-z0-9-]+$/.exec(key);
      expect(m, `malformed override key: ${key}`).not.toBeNull();
      const value = SERVICE_CITY_LASTMOD_OVERRIDES[key];
      expect(new Date(value).toISOString(), `value for ${key} is not ISO`).toBe(value);
    }
  });

  it('moves only the keyed URL; siblings keep their own-input date; test A stays frozen', async () => {
    const { buildSitemapFile } = await import('@/lib/sitemap/sections');
    const entries = (await buildSitemapFile('service-areas-0'))!;
    expect(entries).toHaveLength(2 * 2 * 3);

    // Overridden (the live table carries both of these).
    expect(lastmodOf(entries, 'zh-Hant/services/kitchen/surrey')).toBe('2026-09-24T23:23:15.000Z');
    expect(lastmodOf(entries, 'zh-Hant/services/critical-load-panel/langley')).toBe('2026-09-24T23:23:15.000Z');

    // en/critical-load-panel/langley is a test-A CONTROL page: frozen value.
    expect(lastmodOf(entries, 'en/services/critical-load-panel/langley')).toBe('2026-06-02T07:37:24.452Z');

    // Same page, other locales / same city other service: the page's OWN inputs.
    // kitchen has a project in Surrey and Langley (CITY_STAMP, later than the
    // service row); critical-load-panel has none, so only its service row counts.
    for (const path of ['en/services/kitchen/surrey', 'zh/services/kitchen/surrey', 'zh-Hant/services/kitchen/langley']) {
      expect(lastmodOf(entries, path), path).toBe(CITY_STAMP.toISOString());
    }
    for (const path of [
      'zh/services/critical-load-panel/langley',
      'en/services/critical-load-panel/surrey',
      'zh/services/critical-load-panel/surrey',
      'zh-Hant/services/critical-load-panel/surrey',
    ]) {
      expect(lastmodOf(entries, path), path).toBe(SERVICE_ROW.toISOString());
    }
  });
});
