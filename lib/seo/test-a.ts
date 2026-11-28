import { TEST_A_FROZEN_LASTMOD } from '@/lib/sitemap/lastmod-overrides';

/**
 * SEO TEST A — the 14 /en/ service×city pages of the running experiment.
 *
 * ONE source: the keys of TEST_A_FROZEN_LASTMOD (lib/sitemap/lastmod-overrides.ts),
 * which already freezes their sitemap <lastmod>. Any change that would alter
 * page output (e.g. the DI-15 price removal) must leave these pages on the
 * ORIGINAL code path, byte-identical, until the test is read out.
 */
export const TEST_A_KEYS: readonly string[] = Object.keys(TEST_A_FROZEN_LASTMOD);

const TEST_A = new Set(TEST_A_KEYS);

/** True for `${locale}/services/${service}/${city}` of a TEST A page (en only). */
export function isTestA(locale: string, serviceSlug: string, citySlug: string): boolean {
  return TEST_A.has(`${locale}/services/${serviceSlug}/${citySlug}`);
}
