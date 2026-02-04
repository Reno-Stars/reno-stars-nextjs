import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { serviceTypeToCategory } from '@/lib/data/services';
import { serviceAreas } from '@/lib/data/areas';
import { projects, CATEGORY_SLUGS } from '@/lib/data/projects';
import { blogPosts } from '@/lib/data';
import { getBaseUrl } from '@/lib/utils';
import type { ServiceType } from '@/lib/types';

const BASE_URL = getBaseUrl();
const SERVICE_SLUGS = Object.keys(serviceTypeToCategory) as ServiceType[];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

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
  for (const project of projects) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/projects/${project.slug}/`,
        lastModified: project.published_at?.toISOString() || now,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/projects/${project.slug}/`,
            zh: `${BASE_URL}/zh/projects/${project.slug}/`,
            'x-default': `${BASE_URL}/en/projects/${project.slug}/`,
          },
        },
      });
    }
  }

  // Blog posts
  for (const post of blogPosts) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}/`,
        lastModified: post.published_at?.toISOString() || now,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: {
            en: `${BASE_URL}/en/blog/${post.slug}/`,
            zh: `${BASE_URL}/zh/blog/${post.slug}/`,
            'x-default': `${BASE_URL}/en/blog/${post.slug}/`,
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
