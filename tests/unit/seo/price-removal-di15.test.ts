import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { TEST_A_FROZEN_LASTMOD } from '@/lib/sitemap/lastmod-overrides';
import { TEST_A_KEYS, isTestA } from '@/lib/seo/test-a';

/**
 * DI-15 (2026-11-24, Ryan via Captain): prices off every REMOVE surface,
 * at render time, with TEST A always on the original path.
 * Behaviour of the filter itself: tests/unit/seo/strip-price-copy.test.ts.
 */

const src = (p: string) => readFileSync(p, 'utf8');
/** Source with comments removed — the removal notes themselves name the old identifiers. */
const code = (p: string) => src(p).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('TEST A guard', () => {
  it('has exactly the 14 frozen-lastmod keys (one source)', () => {
    expect(TEST_A_KEYS).toEqual(Object.keys(TEST_A_FROZEN_LASTMOD));
    expect(TEST_A_KEYS).toHaveLength(14);
  });
  it('matches only the en test-A combos', () => {
    expect(isTestA('en', 'kitchen', 'richmond')).toBe(true);
    expect(isTestA('en', 'critical-load-panel', 'langley')).toBe(true);
    expect(isTestA('zh', 'kitchen', 'richmond')).toBe(false);       // siblings are not test A
    expect(isTestA('zh-Hant', 'kitchen', 'richmond')).toBe(false);
    expect(isTestA('en', 'kitchen', 'surrey')).toBe(false);
  });
  it('service×city route strips ONLY when !isTestA — metadata, rows, projects and FAQs', () => {
    const route = src('app/[locale]/services/[service-slug]/[city]/page.tsx');
    expect(route).toContain('if (!isTestA(locale, serviceSlug, city)) {');
    expect(route).toContain('const stripPrices = !isTestA(locale, serviceSlug, city);');
    expect(route).toContain('const service = stripPrices ? stripPriceDeep(rawService) : rawService;');
    expect(route).toContain('const area = stripPrices ? stripPriceDeep(rawArea) : rawArea;');
    expect(route).toContain('const faqs = stripPrices ? filterPriceFaqs(allFaqs) : allFaqs;');
  });
  it('the files test A renders from are not edited: seo-overrides, en faq messages, ServiceLocationPage', () => {
    // Guarded at runtime instead (above); the file contents stay as on main.
    expect(src('lib/data/seo-overrides.ts')).toContain("'kitchen/richmond': {");
    expect(src('components/pages/ServiceLocationPage.tsx')).not.toMatch(/strip-price-copy|stripPrice/);
  });
});

describe('hardcoded price copy removed from REMOVE surfaces', () => {
  it('near-me: no PRICE_BAND / PRICE_RANGE, no ServiceSchema priceRange', () => {
    for (const d of ['renovation-near-me', 'kitchen-renovation-near-me', 'bathroom-renovation-near-me', 'basement-renovation-near-me', 'whole-house-renovation-near-me']) {
      const s = code(`app/[locale]/${d}/page.tsx`);
      expect(s, d).not.toMatch(/PRICE_BAND|PRICE_RANGE|priceRange=/);
      expect(s, d).toContain('filterPriceFaqs(faqs)');
    }
  });
  it('service hubs: SERVICE_PRICE_RANGES (offers) removed; copy + FAQs filtered', () => {
    const s = code('app/[locale]/services/[service-slug]/page.tsx');
    expect(s).not.toMatch(/SERVICE_PRICE_RANGES|priceRange=/);
    expect(s).toContain('const service = stripPriceDeep(rawService);');
    expect(s).toContain('const faqs = filterPriceFaqs(allFaqs);');
  });
  it('/financing/: renovation cost table removed, loan terms kept', () => {
    const s = src('components/pages/FinancingPage.tsx');
    expect(s).not.toMatch(/costRanges|costs\.title|\$10,000 – \$60,000/);
    expect(s).toContain('"heloc"');            // loan options untouched
    expect(s).toContain('"personalLoan"');
    expect(src('messages/en/financing.json')).toMatch(/Prime \+ 0\.5% to 2%/); // rates untouched
  });
  it('/areas/ index: the price-range Q&A is gone', () => {
    expect(src('app/[locale]/areas/page.tsx')).not.toMatch(/\$30,000-\$80,000|How much does a renovation cost in Metro Vancouver/);
  });
});

describe('ALWAYS KEEP', () => {
  it('LocalBusiness priceRange "$$" and the sticky call CTA are untouched', () => {
    expect(src('components/structured-data/LocalBusinessSchema.tsx')).toMatch(/priceRange: '\$\$'/);
  });
});
