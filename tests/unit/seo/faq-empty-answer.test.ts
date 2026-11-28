/**
 * Task 159: a FAQ question whose whole answer was removed for price must go too. Every case is a BASE string (main,
 * raw DB copy — fixtures/task159-faq-cases.json): the Surrey area page body in the 10 locales that ended on a bare
 * "best ROI" question, one locale that was fine (fr), and the en cabinet service hub.
 */
import { describe, expect, it } from 'vitest';
import { hasPriceCopy, stripPriceCopy } from '@/lib/seo/strip-price-copy';
import cases from './fixtures/task159-faq-cases.json';

const all = cases as Record<string, string>;
const QUESTION = /^\s*(?:(?:\*\*|__)[^\n]*?[?？؟]\s*(?:\*\*|__)|#{1,6}\s+[^\n]*?[?？؟]\s*)$/;
const HEADING = /^\s*#{1,6}\s/;

/** Question lines of `md` with nothing under them before the next question / heading / end. */
function bareQuestions(md: string): string[] {
  const lines = md.split('\n');
  return lines.filter((l, i) => {
    if (!QUESTION.test(l)) return false;
    for (let j = i + 1; j < lines.length; j++) {
      if (QUESTION.test(lines[j]) || HEADING.test(lines[j])) return true;
      if (lines[j].trim()) return false;
    }
    return true;
  });
}

/** The base question lines whose answer carries a price (the ones the stripper can empty). */
function pricedQuestions(md: string): string[] {
  const lines = md.split('\n');
  return lines.filter((l, i) => {
    if (!QUESTION.test(l)) return false;
    const answer: string[] = [];
    for (let j = i + 1; j < lines.length && !QUESTION.test(lines[j]) && !HEADING.test(lines[j]); j++) answer.push(lines[j]);
    return hasPriceCopy(answer.join('\n'));
  });
}

const BROKEN = ['zh', 'zh-Hant', 'ja', 'ko', 'es', 'ar', 'fa', 'hi', 'pa', 'vi'] as const;

describe('task 159: a question whose whole answer was removed goes too', () => {
  it.each(BROKEN)('surrey %s: no bare question, the ROI question is gone, the permit question keeps its answer', (L) => {
    const base = all[`surrey__${L}`];
    const out = stripPriceCopy(base);
    expect(hasPriceCopy(out)).toBe(false);
    expect(bareQuestions(out)).toEqual([]);
    const baseQs = base.split('\n').filter((l) => QUESTION.test(l));
    // the page's FAQ ends "… permit processing time?" then "… best ROI in Surrey?" (the last question)
    const [permitQ, roiQ] = baseQs.slice(-2);
    expect(pricedQuestions(base)).toContain(roiQ);
    // the ROI answer is all amounts → question and answer both gone
    expect(out).not.toContain(roiQ.trim());
    // the permit question's answer is a duration, not a price → stays, still answered
    expect(out).toContain(permitQ.trim());
    const after = out.split('\n');
    const at = after.findIndex((l) => l.trim() === permitQ.trim());
    expect(after.slice(at + 1).find((l) => l.trim())?.length ?? 0).toBeGreaterThan(20);
  });

  it('surrey fr (was fine): still fine, no bare question', () => {
    const out = stripPriceCopy(all['surrey__fr']);
    expect(hasPriceCopy(out)).toBe(false);
    expect(bareQuestions(out)).toEqual([]);
  });

  it('en cabinet hub: the cost question goes with its answer, the refinish-vs-reface question stays answered', () => {
    const base = all['cabinet__en'];
    expect(pricedQuestions(base)).toContain('**How much does cabinet refinishing cost in Vancouver?**');
    const out = stripPriceCopy(base);
    expect(out).not.toContain('How much does cabinet refinishing cost in Vancouver?');
    expect(bareQuestions(out)).toEqual([]);
    expect(out).toMatch(
      /\*\*What is the difference between cabinet refinishing and cabinet refacing\?\*\*\nRefinishing repaints your existing cabinet doors/,
    );
  });

  it('negative: a question whose answer survives stays; a question bare in the source is left as it was', () => {
    const md = [
      '**How long does a bathroom take?**',
      'A full bathroom costs $25,000 and takes 3–5 weeks.',
      '',
      '**Do you handle permits?**',
      '',
      '**What does tile cost?**',
      'Tile runs $15–$30 per sq ft.',
      '',
      '**Do you offer a warranty?**',
      'Yes — up to 3 years on plumbing and electrical work.',
    ].join('\n');
    const out = stripPriceCopy(md);
    expect(out).toContain('**How long does a bathroom take?**');
    expect(out).toMatch(/3–5 weeks/);
    // bare in the SOURCE (no answer was removed) → untouched
    expect(out).toContain('**Do you handle permits?**');
    // its whole answer was a price → gone
    expect(out).not.toContain('What does tile cost?');
    expect(out).toContain('**Do you offer a warranty?**\nYes — up to 3 years on plumbing and electrical work.');
  });

  it.each(['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'fr', 'ru', 'ar', 'fa', 'hi', 'pa', 'tl', 'vi'])(
    'basement hub %s: numbered sections still read 1, 2, 3 … after priced sections were removed',
    (L) => {
      const base = all[`basement__${L}`];
      expect(base.split('\n').filter((l) => /^\s*#{1,6}\s+\d{1,2}\./.test(l)).length).toBe(7);
      const nums = stripPriceCopy(base)
        .split('\n')
        .map((l) => /^\s*#{1,6}\s+(\d{1,2})\.(?!\d)/.exec(l)?.[1])
        .filter(Boolean)
        .map(Number);
      expect(nums.length).toBeGreaterThan(0);
      expect(nums).toEqual(nums.map((_, i) => i + 1));
    },
  );

  it('numbering that was not 1..n in the source, or is a decimal, is left as written', () => {
    expect(stripPriceCopy('### 1. Plan\nWe plan.\n\n### 3. Build\nIt costs $9,000.\n\n### 4. Close\nWe close.')).toBe(
      '### 1. Plan\nWe plan.\n\n### 4. Close\nWe close.',
    );
    expect(stripPriceCopy('### 1. Plan\nWe plan.\n\n### 2. Build\nIt costs $9,000.\n\n### 3.5 Extras\nOptional.')).toBe(
      '### 1. Plan\nWe plan.\n\n### 3.5 Extras\nOptional.',
    );
  });

  it('a heading question over a removed answer goes; the next section is untouched', () => {
    const md = ['### How much is a basement suite?', 'Suites run $80,000–$130,000.', '', '### Who pulls the permit?', 'We do.'].join('\n');
    expect(stripPriceCopy(md)).toBe('### Who pulls the permit?\nWe do.');
  });
});
