import type { DeliveryMode, PlatformId } from './types';

/** Modes whose URL the visitor actually sees and pastes. Tagging these would
 *  hand someone an ugly tracking link to paste into a text message. */
const CLEAN_MODES: ReadonlySet<DeliveryMode> = new Set(['copy', 'native']);

/**
 * Per-target share URL, derived from the page's canonical.
 *
 * The canonical is passed in (from `buildAlternates().canonical`) rather than
 * rebuilt here, so the shared URL cannot drift from the one the page declares
 * to search engines.
 *
 * NOTE: UTM params may form a separate Cloudflare cache key, so tagged inbound
 * links can bypass the 300s HTML edge cache and hit origin. If that shows up in
 * origin load, the fix is an `ignore_query_strings` cache key — not dropping the
 * tags, which are the only way to see what sharing actually returns.
 */
export function buildShareUrl(
  canonical: string,
  target: { id: PlatformId; mode: DeliveryMode },
): string {
  if (CLEAN_MODES.has(target.mode)) return canonical;
  try {
    const url = new URL(canonical);
    url.searchParams.set('utm_source', target.id);
    url.searchParams.set('utm_medium', 'social');
    url.searchParams.set('utm_campaign', 'share');
    return url.toString();
  } catch {
    // Relative or malformed canonical — untagged beats broken.
    return canonical;
  }
}

/** Percent-encode for query strings. Handles RTL text and emoji in titles. */
export const enc = (value: string): string => encodeURIComponent(value);
