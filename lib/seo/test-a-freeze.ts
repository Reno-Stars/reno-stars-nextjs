/**
 * TEST A — the 14 service×city pages of SEO test A render EXACTLY as they did
 * before the 2026-11-26 company-facts change (task 158, Ryan via Captain), until
 * the experiment is read out. 「测试 A 冻结至读数后统一」
 *
 * Why a request flag: the company stats and the shell strings reach a Test A
 * page through the shared [locale] layout (footer, LocalBusinessSchema, the
 * client message bundle), which never sees the pathname. `proxy.ts` therefore
 * tags a Test A request with TEST_A_HEADER, and the three places that build what
 * those pages show read it:
 *   - i18n/request.ts      → the en catalog with TEST_A_FROZEN_EN laid over it
 *   - app/[locale]/layout  → the frozen company (footer, nav, LocalBusinessSchema)
 *   - the service×city route → the frozen company for its own copy and metadata
 *
 * Remove this file, the header, and messages/test-a-frozen/ in one change after
 * test A is read out (same moment as TEST_A_FROZEN_LASTMOD).
 */
import { headers } from 'next/headers';
import type { Company } from '@/lib/types';
import frozenEn from '@/messages/test-a-frozen/en.json';
import { TEST_A_HEADER } from './test-a-paths';

export { TEST_A_HEADER, isTestAPath, isTestAServiceCity } from './test-a-paths';

/** True when proxy.ts tagged this request as a Test A page. Server-only. */
export async function isTestARequest(): Promise<boolean> {
  try {
    return (await headers()).get(TEST_A_HEADER) === '1';
  } catch {
    // No request scope (build-time prerender, sitemap/feed routes): never a
    // Test A page — those all render on request under the force-dynamic layout.
    return false;
  }
}

/** The company stats exactly as Test A rendered them on 2026-11-26. */
export const TEST_A_FROZEN_STATS = {
  yearsExperience: '20',
  foundingYear: 2020,
  projectsCompleted: '700+',
} as const;

/** The company object with the Test A stats, same key order as the original. */
export function freezeCompanyForTestA(company: Company): Company {
  return { ...company, ...TEST_A_FROZEN_STATS };
}

type Tree = { [k: string]: unknown };

interface FrozenOverlay {
  /** Original en strings of every key changed since the freeze (same nesting). */
  values: Tree;
  /** Dotted paths of keys ADDED since the freeze — absent on a Test A page. */
  added: string[];
}

function overlay(base: Tree, top: Tree): Tree {
  const out: Tree = { ...base };
  for (const [k, v] of Object.entries(top)) {
    const b = base[k];
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && b && typeof b === 'object'
      ? overlay(b as Tree, v as Tree)
      : v;
  }
  return out;
}

function without(tree: Tree, path: string[]): Tree {
  const [head, ...rest] = path;
  if (!(head in tree)) return tree;
  const out: Tree = { ...tree };
  if (rest.length === 0) delete out[head];
  else if (out[head] && typeof out[head] === 'object') out[head] = without(out[head] as Tree, rest);
  return out;
}

/** The en catalog as Test A saw it: changed keys restored, added keys removed. */
export function frozenEnMessages(current: Tree, frozen: FrozenOverlay = frozenEn as FrozenOverlay): Tree {
  return frozen.added.reduce((t, p) => without(t, p.split('.')), overlay(current, frozen.values));
}
