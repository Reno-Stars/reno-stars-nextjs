import { LOCALE_TO_DB_SUFFIX } from '@/lib/utils';
import { resolveBlogDates } from '@/lib/blog-dates';
import {
  getProjectSlugsFromDb,
  getSiteSlugsFromDb,
  getBlogPostSlugsFromDb,
  getServiceAreasFromDb,
  getCategorySlugs,
  getServicesFromDb,
  getVideoWatchEntriesFromDb,
  getServiceDatesForSitemap,
  getServiceAreaDatesForSitemap,
} from '@/lib/db/queries';
import STATIC_PAGE_LASTMOD from './static-page-lastmod.json';

/** Latest of several ISO timestamps; `undefined` when none is known (never "now"). */
export function latestOf(...values: (string | undefined | null)[]): string | undefined {
  let best: string | undefined;
  for (const v of values) if (v && (!best || v > best)) best = v;
  return best;
}

const iso = (d: Date | null | undefined): string | undefined => (d ? d.toISOString() : undefined);

/**
 * Static pages whose body also lists database rows: their honest lastmod is the
 * later of the page's own code/copy date (static-page-lastmod.json) and the date
 * of the rows they render. Every other static page uses the manifest date alone.
 */
const STATIC_PAGE_DATA_SOURCES: Record<string, ('projects' | 'sites' | 'blog' | 'services' | 'areas')[]> = {
  '': ['projects', 'sites', 'blog'], // home: project gallery + latest posts
  '/projects': ['projects', 'sites'],
  '/before-after': ['projects'],
  '/blog': ['blog'],
  '/services': ['services'],
  '/areas': ['areas'],
};

/**
 * Loads every row the sitemap sections derive their URLs — and their <lastmod>
 * — from.
 *
 * LASTMOD POLICY (DI-12 #2, 2026-11-24): every URL carries the date of ITS OWN
 * content, never a site-wide maximum, never the request or build time. Where a
 * URL has no honest date the entry omits <lastmod> rather than inventing one.
 * See lib/sitemap/sections.ts for which source each section uses.
 *
 * Each sitemap FILE calls this once. The rows are small (slugs + timestamps +
 * one image URL each); what exhausted the pod's heap in 2026-09 was expanding
 * every URL x 14 hreflang alternates and serialising 12.3 MB of XML at once.
 */
export async function loadSitemapData() {
  const [projectRows, siteRows, blogPostRows, serviceAreas, categorySlugs, allServices, videoEntries, serviceDates, areaDates] = await Promise.all([
    getProjectSlugsFromDb(),
    getSiteSlugsFromDb(),
    getBlogPostSlugsFromDb(),
    getServiceAreasFromDb(),
    getCategorySlugs(),
    getServicesFromDb(),
    getVideoWatchEntriesFromDb(),
    getServiceDatesForSitemap(),
    getServiceAreaDatesForSitemap(),
  ]);

  // Leaf dates: the row's own updated_at. A row without one gets NO entry in the
  // map, so its URL omits <lastmod> (it used to fall back to the request time,
  // which changed on every crawl).
  const projectDateMap = new Map<string, string>();
  for (const r of projectRows) { const d = iso(r.updatedAt); if (d) projectDateMap.set(r.slug, d); }
  const siteDateMap = new Map<string, string>();
  for (const r of siteRows) { const d = iso(r.updatedAt); if (d) siteDateMap.set(r.slug, d); }
  // Blog <lastmod> runs the SAME honest-dates gate as the page's BlogPosting
  // JSON-LD (lib/blog-dates.ts): a genuine admin content edit → that date;
  // otherwise → the published date. Raw updated_at is never used (bulk scripts
  // stamp it). No date → no entry → no <lastmod>.
  const blogDateMap = new Map<string, string>();
  for (const r of blogPostRows) {
    const { datePublished, dateModified } = resolveBlogDates({
      published_at: r.publishedAt,
      created_at: r.createdAt,
      content_updated_at: r.contentUpdatedAt,
    });
    const d = dateModified ?? datePublished;
    if (d) blogDateMap.set(r.slug, d);
  }

  // Image-URL maps for image-sitemap support (unchanged).
  const projectImageMap = new Map(projectRows.filter(r => r.heroImageUrl).map(r => [r.slug, r.heroImageUrl!]));
  const siteImageMap = new Map(siteRows.filter(r => r.heroImageUrl).map(r => [r.slug, r.heroImageUrl!]));
  const blogImageMap = new Map(blogPostRows.filter(r => r.featuredImageUrl).map(r => [r.slug, r.featuredImageUrl!]));
  const projectSlugs = projectRows.map(r => r.slug);
  const siteSlugs = siteRows.map(r => r.slug);
  const blogPostSlugs = blogPostRows.map(r => r.slug);
  const serviceSlugs = allServices.filter(s => s.showOnServicesPage !== false).map(s => s.slug);

  // Row-level dates for hub pages, keyed the way those pages select their rows.
  const serviceDateMap = new Map<string, string>();
  for (const r of serviceDates) { const d = iso(r.updatedAt); if (d) serviceDateMap.set(r.slug, d); }
  const areaDateMap = new Map<string, string>();
  for (const r of areaDates) { const d = iso(r.updatedAt); if (d) areaDateMap.set(r.slug, d); }
  const projectsByService = new Map<string, string>();       // service_type -> latest project
  const projectsByCity = new Map<string, string>();          // city (lower-case) -> latest project
  const projectsByServiceCity = new Map<string, string>();   // `${service}|${city}` -> latest project
  const bump = (m: Map<string, string>, k: string, d: string) => { const cur = m.get(k); if (!cur || d > cur) m.set(k, d); };
  for (const p of projectRows) {
    const d = iso(p.updatedAt);
    if (!d) continue;
    const city = p.locationCity?.toLowerCase();
    if (p.serviceType) bump(projectsByService, p.serviceType, d);
    if (city) bump(projectsByCity, city, d);
    if (p.serviceType && city) bump(projectsByServiceCity, `${p.serviceType}|${city}`, d);
  }
  const areaCityBySlug = new Map(serviceAreas.map(a => [a.slug, a.name.en.toLowerCase()]));

  const latestOfMap = (m: Map<string, string>) => latestOf(...m.values());
  const dataSourceDate = {
    projects: latestOfMap(projectDateMap),
    sites: latestOfMap(siteDateMap),
    blog: latestOfMap(blogDateMap),
    services: latestOf(...serviceSlugs.map(s => serviceDateMap.get(s))),
    areas: latestOf(...serviceAreas.map(a => areaDateMap.get(a.slug))),
  };

  /** Static page: its code/copy date from git (manifest), plus the rows it lists. */
  const staticPageLastMod = (path: string): string | undefined =>
    latestOf(
      STATIC_PAGE_LASTMOD.pages[path as keyof typeof STATIC_PAGE_LASTMOD.pages]?.lastmod,
      ...(STATIC_PAGE_DATA_SOURCES[path] ?? []).map(src => dataSourceDate[src]),
    );
  /** /services/<slug>/: the service row, and the newest project of that service it features. */
  const serviceHubLastMod = (slug: string) => latestOf(serviceDateMap.get(slug), projectsByService.get(slug));
  /** /projects/<category>/: the newest project in that category (no projects → no lastmod). */
  const categoryLastMod = (category: string) => projectsByService.get(category);
  /** /areas/<slug>/: the area row and the newest project in that city. */
  const areaLastMod = (slug: string) => latestOf(areaDateMap.get(slug), projectsByCity.get(areaCityBySlug.get(slug) ?? ''));
  /** /services/<service>/<area>/ default: the service row, the area row, and projects of that service in that city. */
  const serviceCityLastMod = (service: string, area: string) =>
    latestOf(serviceDateMap.get(service), areaDateMap.get(area), projectsByServiceCity.get(`${service}|${areaCityBySlug.get(area) ?? ''}`));

  return {
    projectRows,
    siteRows,
    blogPostRows,
    serviceAreas,
    categorySlugs,
    videoEntries,
    projectDateMap,
    siteDateMap,
    blogDateMap,
    projectImageMap,
    siteImageMap,
    blogImageMap,
    projectSlugs,
    siteSlugs,
    blogPostSlugs,
    serviceSlugs,
    staticPageLastMod,
    serviceHubLastMod,
    categoryLastMod,
    areaLastMod,
    serviceCityLastMod,
    nativeKeysBySlug: new Map(blogPostRows.map(r => [r.slug, new Set(r.nativeContentKeys ?? [])])),
  };
}

export type SitemapData = Awaited<ReturnType<typeof loadSitemapData>>;

/**
 * Locales a blog post has a NATIVE body for — en/zh always, the rest only when
 * the localizations jsonb carries a content key for them. Untranslated
 * minor-locale blog URLs render an EN fallback and are `robots: noindex`, so
 * submitting them would be a contradictory signal (793 URLs, GSC 2026-07-07).
 * Extracted from the blog loop unchanged.
 */
export function nativeLocalesFor(nativeKeys: Set<string>, locales: readonly string[]): string[] {
  return locales.filter(loc => {
    if (loc === 'en' || loc === 'zh') return true;
    const suffix = LOCALE_TO_DB_SUFFIX[loc as keyof typeof LOCALE_TO_DB_SUFFIX];
    return suffix ? nativeKeys.has(`content${suffix}`) : false;
  });
}
