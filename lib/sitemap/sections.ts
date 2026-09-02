import type { MetadataRoute } from 'next';
import { locales, INDEXABLE_LEAF_LOCALES, INDEXABLE_SERVICE_CITY_LOCALES } from '@/i18n/config';
import { getBaseUrl } from '@/lib/utils';
import { PRIORITY, CHANGEFREQ, STATIC_PAGES, COST_GUIDE_BLOG_SLUGS } from './config';
import { loadSitemapData, nativeLocalesFor, type SitemapData } from './data';

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
 */

const BASE_URL = getBaseUrl();

/** Source items per file. Bounds the biggest document a single request builds. */
const CHUNK = 150;

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

function expandPaths(items: PathEntry[], fallbackLastMod: string): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const { path, priority, changeFrequency, lastModified } of items) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}/`,
        lastModified: lastModified ?? fallbackLastMod,
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
const BUDGET_TIERS = ['under-30k', '30k-60k', '60k-plus'] as const;

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
    build: (d, slice) => expandPaths(slice as PathEntry[], d.staticLastModified),
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
        })),
        d.staticLastModified,
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
            entries.push({
              url: `${BASE_URL}/${locale}/services/${slug}/${area.slug}/`,
              lastModified: d.areaLastModMap.get(area.slug) ?? d.staticLastModified,
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
    // Project category hubs + the programmatic budget-tier filter pages.
    id: 'project-hubs',
    items: (d) => [
      ...d.categorySlugs.map((category: string) => ({
        path: `/projects/${category}`,
        priority: PRIORITY.hub,
        changeFrequency: CHANGEFREQ.monthly,
      })),
      ...BUDGET_TIERS.map((tier) => ({
        path: `/projects/budget/${tier}`,
        priority: PRIORITY.guide,
        changeFrequency: CHANGEFREQ.monthly,
      })),
    ],
    build: (d, slice) => expandPaths(slice as PathEntry[], d.staticLastModified),
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
        const dateMap = kind === 'project' ? d.projectDateMap : d.siteDateMap;
        for (const locale of PROJECT_LEAF_LOCALES) {
          entries.push({
            url: `${BASE_URL}/${locale}/projects/${slug}/`,
            lastModified: dateMap.get(slug) ?? d.now,
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
    id: 'blog',
    items: (d) => d.blogPostSlugs,
    build: (d, slice) => {
      const entries: MetadataRoute.Sitemap = [];
      for (const slug of slice as string[]) {
        const isCostGuide = COST_GUIDE_BLOG_SLUGS.has(slug);
        const blogImage = d.blogImageMap.get(slug);
        const nativeKeys = d.nativeKeysBySlug.get(slug) ?? new Set<string>();
        const nativeLocales = nativeLocalesFor(nativeKeys, locales);
        const alternates = buildAlternates(`/blog/${slug}`, nativeLocales);
        for (const locale of nativeLocales) {
          entries.push({
            url: `${BASE_URL}/${locale}/blog/${slug}/`,
            lastModified: d.blogDateMap.get(slug) ?? d.now,
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
          lastModified: d.areaLastModMap.get(area.slug) ?? d.staticLastModified,
        })),
        d.staticLastModified,
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
            lastModified: (v.updatedAt ?? new Date()).toISOString(),
            alternates: buildAlternates(`/videos/${v.slug}`, [...PROJECT_LEAF_LOCALES]),
            priority: PRIORITY.projectLeaf,
            changeFrequency: CHANGEFREQ.yearly,
            videos: [{
              title: isZh ? `${v.titleZh}——装修实拍视频` : `${v.titleEn} — Renovation Video Tour`,
              thumbnail_loc: v.thumbnailUrl,
              description: (isZh ? v.descriptionZh : v.descriptionEn) || (isZh ? v.titleZh : v.titleEn),
              content_loc: v.videoUrl,
              publication_date: (v.uploadDate ?? new Date()).toISOString(),
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

/** Every sitemap file that currently exists, in index order. */
export async function listSitemapFiles(
  data?: SitemapData,
): Promise<{ file: string; lastModified: string }[]> {
  const d = data ?? (await loadSitemapData());
  const files: { file: string; lastModified: string }[] = [];
  for (const section of SECTIONS) {
    const count = pageCount(section.items(d).length);
    for (let page = 0; page < count; page++) {
      files.push({ file: `${section.id}-${page}`, lastModified: d.staticLastModified });
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
