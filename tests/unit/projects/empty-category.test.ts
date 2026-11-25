import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * DI-16 (2026-11-24): project category hubs with NO published project rendered
 * only "No projects found" yet were submitted at priority 0.9 (cabinet,
 * basement, poly-b-replacement, accessible-bathroom × 14 locales = 56 URLs).
 *   - empty category     → not in the sitemap, robots noindex,follow
 *   - category with rows → in the sitemap, no robots override (indexable)
 *   - empty → non-empty  → back in the sitemap and indexable on the next
 *                          request, with no code change
 * Both the sitemap and the page read the SAME rule
 * (lib/projects/empty-category.ts) from live rows.
 */

const LOCALES = ['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pa', 'tl', 'fa', 'ar', 'ru', 'fr', 'hi', 'vi'] as const;
const CATEGORIES = ['whole-house', 'kitchen', 'bathroom', 'cabinet', 'basement'];

type Row = { slug: string; serviceType: string | null };
const state = vi.hoisted(() => ({ rows: [] as { slug: string; serviceType: string | null }[] }));

const projectRow = (slug: string, serviceType: string | null) => ({
  slug,
  updatedAt: new Date('2026-03-01T00:00:00.000Z'),
  locationCity: 'Burnaby',
  heroImageUrl: null,
  serviceType,
});

vi.mock('@/i18n/config', async (orig) => ({
  ...(await orig<typeof import('@/i18n/config')>()),
  locales: LOCALES,
  INDEXABLE_LEAF_LOCALES: ['en', 'zh'],
  INDEXABLE_SERVICE_CITY_LOCALES: ['en', 'zh', 'zh-Hant'],
}));
vi.mock('@/lib/awards', () => ({ HAS_AWARDS: false }));
vi.mock('@/lib/blog-dates', () => ({
  resolveBlogDates: () => ({ datePublished: '2026-01-01T00:00:00.000Z', dateModified: null }),
}));
vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string, vars?: Record<string, string>) => `${key}:${vars?.category ?? ''}`,
  setRequestLocale: () => {},
}));
// The route's render components are not under test here (generateMetadata is);
// stub them so importing the route does not pull in client navigation.
vi.mock('@/navigation', () => ({ Link: () => null, redirect: vi.fn(), usePathname: () => '/', useRouter: () => ({}), getPathname: () => '/' }));
vi.mock('@/components/pages/ProjectCategoryPage', () => ({ default: () => null }));
vi.mock('@/components/pages/ProjectDetailPage', () => ({ default: () => null }));
vi.mock('@/components/pages/SiteDetailPage', () => ({ default: () => null }));
vi.mock('@/components/ClientMessages', () => ({ default: () => null }));
vi.mock('@/lib/db/queries', () => ({
  // sitemap readers
  getProjectSlugsFromDb: async () => state.rows.map((r: Row) => projectRow(r.slug, r.serviceType)),
  getSiteSlugsFromDb: async () => [],
  getBlogPostSlugsFromDb: async () => [],
  getServiceAreasFromDb: async () => [],
  getCategorySlugs: async () => CATEGORIES,
  getServicesFromDb: async () => [],
  getVideoWatchEntriesFromDb: async () => [],
  getServiceDatesForSitemap: async () => [],
  getServiceAreaDatesForSitemap: async () => [],
  // page readers — the same rows, in the page's Project shape
  getProjectsFromDb: async () => state.rows.map((r: Row) => ({ slug: r.slug, service_type: r.serviceType })),
  getCategoriesLocalized: async () => CATEGORIES.map((c) => ({ serviceType: c, en: c, zh: c })),
  getSiteBySlugFromDb: async () => null,
  getCompanyFromDb: async () => ({}),
  getServiceTypeToCategory: async () => ({}),
  getServiceBlocksBySlug: async () => [],
  getProjectReviews: async () => [],
}));

const PUBLISHED: Row[] = [
  { slug: 'wh-1', serviceType: 'whole-house' },
  { slug: 'k-1', serviceType: 'kitchen' },
  { slug: 'k-2', serviceType: 'kitchen' },
  { slug: 'b-1', serviceType: 'bathroom' },
  { slug: 'orphan', serviceType: null },
];

async function hubUrls(): Promise<string[]> {
  const { listSitemapFiles, buildSitemapFile } = await import('@/lib/sitemap/sections');
  const urls: string[] = [];
  for (const { file } of await listSitemapFiles()) {
    if (!file.startsWith('project-hubs-')) continue;
    urls.push(...((await buildSitemapFile(file)) ?? []).map((e) => e.url));
  }
  return urls;
}

async function categoryMeta(slug: string, locale = 'en') {
  const { generateMetadata } = await import('@/app/[locale]/projects/[slug]/page');
  return generateMetadata({ params: Promise.resolve({ locale, slug }) });
}

const hub = (locale: string, c: string) => `https://www.reno-stars.com/${locale}/projects/${c}/`;

beforeEach(() => {
  state.rows = [...PUBLISHED];
});

describe('empty project categories (DI-16)', () => {
  it('an empty category is not in the sitemap, in any locale', async () => {
    const urls = await hubUrls();
    for (const c of ['cabinet', 'basement']) {
      expect(urls.filter((u) => u.includes(`/projects/${c}/`))).toEqual([]);
    }
  });

  it('a category with published projects stays in the sitemap in all 14 locales', async () => {
    const urls = await hubUrls();
    for (const c of ['whole-house', 'kitchen', 'bathroom']) {
      expect(urls.filter((u) => u.includes(`/projects/${c}/`)).sort()).toEqual(LOCALES.map((l) => hub(l, c)).sort());
    }
    expect(urls).toHaveLength(3 * LOCALES.length);
  });

  it('an empty category page is noindex, follow (every locale)', async () => {
    for (const locale of ['en', 'zh', 'ja']) {
      const meta = await categoryMeta('cabinet', locale);
      expect(meta.robots, locale).toEqual({ index: false, follow: true });
      // Everything else about the page's metadata is unchanged.
      expect(meta.title).toBe('title:cabinet');
      expect(meta.alternates).toBeDefined();
    }
  });

  it('a category with projects sets no robots override (indexable, as before)', async () => {
    for (const c of ['kitchen', 'whole-house']) {
      const meta = await categoryMeta(c);
      expect(meta.robots, c).toBeUndefined();
      expect(meta.title).toBe(`title:${c}`);
    }
  });

  it('recovers by itself when the first project in a category is published', async () => {
    expect(await hubUrls()).not.toContain(hub('en', 'cabinet'));
    expect((await categoryMeta('cabinet')).robots).toEqual({ index: false, follow: true });

    // A cabinet project is published — no code change, just the next request.
    state.rows = [...PUBLISHED, { slug: 'cab-1', serviceType: 'cabinet' }];

    const urls = await hubUrls();
    expect(urls.filter((u) => u.includes('/projects/cabinet/')).sort()).toEqual(LOCALES.map((l) => hub(l, 'cabinet')).sort());
    expect((await categoryMeta('cabinet')).robots).toBeUndefined();

    // …and it goes back out if that project is unpublished again.
    state.rows = [...PUBLISHED];
    expect(await hubUrls()).not.toContain(hub('en', 'cabinet'));
  });

  it('a failed / empty project query does NOT noindex or drop every hub (outage guard)', async () => {
    state.rows = [];
    const urls = await hubUrls();
    expect(urls).toHaveLength(CATEGORIES.length * LOCALES.length);
    expect((await categoryMeta('cabinet')).robots).toBeUndefined();
  });
});

describe('empty-category rule', () => {
  it('categoriesWithProjects / isEmptyCategory', async () => {
    const { categoriesWithProjects, isEmptyCategory } = await import('@/lib/projects/empty-category');
    const set = categoriesWithProjects(['kitchen', null, 'kitchen', undefined, 'bathroom']);
    expect([...set!].sort()).toEqual(['bathroom', 'kitchen']);
    expect(isEmptyCategory('kitchen', set)).toBe(false);
    expect(isEmptyCategory('cabinet', set)).toBe(true);
    expect(categoriesWithProjects([])).toBeNull();
    expect(isEmptyCategory('cabinet', null)).toBe(false);
  });
});
