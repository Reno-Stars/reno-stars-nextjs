import type { MetadataRoute } from 'next';
import { locales, INDEXABLE_LEAF_LOCALES, INDEXABLE_SERVICE_CITY_LOCALES } from '@/i18n/config';
import { getBaseUrl } from '@/lib/utils';
import { PRIORITY, CHANGEFREQ, STATIC_PAGES, COST_GUIDE_BLOG_SLUGS } from './config';
import { loadSitemapData, nativeLocalesFor, type SitemapData } from './data';
import { SERVICE_CITY_LASTMOD_OVERRIDES, TEST_A_FROZEN_LASTMOD, serviceCityLastModKey } from './lastmod-overrides';
import { BLOG_SLUGS_REDIRECTED_TO_GUIDES } from '@/lib/seo/blog-guide-redirects';

/**
 * The sitemap, split into an index plus per-section files.
 *
 * Every builder below is the corresponding loop from the former one-function
 * `app/sitemap.ts`, moved without changing which URLs it emits or what
 * priority / changefreq / hreflang set it gives them. The split is about
 * MEMORY, not about content: one request used to expand all 5,825 URLs (each
 * carrying 14 hreflang alternates) and serialise 12.3 MB of XML, which
 * exhausted the pod's heap under concurrent crawls. A file is now a slice.
 *
 * `tests/unit/sitemap/sections.test.ts` asserts the union of every file equals
 * what a single combined build produces, so a section can never silently drop
 * URLs the old sitemap carried.
 *
 * <lastmod> (DI-12 #2, 2026-11-24): each URL carries its OWN content date —
 *   pages          git date of the page's code + copy (static-page-lastmod.json),
 *                  or later rows for pages that list rows (home, /projects, /blog…)
 *   services       the service row + the newest project of that service
 *   service-areas  TEST A frozen → 9 zh-Hant overrides → service row, area row and
 *                  projects of that service in that city
 *   project-hubs   newest project in the category
 *   projects       the project's / site's own updated_at
 *   blog           honest blog date (lib/blog-dates.ts)
 *   areas          the area row + newest project in that city
 *   videos         the video's own updated_at
 * No date → the entry has no <lastmod>. Never a site-wide value, never "now".
 */

const BASE_URL = getBaseUrl();

/**
 * Source items per file — bounds the biggest document a single request builds.
 *
 * Measured against production data (5,825 URLs) rather than guessed, because a
 * source item expands into up to 14 locale URLs and the ratio differs per
 * section:
 *   CHUNK 150 ->  9 files, largest 4.30 MB
 *   CHUNK  75 -> 11 files, largest 2.35 MB
 *   CHUNK  50 -> 14 files, largest 1.58 MB   <- chosen
 * 1.58 MB is 7.8x smaller than the 12.3 MB single document that exhausted the
 * heap. Going lower trades away little: the files are already small, and each
 * one re-reads the shared row set, so more files means more DB round trips for
 * a full crawl.
 */
const CHUNK = 50;

/** hreflang alternates. Identical to the former inline `buildAlternates`. */
function buildAlternates(path: string, includeLocales: readonly string[] = locales) {
  const languages: Record<string, string> = {};
  for (const loc of includeLocales) {
    languages[loc] = `${BASE_URL}/${loc}${path}/`;
  }
  languages['x-default'] = `${BASE_URL}/en${path}/`;
  return { languages };
}

/** A path rendered in every locale — the shape most sections reduce to. */
interface PathEntry {
  path: string;
  priority: number;
  changeFrequency: 'weekly' | 'monthly' | 'yearly';
  lastModified?: string;
}

function expandPaths(items: PathEntry[]): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const { path, priority, changeFrequency, lastModified } of items) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}/`,
        ...(lastModified && { lastModified }),
        alternates: buildAlternates(path),
        priority,
        changeFrequency,
      });
    }
  }
  return entries;
}

const SERVICE_CITY_LOCALES = INDEXABLE_SERVICE_CITY_LOCALES;
const PROJECT_LEAF_LOCALES = INDEXABLE_LEAF_LOCALES;

interface Section {
  id: string;
  /** Source items; file count is ceil(length / CHUNK) — at least one file. */
  items: (d: SitemapData) => unknown[];
  /** Build the entries for one slice of `items`. */
  build: (d: SitemapData, slice: unknown[]) => MetadataRoute.Sitemap;
}

export const SECTIONS: Section[] = [
  {
    id: 'pages',
    items: () => STATIC_PAGES,
    build: (d, slice) =>
      expandPaths((slice as PathEntry[]).map((p) => ({ ...p, lastModified: d.staticPageLastMod(p.path) }))),
  },
  {
    id: 'services',
    items: (d) => d.serviceSlugs,
    build: (d, slice) =>
      expandPaths(
        (slice as string[]).map((slug) => ({
          path: `/services/${slug}`,
          priority: PRIORITY.serviceLeaf,
          changeFrequency: CHANGEFREQ.monthly,
          lastModified: d.serviceHubLastMod(slug),
        })),
      ),
  },
  {
    // Which locales get a service x city page is a CONFIG fact, read from the
    // same list that drives the route's robots tag and hreflang set. The
    // alternates are restricted to that set on purpose: the default of all 14
    // would advertise eleven URLs this section deliberately does not submit and
    // the page marks noindex.
    id: 'service-areas',
    items: (d) => d.serviceSlugs,
    build: (d, slice) => {
      const entries: MetadataRoute.Sitemap = [];
      for (const slug of slice as string[]) {
        for (const area of d.serviceAreas) {
          for (const locale of SERVICE_CITY_LOCALES) {
            const key = serviceCityLastModKey(locale, slug, area.slug);
            // Test A frozen first, then the per-URL overrides (lastmod-overrides.ts),
            // then the page's own inputs. No input dated → no <lastmod>.
            const lastModified = TEST_A_FROZEN_LASTMOD[key]
              ?? SERVICE_CITY_LASTMOD_OVERRIDES[key]
              ?? d.serviceCityLastMod(slug, area.slug);
            entries.push({
              url: `${BASE_URL}/${locale}/services/${slug}/${area.slug}/`,
              ...(lastModified && { lastModified }),
              alternates: buildAlternates(`/services/${slug}/${area.slug}`, SERVICE_CITY_LOCALES),
              priority: PRIORITY.serviceArea,
              changeFrequency: CHANGEFREQ.monthly,
            });
          }
        }
      }
      return entries;
    },
  },
  {
    // Project category hubs. (The budget-tier pages were retired 2026-11-24 —
    // they now 301 to /projects/, see lib/projects/retired-budget-pages.ts.)
    id: 'project-hubs',
    items: (d) => [
      ...d.categorySlugs.map((category: string) => ({
        path: `/projects/${category}`,
        priority: PRIORITY.hub,
        changeFrequency: CHANGEFREQ.monthly,
      })),
    ],
    build: (d, slice) =>
      expandPaths((slice as PathEntry[]).map((p) => ({ ...p, lastModified: d.categoryLastMod(p.path.slice('/projects/'.length)) }))),
  },
  {
    // Project and site leaves. Minor locales are dropped for the same reason as
    // service x city: duplicate-by-content per the GSC 2026-05-07 audit, only
    // the indexable leaf set has organic traffic on these long-tail combos.
    id: 'projects',
    items: (d) => {
      const categorySet = new Set(d.categorySlugs);
      const projectSlugSet = new Set(d.projectSlugs);
      return [
        ...d.projectSlugs.filter((s: string) => !categorySet.has(s)).map((slug: string) => ({ slug, kind: 'project' as const })),
        ...d.siteSlugs.filter((s: string) => !projectSlugSet.has(s)).map((slug: string) => ({ slug, kind: 'site' as const })),
      ];
    },
    build: (d, slice) => {
      const entries: MetadataRoute.Sitemap = [];
      for (const { slug, kind } of slice as { slug: string; kind: 'project' | 'site' }[]) {
        const image = kind === 'project' ? d.projectImageMap.get(slug) : d.siteImageMap.get(slug);
        const lastModified = (kind === 'project' ? d.projectDateMap : d.siteDateMap).get(slug);
        for (const locale of PROJECT_LEAF_LOCALES) {
          entries.push({
            url: `${BASE_URL}/${locale}/projects/${slug}/`,
            ...(lastModified && { lastModified }),
            alternates: buildAlternates(`/projects/${slug}`),
            priority: PRIORITY.projectLeaf,
            changeFrequency: CHANGEFREQ.yearly,
            ...(image && { images: [image] }),
          });
        }
      }
      return entries;
    },
  },
  {
    // Blog x locale: only locales with a NATIVE body are submitted. The rest
    // render an EN fallback under `robots: noindex`, so listing them would be a
    // contradictory signal (793 URLs, GSC 2026-07-07).
    // Posts whose URL permanently redirects to a /guides/ page (next.config.ts
    // 9b1, list in lib/seo/blog-guide-redirects.ts) are skipped: a sitemap must
    // not list URLs that answer with a redirect (DI-18, 82 URLs on 2026-11-24).
    // Filtering the ITEMS (not the built entries) keeps every file at CHUNK
    // posts, so later posts move up into earlier files.
    id: 'blog',
    items: (d) => d.blogPostSlugs.filter((slug: string) => !BLOG_SLUGS_REDIRECTED_TO_GUIDES.has(slug)),
    build: (d, slice) => {
      const entries: MetadataRoute.Sitemap = [];
      for (const slug of slice as string[]) {
        const isCostGuide = COST_GUIDE_BLOG_SLUGS.has(slug);
        const blogImage = d.blogImageMap.get(slug);
        const nativeKeys = d.nativeKeysBySlug.get(slug) ?? new Set<string>();
        const nativeLocales = nativeLocalesFor(nativeKeys, locales);
        const alternates = buildAlternates(`/blog/${slug}`, nativeLocales);
        const lastModified = d.blogDateMap.get(slug);
        for (const locale of nativeLocales) {
          entries.push({
            url: `${BASE_URL}/${locale}/blog/${slug}/`,
            ...(lastModified && { lastModified }),
            alternates,
            priority: isCostGuide ? PRIORITY.guide : PRIORITY.blog,
            changeFrequency: CHANGEFREQ.monthly,
            ...(blogImage && { images: [blogImage] }),
          });
        }
      }
      return entries;
    },
  },
  {
    id: 'areas',
    items: (d) => d.serviceAreas,
    build: (d, slice) =>
      expandPaths(
        (slice as { slug: string }[]).map((area) => ({
          path: `/areas/${area.slug}`,
          priority: PRIORITY.area,
          changeFrequency: CHANGEFREQ.monthly,
          lastModified: d.areaLastMod(area.slug),
        })),
      ),
  },
  {
    // Video WATCH pages. `videos` renders <video:video> tags, which Google
    // requires alongside the VideoObject JSON-LD for video indexing.
    id: 'videos',
    items: (d) => d.videoEntries.filter((v: { thumbnailUrl?: string | null }) => v.thumbnailUrl),
    build: (d, slice) => {
      const entries: MetadataRoute.Sitemap = [];
      for (const v of slice as SitemapData['videoEntries']) {
        if (!v.thumbnailUrl) continue;
        for (const locale of PROJECT_LEAF_LOCALES) {
          const isZh = locale === 'zh';
          entries.push({
            url: `${BASE_URL}/${locale}/videos/${v.slug}/`,
            ...(v.updatedAt && { lastModified: v.updatedAt.toISOString() }),
            alternates: buildAlternates(`/videos/${v.slug}`, [...PROJECT_LEAF_LOCALES]),
            priority: PRIORITY.projectLeaf,
            changeFrequency: CHANGEFREQ.yearly,
            videos: [{
              title: isZh ? `${v.titleZh}——装修实拍视频` : `${v.titleEn} — Renovation Video Tour`,
              thumbnail_loc: v.thumbnailUrl,
              description: (isZh ? v.descriptionZh : v.descriptionEn) || (isZh ? v.titleZh : v.titleEn),
              content_loc: v.videoUrl,
              // No upload date → omit the tag rather than claim "published now".
              ...(v.uploadDate && { publication_date: v.uploadDate.toISOString() }),
            }],
          });
        }
      }
      return entries;
    },
  },
];

/** `blog-3` -> { id: 'blog', page: 3 }. Returns null for anything unrecognised. */
export function parseSitemapFile(file: string): { id: string; page: number } | null {
  const match = /^([a-z-]+)-(\d+)$/.exec(file);
  if (!match) return null;
  const section = SECTIONS.find((s) => s.id === match[1]);
  if (!section) return null;
  const page = Number(match[2]);
  return Number.isInteger(page) && page >= 0 ? { id: match[1], page } : null;
}

function pageCount(length: number): number {
  return Math.max(1, Math.ceil(length / CHUNK));
}

/** The latest <lastmod> among a file's entries; undefined when none carries one. */
export function maxLastMod(entries: MetadataRoute.Sitemap): string | undefined {
  let best: string | undefined;
  for (const e of entries) {
    const v = e.lastModified instanceof Date ? e.lastModified.toISOString() : e.lastModified;
    if (v && (!best || v > best)) best = v;
  }
  return best;
}

/**
 * Every sitemap file that currently exists, in index order, each with the
 * latest <lastmod> of the URLs it contains (deterministic; omitted when none of
 * its URLs carries one). Files are built one at a time and discarded, so the
 * memory bound that motivated the split still holds.
 */
export async function listSitemapFiles(
  data?: SitemapData,
): Promise<{ file: string; lastModified?: string }[]> {
  const d = data ?? (await loadSitemapData());
  const files: { file: string; lastModified?: string }[] = [];
  for (const section of SECTIONS) {
    const items = section.items(d);
    const count = pageCount(items.length);
    for (let page = 0; page < count; page++) {
      const lastModified = maxLastMod(section.build(d, items.slice(page * CHUNK, (page + 1) * CHUNK)));
      files.push({ file: `${section.id}-${page}`, ...(lastModified && { lastModified }) });
    }
  }
  return files;
}

/** Entries for one file. `null` when the file does not exist. */
export async function buildSitemapFile(
  file: string,
  data?: SitemapData,
): Promise<MetadataRoute.Sitemap | null> {
  const parsed = parseSitemapFile(file);
  if (!parsed) return null;
  const section = SECTIONS.find((s) => s.id === parsed.id);
  if (!section) return null;

  const d = data ?? (await loadSitemapData());
  const items = section.items(d);
  if (parsed.page >= pageCount(items.length)) return null;

  const slice = items.slice(parsed.page * CHUNK, (parsed.page + 1) * CHUNK);
  return section.build(d, slice);
}

/**
 * Every entry across every file, in index order. Used by the parity test — NOT
 * by a route, because materialising all of them at once is exactly what the
 * split exists to avoid.
 */
export async function buildAllEntriesForTest(data?: SitemapData): Promise<MetadataRoute.Sitemap> {
  const d = data ?? (await loadSitemapData());
  const all: MetadataRoute.Sitemap = [];
  for (const { file } of await listSitemapFiles(d)) {
    const entries = await buildSitemapFile(file, d);
    if (entries) all.push(...entries);
  }
  return all;
}
