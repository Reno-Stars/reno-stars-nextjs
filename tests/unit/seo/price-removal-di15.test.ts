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
  it('LocalBusiness JSON-LD priceRange is still "$$"', () => {
    expect(src('components/structured-data/LocalBusinessSchema.tsx')).toMatch(/priceRange: '\$\$'/);
  });

  // Snapshot of main 4795870b (CI clones depth 1, so base cannot be read from git at test time).
  const BASE_STICKY_CALL: Record<string, string> = {
    ar: 'يتصل', en: 'Call', es: 'Llamar', fa: 'تماس بگیرید', fr: 'Appel', hi: 'पुकारना', ja: '電話',
    ko: '부르다', pa: 'ਕਾਲ ਕਰੋ', ru: 'Вызов', tl: 'Tumawag', vi: 'Gọi', zh: '称呼', 'zh-Hant': '稱呼',
  };
  it.each(Object.entries(BASE_STICKY_CALL))('cta.stickyCall (%s) is unchanged vs main 4795870b', (loc, base) => {
    const cta = JSON.parse(src(`messages/${loc}/cta.json`)) as { cta?: { stickyCall?: string }; stickyCall?: string };
    expect(cta.cta?.stickyCall ?? cta.stickyCall).toBe(base);
  });

  const BASE_PO_NUMBER_LINES: Record<string, string[]> = {
    'components/pages/ProjectsPage.tsx': [
      'po_number: site.po_number,',
      'const searchMatch = !searchQuery || [project.title, project.po_number].some((v) => v?.toLowerCase().includes(q));',
    ],
    'lib/data/projects.ts': ['po_number: project.po_number,'],
    'lib/db/project-mappers.ts': ['po_number: row.poNumber ?? undefined,', 'po_number: row.poNumber ?? undefined,'],
    'lib/db/schema.ts': ["poNumber: varchar('po_number', { length: 50 }),", "poNumber: varchar('po_number', { length: 50 }),"],
    'lib/types.ts': ['po_number?: string;', 'po_number?: string;', 'po_number?: string;'],
  };
  it.each(Object.entries(BASE_PO_NUMBER_LINES))('po_number lines in %s are unchanged vs main 4795870b', (file, base) => {
    const lines = src(file).split('\n').map((l) => l.trim()).filter((l) => l.includes('po_number'));
    expect(lines.sort()).toEqual([...base].sort());
  });
  it('the strip module never touches po_number', () => {
    expect(code('lib/seo/strip-price-copy.ts')).not.toMatch(/po_?number/i);
  });
});

describe('ALWAYS KEEP — near-me trust stats', () => {
  it('trust.* message values (e.g. the bare "$5M" stat) bypass the filter', () => {
    const s = src('components/pages/NearMePage.tsx');
    expect(s).toContain("return key.startsWith('trust.') ? s : stripPriceCopy(s);");
  });
});

