import { describe, it, expect, vi } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * DI-18 (2026-11-24): the live sitemap listed 82 blog URLs that answer with a
 * 308 into /guides/ — the 7 cost-guide blog slugs consolidated by next.config.ts
 * 9b1. A sitemap must not list redirecting URLs. These tests pin:
 *   1. none of the redirected slugs appears in ANY sub-sitemap file;
 *   2. the slug list the sitemap skips is the same list next.config.ts redirects
 *      (one source: lib/seo/blog-guide-redirects.ts), and the generated rules are
 *      byte-identical to the hand-written ones they replaced;
 *   3. every other URL — other blog posts and every other section, including the
 *      frozen TEST A service×city lastmods — is unchanged.
 */

const LOCALES = ['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pa', 'tl', 'fa', 'ar', 'ru', 'fr', 'hi', 'vi'] as const;

const REDIRECTED = [
  'average-bathroom-renovation-cost-vancouver',
  'basement-renovation-cost-vancouver-2026',
  'basement-suite-renovation-cost-vancouver',
  'basement-suite-renovation-cost-vancouver-zh',
  'bathroom-renovation-cost-vancouver-by-size',
  'bathroom-renovation-cost-vancouver-by-style',
  'renovation-cost-vancouver-2026-complete-guide',
];

// Native bodies in every non-en/zh locale, so each redirected post would emit
// 14 URLs — the shape most of the 82 live ones had.
const ALL_NATIVE = ['contentZhHant', 'contentJa', 'contentKo', 'contentEs', 'contentPa', 'contentTl', 'contentFa', 'contentAr', 'contentRu', 'contentFr', 'contentHi', 'contentVi'];

const blogRow = (slug: string, i: number, native: string[]) => ({
  slug,
  publishedAt: new Date('2026-01-05T00:00:00.000Z'),
  createdAt: new Date('2026-01-04T00:00:00.000Z'),
  contentUpdatedAt: null,
  featuredImageUrl: i % 2 === 0 ? `https://img.example/b${i}.jpg` : null,
  nativeContentKeys: native,
});

const OTHER_POSTS = Array.from({ length: 160 }, (_, i) =>
  blogRow(`post-${i}`, i, i % 3 === 0 ? ['contentJa'] : []),
);
// The redirected posts interleaved among ordinary ones, so removing them shifts
// later posts across CHUNK boundaries (as on the live site).
const WITH_REDIRECTED = [
  ...OTHER_POSTS.slice(0, 40),
  blogRow(REDIRECTED[0], 1000, ALL_NATIVE),
  blogRow(REDIRECTED[1], 1001, []),
  ...OTHER_POSTS.slice(40, 90),
  blogRow(REDIRECTED[2], 1002, ALL_NATIVE),
  blogRow(REDIRECTED[3], 1003, ALL_NATIVE),
  ...OTHER_POSTS.slice(90, 130),
  blogRow(REDIRECTED[4], 1004, ALL_NATIVE),
  blogRow(REDIRECTED[5], 1005, ALL_NATIVE),
  blogRow(REDIRECTED[6], 1006, ['contentZhHant', 'contentJa', 'contentKo', 'contentEs', 'contentFr', 'contentRu', 'contentVi', 'contentHi']),
  ...OTHER_POSTS.slice(130),
];

const mocks = vi.hoisted(() => ({ blogRows: [] as unknown[] }));

vi.mock('@/i18n/config', () => ({
  locales: LOCALES,
  INDEXABLE_LEAF_LOCALES: ['en', 'zh'],
  INDEXABLE_SERVICE_CITY_LOCALES: ['en', 'zh', 'zh-Hant'],
}));
vi.mock('@/lib/awards', () => ({ HAS_AWARDS: false }));
vi.mock('@/lib/utils', () => ({
  getBaseUrl: () => 'https://www.reno-stars.com',
  LOCALE_TO_DB_SUFFIX: {
    'zh-Hant': 'ZhHant', ja: 'Ja', ko: 'Ko', es: 'Es', pa: 'Pa', tl: 'Tl', fa: 'Fa', ar: 'Ar', ru: 'Ru', fr: 'Fr', hi: 'Hi', vi: 'Vi',
  },
}));
vi.mock('@/lib/blog-dates', () => ({
  resolveBlogDates: () => ({ datePublished: '2026-01-01T00:00:00.000Z', dateModified: null }),
}));
vi.mock('@/lib/db/queries', () => ({
  getProjectSlugsFromDb: async () => [
    { slug: 'p-1', updatedAt: new Date('2026-02-02T00:00:00.000Z'), heroImageUrl: null, locationCity: 'Richmond', serviceType: 'kitchen' },
  ],
  getSiteSlugsFromDb: async () => [],
  getBlogPostSlugsFromDb: async () => mocks.blogRows,
  getServiceAreasFromDb: async () => [
    { slug: 'richmond', name: { en: 'Richmond' } },
    { slug: 'surrey', name: { en: 'Surrey' } },
  ],
  getCategorySlugs: async () => ['kitchen'],
  getServicesFromDb: async () => [
    { slug: 'kitchen', showOnServicesPage: true },
    { slug: 'bathroom', showOnServicesPage: true },
  ],
  getVideoWatchEntriesFromDb: async () => [],
  getServiceDatesForSitemap: async () => [],
  getServiceAreaDatesForSitemap: async () => [],
}));

async function build(rows: unknown[]) {
  mocks.blogRows = rows;
  const { listSitemapFiles, buildSitemapFile } = await import('@/lib/sitemap/sections');
  const byFile = new Map<string, { url: string; lastModified?: string | Date; priority?: number }[]>();
  for (const { file } of await listSitemapFiles()) {
    byFile.set(file, (await buildSitemapFile(file)) ?? []);
  }
  return byFile;
}

const urlsOf = (byFile: Awaited<ReturnType<typeof build>>, prefix?: string) =>
  [...byFile.entries()]
    .filter(([f]) => !prefix || f.startsWith(prefix))
    .flatMap(([, entries]) => entries);

describe('blog posts redirected to /guides/ are not in the sitemap (DI-18)', () => {
  it('none of the 7 redirected slugs appears in any sub-sitemap file, in any locale', async () => {
    const byFile = await build(WITH_REDIRECTED);
    const leaked = urlsOf(byFile)
      .map((e) => e.url)
      .filter((u) => REDIRECTED.some((s) => u.includes(`/blog/${s}/`)));
    expect(leaked).toEqual([]);
  });

  it('every other URL is unchanged — other blog posts and all other sections', async () => {
    const withRedirected = await build(WITH_REDIRECTED);
    const baseline = await build(OTHER_POSTS);

    const key = (e: { url: string; lastModified?: string | Date; priority?: number }) =>
      `${e.url} ${String(e.lastModified ?? '')} ${e.priority}`;
    // Identical blog URL set (with lastmod + priority), and identical pagination:
    // removing the redirected posts leaves exactly the files a build without them
    // would produce.
    expect([...withRedirected.keys()]).toEqual([...baseline.keys()]);
    for (const [file, entries] of baseline) {
      expect(withRedirected.get(file)!.map(key), file).toEqual(entries.map(key));
    }
    // 160 ordinary posts: en + zh each, plus ja on every third.
    expect(urlsOf(withRedirected, 'blog-')).toHaveLength(160 * 2 + Math.ceil(160 / 3));
  });

  it('TEST A service×city pages keep their URL and frozen lastmod', async () => {
    const byFile = await build(WITH_REDIRECTED);
    const { TEST_A_FROZEN_LASTMOD } = await import('@/lib/sitemap/lastmod-overrides');
    const kr = urlsOf(byFile, 'service-areas-').find(
      (e) => e.url === 'https://www.reno-stars.com/en/services/kitchen/richmond/',
    );
    expect(kr).toBeDefined();
    expect(kr!.lastModified).toBe(TEST_A_FROZEN_LASTMOD['en/services/kitchen/richmond']);
  });
});

describe('one source for the blog → guide redirect list', () => {
  it('the sitemap skips exactly the slugs next.config.ts redirects', async () => {
    const { BLOG_TO_GUIDE_REDIRECTS, BLOG_SLUGS_REDIRECTED_TO_GUIDES } = await import('@/lib/seo/blog-guide-redirects');
    expect([...BLOG_SLUGS_REDIRECTED_TO_GUIDES].sort()).toEqual([...REDIRECTED].sort());
    expect(BLOG_TO_GUIDE_REDIRECTS.map((r) => r.blogSlug).sort()).toEqual([...REDIRECTED].sort());
    // Every destination is a real static guide route.
    for (const { guideSlug } of BLOG_TO_GUIDE_REDIRECTS) {
      expect(existsSync(join(process.cwd(), 'app/[locale]/guides', guideSlug, 'page.tsx')), guideSlug).toBe(true);
    }
  });

  it('next.config.ts builds its 9b1 rules from that list and hand-writes none', () => {
    const src = readFileSync(join(process.cwd(), 'next.config.ts'), 'utf8');
    expect(src).toContain("from './lib/seo/blog-guide-redirects'");
    expect(src).toMatch(/\.\.\.blogToGuideRedirectRules\('en\|zh\|zh-Hant\|ja\|ko\|es\|pa\|tl\|fa\|vi\|ru\|ar\|hi\|fr'\)/);
    // No literal blog → guides rule left behind to drift from the list.
    for (const slug of REDIRECTED) {
      expect(src, slug).not.toContain(`/blog/${slug}'`);
    }
  });

  it('generates rules byte-identical to the hand-written ones they replaced', async () => {
    const { blogToGuideRedirectRules } = await import('@/lib/seo/blog-guide-redirects');
    const L = 'en|zh|zh-Hant|ja|ko|es|pa|tl|fa|vi|ru|ar|hi|fr';
    expect(blogToGuideRedirectRules(L)).toEqual([
      { source: `/:locale(${L})/blog/average-bathroom-renovation-cost-vancouver`, destination: '/:locale/guides/bathroom-renovation-cost-vancouver/', permanent: true },
      { source: `/:locale(${L})/blog/basement-renovation-cost-vancouver-2026`, destination: '/:locale/guides/basement-renovation-cost-vancouver/', permanent: true },
      { source: `/:locale(${L})/blog/basement-suite-renovation-cost-vancouver`, destination: '/:locale/guides/basement-suite-cost-vancouver/', permanent: true },
      { source: `/:locale(${L})/blog/basement-suite-renovation-cost-vancouver-zh`, destination: '/:locale/guides/basement-suite-cost-vancouver/', permanent: true },
      { source: `/:locale(${L})/blog/bathroom-renovation-cost-vancouver-by-size`, destination: '/:locale/guides/bathroom-renovation-cost-vancouver/', permanent: true },
      { source: `/:locale(${L})/blog/bathroom-renovation-cost-vancouver-by-style`, destination: '/:locale/guides/bathroom-renovation-cost-vancouver/', permanent: true },
      { source: `/:locale(${L})/blog/renovation-cost-vancouver-2026-complete-guide`, destination: '/:locale/guides/whole-house-renovation-cost-vancouver/', permanent: true },
    ]);
  });

  it('average-bathroom-renovation-cost-vancouver stays in COST_GUIDE_BLOG_SLUGS (only the sitemap entry goes)', async () => {
    const { COST_GUIDE_BLOG_SLUGS } = await import('@/lib/sitemap/config');
    expect(COST_GUIDE_BLOG_SLUGS.has('average-bathroom-renovation-cost-vancouver')).toBe(true);
  });
});
