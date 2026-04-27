import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { getBaseUrl } from '@/lib/utils';
import { getProjectSlugsFromDb, getSiteSlugsFromDb, getBlogPostSlugsFromDb, getServiceAreasFromDb, getCategorySlugs, getServicesFromDb } from '@/lib/db/queries';

export const revalidate = 21600; // 6h

const BASE_URL = getBaseUrl();

/**
 * Build a per-page lastmod from a stable build/revalidation timestamp.
 * Google ignores priority/changefreq (per their public docs), so those are
 * intentionally omitted to keep the sitemap small and signal-clean.
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

  const entries: MetadataRoute.Sitemap = [];

  const staticPages = [
    '',
    '/services',
    '/projects',
    '/about',
    '/design',
    '/features',
    '/blog',
    '/contact',
    '/workflow',
    '/areas',
    '/showroom',
    '/reviews',
    '/guides',
    '/guides/kitchen-renovation-cost-vancouver',
    '/guides/bathroom-renovation-cost-vancouver',
    '/guides/whole-house-renovation-cost-vancouver',
    '/guides/basement-renovation-cost-vancouver',
    '/guides/commercial-renovation-cost-vancouver',
    '/guides/cabinet-refinishing-cost-vancouver',
    '/guides/basement-suite-cost-vancouver',
    '/financing',
    '/before-after',
    '/privacy',
    '/terms',
  ];

  const buildAlternates = (path: string) => ({
    languages: {
      en: `${BASE_URL}/en${path}/`,
      zh: `${BASE_URL}/zh${path}/`,
      ja: `${BASE_URL}/ja${path}/`,
      ko: `${BASE_URL}/ko${path}/`,
      es: `${BASE_URL}/es${path}/`,
      'x-default': `${BASE_URL}/en${path}/`,
    },
  });

  for (const path of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}/`,
        lastModified: staticLastModified,
        alternates: buildAlternates(path),
      });
    }
  }

  for (const slug of serviceSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/services/${slug}/`,
        lastModified: staticLastModified,
        alternates: buildAlternates(`/services/${slug}`),
      });
    }
  }

  for (const slug of serviceSlugs) {
    for (const area of serviceAreas) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/services/${slug}/${area.slug}/`,
          lastModified: staticLastModified,
          alternates: buildAlternates(`/services/${slug}/${area.slug}`),
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
      });
    }
  }

  for (const slug of blogPostSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}/`,
        lastModified: blogDateMap.get(slug) ?? now,
        alternates: buildAlternates(`/blog/${slug}`),
      });
    }
  }

  for (const area of serviceAreas) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/areas/${area.slug}/`,
        lastModified: staticLastModified,
        alternates: buildAlternates(`/areas/${area.slug}`),
      });
    }
  }

  return entries;
}
