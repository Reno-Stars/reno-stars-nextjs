import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { parse } from '@formatjs/icu-messageformat-parser';
import {
  SERVICE_PRICES,
  formatAmount,
  formatBand,
  formatPriceRange,
  formatPriceTier,
  priceRangeForSchema,
  priceTokens,
  applyPriceTokens,
  applyPriceTokensDeep,
  spanRange,
  resolvePriceSlug,
  RESIDENTIAL_SPAN,
  type PriceSlug,
} from '@/lib/pricing';
import { namespaces } from '@/i18n/namespaces';
import { guideSections } from '@/i18n/guideSections';

const SLUGS = Object.keys(SERVICE_PRICES) as PriceSlug[];

describe('SERVICE_PRICES — data integrity', () => {
  it.each(SLUGS)('%s is a sane band with a stated source', (slug) => {
    const p = SERVICE_PRICES[slug];
    expect(p.min).toBeGreaterThan(0);
    expect(p.max).toBeGreaterThan(p.min);
    expect(p.source.length).toBeGreaterThan(10);
    if (p.typicalMin !== undefined || p.typicalMax !== undefined) {
      expect(p.typicalMin).toBeGreaterThanOrEqual(p.min);
      expect(p.typicalMax).toBeLessThanOrEqual(p.max);
      expect(p.typicalMax!).toBeGreaterThan(p.typicalMin!);
    }
    if (p.median !== undefined) {
      expect(p.median).toBeGreaterThanOrEqual(p.min);
      expect(p.median).toBeLessThanOrEqual(p.max);
    }
    for (const t of Object.values(p.tiers ?? {})) expect(t.max).toBeGreaterThan(t.min);
  });

  it('invoice-derived tiers tile the headline band exactly (no hand-typed drift)', () => {
    for (const slug of ['kitchen', 'bathroom', 'whole-house'] as const) {
      const p = SERVICE_PRICES[slug];
      expect(p.tiers!.budget.min).toBe(p.min);
      expect(p.tiers!.budget.max).toBe(p.typicalMin);
      expect(p.tiers!.mid).toMatchObject({ min: p.typicalMin, max: p.typicalMax });
      expect(p.tiers!.high).toMatchObject({ min: p.typicalMax, max: p.max });
    }
  });

  it('nothing is marked approved until the owner signs off', () => {
    // Flip deliberately (and update this test) when the owner approves the numbers.
    expect(SLUGS.filter((s) => SERVICE_PRICES[s].approved)).toEqual([]);
  });

  it('carries the proposed invoice-derived numbers', () => {
    expect(formatPriceRange('bathroom')).toBe('$6K–$25K');
    expect(formatPriceRange('kitchen')).toBe('$13K–$30K');
    expect(formatPriceRange('flooring')).toBe('$1K–$11K');
    expect(formatPriceRange('whole-house')).toBe('$12K–$75K+');
  });
});

describe('formatting', () => {
  it('formats amounts', () => {
    expect(formatAmount(13000)).toBe('$13K');
    expect(formatAmount(2500)).toBe('$2.5K');
    expect(formatAmount(1_000_000)).toBe('$1M');
    expect(formatAmount(800)).toBe('$800');
    expect(formatAmount(13000, 'long')).toBe('$13,000');
    expect(formatAmount(13000, 'wan')).toBe('1.3万');
  });

  it('formats bands, open-ended and in every style', () => {
    expect(formatBand({ min: 13000, max: 30000 })).toBe('$13K–$30K');
    expect(formatBand({ min: 50000, max: 1_000_000, openEnded: true })).toBe('$50K–$1M+');
    expect(formatBand({ min: 13000, max: 30000 }, 'long')).toBe('$13,000–$30,000');
    expect(formatBand({ min: 13000, max: 30000 }, 'wan')).toBe('1.3万–3万加元');
    expect(formatBand({ min: 12000, max: 75000, openEnded: true }, 'wan')).toBe('1.2万–7.5万加元以上');
  });

  it('zh uses the same $K convention current zh copy uses', () => {
    expect(formatPriceRange('kitchen', 'zh')).toBe(formatPriceRange('kitchen', 'en'));
  });

  it('formats tiers and refuses a service without tiers', () => {
    expect(formatPriceTier('kitchen', 'budget')).toBe('$13K–$18K');
    expect(formatPriceTier('kitchen', 'high')).toBe('$25K–$30K+');
    expect(formatPriceTier('bathroom', 'mid', 'long')).toBe('$9,000–$18,000');
    expect(() => formatPriceTier('flooring', 'budget')).toThrow(/no tiers/);
  });
});

describe('schema + slug mapping', () => {
  it('maps DB service slugs onto pricing keys', () => {
    expect(resolvePriceSlug('cabinet')).toBe('cabinet-refinishing');
    expect(resolvePriceSlug('kitchen')).toBe('kitchen');
    expect(resolvePriceSlug('heat-pump-hvac')).toBeUndefined();
  });

  it('priceRangeForSchema returns min/max or undefined', () => {
    expect(priceRangeForSchema('kitchen')).toEqual({ min: 13000, max: 30000 });
    expect(priceRangeForSchema('cabinet')).toEqual({ min: 4000, max: 15000 });
    expect(priceRangeForSchema('poly-b-replacement')).toBeUndefined();
  });

  it('spanRange covers every service it spans', () => {
    const span = spanRange(RESIDENTIAL_SPAN);
    for (const s of RESIDENTIAL_SPAN) {
      expect(span.min).toBeLessThanOrEqual(SERVICE_PRICES[s].min);
      expect(span.max).toBeGreaterThanOrEqual(SERVICE_PRICES[s].max);
    }
  });
});

describe('message tokens', () => {
  const tokens = priceTokens();

  it('exposes Range/From/To (+Long) for every service', () => {
    expect(tokens.kitchenRange).toBe('$13K–$30K');
    expect(tokens.kitchenRangeLong).toBe('$13,000–$30,000');
    expect(tokens.wholeHouseTo).toBe('$75K+');
    expect(tokens.cabinetRefinishingBudgetLong).toBe('$4,000–$8,000');
    for (const slug of SLUGS) {
      const prefix = slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      for (const s of ['Range', 'From', 'To']) {
        expect(tokens[`${prefix}${s}`], `${prefix}${s}`).toBeTruthy();
        expect(tokens[`${prefix}${s}Long`], `${prefix}${s}Long`).toBeTruthy();
      }
    }
  });

  it('replaces only known tokens — ICU args survive', () => {
    expect(applyPriceTokens('Kitchens in {area} cost {kitchenRange}.')).toBe('Kitchens in {area} cost $13K–$30K.');
    expect(applyPriceTokens('{count, plural, one {# job} other {# jobs}}')).toBe('{count, plural, one {# job} other {# jobs}}');
  });

  it('deep-applies without mutating the input', () => {
    const tree = { a: { b: '{bathroomRange}' }, c: ['{kitchenFrom}'] };
    const out = applyPriceTokensDeep(tree);
    expect(out).toEqual({ a: { b: '$6K–$25K' }, c: ['$13K'] });
    expect(tree.a.b).toBe('{bathroomRange}');
  });

  // Every price-looking token in the catalogue must be one lib/pricing.ts
  // resolves. A typo ({kitchenRnage}) would otherwise reach next-intl as an
  // unpassed ICU argument and throw FORMATTING_ERROR at render.
  const PRICEY = /\{([a-z][A-Za-z]*(?:Range|From|To|Typical|Budget|Mid|High)(?:Long)?)\}/g;
  const locales = readdirSync('messages').filter((l) => l !== 'admin');
  const rels = [...namespaces, ...guideSections.map((g) => `guides/${g}`)];

  it.each(locales)('%s: every price token resolves, and resolved messages still compile', (locale) => {
    const unknown: string[] = [];
    const broken: string[] = [];
    for (const rel of rels) {
      const file = `messages/${locale}/${rel}.json`;
      if (!existsSync(file)) continue;
      const raw = readFileSync(file, 'utf8');
      for (const m of raw.matchAll(PRICEY)) if (!(m[1] in tokens)) unknown.push(`${rel}: {${m[1]}}`);
      const resolved = applyPriceTokensDeep(JSON.parse(raw) as unknown);
      const walk = (n: unknown, path: string) => {
        if (typeof n === 'string') {
          try { parse(n); } catch { broken.push(`${rel}: ${path}`); }
        } else if (n && typeof n === 'object') {
          for (const [k, v] of Object.entries(n)) walk(v, path ? `${path}.${k}` : k);
        }
      };
      walk(resolved, '');
    }
    expect(unknown).toEqual([]);
    expect(broken).toEqual([]);
  });
});
