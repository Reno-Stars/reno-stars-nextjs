import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { getBaseUrl } from '@/lib/utils';
import { getProjectSlugsFromDb, getSiteSlugsFromDb, getBlogPostSlugsFromDb, getServiceAreasFromDb, getServiceTypeToCategory, getCategorySlugs } from '@/lib/db/queries';

const BASE_URL = getBaseUrl();

/** Fixed date for static pages — avoids misleading "updated" signals on every deploy */
const STATIC_LAST_MODIFIED = '2026-03-17';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();
  const [projectRows, siteRows, blogPostRows, serviceAreas, serviceTypeMap, categorySlugs] = await Promise.all([
    getProjectSlugsFromDb(),
    getSiteSlugsFromDb(),
    getBlogPostSlugsFromDb(),
    getServiceAreasFromDb(),
    getServiceTypeToCategory(),
    getCategorySlugs(),
  ]);
  const projectDateMap = new Map(projectRows.map(r => [r.slug, r.updatedAt?.toISOString() ?? now]));
  const siteDateMap = new Map(siteRows.map(r => [r.slug, r.updatedAt?.toISOString() ?? now]));
  const blogDateMap = new Map(blogPostRows.map(r => [r.slug, r.updatedAt?.toISOString() ?? now]));
  const projectSlugs = projectRows.map(r => r.slug);
  const siteSlugs = siteRows.map(r => r.slug);
  const blogPostSlugs = blogPostRows.map(r => r.slug);
  const serviceSlugs = Object.keys(serviceTypeMap);

  const entries: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/services', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/projects', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/design', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/benefits', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/process', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/areas', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/showroom', priority: 0.7, changeFrequency: 'monthly' as const },
  ];

  // Add static pages for each locale
  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}/`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            en: `${BASE_URL}/en${page.path}/`,
            zh: `${BASE_URL}/zh${page.path}/`,
            'x-default': `${BASE_URL}/en${page.path}/`,
          },
        },
      });
    }
  }

  // Service pages
  for (const slug of serviceSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/services/${slug}/`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/services/${slug}/`,
            zh: `${BASE_URL}/zh/services/${slug}/`,
            'x-default': `${BASE_URL}/en/services/${slug}/`,
          },
        },
      });
    }
  }

  // Service + Location combination pages
  for (const slug of serviceSlugs) {
    for (const area of serviceAreas) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/services/${slug}/${area.slug}/`,
          lastModified: STATIC_LAST_MODIFIED,
          changeFrequency: 'monthly',
          priority: 0.7,
          alternates: {
            languages: {
              en: `${BASE_URL}/en/services/${slug}/${area.slug}/`,
              zh: `${BASE_URL}/zh/services/${slug}/${area.slug}/`,
              'x-default': `${BASE_URL}/en/services/${slug}/${area.slug}/`,
            },
          },
        });
      }
    }
  }

  // Project category pages
  for (const category of categorySlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/projects/${category}/`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/projects/${category}/`,
            zh: `${BASE_URL}/zh/projects/${category}/`,
            'x-default': `${BASE_URL}/en/projects/${category}/`,
          },
        },
      });
    }
  }

  // Individual project pages
  const categorySet = new Set(categorySlugs);
  for (const slug of projectSlugs.filter(s => !categorySet.has(s))) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/projects/${slug}/`,
        lastModified: projectDateMap.get(slug) ?? now,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/projects/${slug}/`,
            zh: `${BASE_URL}/zh/projects/${slug}/`,
            'x-default': `${BASE_URL}/en/projects/${slug}/`,
          },
        },
      });
    }
  }

  // Site pages (whole-house projects displayed as /projects/{site-slug}/)
  const projectSlugSet = new Set(projectSlugs);
  for (const slug of siteSlugs.filter(s => !projectSlugSet.has(s))) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/projects/${slug}/`,
        lastModified: siteDateMap.get(slug) ?? now,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/projects/${slug}/`,
            zh: `${BASE_URL}/zh/projects/${slug}/`,
            'x-default': `${BASE_URL}/en/projects/${slug}/`,
          },
        },
      });
    }
  }

  // Blog posts
  for (const slug of blogPostSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}/`,
        lastModified: blogDateMap.get(slug) ?? now,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/blog/${slug}/`,
            zh: `${BASE_URL}/zh/blog/${slug}/`,
            'x-default': `${BASE_URL}/en/blog/${slug}/`,
          },
        },
      });
    }
  }

  // Service area pages
  for (const area of serviceAreas) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/areas/${area.slug}/`,
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/areas/${area.slug}/`,
            zh: `${BASE_URL}/zh/areas/${area.slug}/`,
            'x-default': `${BASE_URL}/en/areas/${area.slug}/`,
          },
        },
      });
    }
  }

  return entries;
}
