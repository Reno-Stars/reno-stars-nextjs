import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { withFallback } from './cache-fallback';

/**
 * Two-layer query caching wrappers shared by every domain query module.
 * Extracted from queries.ts (2026-07-09 split). withFallback (cache-fallback.ts)
 * makes them poison-fallback-safe: a DbQueryError thrown by safeQuery is caught
 * here and the fallback served WITHOUT being cached.
 */

/**
 * Default TTL for every cached query.
 *
 * Was 86400 (24h). That was sized for the Vercel/Neon era, where the point was
 * to deduplicate billable Neon hits across Lambda invocations — the comments on
 * the wrappers below still describe that world. Postgres is now in-cluster
 * (renostars-website-pg), so a cache miss is a local round trip and the old
 * cost argument no longer applies.
 *
 * It has to come down before the deployment runs more than one replica.
 * `revalidatePath`/`updateTag` only invalidate the pod that handled the admin
 * action; any other pod keeps serving its own cached rows until they expire on
 * their own. At 24h that meant published content could be invisible on a pod
 * for a day. 300s bounds that divergence to five minutes — the same window as
 * the Cloudflare HTML edge cache the site already runs behind, so it adds no
 * staleness a visitor could actually observe.
 */
export const DEFAULT_REVALIDATE_SECONDS = 300;

/**
 * Wrap a layout-level / high-traffic query in BOTH layers of caching:
 * - `unstable_cache` shares the result across all Lambda invocations
 *   within the revalidate window (deduplicates Neon hits across requests).
 * - `cache` (from react) dedupes within a single render tree (covers
 *   the case where the same function gets called from layout + page).
 *
 * Order matters: react `cache()` must be the OUTER wrapper so it sees
 * each render-pass invocation; `unstable_cache` is the INNER store
 * that persists across renders.
 *
 * Default revalidate is DEFAULT_REVALIDATE_SECONDS — see the constant.
 * Admin server actions call `revalidatePath`, which invalidates the
 * unstable_cache entries on the affected paths IN THE PROCESS THAT HANDLES
 * THE ACTION — which is why the default TTL, not the invalidation, is what
 * bounds staleness once more than one replica is running.
 */
export function cachedQuery<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  options: { revalidate?: number; tags?: string[] } = {},
): () => Promise<T> {
  // unstable_cache reads from Next's AsyncLocalStorage incrementalCache.
  // tsx scripts (seed jobs, migrations, CLI tools) run outside that context
  // and would crash with "Invariant: incrementalCache missing". Fall back
  // to react.cache() — single-process dedup is fine for one-shot scripts.
  if (!process.env.NEXT_RUNTIME) return withFallback(cache(fn));
  const wrapped = unstable_cache(fn, keyParts, {
    revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS,
    tags: options.tags,
  });
  return withFallback(cache(wrapped));
}

/**
 * Same caching contract as `cachedQuery` but for queries that take an
 * argument (slug, id, city name). unstable_cache automatically appends
 * runtime args to the cache key, so `getProjectsByAreaFromDb('Burnaby')`
 * and `getProjectsByAreaFromDb('Vancouver')` end up in distinct entries.
 */
export function cachedQueryWithArgs<A extends string, T>(
  fn: (arg: A) => Promise<T>,
  keyParts: string[],
  options: { revalidate?: number; tags?: string[] } = {},
): (arg: A) => Promise<T> {
  if (!process.env.NEXT_RUNTIME) return withFallback(cache(fn));
  const wrapped = unstable_cache(fn, keyParts, {
    revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS,
    tags: options.tags,
  });
  return withFallback(cache(wrapped));
}

/**
 * Per-slug cached query with FINE-GRAINED tags.
 *
 * Each slug gets its own unstable_cache instance tagged with both the
 * broad invalidation tag(s) (e.g. 'projects') AND a narrow per-slug tag
 * (e.g. 'project:burnaby-whole-house-renovation'). Admin actions can
 * fire `updateTag('project:${slug}')` on edits and only invalidate the
 * affected detail page's cache, instead of blowing away every cached
 * project page on every edit.
 *
 * Implementation note: unstable_cache's `tags` option is static at
 * factory-call time — there's no per-call tag function in the Next.js
 * API. To get dynamic tags we build the unstable_cache instance lazily
 * inside the wrapper, keyed by [...keyParts, slug] so all Lambdas hit
 * the same cache entry for the same slug. The factory call itself is
 * cheap; the actual cache lookup happens inside the returned wrapped().
 */
export function cachedQueryPerSlug<T>(
  fn: (slug: string) => Promise<T>,
  baseKey: string,
  options: { revalidate?: number; broadTags?: string[]; tagPrefix?: string } = {},
): (slug: string) => Promise<T> {
  if (!process.env.NEXT_RUNTIME) return withFallback(cache(fn));
  return withFallback(cache(async (slug: string) => {
    const wrapped = unstable_cache(
      () => fn(slug),
      [baseKey, slug],
      {
        revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS,
        tags: [
          ...(options.broadTags ?? []),
          `${options.tagPrefix ?? baseKey}:${slug}`,
        ],
      },
    );
    return wrapped();
  }));
}

/**
 * Per-(slug, locale) cached query with locale-scoped tags.
 *
 * Like `cachedQueryPerSlug` but partitions the cache by locale so a single
 * locale's page can be invalidated without regenerating the other 13. Each
 * entry carries TWO tags:
 *   - `${tagPrefix}:${slug}`          — broad: busts all locales (create/delete)
 *   - `${tagPrefix}:${slug}:${locale}` — narrow: busts just this locale
 *
 * `fn` still receives only the slug (the row is locale-independent; the page
 * localizes the returned value). The locale only partitions the cache + tags,
 * so an MT backfill that touches one locale no longer fans out to all 14.
 */
export function cachedQueryPerSlugLocale<T>(
  fn: (slug: string) => Promise<T>,
  baseKey: string,
  options: { revalidate?: number; tagPrefix?: string } = {},
): (slug: string, locale: string) => Promise<T> {
  if (!process.env.NEXT_RUNTIME) return withFallback(cache((slug: string, _locale: string) => fn(slug)));
  return withFallback(cache(async (slug: string, locale: string) => {
    const prefix = options.tagPrefix ?? baseKey;
    const wrapped = unstable_cache(
      () => fn(slug),
      [baseKey, slug, locale],
      {
        revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS,
        tags: [`${prefix}:${slug}`, `${prefix}:${slug}:${locale}`],
      },
    );
    return wrapped();
  }));
}
