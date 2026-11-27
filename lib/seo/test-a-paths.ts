/**
 * Test A URL check + the request header proxy.ts sets on a Test A page.
 * Kept free of message/JSON imports so the proxy bundle stays small; the
 * freeze itself lives in ./test-a-freeze.ts.
 */
import { TEST_A_FROZEN_LASTMOD } from '@/lib/sitemap/lastmod-overrides';

export const TEST_A_HEADER = 'x-rs-test-a';

/** `/en/services/kitchen/richmond/` → true for the 14 Test A URLs only. */
export function isTestAPath(pathname: string): boolean {
  const key = pathname.replace(/^\/+|\/+$/g, '');
  return Object.prototype.hasOwnProperty.call(TEST_A_FROZEN_LASTMOD, key);
}

/** Test A service×city key, from the route params. */
export function isTestAServiceCity(locale: string, serviceSlug: string, city: string): boolean {
  return isTestAPath(`${locale}/services/${serviceSlug}/${city}`);
}
