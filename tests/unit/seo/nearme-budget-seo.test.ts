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
 * 2. (Budget-tier H1s: those pages were retired on 2026-11-24 and now 301.)
 */

import { generateMetadata as kitchenMeta } from '@/app/[locale]/kitchen-renovation-near-me/page';
import { generateMetadata as bathroomMeta } from '@/app/[locale]/bathroom-renovation-near-me/page';
import { generateMetadata as basementMeta } from '@/app/[locale]/basement-renovation-near-me/page';
import { generateMetadata as wholeHouseMeta } from '@/app/[locale]/whole-house-renovation-near-me/page';

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

// The budget-facet H1 tests were removed with the budget pages themselves
// (retired 2026-11-24, now a 301 — see tests/unit/projects/price-removal.test.tsx).
