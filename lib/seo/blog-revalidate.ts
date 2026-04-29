/**
 * Helpers for refreshing public blog pages and pinging search engines when
 * a blog post changes. Used by admin actions (and the seo-builder cron via
 * the same actions) so editors can be confident that:
 *   1. The list page + the specific post show fresh content immediately.
 *   2. Bing/Yandex/Naver/Seznam are notified via IndexNow.
 *   3. Google gets a sitemap ping.
 *
 * These are scoped to specific paths so we don't blow Vercel's ISR budget
 * (which the old `revalidatePath('/', 'layout')` pattern was doing).
 */
import { revalidatePath } from 'next/cache';
import { locales } from '@/i18n/config';
import { getBaseUrl } from '@/lib/utils';

const BASE_URL = getBaseUrl();
const INDEXNOW_KEY = 'deb16e016b38665b452c0ee3f58c1d15';

/** Revalidate the blog list and the specific post across every locale. */
export function revalidateBlogPaths(slug?: string | null): void {
  for (const loc of locales) {
    revalidatePath(`/${loc}/blog`);
    if (slug) revalidatePath(`/${loc}/blog/${slug}`);
  }
}

/**
 * Ping IndexNow (Bing + Yandex + Naver + Seznam) and Google's sitemap
 * endpoint with the post URLs across every locale. Fire-and-forget — never
 * blocks or throws on the admin save path.
 */
export async function pingSearchEngines(slug?: string | null): Promise<void> {
  if (!slug) return;
  const urls = locales.map((loc) => `${BASE_URL}/${loc}/blog/${slug}`);

  // IndexNow — Bing, Yandex, Naver, Seznam
  const indexnowPayload = {
    host: new URL(BASE_URL).host,
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };
  const indexnowPromise = fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(indexnowPayload),
  }).catch((e) => console.error('[search-engines] IndexNow ping failed:', e));

  // Google sitemap ping — re-announces the sitemap so Google notices the
  // updated lastmod for affected URLs faster than its normal schedule.
  const sitemapUrl = encodeURIComponent(`${BASE_URL}/sitemap.xml`);
  const googlePromise = fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`)
    .catch((e) => console.error('[search-engines] Google sitemap ping failed:', e));

  await Promise.all([indexnowPromise, googlePromise]);
}

/** Combined: revalidate ISR + ping search engines after a blog post change. */
export function refreshBlogPost(slug?: string | null): void {
  revalidateBlogPaths(slug);
  // Don't await — we don't want to block the admin save flow on third-party
  // pings. Errors are logged inside pingSearchEngines.
  void pingSearchEngines(slug);
}
