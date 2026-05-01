import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { getBaseUrl } from '@/lib/utils';
import { getProjectSlugsFromDb, getSiteSlugsFromDb, getBlogPostSlugsFromDb, getServiceAreasFromDb, getCategorySlugs, getServicesFromDb } from '@/lib/db/queries';

export const revalidate = 604800; // 168h — bumped to reduce ISR writes (Vercel free-tier optimization)

const BASE_URL = getBaseUrl();

/**
 * Build a per-page lastmod from DB row timestamps + priority/changefreq
 * buckets. Google states they ignore priority/changefreq (per public docs)
 * but Bing, Yandex, and DuckDuckGo do use them. Cost is zero, signal is
 * real for non-Google search engines and crawl-budget heuristics.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();
  const [projectRows, siteRows, blogPostRows, serviceAreas, categorySlugs, allServices] = await Promise.all([
    getProjectSlugsFromDb(),
    getSiteSlugsFromDb(),
    getBlogPostSlugsFromDb(),
    getServiceAreasFromDb(),
    getCategorySlugs(),
    getServicesFromDb(),
  ]);
  const projectDateMap = new Map(projectRows.map(r => [r.slug, r.updatedAt?.toISOString() ?? now]));
  const siteDateMap = new Map(siteRows.map(r => [r.slug, r.updatedAt?.toISOString() ?? now]));
  const blogDateMap = new Map(blogPostRows.map(r => [r.slug, r.updatedAt?.toISOString() ?? now]));
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

  const entries: MetadataRoute.Sitemap = [];

  // Priority buckets — see comment at top of file. Cost zero, signal real for non-Google.
  const PRIORITY = {
    home: 1.0,
    hub: 0.9,
    guide: 0.85,
    serviceArea: 0.8,
    area: 0.8,
    serviceLeaf: 0.75,
    projectLeaf: 0.7,
    blog: 0.65,
    secondary: 0.5,
  } as const;

  // Pages that change "weekly" (curated content), monthly (catalog), yearly (legal).
  const CHANGEFREQ = {
    weekly: 'weekly' as const,
    monthly: 'monthly' as const,
    yearly: 'yearly' as const,
  };

  const staticPages: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '',                                                priority: PRIORITY.home,      changeFrequency: CHANGEFREQ.weekly },
    { path: '/services',                                       priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.weekly },
    { path: '/projects',                                       priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.weekly },
    { path: '/blog',                                           priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.weekly },
    { path: '/areas',                                          priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.monthly },
    { path: '/guides',                                         priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.weekly },
    { path: '/about',                                          priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.monthly },
    { path: '/design',                                         priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.monthly },
    { path: '/features',                                       priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.monthly },
    { path: '/contact',                                        priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.yearly },
    { path: '/workflow',                                       priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.yearly },
    { path: '/showroom',                                       priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.monthly },
    { path: '/reviews',                                        priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.weekly },
    { path: '/guides/kitchen-renovation-cost-vancouver',       priority: PRIORITY.guide,     changeFrequency: CHANGEFREQ.monthly },
    { path: '/guides/bathroom-renovation-cost-vancouver',      priority: PRIORITY.guide,     changeFrequency: CHANGEFREQ.monthly },
    { path: '/guides/whole-house-renovation-cost-vancouver',   priority: PRIORITY.guide,     changeFrequency: CHANGEFREQ.monthly },
    { path: '/guides/basement-renovation-cost-vancouver',      priority: PRIORITY.guide,     changeFrequency: CHANGEFREQ.monthly },
    { path: '/guides/commercial-renovation-cost-vancouver',    priority: PRIORITY.guide,     changeFrequency: CHANGEFREQ.monthly },
    { path: '/guides/cabinet-refinishing-cost-vancouver',      priority: PRIORITY.guide,     changeFrequency: CHANGEFREQ.monthly },
    { path: '/guides/basement-suite-cost-vancouver',           priority: PRIORITY.guide,     changeFrequency: CHANGEFREQ.monthly },
    { path: '/financing',                                      priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.yearly },
    { path: '/before-after',                                   priority: PRIORITY.hub,       changeFrequency: CHANGEFREQ.monthly },
    { path: '/privacy',                                        priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.yearly },
    { path: '/terms',                                          priority: PRIORITY.secondary, changeFrequency: CHANGEFREQ.yearly },
  ];

  // Generate hreflang alternates for every supported locale. Driven by
  // i18n/config.ts locales array so adding a new locale automatically
  // expands the sitemap without further edits here.
  const buildAlternates = (path: string) => {
    const languages: Record<string, string> = {};
    for (const loc of locales) {
      languages[loc] = `${BASE_URL}/${loc}${path}/`;
    }
    languages['x-default'] = `${BASE_URL}/en${path}/`;
    return { languages };
  };

  for (const { path, priority, changeFrequency } of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}/`,
        lastModified: staticLastModified,
        alternates: buildAlternates(path),
        priority,
        changeFrequency,
      });
    }
  }

  for (const slug of serviceSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/services/${slug}/`,
        lastModified: staticLastModified,
        alternates: buildAlternates(`/services/${slug}`),
        priority: PRIORITY.serviceLeaf,
        changeFrequency: CHANGEFREQ.monthly,
      });
    }
  }

  for (const slug of serviceSlugs) {
    for (const area of serviceAreas) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/services/${slug}/${area.slug}/`,
          lastModified: areaLastModMap.get(area.slug) ?? staticLastModified,
          alternates: buildAlternates(`/services/${slug}/${area.slug}`),
          priority: PRIORITY.serviceArea,
          changeFrequency: CHANGEFREQ.monthly,
        });
      }
    }
  }

  for (const category of categorySlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/projects/${category}/`,
        lastModified: staticLastModified,
        alternates: buildAlternates(`/projects/${category}`),
        priority: PRIORITY.hub,
        changeFrequency: CHANGEFREQ.monthly,
      });
    }
  }

  const categorySet = new Set(categorySlugs);
  for (const slug of projectSlugs.filter(s => !categorySet.has(s))) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/projects/${slug}/`,
        lastModified: projectDateMap.get(slug) ?? now,
        alternates: buildAlternates(`/projects/${slug}`),
        priority: PRIORITY.projectLeaf,
        changeFrequency: CHANGEFREQ.yearly,
      });
    }
  }

  const projectSlugSet = new Set(projectSlugs);
  for (const slug of siteSlugs.filter(s => !projectSlugSet.has(s))) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/projects/${slug}/`,
        lastModified: siteDateMap.get(slug) ?? now,
        alternates: buildAlternates(`/projects/${slug}`),
        priority: PRIORITY.projectLeaf,
        changeFrequency: CHANGEFREQ.yearly,
      });
    }
  }

  for (const slug of blogPostSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}/`,
        lastModified: blogDateMap.get(slug) ?? now,
        alternates: buildAlternates(`/blog/${slug}`),
        priority: PRIORITY.blog,
        changeFrequency: CHANGEFREQ.monthly,
      });
    }
  }

  for (const area of serviceAreas) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/areas/${area.slug}/`,
        lastModified: areaLastModMap.get(area.slug) ?? staticLastModified,
        alternates: buildAlternates(`/areas/${area.slug}`),
        priority: PRIORITY.area,
        changeFrequency: CHANGEFREQ.monthly,
      });
    }
  }

  return entries;
}
