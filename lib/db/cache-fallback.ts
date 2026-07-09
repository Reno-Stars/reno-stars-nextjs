/**
 * Poison-fallback-safe query primitives.
 *
 * The bug this prevents (hit production 2026-07-09): a DB error inside a
 * function wrapped by `unstable_cache` used to be swallowed and its fallback
 * ([], null, a FALLBACK object) RETURNED — so `unstable_cache` stored the
 * fallback as a legitimate value for the whole revalidate window (up to 24h).
 * One transient blip during regeneration emptied nav/footer/areas/llms sitewide
 * until the TTL or a manual tag bust.
 *
 * Fix: `safeQuery` THROWS a `DbQueryError` carrying the fallback. Because
 * `unstable_cache` never persists a rejected fn, nothing is cached. The cache
 * wrappers apply `withFallback` as their OUTERMOST layer, which converts the
 * thrown sentinel back into the fallback value for THIS render only.
 *
 * Uncached direct callers (e.g. the sitemap slug lists that deliberately skip
 * caching for publish-freshness) use `uncachedQuery`, which returns the
 * fallback directly — safe because nothing is cached, so no poison risk.
 */

export class DbQueryError<T> extends Error {
  constructor(public readonly fallback: T, cause: unknown) {
    super('db query failed');
    this.name = 'DbQueryError';
    this.cause = cause;
  }
}

/** Cached-path query: throws a sentinel on error so the cache stores nothing. */
export async function safeQuery<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[db:${label}] query failed, serving fallback (uncached):`, err);
    throw new DbQueryError(fallback, err);
  }
}

/** Uncached-path query: returns the fallback directly (no cache to poison). */
export async function uncachedQuery<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[db:${label}] uncached query failed, returning fallback:`, err);
    return fallback;
  }
}

/**
 * Outermost cache-wrapper layer: turns a thrown `DbQueryError` back into its
 * fallback value. Sitting OUTSIDE `unstable_cache` means the fallback is served
 * to the render but the cache stores nothing, so the next request retries the
 * DB. Any non-`DbQueryError` propagates unchanged.
 */
export function withFallback<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<T>,
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof DbQueryError) return err.fallback as T;
      throw err;
    }
  };
}
