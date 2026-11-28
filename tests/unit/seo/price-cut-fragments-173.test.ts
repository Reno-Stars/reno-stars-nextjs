import { describe, it, expect } from 'vitest';
import { stripPriceCopy, stripPriceMarkdown } from '@/lib/seo/strip-price-copy';

/**
 * Task 173: sentence fragments left by the DI-15 render-time price cut.
 * One test per pattern; each pins the real source text it came from.
 */
describe('price-cut fragments (task 173)', () => {
  it('a cut opening clause leaves the sentence capitalised (en heat-pump hub, services 90fc0ada)', () => {
    const v = '2. **Replace a 20+ year gas furnace.** Federal carbon pricing makes this the right financial call now. '
      + 'Heat pump central system runs $14–22K installed, rebates can offset $7–11K.';
    const out = stripPriceMarkdown(v);
    expect(out).toBe('2. **Replace a 20+ year gas furnace.** Federal carbon pricing makes this the right financial call now. Rebates can offset $7–11K.');
    expect(out).not.toMatch(/\. rebates/);
    // the rebate amount is a subsidy and stays
    expect(out).toContain('$7–11K');
  });

  it('keeps lower case when the original sentence started lower case, and leaves untouched sentences alone', () => {
    expect(stripPriceCopy('iPhone photos are fine.')).toBe('iPhone photos are fine.');
    expect(stripPriceCopy('Federal carbon pricing makes this the right call now.')).toBe('Federal carbon pricing makes this the right call now.');
  });

  it('a price after the last 「、」 does not leave 「、。」 (ja nearMe cards)', () => {
    expect(stripPriceCopy('予算に優しいリフレッシュからフルカスタムまで。通常 4 ～ 8 週間、15,000 ～ 72,000 ドル。'))
      .toBe('予算に優しいリフレッシュからフルカスタムまで。通常 4 ～ 8 週間。');
    expect(stripPriceCopy('同じ設置面積で新しいドア、ハードウェア、クォーツを使用できます。 1～2週間、8,000～20,000ドル。'))
      .toBe('同じ設置面積で新しいドア、ハードウェア、クォーツを使用できます。1～2週間。');
  });

  it('a bold lead-in over a cost table removed whole goes with it (heat-pump / poly-b / critical-load hubs)', () => {
    const md = [
      'Intro paragraph.',
      '',
      '**Real Vancouver [heat pump](/en/blog/x/) installation costs (before rebates):**',
      '',
      '| System type | Installed cost | Heats / cools |',
      '|---|---|---|',
      '| Ductless mini-split (1 zone) | $4,500 – $7,500 | 1 room or open space |',
      '| Ducted central (replace gas furnace) | $12,000 – $25,000+ | Whole house, existing ducts |',
      '',
      '**BC Hydro / Province rebates available:**',
      '',
      '- Heat pump rebate: up to **$3,000** (BC Hydro)',
      '- Greener Homes Grant: up to **$5,000** (federal)',
    ].join('\n');
    const out = stripPriceMarkdown(md);
    expect(out).not.toContain('installation costs (before rebates)');
    expect(out).not.toContain('| System type');
    expect(out).toContain('**BC Hydro / Province rebates available:**');
    expect(out).toContain('up to **$3,000** (BC Hydro)');
    expect(out).toContain('up to **$5,000** (federal)');

    // critical-load-panel hub: no duration column, so the whole table goes and its lead-in with it
    const clp = '**Real [Vancouver](/en/areas/vancouver/) critical load panel costs:**\n\n| Scope | Cost | What it does |\n|---|---|---|\n'
      + '| Sub-panel only (10–12 critical circuits) | $2,500 – $4,500 | Pre-wires for future generator/battery |\n\n'
      + '**Why this often shows up alongside other renovations:**\n\n- Heat pump install pushes electrical load past panel capacity.';
    const c = stripPriceMarkdown(clp);
    expect(c).not.toContain('critical load panel costs:');
    expect(c).toContain('**Why this often shows up alongside other renovations:**');
    // a table that keeps its duration column keeps its lead-in (task 148 behaviour unchanged)
    const poly = '**Real Vancouver Poly-B replacement costs:**\n\n| Property type | Replacement cost | Timeline |\n|---|---|---|\n'
      + '| Condo (2-bath) | $6,000 – $12,000 | 3–4 days |\n\n**What\'s included:** PEX-A or PEX-B re-pipe, manifold installation.';
    const p = stripPriceMarkdown(poly);
    expect(p).toContain('replacement costs:');
    expect(p).toContain('| Condo (2-bath) | | 3–4 days |');
  });

  it('a lead-in over a table that keeps a row stays, and so does a table with no price', () => {
    const md = '**Typical timelines:**\n\n| Scope | Cost | Time |\n|---|---|---|\n| Bath | $20,000 | 3 weeks |\n| Kitchen | ask us | 6 weeks |';
    const out = stripPriceMarkdown(md);
    expect(out).toContain('**Typical timelines:**');
    expect(out).toContain('| Kitchen | ask us | 6 weeks |');
    const plain = 'Text with $20,000 removed.\n\n**Steps:**\n\n| Step | Who |\n|---|---|\n| Permit | us |';
    expect(stripPriceMarkdown(plain)).toContain('**Steps:**\n\n| Step | Who |');
  });

  it('the same rule covers a Latin comma before the sentence end', () => {
    const out = stripPriceCopy('Typically 4–8 weeks, $15,000–$72,000.');
    expect(out).not.toMatch(/,\s*\./);
    expect(out).toContain('4–8 weeks');
  });
});
