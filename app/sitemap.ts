import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { serviceTypeToCategory } from '@/lib/data/services';
import { CATEGORY_SLUGS } from '@/lib/data/projects';
import { getBaseUrl } from '@/lib/utils';
import { getProjectSlugsFromDb, getBlogPostSlugsFromDb, getServiceAreasFromDb } from '@/lib/db/queries';
import type { ServiceType } from '@/lib/types';

const BASE_URL = getBaseUrl();
const SERVICE_SLUGS = Object.keys(serviceTypeToCategory) as ServiceType[];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();
  const [projectSlugs, blogPostSlugs, serviceAreas] = await Promise.all([
    getProjectSlugsFromDb(),
    getBlogPostSlugsFromDb(),
    getServiceAreasFromDb(),
  ]);

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
  ];

  // Add static pages for each locale
  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}/`,
        lastModified: now,
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
  for (const slug of SERVICE_SLUGS) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/services/${slug}/`,
        lastModified: now,
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
  for (const slug of SERVICE_SLUGS) {
    for (const area of serviceAreas) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/services/${slug}/${area.slug}/`,
          lastModified: now,
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
  for (const category of CATEGORY_SLUGS) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/projects/${category}/`,
        lastModified: now,
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
  const categorySet = new Set(CATEGORY_SLUGS);
  for (const slug of projectSlugs.filter(s => !categorySet.has(s))) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/projects/${slug}/`,
        lastModified: now,
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
        lastModified: now,
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
        lastModified: now,
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
