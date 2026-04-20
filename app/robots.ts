import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/utils';

const BASE_URL = getBaseUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/en/contact/thank-you/',
          '/zh/contact/thank-you/',
          '*/kitchen-e2e-test/',
          '*/kitchen-e2e-test/*',
        ],
      },
      // Explicitly allow AI crawlers for citation/discovery
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'PerplexityBot', 'ClaudeBot', 'Applebot-Extended'],
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
