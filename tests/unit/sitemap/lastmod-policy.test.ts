import { readFileSync, readdirSync } from 'node:fs';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import type { MetadataRoute } from 'next';

/**
 * DI-12 #2 (2026-11-24): every sitemap URL carries the date of ITS OWN content.
 *
 *  - no site-wide timestamp, no request/build time ("now") anywhere;
 *  - no honest date → no <lastmod>;
 *  - the index's per-file lastmod = the newest lastmod inside that file;
 *  - the 4 room "near me" pages × 14 locales (canonical elsewhere) are gone,
 *    /renovation-near-me/ stays;
 *  - the 14 test-A URLs stay, with their 2026-11-24 lastmod frozen verbatim.
 *
 * Fixtures give every row a DIFFERENT date so a wrong source shows up as a
 * wrong value, not as a coincidentally equal one.
 */

const LOCALES = ['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pa', 'tl', 'fa', 'ar', 'ru', 'fr', 'hi', 'vi'] as const;
const FAKE_NOW = new Date('2031-01-01T00:00:00.000Z');

vi.mock('@/i18n/config', () => ({
  locales: LOCALES,
  INDEXABLE_LEAF_LOCALES: ['en', 'zh'],
  INDEXABLE_SERVICE_CITY_LOCALES: ['en', 'zh', 'zh-Hant'],
}));
vi.mock('@/lib/awards', () => ({ HAS_AWARDS: false }));
vi.mock('@/lib/utils', () => ({
  getBaseUrl: () => 'https://www.reno-stars.com',
  LOCALE_TO_DB_SUFFIX: { ja: 'Ja', ko: 'Ko', es: 'Es', fr: 'Fr' },
}));
// The real gate's contract: a content edit → that date, else the published date.
vi.mock('@/lib/blog-dates', () => ({
  resolveBlogDates: (r: { published_at: Date | null; content_updated_at: Date | null }) => ({
    datePublished: r.published_at ? r.published_at.toISOString() : null,
    dateModified: r.content_updated_at ? r.content_updated_at.toISOString() : null,
  }),
}));

const D = (s: string) => new Date(`2026-${s}T00:00:00.000Z`);
const SERVICES = ['kitchen', 'basement', 'cabinet', 'bathroom', 'heat-pump-hvac', 'critical-load-panel', 'commercial'];
const AREA_NAMES: Record<string, string> = {
  richmond: 'Richmond', delta: 'Delta', coquitlam: 'Coquitlam', 'north-vancouver': 'North Vancouver',
  burnaby: 'Burnaby', langley: 'Langley', 'port-moody': 'Port Moody', 'port-coquitlam': 'Port Coquitlam',
  'white-rock': 'White Rock', surrey: 'Surrey',
};
const PROJECTS = [
  { slug: 'k-burnaby', updatedAt: D('03-10'), locationCity: 'Burnaby', serviceType: 'kitchen', heroImageUrl: null },
  { slug: 'k-surrey', updatedAt: D('05-20'), locationCity: 'Surrey', serviceType: 'kitchen', heroImageUrl: null },
  { slug: 'b-surrey', updatedAt: D('04-01'), locationCity: 'Surrey', serviceType: 'bathroom', heroImageUrl: null },
  { slug: 'b-delta', updatedAt: D('02-14'), locationCity: 'Delta', serviceType: 'bathroom', heroImageUrl: null },
  { slug: 'no-date', updatedAt: null, locationCity: 'Delta', serviceType: 'bathroom', heroImageUrl: null },
];
const SITES = [
  { slug: 'site-dated', updatedAt: D('06-06'), heroImageUrl: null },
  { slug: 'site-undated', updatedAt: null, heroImageUrl: null },
];
const BLOG = [
  { slug: 'edited', publishedAt: D('01-05'), createdAt: D('01-04'), contentUpdatedAt: D('07-07'), featuredImageUrl: null, nativeContentKeys: [] },
  { slug: 'published-only', publishedAt: D('02-02'), createdAt: D('02-01'), contentUpdatedAt: null, featuredImageUrl: null, nativeContentKeys: [] },
  { slug: 'undated', publishedAt: null, createdAt: null, contentUpdatedAt: null, featuredImageUrl: null, nativeContentKeys: [] },
];
const SERVICE_DATES: Record<string, Date> = {
  kitchen: D('01-11'), basement: D('01-12'), cabinet: D('01-13'), bathroom: D('01-14'),
  'heat-pump-hvac': D('01-15'), 'critical-load-panel': D('01-16'), commercial: D('08-08'),
};
const AREA_DATES: Record<string, Date> = { surrey: D('01-21'), burnaby: D('04-20'), delta: D('01-22') };
const VIDEOS = [
  { slug: 'v-dated', titleEn: 'A', titleZh: '甲', descriptionEn: 'd', descriptionZh: '描', thumbnailUrl: 'https://img/t.jpg', videoUrl: 'https://img/v.mp4', updatedAt: D('03-03'), uploadDate: D('03-01') },
  { slug: 'v-undated', titleEn: 'B', titleZh: '乙', descriptionEn: 'd', descriptionZh: '描', thumbnailUrl: 'https://img/t2.jpg', videoUrl: 'https://img/v2.mp4', updatedAt: null, uploadDate: null },
];

vi.mock('@/lib/db/queries', () => ({
  getProjectSlugsFromDb: async () => PROJECTS,
  getSiteSlugsFromDb: async () => SITES,
  getBlogPostSlugsFromDb: async () => BLOG,
  getServiceAreasFromDb: async () => Object.entries(AREA_NAMES).map(([slug, en]) => ({ slug, name: { en } })),
  getCategorySlugs: async () => ['kitchen', 'bathroom', 'commercial'],
  getServicesFromDb: async () => SERVICES.map((slug) => ({ slug, showOnServicesPage: true })),
  getVideoWatchEntriesFromDb: async () => VIDEOS,
  getServiceDatesForSitemap: async () => Object.entries(SERVICE_DATES).map(([slug, updatedAt]) => ({ slug, updatedAt })),
  getServiceAreaDatesForSitemap: async () => Object.entries(AREA_DATES).map(([slug, updatedAt]) => ({ slug, updatedAt })),
}));

const BASE = 'https://www.reno-stars.com';
const MANIFEST = JSON.parse(readFileSync('lib/sitemap/static-page-lastmod.json', 'utf8')).pages as Record<string, { lastmod: string }>;
const iso = (d: Date) => d.toISOString();
const max = (...v: string[]) => v.sort().slice(-1)[0];
const lm = (e: MetadataRoute.Sitemap[number] | undefined) =>
  e?.lastModified instanceof Date ? e.lastModified.toISOString() : (e?.lastModified as string | undefined);

let all: MetadataRoute.Sitemap;
const entry = (path: string) => all.find((e) => e.url === `${BASE}/${path}`);

beforeAll(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(FAKE_NOW);
  const { buildAllEntriesForTest } = await import('@/lib/sitemap/sections');
  all = await buildAllEntriesForTest();
});
afterAll(() => vi.useRealTimers());

describe('no site-wide stamp and no "now"', () => {
  it('no entry carries the request time (system clock is pinned to 2031)', () => {
    for (const e of all) expect(lm(e) ?? '', e.url).not.toMatch(/^2031/);
    for (const e of all) for (const v of e.videos ?? []) expect(String(v.publication_date ?? '')).not.toMatch(/^2031/);
  });

  it('lib/sitemap has no clock reads and no site-wide fallback left', () => {
    for (const f of readdirSync('lib/sitemap').filter((x) => x.endsWith('.ts'))) {
      const src = readFileSync(`lib/sitemap/${f}`, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
      expect(src, f).not.toMatch(/new Date\(\s*\)|Date\.now\(|staticLastModified|\bd\.now\b/);
    }
  });

  it('different pages now carry different dates', () => {
    const distinct = new Set(all.map(lm).filter(Boolean));
    expect(distinct.size).toBeGreaterThan(15);
    const pages = new Set(all.filter((e) => !/\/(services|projects|blog|areas|videos)\//.test(e.url)).map(lm));
    expect(pages.size).toBeGreaterThan(3);
  });
});

describe('each URL class reads its own source', () => {
  it('project and site leaves: their own updated_at; undated rows omit <lastmod>', () => {
    expect(lm(entry('en/projects/k-burnaby/'))).toBe(iso(D('03-10')));
    expect(lm(entry('zh/projects/k-surrey/'))).toBe(iso(D('05-20')));
    expect(lm(entry('en/projects/site-dated/'))).toBe(iso(D('06-06')));
    expect(entry('en/projects/no-date/')).toBeDefined();
    expect(entry('en/projects/no-date/')!.lastModified).toBeUndefined();
    expect(entry('en/projects/site-undated/')!.lastModified).toBeUndefined();
  });

  it('blog: the honest date (content edit, else publication); undated posts omit it', () => {
    expect(lm(entry('en/blog/edited/'))).toBe(iso(D('07-07')));
    expect(lm(entry('en/blog/published-only/'))).toBe(iso(D('02-02')));
    expect(entry('en/blog/undated/')!.lastModified).toBeUndefined();
  });

  it('project hubs: the newest project in that category; an empty category is not listed at all', () => {
    for (const loc of LOCALES) {
      expect(lm(entry(`${loc}/projects/kitchen/`))).toBe(iso(D('05-20')));
      expect(lm(entry(`${loc}/projects/bathroom/`))).toBe(iso(D('04-01')));
      // DI-16: no published commercial project → the hub renders "No projects
      // found", is noindex, and is left out of the sitemap (it used to be
      // listed with no <lastmod>).
      expect(entry(`${loc}/projects/commercial/`)).toBeUndefined();
    }
  });

  it('service hubs: the service row or its newest project, whichever is later', () => {
    expect(lm(entry('en/services/kitchen/'))).toBe(iso(D('05-20')));      // project later than row
    expect(lm(entry('ja/services/commercial/'))).toBe(iso(D('08-08')));   // row, no projects
    expect(lm(entry('en/services/basement/'))).toBe(iso(D('01-12')));
  });

  it('areas: the area row or its newest project, whichever is later; nothing dated → omitted', () => {
    expect(lm(entry('en/areas/surrey/'))).toBe(iso(D('05-20')));
    expect(lm(entry('fr/areas/burnaby/'))).toBe(iso(D('04-20')));       // row later than the 03-10 project
    expect(entry('en/areas/white-rock/')!.lastModified).toBeUndefined();
  });

  it('service×city (non-test-A): service row, area row and projects of THAT service in THAT city', () => {
    expect(lm(entry('en/services/kitchen/surrey/'))).toBe(iso(D('05-20')));
    expect(lm(entry('zh/services/bathroom/surrey/'))).toBe(iso(D('04-01')));        // not the kitchen project
    expect(lm(entry('zh-Hant/services/commercial/burnaby/'))).toBe(iso(D('08-08')));
    expect(lm(entry('en/services/heat-pump-hvac/surrey/'))).toBe(max(iso(D('01-15')), iso(D('01-21'))));
    // the 9 zh-Hant overrides still apply
    expect(lm(entry('zh-Hant/services/kitchen/surrey/'))).toBe('2026-09-24T23:23:15.000Z');
  });

  it('videos: their own updated_at; undated → no <lastmod> and no invented publication date', () => {
    expect(lm(entry('en/videos/v-dated/'))).toBe(iso(D('03-03')));
    const undated = entry('en/videos/v-undated/')!;
    expect(undated.lastModified).toBeUndefined();
    expect(undated.videos![0].publication_date).toBeUndefined();
  });

  it('static pages: the git manifest date, or the rows they list when later', () => {
    for (const loc of LOCALES) {
      expect(lm(entry(`${loc}/about/`))).toBe(MANIFEST['/about'].lastmod);
      expect(lm(entry(`${loc}/privacy/`))).toBe(MANIFEST['/privacy'].lastmod);
      expect(lm(entry(`${loc}/blog/`))).toBe(max(MANIFEST['/blog'].lastmod, iso(D('07-07'))));
      expect(lm(entry(`${loc}/`))).toBe(max(MANIFEST[''].lastmod, iso(D('05-20')), iso(D('06-06')), iso(D('07-07'))));
      expect(lm(entry(`${loc}/services/`))).toBe(max(MANIFEST['/services'].lastmod, iso(D('08-08'))));
    }
  });
});

describe('static-page manifest', () => {
  it('covers every static path with an ISO date and records its sources', async () => {
    const { STATIC_PAGES } = await import('@/lib/sitemap/config');
    for (const { path } of STATIC_PAGES) {
      const m = MANIFEST[path];
      expect(m, `manifest has no entry for "${path}" — run pnpm sitemap:lastmod`).toBeDefined();
      expect(new Date(m.lastmod).toISOString()).toBe(m.lastmod);
    }
  });
});

describe('sitemap index', () => {
  it("each file's lastmod is the newest lastmod inside that file", async () => {
    const { listSitemapFiles, buildSitemapFile } = await import('@/lib/sitemap/sections');
    const files = await listSitemapFiles();
    expect(files.length).toBeGreaterThan(5);
    for (const { file, lastModified } of files) {
      const values = (await buildSitemapFile(file))!.map(lm).filter((v): v is string => !!v);
      expect(lastModified, file).toBe(values.length ? max(...values) : undefined);
    }
    expect(new Set(files.map((f) => f.lastModified)).size).toBeGreaterThan(3);
  });
});

describe('near-me cleanup (56 URLs out, /renovation-near-me/ stays)', () => {
  const removed = readFileSync('tests/fixtures/sitemap-nearme-56-removed.txt', 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);

  it('the fixture is the 56-URL list (4 rooms × 14 locales)', () => {
    expect(removed).toHaveLength(56);
    expect(new Set(removed).size).toBe(56);
  });
  it('none of the 56 is in any sitemap file', () => {
    const urls = new Set(all.map((e) => e.url));
    expect(removed.filter((u) => urls.has(u))).toEqual([]);
  });
  it('all 14 /renovation-near-me/ URLs are still listed', () => {
    for (const loc of LOCALES) expect(entry(`${loc}/renovation-near-me/`), loc).toBeDefined();
  });
  it('pages section = 27 paths × 14 locales = 378 (was 31 × 14 = 434)', async () => {
    const { buildSitemapFile } = await import('@/lib/sitemap/sections');
    expect((await buildSitemapFile('pages-0'))!.length).toBe(378);
  });
});

describe('test A: 14 URLs present, lastmod frozen verbatim', () => {
  const rows = readFileSync('tests/fixtures/sitemap-testA-lastmod-2026-11-24.csv', 'utf8')
    .split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.split(','));

  it('the fixture has the 14 URLs', () => expect(rows).toHaveLength(14));
  it.each(rows.map(([url, file, value]) => [url, file, value]))('%s', async (url, file, value) => {
    const e = all.find((x) => x.url === url);
    expect(e, `${url} missing from the sitemap`).toBeDefined();
    expect(lm(e)).toBe(value);
    const { buildSitemapFile } = await import('@/lib/sitemap/sections');
    expect((await buildSitemapFile(file.replace(/\.xml$/, '')))!.some((x) => x.url === url), `${url} not in ${file}`).toBe(true);
  });
});
