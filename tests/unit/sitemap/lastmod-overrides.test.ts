import { describe, it, expect, vi } from 'vitest';

/**
 * The service×city sitemap section's default lastmod is a per-CITY project
 * stamp shared by every service and locale in that city. The override table
 * exists to move ONE URL's lastmod without touching its en / zh siblings or any
 * other city. These tests pin exactly that: an override changes the keyed URL
 * only, and every key is well-formed so a typo cannot silently become a no-op.
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
vi.mock('@/lib/db/queries', () => ({
  getProjectSlugsFromDb: async () => [
    { slug: 'p-surrey', updatedAt: CITY_STAMP, heroImageUrl: null, locationCity: 'Surrey' },
    { slug: 'p-langley', updatedAt: CITY_STAMP, heroImageUrl: null, locationCity: 'Langley' },
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

  it('moves only the keyed URL; sibling locales and other cities keep the city stamp', async () => {
    const { buildSitemapFile } = await import('@/lib/sitemap/sections');
    const entries = (await buildSitemapFile('service-areas-0'))!;
    expect(entries).toHaveLength(2 * 2 * 3);

    // Overridden (the live table carries both of these).
    expect(lastmodOf(entries, 'zh-Hant/services/kitchen/surrey')).toBe('2026-09-24T23:23:15.000Z');
    expect(lastmodOf(entries, 'zh-Hant/services/critical-load-panel/langley')).toBe('2026-09-24T23:23:15.000Z');

    // Same page, other locales: untouched. en/critical-load-panel/langley is a
    // test-A CONTROL page and must keep the shared stamp.
    for (const path of [
      'en/services/kitchen/surrey',
      'zh/services/kitchen/surrey',
      'en/services/critical-load-panel/langley',
      'zh/services/critical-load-panel/langley',
      // Same city, a service with no override: untouched in every locale.
      'en/services/critical-load-panel/surrey',
      'zh/services/critical-load-panel/surrey',
      'zh-Hant/services/critical-load-panel/surrey',
      'zh-Hant/services/kitchen/langley',
    ]) {
      expect(lastmodOf(entries, path), path).toBe(CITY_STAMP.toISOString());
    }
  });
});
