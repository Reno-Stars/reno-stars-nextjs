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
          // Block test/e2e service pages that leaked to Google index
          '*/kitchen-e2e-test/',
          '*/kitchen-e2e-test/*',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
