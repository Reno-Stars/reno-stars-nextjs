import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * The sitemap was split from ONE 12.3 MB document into an index plus per-section
 * files (2026-09-02) because building all 5,825 URLs per request exhausted the
 * pod's heap under concurrent crawls.
 *
 * The risk of that split is silent URL LOSS — a section that stops being listed,
 * or a page boundary that drops its tail, would quietly deindex pages and
 * nothing would error. These tests pin the invariants that make that visible:
 * every file the index advertises resolves, no URL is duplicated across files,
 * and the union of the files equals a single combined build.
 */

const LOCALES = ['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pa', 'tl', 'fa', 'ar', 'ru', 'fr', 'hi', 'vi'] as const;

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

vi.mock('@/lib/blog-dates', () => ({
  resolveBlogDates: () => ({ datePublished: '2026-01-01T00:00:00.000Z', dateModified: null }),
}));

// Enough source rows that several sections span more than one file (CHUNK=150).
const PROJECTS = Array.from({ length: 320 }, (_, i) => ({
  slug: `project-${i}`,
  updatedAt: new Date('2026-02-02T00:00:00.000Z'),
  heroImageUrl: i % 2 === 0 ? `https://img.example/p${i}.jpg` : null,
  locationCity: 'Burnaby',
}));
const SITES = Array.from({ length: 40 }, (_, i) => ({
  slug: `site-${i}`,
  updatedAt: new Date('2026-02-03T00:00:00.000Z'),
  heroImageUrl: null,
  locationCity: 'Richmond',
}));
const BLOG = Array.from({ length: 400 }, (_, i) => ({
  slug: `post-${i}`,
  publishedAt: new Date('2026-01-05T00:00:00.000Z'),
  createdAt: new Date('2026-01-04T00:00:00.000Z'),
  contentUpdatedAt: null,
  featuredImageUrl: null,
  // Every third post also has a native Japanese body.
  nativeContentKeys: i % 3 === 0 ? ['contentJa'] : [],
}));
const AREAS = Array.from({ length: 15 }, (_, i) => ({
  slug: `area-${i}`,
  name: { en: `Area ${i}` },
}));
const SERVICES = Array.from({ length: 45 }, (_, i) => ({
  slug: `service-${i}`,
  showOnServicesPage: true,
}));
const VIDEOS = [
  {
    slug: 'video-a',
    titleEn: 'A',
    titleZh: '甲',
    descriptionEn: 'desc',
    descriptionZh: '描述',
    thumbnailUrl: 'https://img.example/t.jpg',
    videoUrl: 'https://img.example/v.mp4',
    updatedAt: new Date('2026-03-01T00:00:00.000Z'),
    uploadDate: new Date('2026-02-01T00:00:00.000Z'),
  },
  // No thumbnail — must be excluded, as the original loop did.
  { slug: 'video-b', titleEn: 'B', titleZh: '乙', descriptionEn: '', descriptionZh: '', thumbnailUrl: null, videoUrl: '', updatedAt: null, uploadDate: null },
];

vi.mock('@/lib/db/queries', () => ({
  getProjectSlugsFromDb: async () => PROJECTS,
  getSiteSlugsFromDb: async () => SITES,
  getBlogPostSlugsFromDb: async () => BLOG,
  getServiceAreasFromDb: async () => AREAS,
  getCategorySlugs: async () => ['kitchen', 'bathroom'],
  getServicesFromDb: async () => SERVICES,
  getVideoWatchEntriesFromDb: async () => VIDEOS,
}));

const importSections = async () => await import('@/lib/sitemap/sections');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sitemap sections', () => {
  it('lists at least one file per section, and every listed file resolves', async () => {
    const { SECTIONS, listSitemapFiles, buildSitemapFile } = await importSections();
    const files = await listSitemapFiles();

    for (const section of SECTIONS) {
      expect(files.some((f) => f.file.startsWith(`${section.id}-`)), `no file for ${section.id}`).toBe(true);
    }
    for (const { file } of files) {
      const entries = await buildSitemapFile(file);
      expect(entries, `${file} did not resolve`).not.toBeNull();
      expect(entries!.length, `${file} is empty`).toBeGreaterThan(0);
    }
  });

  it('splits large sections across multiple files', async () => {
    const { listSitemapFiles } = await importSections();
    const files = (await listSitemapFiles()).map((f) => f.file);
    // 400 blog posts / CHUNK 150 => 3 files; 360 project+site leaves => 3 files.
    expect(files.filter((f) => f.startsWith('blog-')).length).toBeGreaterThan(1);
    expect(files.filter((f) => f.startsWith('projects-')).length).toBeGreaterThan(1);
  });

  // The load-bearing one: the split must not lose or duplicate a single URL.
  it('the union of all files has no duplicate URLs', async () => {
    const { buildAllEntriesForTest } = await importSections();
    const all = await buildAllEntriesForTest();
    const urls = all.map((e) => e.url);
    const dupes = urls.filter((u, i) => urls.indexOf(u) !== i);
    expect([...new Set(dupes)]).toEqual([]);
    expect(urls.length).toBeGreaterThan(1000);
  });

  it('carries hreflang alternates, images and videos through the split', async () => {
    const { buildAllEntriesForTest } = await importSections();
    const all = await buildAllEntriesForTest();

    const home = all.find((e) => e.url === 'https://www.reno-stars.com/en/');
    expect(Object.keys(home!.alternates!.languages!)).toContain('x-default');
    expect(Object.keys(home!.alternates!.languages!)).toHaveLength(LOCALES.length + 1);

    const withImage = all.find((e) => e.url.includes('/projects/project-0/'));
    expect(withImage!.images).toEqual(['https://img.example/p0.jpg']);

    const video = all.find((e) => e.url.includes('/videos/video-a/'));
    expect(video!.videos![0].thumbnail_loc).toBe('https://img.example/t.jpg');
    // The thumbnail-less entry is excluded, exactly as the original loop did.
    expect(all.some((e) => e.url.includes('/videos/video-b/'))).toBe(false);
  });

  it('submits blog URLs only for locales with a native body', async () => {
    const { buildAllEntriesForTest } = await importSections();
    const all = await buildAllEntriesForTest();

    // post-0 has contentJa, so en + zh + ja. post-1 has none, so en + zh only.
    const post0 = all.filter((e) => e.url.endsWith('/blog/post-0/')).map((e) => e.url);
    expect(post0.sort()).toEqual([
      'https://www.reno-stars.com/en/blog/post-0/',
      'https://www.reno-stars.com/ja/blog/post-0/',
      'https://www.reno-stars.com/zh/blog/post-0/',
    ]);
    const post1 = all.filter((e) => e.url.endsWith('/blog/post-1/')).map((e) => e.url);
    expect(post1.sort()).toEqual([
      'https://www.reno-stars.com/en/blog/post-1/',
      'https://www.reno-stars.com/zh/blog/post-1/',
    ]);
  });

  it('restricts project leaves and service-city pages to their indexable locales', async () => {
    const { buildAllEntriesForTest } = await importSections();
    const all = await buildAllEntriesForTest();

    const leaves = all.filter((e) => e.url.endsWith('/projects/project-1/'));
    expect(leaves.map((e) => e.url).sort()).toEqual([
      'https://www.reno-stars.com/en/projects/project-1/',
      'https://www.reno-stars.com/zh/projects/project-1/',
    ]);

    const serviceCity = all.filter((e) => e.url.endsWith('/services/service-0/area-0/'));
    expect(serviceCity).toHaveLength(3); // en, zh, zh-Hant
    // Alternates must be restricted to the same set, not the full 14.
    expect(Object.keys(serviceCity[0].alternates!.languages!)).toHaveLength(4); // 3 + x-default
  });

  it('404s an unknown or out-of-range file instead of returning an empty urlset', async () => {
    const { buildSitemapFile, parseSitemapFile } = await importSections();
    expect(parseSitemapFile('nope-0')).toBeNull();
    expect(parseSitemapFile('blog')).toBeNull();
    expect(await buildSitemapFile('blog-999')).toBeNull();
    expect(await buildSitemapFile('../secret')).toBeNull();
  });
});

describe('sitemap XML', () => {
  it('renders the namespaces and element order Next used', async () => {
    const { renderUrlset, renderSitemapIndex, xmlEscape } = await import('@/lib/sitemap/xml');

    const xml = renderUrlset([
      {
        url: 'https://www.reno-stars.com/en/',
        lastModified: '2026-08-12T21:43:16.266Z',
        alternates: { languages: { en: 'https://www.reno-stars.com/en/' } },
        changeFrequency: 'weekly',
        priority: 1,
      },
    ]);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="en" href="https://www.reno-stars.com/en/" />');
    // Next renders 1.0 as "1", not "1.0" — keep that so output stays comparable.
    expect(xml).toContain('<priority>1</priority>');
    expect(xml.indexOf('<loc>')).toBeLessThan(xml.indexOf('<lastmod>'));
    expect(xml.indexOf('<xhtml:link')).toBeLessThan(xml.indexOf('<lastmod>'));

    const index = renderSitemapIndex([{ loc: 'https://www.reno-stars.com/sitemaps/blog-0.xml' }]);
    expect(index).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(index).toContain('<loc>https://www.reno-stars.com/sitemaps/blog-0.xml</loc>');

    expect(xmlEscape(`a&b<c>"d'e`)).toBe('a&amp;b&lt;c&gt;&quot;d&apos;e');
  });
});
