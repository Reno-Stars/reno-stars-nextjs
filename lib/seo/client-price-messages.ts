import { stripPriceMessages } from '@/lib/seo/strip-price-copy';

/**
 * DI-15: EVERY namespace ClientMessages serializes reaches the client
 * price-free — a client component's messages are written into the RSC payload
 * (page source) whether or not the component renders them, so filtering only
 * inside the component (or only `nearMe`) still leaked "$15,000–$72,000" from
 * /financing/ and /services/ (Captain review, task 136 addendum 2).
 * Same rules as the rest of DI-15: insurance (million-level) and government
 * rebate / grant / subsidy amounts STAY. `trust.*` subtrees are company facts
 * (the bare "$5M" liability stat) and are kept as-is.
 * KEEP / UNTOUCHED routes (blog, guides, the 14 test-A pages) opt out with
 * `<ClientMessages keepPrices>`.
 */
const KEEP_SUBTREES: ReadonlySet<string> = new Set(['trust']);

/** Price-strip a picked client message tree (all namespaces). */
export function stripClientPrices(picked: Record<string, unknown>): Record<string, unknown> {
  return stripPriceMessages(picked, KEEP_SUBTREES);
}

/** The only area fields NearMePage renders: a link (slug) and its label (name). */
export interface NearMeAreaLink {
  slug: string;
  name: Record<string, string> & { en: string };
}

/**
 * Project service-area rows down to link data BEFORE they reach the client
 * NearMePage. Passing the full rows serialized every area's long content, in
 * all 14 locales, into the RSC payload (~1 MB, with renovation prices).
 */
export function nearMeAreaLinks(areas: ReadonlyArray<{ slug: string; name: NearMeAreaLink['name'] }>): NearMeAreaLink[] {
  return areas.map(({ slug, name }) => ({ slug, name }));
}
