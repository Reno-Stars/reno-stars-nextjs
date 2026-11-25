import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { filterPriceFaqs, hasPriceCopy, stripPriceCopy, stripPriceProse, isSubsidyText } from '@/lib/seo/strip-price-copy';

/**
 * Ryan 2026-11-25 (task 136 addendum): government rebate / grant / subsidy
 * amounts (heat-pump rebates, Greener Homes, HAFI) are NOT prices — they stay.
 * Source strings: messages/<locale>/faq.json → faq.heat-pump-hvac.{q1,a1}
 * (en line 70) and faq.accessible-bathroom.{q2,a2} (en line 80).
 */
type Faq = { faq: Record<string, Record<string, string>> };
const LOCALES = readdirSync('messages').filter((d) => existsSync(`messages/${d}/faq.json`));
const CASES = LOCALES.flatMap((loc) => {
  const f = (JSON.parse(readFileSync(`messages/${loc}/faq.json`, 'utf8')) as Faq).faq;
  return [
    [loc, 'heat-pump-hvac q1/a1 (en :70)', f['heat-pump-hvac']?.q1, f['heat-pump-hvac']?.a1],
    [loc, 'accessible-bathroom q2/a2 (en :80)', f['accessible-bathroom']?.q2, f['accessible-bathroom']?.a2],
  ].filter((c) => c[2] && c[3]) as Array<[string, string, string, string]>;
});

describe('subsidy / rebate amounts STAY (faq.json :70 and :80, every locale)', () => {
  it('the strings exist in all 14 site locales (28 cases)', () => {
    expect(LOCALES).toHaveLength(14);
    expect(CASES).toHaveLength(28);
  });

  it.each(CASES)('%s %s: answer kept verbatim', (_loc, _key, q, a) => {
    expect(filterPriceFaqs([{ question: q, answer: a }])).toEqual([{ question: q, answer: a }]);
  });

  it('en :70 — every rebate amount survives the prose filter too', () => {
    const a = CASES.find(([l, k]) => l === 'en' && k.startsWith('heat-pump'))![3];
    expect(stripPriceCopy(a)).toBe(a);
    for (const amt of ['$3,000', '$5,000', '$11,000']) expect(stripPriceCopy(a)).toContain(amt);
  });

  it('en :80 — HAFI "up to $20,000" survives the prose filter too', () => {
    const a = CASES.find(([l, k]) => l === 'en' && k.startsWith('accessible'))![3];
    expect(stripPriceCopy(a)).toBe(a);
    expect(hasPriceCopy(a)).toBe(false);
  });
});

describe('subsidy rule does not let renovation prices through', () => {
  it('a price sentence next to a grant sentence is still stripped', () => {
    const out = stripPriceProse('Kitchens run $25K–$50K. HAFI grants cover up to $20,000 for eligible seniors.');
    expect(out).not.toMatch(/\$25K|\$50K/);
    expect(out).toContain('HAFI grants cover up to $20,000 for eligible seniors.');
  });
  it('"granite" is not "grant"', () => {
    expect(isSubsidyText('Granite countertops')).toBe(false);
    expect(hasPriceCopy('Granite countertops run $3,000–$5,000.')).toBe(true);
  });
  it('"BC Hydro" alone does not protect a price', () => {
    expect(hasPriceCopy('A 200A panel upgrade for BC Hydro runs $2,500–$4,500.')).toBe(true);
  });
  it('a cost question is still dropped when its answer has prices and no subsidy', () => {
    expect(filterPriceFaqs([{ question: 'How much does an accessible bathroom renovation cost?',
      answer: 'Costs depend on scope: $3,000-$8,000 for safety basics.' }])).toEqual([]);
  });
});
