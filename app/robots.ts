import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/utils';

const BASE_URL = getBaseUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // NOTE: /_next/ and /api/image, /api/og are intentionally crawlable.
        // Blocking /_next/ stops Google/Bing from fetching the JS/CSS needed to
        // render the page; blocking /api/ hid all images (served via /api/image)
        // and OG previews (/api/og). Only the genuinely private API routes are
        // disallowed below.
        disallow: [
          '/api/revalidate',
          '/api/indexnow',
          '/admin/',
          '*/contact/thank-you/',
          '*/invoice/',
          '*/kitchen-e2e-test/',
          '*/kitchen-e2e-test/*',
        ],
      },
      // Explicitly allow AI search/citation crawlers (live retrieval, citation-eligible).
      // Listing them explicitly keeps Bing Copilot / OpenAI / Anthropic / Perplexity
      // from falling through to the catch-all and ensures clear intent.
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'PerplexityBot',
          'ClaudeBot',
          'Claude-Web',
          'Claude-SearchBot',
          'Google-Extended',
          'Applebot-Extended',
          'Bingbot',
        ],
        allow: '/',
        disallow: [
          '/api/revalidate',
          '/api/indexnow',
          '/admin/',
          '*/invoice/',
          '*/contact/thank-you/',
        ],
      },
      // Training-only crawlers — no citation/retrieval benefit. Block them.
      {
        userAgent: ['CCBot', 'anthropic-ai', 'cohere-ai', 'Diffbot', 'omgili', 'omgilibot'],
        disallow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
