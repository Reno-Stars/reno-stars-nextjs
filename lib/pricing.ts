/**
 * SERVICE PRICE SINGLE SOURCE OF TRUTH.
 *
 * Every price range the site states for a SERVICE (kitchen, bathroom, …) is read
 * from this file: ServiceSchema offers, the near-me pages, cost-guide tier cards
 * and cross-links, /llms.txt, the seo-overrides combo metas, and — through the
 * `{kitchenRange}`-style tokens resolved in `i18n/request.ts` — every message
 * string in all 14 locales. To change a price everywhere, change it HERE.
 *
 * Why this exists (2026-09-24): the site stated kitchen as $15K–$72K, $15K–$75K+,
 * $15K–$80K, $20K–$72K and $25K–$150K on different pages. AI answer engines
 * quote whichever copy they crawl, so the contradictions were being repeated
 * back to customers as fact.
 *
 * What is NOT covered (it cannot import a constant): DB-held prose
 * (services.description_*, service_areas.meta_description_*, blog posts), the
 * guide article bodies in messages/<locale>/guides/<guide>.json, and the per-city
 * figures computed from real projects.budget_range rows. See
 * tests/unit/lib/pricing-literal-guard.test.ts for the enforced scope.
 *
 * `approved: false` = a PROPOSAL awaiting the owner's sign-off. Do not flip it
 * without the owner confirming the numbers.
 */

export type PriceSlug =
  | 'kitchen'
  | 'bathroom'
  | 'whole-house'
  | 'basement'
  | 'basement-suite'
  | 'cabinet-refinishing'
  | 'kitchen-cabinets'
  | 'flooring'
  | 'commercial'
  | 'painting';

export interface PriceBand {
  min: number;
  max: number;
  /** Render a trailing "+": real jobs run above `max`. */
  openEnded?: boolean;
}

export interface ServicePrice extends PriceBand {
  /** Middle of the market (≈P25–P75 where invoice-derived). */
  typicalMin?: number;
  typicalMax?: number;
  /** Median job (invoice/estimate data), for "average" stat tiles. */
  median?: number;
  /** Budget / mid / high cards on the cost guides and the guides-index comparison. */
  tiers?: { budget: PriceBand; mid: PriceBand; high: PriceBand };
  /** Where the numbers come from — shown to the owner, not to visitors. */
  source: string;
  /** The owner has signed off on these numbers. */
  approved: boolean;
}

const INVOICE_SOURCE =
  'Reno Stars invoice DB, 2024+ (read-only pull 2026-09-24): paid/completed invoices + latest estimate per client';
const EXISTING_COPY = 'existing site copy — not invoice-verified';

/**
 * Tiers for invoice-derived services are DERIVED from the same percentiles as
 * the headline: budget = P10–P25, mid = P25–P75, high = P75–P90 (open-ended).
 * Writing them by hand is how the tiers and the headline drifted apart before.
 */
function derivedTiers(p: { min: number; max: number; typicalMin: number; typicalMax: number }) {
  return {
    budget: { min: p.min, max: p.typicalMin },
    mid: { min: p.typicalMin, max: p.typicalMax },
    high: { min: p.typicalMax, max: p.max, openEnded: true },
  };
}

const KITCHEN = { min: 13000, max: 30000, typicalMin: 18000, typicalMax: 25000, median: 19700 };
const BATHROOM = { min: 6000, max: 25000, typicalMin: 9000, typicalMax: 18000, median: 12700 };
const WHOLE_HOUSE = { min: 12000, max: 75000, typicalMin: 25000, typicalMax: 65000 };

export const SERVICE_PRICES: Readonly<Record<PriceSlug, ServicePrice>> = {
  kitchen: {
    ...KITCHEN,
    tiers: derivedTiers(KITCHEN),
    source: `${INVOICE_SOURCE}. Estimates n=21 (P10–P90 / P25–P75); only 2 paid kitchen-only invoices (both $19.5K).`,
    approved: false,
  },
  bathroom: {
    ...BATHROOM,
    tiers: derivedTiers(BATHROOM),
    source: `${INVOICE_SOURCE}. Single-bath estimates n=45 (P10–P90 / P25–P75); paid-invoice median $9.5K (n=16) agrees.`,
    approved: false,
  },
  'whole-house': {
    ...WHOLE_HOUSE,
    openEnded: true,
    tiers: derivedTiers(WHOLE_HOUSE),
    source: `${INVOICE_SOURCE}. Paid invoices n=14 (P10≈$11.8K, P25 $23.2K, P75 $65.4K, P90 $73.6K, max $119.5K). Quotes run higher ($30K–$150K, n=52) — owner must pick which to publish.`,
    approved: false,
  },
  flooring: {
    min: 1000,
    max: 11000,
    typicalMin: 2000,
    typicalMax: 6000,
    source: `${INVOICE_SOURCE}. Flooring-only estimates n=18; only 6 invoices.`,
    approved: false,
  },
  basement: {
    min: 30000,
    max: 120000,
    openEnded: true,
    tiers: {
      budget: { min: 30000, max: 50000 },
      mid: { min: 50000, max: 80000 },
      high: { min: 80000, max: 120000, openEnded: true },
    },
    source: `${EXISTING_COPY} (invoice data is bimodal $2.7K–$162K, n=8 — not publishable)`,
    approved: false,
  },
  'basement-suite': {
    min: 60000,
    max: 150000,
    // NOTE: these tier cards were copy-pasted from `basement` on the suite guide
    // and do not sit inside the $60K–$150K headline. Preserved as-is so this
    // change is value-neutral for the uncovered services; the owner decides.
    tiers: {
      budget: { min: 30000, max: 50000 },
      mid: { min: 50000, max: 80000 },
      high: { min: 80000, max: 120000, openEnded: true },
    },
    source: EXISTING_COPY,
    approved: false,
  },
  'cabinet-refinishing': {
    min: 4000,
    max: 15000,
    tiers: {
      budget: { min: 4000, max: 8000 },
      mid: { min: 8000, max: 15000 },
      high: { min: 15000, max: 30000, openEnded: true },
    },
    source: `${EXISTING_COPY} (cabinets n=3 invoices / 8 estimates — too thin)`,
    approved: false,
  },
  'kitchen-cabinets': {
    min: 3000,
    max: 45000,
    openEnded: true,
    source: EXISTING_COPY,
    approved: false,
  },
  commercial: {
    min: 50000,
    max: 1000000,
    openEnded: true,
    tiers: {
      budget: { min: 50000, max: 150000 },
      mid: { min: 150000, max: 400000 },
      high: { min: 400000, max: 1000000, openEnded: true },
    },
    source: `${EXISTING_COPY} (no commercial invoices in the pull)`,
    approved: false,
  },
  painting: {
    min: 5000,
    max: 20000,
    source: `${EXISTING_COPY} (schema only; 0 painting-only invoices)`,
    approved: false,
  },
};

/** DB service slugs → pricing keys (the services table calls it `cabinet`). */
const SERVICE_SLUG_ALIASES: Readonly<Record<string, PriceSlug>> = {
  cabinet: 'cabinet-refinishing',
};

export function resolvePriceSlug(slug: string): PriceSlug | undefined {
  if (slug in SERVICE_PRICES) return slug as PriceSlug;
  return SERVICE_SLUG_ALIASES[slug];
}

export type PriceStyle = 'short' | 'long' | 'wan';

/** $13K, $2.5K, $1M — or $13,000 in the long style. */
export function formatAmount(n: number, style: PriceStyle = 'short'): string {
  if (style === 'long') return `$${n.toLocaleString('en-US')}`;
  if (style === 'wan') {
    const wan = n / 10000;
    return `${Number.isInteger(wan) ? wan : Number(wan.toFixed(1))}万`;
  }
  if (n >= 1_000_000) return `$${trim(n / 1_000_000)}M`;
  if (n >= 1000) return `$${trim(n / 1000)}K`;
  return `$${n}`;
}

function trim(x: number): string {
  return Number.isInteger(x) ? String(x) : String(Number(x.toFixed(1)));
}

/**
 * "$13K–$30K", "$12K–$75K+", or "$13,000–$30,000" (long). The `wan` style gives
 * "1.3万–3万加元" for Chinese prose that wants it, but every current zh surface
 * writes money as "$15K–$72K", so zh uses the default short style.
 */
export function formatBand(band: PriceBand, style: PriceStyle = 'short'): string {
  const plus = band.openEnded ? '+' : '';
  const body = `${formatAmount(band.min, style)}–${formatAmount(band.max, style)}`;
  return style === 'wan' ? `${body}加元${band.openEnded ? '以上' : ''}` : `${body}${plus}`;
}

function entry(slug: PriceSlug): ServicePrice {
  return SERVICE_PRICES[slug];
}

/** Headline range for a service. `locale` is accepted for call-site symmetry. */
export function formatPriceRange(slug: PriceSlug, _locale?: string, style: PriceStyle = 'short'): string {
  return formatBand(entry(slug), style);
}

export function formatPriceTier(
  slug: PriceSlug,
  tier: 'budget' | 'mid' | 'high',
  style: PriceStyle = 'short',
): string {
  const tiers = entry(slug).tiers;
  if (!tiers) throw new Error(`pricing: ${slug} has no tiers`);
  return formatBand(tiers[tier], style);
}

/** Median job for a service ("$19.7K"); undefined when the data has none. */
export function formatMedian(slug: PriceSlug): string | undefined {
  const m = entry(slug).median;
  return m === undefined ? undefined : formatAmount(m);
}

/** schema.org priceSpecification min/max for ServiceSchema. */
export function priceRangeForSchema(slug: string): { min: number; max: number } | undefined {
  const key = resolvePriceSlug(slug);
  if (!key) return undefined;
  const { min, max } = entry(key);
  return { min, max };
}

/** Umbrella band across several services (e.g. /renovation-near-me/). */
export function spanRange(slugs: readonly PriceSlug[]): PriceBand {
  const es = slugs.map(entry);
  const max = Math.max(...es.map((e) => e.max));
  return {
    min: Math.min(...es.map((e) => e.min)),
    max,
    openEnded: es.some((e) => e.max === max && e.openEnded),
  };
}

/** The residential services a general "renovation" range spans. */
export const RESIDENTIAL_SPAN: readonly PriceSlug[] = ['bathroom', 'kitchen', 'basement', 'whole-house'];

/** Message-token prefix per slug: `whole-house` → `wholeHouse`. */
export function tokenPrefix(slug: PriceSlug): string {
  return slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Every `{token}` a message string may use, resolved to its display value.
 * Per service `<p>` (e.g. kitchen, wholeHouse):
 *   <p>Range  <p>From  <p>To      — "$13K–$30K", "$13K", "$30K" ("+" when open-ended)
 *   <p>Typical                     — typical band, when defined
 *   <p>Budget <p>Mid <p>High      — tier bands, when defined
 * plus a `Long` variant of each ("$13,000–$30,000"), and `residentialRange`.
 */
export function priceTokens(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const slug of Object.keys(SERVICE_PRICES) as PriceSlug[]) {
    const p = entry(slug);
    const prefix = tokenPrefix(slug);
    const bands: Record<string, PriceBand> = {
      Range: p,
      From: { min: p.min, max: p.min },
      To: { min: p.max, max: p.max, openEnded: p.openEnded },
    };
    if (p.typicalMin !== undefined && p.typicalMax !== undefined) {
      bands.Typical = { min: p.typicalMin, max: p.typicalMax };
    }
    if (p.tiers) {
      bands.Budget = p.tiers.budget;
      bands.Mid = p.tiers.mid;
      bands.High = p.tiers.high;
    }
    for (const [suffix, band] of Object.entries(bands)) {
      const single = suffix === 'From' || suffix === 'To';
      for (const style of ['short', 'long'] as const) {
        const name = `${prefix}${suffix}${style === 'long' ? 'Long' : ''}`;
        out[name] = single
          ? `${formatAmount(band.min, style)}${band.openEnded ? '+' : ''}`
          : formatBand(band, style);
      }
    }
  }
  out.residentialRange = formatBand(spanRange(RESIDENTIAL_SPAN));
  out.residentialRangeLong = formatBand(spanRange(RESIDENTIAL_SPAN), 'long');
  return out;
}

const TOKEN_RE = /\{([A-Za-z]+)\}/g;

/** Replace known price tokens in one string; ICU args like `{area}` are left alone. */
export function applyPriceTokens(s: string, tokens: Record<string, string> = priceTokens()): string {
  return s.replace(TOKEN_RE, (whole, name: string) => tokens[name] ?? whole);
}

/** Deep-apply price tokens to a messages tree (returns a new tree). */
export function applyPriceTokensDeep<T>(node: T, tokens: Record<string, string> = priceTokens()): T {
  if (typeof node === 'string') return applyPriceTokens(node, tokens) as T;
  if (Array.isArray(node)) return node.map((n) => applyPriceTokensDeep(n, tokens)) as T;
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) out[k] = applyPriceTokensDeep(v, tokens);
    return out as T;
  }
  return node;
}
