import { describe, it, expect } from 'vitest';
import { selectFaqsToInsert } from '@/scripts/lib/faq-seed-guard';

// Regression coverage for the seed-area-content.ts step-3 guard: `areaFaqs` is
// one FLAT list mixing every area, so a per-iteration `continue` only skips a
// single FAQ, not "the rest of this area". The original bug only checked
// `displayOrder === 0`, so a re-run against an already-seeded production
// database duplicated every displayOrder:1 (or higher) FAQ — Vancouver and
// Richmond both have one. This test proves the fix skips EVERY FAQ of an
// already-seeded area, not just the first one.

interface Faq {
  areaSlug: string;
  displayOrder: number;
}

const slugToId = new Map<string, string>([
  ['vancouver', 'area-van'],
  ['richmond', 'area-rmd'],
  ['surrey', 'area-sry'],
]);

const faqs: Faq[] = [
  { areaSlug: 'vancouver', displayOrder: 0 },
  { areaSlug: 'vancouver', displayOrder: 1 },
  { areaSlug: 'richmond', displayOrder: 0 },
  { areaSlug: 'richmond', displayOrder: 1 },
  { areaSlug: 'surrey', displayOrder: 0 },
  { areaSlug: 'surrey', displayOrder: 1 },
];

describe('selectFaqsToInsert', () => {
  it('skips every FAQ of an already-seeded area, including displayOrder: 1', () => {
    // Simulates a re-run: vancouver and richmond already have FAQ rows,
    // surrey does not.
    const alreadySeeded = new Set(['area-van', 'area-rmd']);
    const result = selectFaqsToInsert(faqs, slugToId, (id) => alreadySeeded.has(id));

    expect(result).toEqual([
      { areaSlug: 'surrey', displayOrder: 0 },
      { areaSlug: 'surrey', displayOrder: 1 },
    ]);
    // Explicitly assert the displayOrder:1 entries for the seeded areas were
    // dropped — this is the exact case the original `displayOrder === 0`
    // guard let through.
    expect(result.some((f) => f.areaSlug === 'vancouver')).toBe(false);
    expect(result.some((f) => f.areaSlug === 'richmond')).toBe(false);
  });

  it('inserts every FAQ on a first run where no area is seeded yet', () => {
    const result = selectFaqsToInsert(faqs, slugToId, () => false);
    expect(result).toEqual(faqs);
  });

  it('drops FAQs whose area slug is not in slugToId', () => {
    const withUnknown: Faq[] = [...faqs, { areaSlug: 'nowhere', displayOrder: 0 }];
    const result = selectFaqsToInsert(withUnknown, slugToId, () => false);
    expect(result.some((f) => f.areaSlug === 'nowhere')).toBe(false);
  });
});
