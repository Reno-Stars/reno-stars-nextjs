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
} from '@/lib/db/queries';

/**
 * Loads every row the sitemap sections derive their URLs from.
 *
 * Lifted VERBATIM from the former single-function `app/sitemap.ts` (2026-09-02)
 * when the sitemap was split into per-file sections. The queries, the honest
 * blog-date gate, the image maps and the per-area lastmod are unchanged.
 *
 * Each sitemap FILE calls this once. That is deliberate: the rows are small
 * (slugs + timestamps + one image URL each), whereas what actually exhausted
 * the pod's heap was expanding 5,825 URLs x 14 hreflang alternates into entry
 * objects and serialising 12.3 MB of XML in a single request. Splitting the
 * ENTRY building is what bounds the memory; re-reading a few thousand slug rows
 * per file is cheap now that Postgres is in-cluster.
 */
export async function loadSitemapData() {
  const now = new Date().toISOString();
  const [projectRows, siteRows, blogPostRows, serviceAreas, categorySlugs, allServices, videoEntries] = await Promise.all([
    getProjectSlugsFromDb(),
    getSiteSlugsFromDb(),
    getBlogPostSlugsFromDb(),
    getServiceAreasFromDb(),
    getCategorySlugs(),
    getServicesFromDb(),
    getVideoWatchEntriesFromDb(),
  ]);
  const projectDateMap = new Map(projectRows.map(r => [r.slug, r.updatedAt?.toISOString() ?? now]));
  const siteDateMap = new Map(siteRows.map(r => [r.slug, r.updatedAt?.toISOString() ?? now]));
  // Blog <lastmod> runs the SAME honest-dates gate as the page's BlogPosting
  // JSON-LD (lib/blog-dates.ts): a genuine admin content edit (content_updated_at
  // meaningfully after publication) → that edit date; otherwise → the published
  // date. Raw updated_at here previously advertised bulk-script stamps (29 posts
  // shared one 2026-07-10 stamp) as freshness while the pages themselves omitted
  // dateModified — contradictory signals to Google on the same URLs (2026-07-13
  // review finding). content_updated_at is a plain column read, so this no longer
  // costs the O(n^2) cluster subquery it used to (finding #28).
  const blogDateMap = new Map(blogPostRows.map(r => {
    const { datePublished, dateModified } = resolveBlogDates({
      published_at: r.publishedAt,
      created_at: r.createdAt,
      content_updated_at: r.contentUpdatedAt,
    });
    return [r.slug, dateModified ?? datePublished ?? now];
  }));

  // Image-URL maps for image-sitemap support. Next.js MetadataRoute.Sitemap
  // accepts an `images: string[]` field per entry — the renderer adds the
  // `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"` namespace
  // and emits `<image:image><image:loc>URL</image:loc></image:image>` per
  // image. Lifts image-search traffic (Google Images, Bing Visual Search)
  // for renovation project galleries + blog hero images + service-area
  // city photos. Verified Next.js sitemap renderer supports this at
  // node_modules/next/dist/build/webpack/loaders/metadata/resolve-route-data.js:109.
  const projectImageMap = new Map(projectRows.filter(r => r.heroImageUrl).map(r => [r.slug, r.heroImageUrl!]));
  const siteImageMap = new Map(siteRows.filter(r => r.heroImageUrl).map(r => [r.slug, r.heroImageUrl!]));
  const blogImageMap = new Map(blogPostRows.filter(r => r.featuredImageUrl).map(r => [r.slug, r.featuredImageUrl!]));
  const projectSlugs = projectRows.map(r => r.slug);
  const siteSlugs = siteRows.map(r => r.slug);
  const blogPostSlugs = blogPostRows.map(r => r.slug);
  const serviceSlugs = allServices.filter(s => s.showOnServicesPage !== false).map(s => s.slug);

  // Use the latest DB timestamp as the lastmod for static pages — gives Google
  // a real "site updated" signal that moves when content changes.
  const allDates = [
    ...Array.from(projectDateMap.values()),
    ...Array.from(siteDateMap.values()),
    ...Array.from(blogDateMap.values()),
  ];
  const staticLastModified = allDates.length > 0
    ? allDates.sort().slice(-1)[0]
    : now;

  // Per-area lastmod: latest project updatedAt where the project's location
  // matches the area name. Falls back to staticLastModified for areas with
  // no completed projects yet.
  const areaLastModMap = new Map<string, string>();
  for (const area of serviceAreas) {
    const cityName = area.name.en.toLowerCase();
    const latestProjectDate = projectRows
      .filter(p => p.locationCity?.toLowerCase() === cityName)
      .map(p => p.updatedAt?.toISOString() ?? '')
      .filter(Boolean)
      .sort()
      .slice(-1)[0];
    areaLastModMap.set(area.slug, latestProjectDate || staticLastModified);
  }

  return {
    now,
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
    staticLastModified,
    areaLastModMap,
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
