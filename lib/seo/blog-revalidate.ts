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

/**
 * Revalidate the post detail page and (by default) the blog list page.
 *
 * - `includeIndex: false` skips the list pages — pass when only the post
 *   body/meta changed (the list cards are unaffected).
 * - `locales` scopes the post-path revalidation to the locales whose rendered
 *   content actually changed; defaults to all locales. The index, when
 *   included, always covers all locales (a new/removed/retitled post shows on
 *   every locale's list).
 */
export function revalidateBlogPaths(
  slug?: string | null,
  opts: { includeIndex?: boolean; locales?: readonly string[] } = {},
): void {
  const includeIndex = opts.includeIndex ?? true;
  const postLocales = opts.locales ?? locales;
  if (includeIndex) {
    for (const loc of locales) revalidatePath(`/${loc}/blog`);
  }
  if (slug) {
    for (const loc of postLocales) revalidatePath(`/${loc}/blog/${slug}`);
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

/**
 * Combined: revalidate ISR + ping search engines after a blog post change.
 *
 * `listingChanged` defaults to true so create / delete / publish-toggle callers
 * (which always change the listing) keep their existing behavior. Plain edits
 * pass the computed value so the blog index is only revalidated when a card
 * field actually changed.
 */
export function refreshBlogPost(
  slug?: string | null,
  opts: { listingChanged?: boolean; locales?: readonly string[] } = {},
): void {
  revalidateBlogPaths(slug, {
    includeIndex: opts.listingChanged ?? true,
    locales: opts.locales,
  });
  // Don't await — we don't want to block the admin save flow on third-party
  // pings. Errors are logged inside pingSearchEngines.
  void pingSearchEngines(slug);
}
