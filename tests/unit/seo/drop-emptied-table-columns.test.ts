import { describe, it, expect } from 'vitest';
import { stripPriceMarkdown } from '@/lib/seo/strip-price-copy';

/**
 * Task 175 item 3 (plan A for the poly-b hub): a markdown table column whose every data cell is empty
 * after the render-time price cut loses its header, alignment and data cells. Tables the cut does not
 * touch stay byte-identical.
 */
describe('dropEmptiedColumns (task 175)', () => {
  it('drops a column the price cut emptied (poly-b "Replacement cost"), keeps the Timeline', () => {
    const md = [
      'Intro.',
      '',
      '**Real Vancouver Poly-B replacement costs:**',
      '',
      '| Property type | Replacement cost | Timeline |',
      '|---|---|---|',
      '| Condo (1-bath, single-floor) | $4,000 – $8,000 | 2–3 days |',
      '| Condo (2-bath) | $6,000 – $12,000 | 3–4 days |',
      '',
      "**What's included:** PEX-A re-pipe.",
    ].join('\n');
    const out = stripPriceMarkdown(md);
    expect(out).toContain('| Property type | Timeline |\n|---|---|\n| Condo (1-bath, single-floor) | 2–3 days |\n| Condo (2-bath) | 3–4 days |');
    expect(out).not.toContain('Replacement cost');
    expect(out).not.toMatch(/\$\d/);
  });

  it('keeps a column that still has content in some row', () => {
    const md = '| Scope | Cost | Time |\n|---|---|---|\n| Bath | $20,000 | 3 weeks |\n| Kitchen | ask us | 6 weeks |';
    const out = stripPriceMarkdown(md);
    expect(out).toContain('| Scope | Cost | Time |');
    expect(out).toContain('| Kitchen | ask us | 6 weeks |');
  });

  it('leaves a table the cut does not touch byte-identical (even with an empty source column)', () => {
    const table = '| Step | Note | Who |\n|:---|---|---:|\n| Permit |  | us |\n| Demo |  | crew |';
    const md = `A bathroom costs $20,000.\n\n${table}`;
    const out = stripPriceMarkdown(md);
    expect(out).toContain(table);
  });

  it('can leave a single column', () => {
    const md = '| Cost | Timeline |\n|---|---|\n| $5,000–$9,000 | 2–3 weeks |\n| $9,000+ | 4 weeks |';
    expect(stripPriceMarkdown(md)).toBe('| Timeline |\n|---|\n| 2–3 weeks |\n| 4 weeks |');
  });

  it('keeps the alignment cells of the remaining columns', () => {
    const md = '| Type | Cost | Days |\n|:---|:---:|---:|\n| Condo | $6,000 | 3–4 days |';
    expect(stripPriceMarkdown(md)).toBe('| Type | Days |\n|:---|---:|\n| Condo | 3–4 days |');
  });
});
