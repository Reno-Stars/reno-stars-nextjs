import { connection } from 'next/server';
import { isCachedLocale } from '@/i18n/config';

/**
 * Opt the current render out of the ISR / Full-Route Cache for long-tail
 * locales (anything NOT in CACHED_LOCALES). Touching a dynamic API
 * (`connection()`) makes the route render dynamically (SSR per request) and
 * write NOTHING to the ISR cache.
 *
 * Why: the ~5k+ non-EN detail pages (areas/projects/blog × 10 long-tail
 * locales) are too numerous to stay warm in Vercel's ISR cache, so they were
 * continuously EVICTED and re-generated on crawl — the dominant ISR-Write cost
 * (sustained ~10K write-units/hr baseline + full re-gen on every deploy wipe).
 * Per GSC (28d) those 10 locales own ~13% of organic clicks (fr alone: 2,393
 * impressions → 1 click). Rendering them dynamically keeps crawlers served full
 * SSR HTML (SEO-neutral) while generating ZERO ISR writes. Cached locales
 * (en/zh/zh-Hant/ko, ~86.5% of clicks) skip this and keep ISR.
 *
 * CRITICAL: the route calling this MUST NOT export `revalidate` (route-level
 * ISR). A dynamic API on an ISR route throws `DYNAMIC_SERVER_USAGE` during
 * Vercel's background regeneration (confirmed in prod: digest
 * DYNAMIC_SERVER_USAGE, PR #129). These detail routes already surface edits via
 * on-demand revalidation (`/api/revalidate` + the admin server actions), so the
 * removed TTL floor changes nothing operationally.
 *
 * Build/prerender is unaffected — these locales were never prerendered
 * (generateStaticParams only emits PRERENDERED_LOCALES); they always rendered
 * on first request.
 */
export async function optOutISRForLongTailLocale(locale: string): Promise<void> {
  if (!isCachedLocale(locale)) {
    await connection();
  }
}
