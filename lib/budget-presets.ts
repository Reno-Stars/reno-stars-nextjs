/**
 * Canonical budget facet presets for the projects listing.
 *
 * Why presets exist alongside the free slider: arbitrary ?budget=lo-hi values
 * are infinite and get STRIPPED from the canonical (they'd index-bloat), but a
 * finite set of preset buckets are legitimate landing pages ("renovation
 * projects under $30k") — they keep their ?budget=<slug> in the canonical,
 * appear in the page title/description, and the filter chips are real <a>
 * links so crawlers can discover them.
 */
export interface BudgetPreset {
  slug: string;
  min: number;
  /** null = unbounded upper end ("$100K+"). */
  max: number | null;
  /** Language-neutral label (numerals + symbols only). */
  label: string;
}

export const BUDGET_PRESETS: readonly BudgetPreset[] = [
  { slug: 'under-10k', min: 0,      max: 10000,  label: '≤ $10K' },
  { slug: '10k-30k',   min: 10000,  max: 30000,  label: '$10K–$30K' },
  { slug: '30k-60k',   min: 30000,  max: 60000,  label: '$30K–$60K' },
  { slug: '60k-100k',  min: 60000,  max: 100000, label: '$60K–$100K' },
  { slug: 'over-100k', min: 100000, max: null,   label: '$100K+' },
] as const;

/** Sentinel used server-side for unbounded preset maxima. */
export const BUDGET_UNBOUNDED = 100_000_000;

export function presetBySlug(slug: string | undefined): BudgetPreset | undefined {
  return BUDGET_PRESETS.find((p) => p.slug === slug);
}

/** Numeric range a preset filters by (server + client agree on this). */
export function presetRange(p: BudgetPreset): [number, number] {
  return [p.min, p.max ?? BUDGET_UNBOUNDED];
}

/**
 * The preset matching a selection, given the data bounds the selection was
 * clamped to — used to render chip active state and to write the preset slug
 * (not raw numbers) back into the URL.
 */
export function presetForSelection(
  sel: [number, number] | null,
  bounds: [number, number],
): BudgetPreset | undefined {
  if (!sel) return undefined;
  return BUDGET_PRESETS.find((p) => {
    const lo = Math.max(p.min, bounds[0]);
    const hi = Math.min(p.max ?? BUDGET_UNBOUNDED, bounds[1]);
    return sel[0] === lo && sel[1] === hi;
  });
}
