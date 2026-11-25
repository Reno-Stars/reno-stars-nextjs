import { stripPriceMessages } from '@/lib/seo/strip-price-copy';

/**
 * DI-15: namespaces whose copy must reach the client price-free. NearMePage is
 * a client component, so filtering only inside it would still serialize the
 * raw prices into the RSC payload / page source. `trust.*` is a company fact
 * (the bare "$5M" liability stat) and is kept. Test-A pages never ship nearMe.
 */
const PRICE_FREE_NAMESPACES: Readonly<Record<string, ReadonlySet<string>>> = {
  nearMe: new Set(['trust']),
};

/** Price-strip the PRICE_FREE_NAMESPACES present in a picked message tree. */
export function stripClientPrices(picked: Record<string, unknown>): Record<string, unknown> {
  let out = picked;
  for (const [ns, skip] of Object.entries(PRICE_FREE_NAMESPACES)) {
    if (out[ns] !== undefined) out = { ...out, [ns]: stripPriceMessages(out[ns], skip) };
  }
  return out;
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
