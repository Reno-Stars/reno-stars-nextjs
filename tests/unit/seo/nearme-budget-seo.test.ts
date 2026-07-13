import { describe, it, expect, vi } from 'vitest';

// ProjectsPage (pulled in by the budget page) imports `@/navigation`, whose
// next-intl `createNavigation` internally imports `next/navigation` in a way
// Vite's SSR resolver can't handle. These tests only call `generateMetadata`
// and the pure `budgetTierH1` helper — they never render the components — so a
// trivial stub is enough to let the page modules evaluate.
vi.mock('@/navigation', () => ({
  Link: (props: { children?: unknown }) => props.children,
  redirect: vi.fn(),
  usePathname: () => '/',
  useRouter: () => ({}),
  getPathname: () => '/',
}));

/**
 * SEO de-dup pass: near-me canonical consolidation + distinct budget-facet H1s.
 *
 * 1. The 4 room-specific "…-renovation-near-me" pages were ~99.9% identical to
 *    each other and thinner than the /services/<room>/ pages. They now emit a
 *    rel=canonical pointing at the matching service page (metadata
 *    `alternates.canonical`) so the duplicate signal consolidates there while
 *    the pages still serve "near me" searchers. The umbrella
 *    /renovation-near-me/ stays self-canonical (asserted below).
 * 2. The 3 budget-tier facets previously shared one generic H1
 *    (section.projectsH1). Each now gets a distinct, band-naming H1 via
 *    `budgetTierH1`.
 */

import { generateMetadata as kitchenMeta } from '@/app/[locale]/kitchen-renovation-near-me/page';
import { generateMetadata as bathroomMeta } from '@/app/[locale]/bathroom-renovation-near-me/page';
import { generateMetadata as basementMeta } from '@/app/[locale]/basement-renovation-near-me/page';
import { generateMetadata as wholeHouseMeta } from '@/app/[locale]/whole-house-renovation-near-me/page';
import {
  budgetTierH1,
  TIERS,
  TIER_LABELS,
} from '@/app/[locale]/projects/budget/[tier]/page';

type MetaFn = (args: { params: Promise<{ locale: string }> }) => Promise<{
  alternates?: { canonical?: string | URL | null };
}>;

const roomCases: Array<{ name: string; fn: MetaFn; service: string }> = [
  { name: 'kitchen', fn: kitchenMeta as unknown as MetaFn, service: 'kitchen' },
  { name: 'bathroom', fn: bathroomMeta as unknown as MetaFn, service: 'bathroom' },
  { name: 'basement', fn: basementMeta as unknown as MetaFn, service: 'basement' },
  { name: 'whole-house', fn: wholeHouseMeta as unknown as MetaFn, service: 'whole-house' },
];

describe('near-me → service canonical consolidation', () => {
  for (const { name, fn, service } of roomCases) {
    it(`${name}-renovation-near-me canonicalizes to /services/${service}/ (en)`, async () => {
      const meta = await fn({ params: Promise.resolve({ locale: 'en' }) });
      const canonical = String(meta.alternates?.canonical ?? '');
      expect(canonical).toMatch(new RegExp(`/en/services/${service}/$`));
      // The whole point of the consolidation: the canonical must NOT be the
      // near-me URL itself.
      expect(canonical).not.toContain('near-me');
    });

    it(`${name}-renovation-near-me canonical keeps the current locale (zh)`, async () => {
      const meta = await fn({ params: Promise.resolve({ locale: 'zh' }) });
      const canonical = String(meta.alternates?.canonical ?? '');
      expect(canonical).toMatch(new RegExp(`/zh/services/${service}/$`));
    });
  }
});

describe('budget-facet distinct H1s', () => {
  it('produces three distinct EN H1s, one per band', () => {
    const h1s = TIERS.map((t) => budgetTierH1(t, 'en'));
    expect(new Set(h1s).size).toBe(TIERS.length);
  });

  it('names the real tier band in each EN H1', () => {
    expect(budgetTierH1('under-30k', 'en')).toContain('$30K');
    expect(budgetTierH1('30k-60k', 'en')).toContain('$30K');
    expect(budgetTierH1('30k-60k', 'en')).toContain('$60K');
    expect(budgetTierH1('60k-plus', 'en')).toContain('$60K');
  });

  it('band numbers match the real TIER_LABELS bounds (no fabrication)', () => {
    // 30000 → "$30K", 60000 → "$60K"
    expect(TIER_LABELS['under-30k'].range).toEqual([0, 30000]);
    expect(TIER_LABELS['30k-60k'].range).toEqual([30000, 60000]);
    expect(TIER_LABELS['60k-plus'].range[0]).toBe(60000);
  });

  it('localizes the H1 for zh / zh-Hant and falls back to EN otherwise', () => {
    for (const t of TIERS) {
      const en = budgetTierH1(t, 'en');
      const zh = budgetTierH1(t, 'zh');
      const zhHant = budgetTierH1(t, 'zh-Hant');
      expect(zh).not.toBe(en);
      expect(zhHant).not.toBe(en);
      expect(zhHant).not.toBe(zh);
      // Unknown locale falls back to the EN string.
      expect(budgetTierH1(t, 'fr')).toBe(en);
    }
  });
});
