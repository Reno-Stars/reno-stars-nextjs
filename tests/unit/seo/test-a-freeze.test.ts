/**
 * Task 158 (Ryan via Captain, 2026-11-26): the company facts changed site-wide
 * (founded 2021, 900+ projects, no years-of-experience claim), but the 14 Test A
 * pages must render byte-identically until the experiment is read out. These
 * tests pin the freeze mechanism; the byte-identical render itself is gated by
 * the Test A crawl compare.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  TEST_A_FROZEN_STATS,
  freezeCompanyForTestA,
  frozenEnMessages,
  isTestAPath,
  isTestAServiceCity,
} from '@/lib/seo/test-a-freeze';
import { TEST_A_FROZEN_LASTMOD } from '@/lib/sitemap/lastmod-overrides';
import { COMPANY_FALLBACK } from '@/lib/db/queries/company';
import frozen from '@/messages/test-a-frozen/en.json';

type Tree = Record<string, unknown>;

function enCatalog(): Tree {
  const root = join(process.cwd(), 'messages/en');
  const merged: Tree = {};
  for (const f of readdirSync(root)) {
    if (f.endsWith('.json')) Object.assign(merged, JSON.parse(readFileSync(join(root, f), 'utf8')));
  }
  const guides: Tree = {};
  for (const f of readdirSync(join(root, 'guides'))) {
    Object.assign(guides, JSON.parse(readFileSync(join(root, 'guides', f), 'utf8')));
  }
  merged.guides = guides;
  return merged;
}

function get(tree: Tree, path: string): unknown {
  return path.split('.').reduce<unknown>((n, p) => (n && typeof n === 'object' ? (n as Tree)[p] : undefined), tree);
}

function leaves(o: unknown, p = ''): string[] {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return [p];
  return Object.entries(o as Tree).flatMap(([k, v]) => leaves(v, p ? `${p}.${k}` : k));
}

describe('Test A path check', () => {
  it('matches exactly the 14 frozen URLs, with or without slashes', () => {
    const keys = Object.keys(TEST_A_FROZEN_LASTMOD);
    expect(keys).toHaveLength(14);
    for (const k of keys) {
      expect(isTestAPath(`/${k}/`)).toBe(true);
      expect(isTestAPath(k)).toBe(true);
    }
    expect(isTestAServiceCity('en', 'kitchen', 'richmond')).toBe(true);
    expect(isTestAServiceCity('zh', 'kitchen', 'richmond')).toBe(false);
    expect(isTestAPath('/en/services/kitchen/vancouver/')).toBe(false);
    expect(isTestAPath('/en/services/kitchen/')).toBe(false);
    expect(isTestAPath('/en/')).toBe(false);
  });
});

describe('frozen company', () => {
  it('live company makes no years claim; Test A gets the old stats in the same key order', () => {
    expect(COMPANY_FALLBACK.yearsExperience).toBe('');
    expect(COMPANY_FALLBACK.foundingYear).toBe(2021);
    expect(COMPANY_FALLBACK.projectsCompleted).toBe('900+');
    const f = freezeCompanyForTestA(COMPANY_FALLBACK);
    expect(f).toMatchObject(TEST_A_FROZEN_STATS);
    expect(Object.keys(f)).toEqual(Object.keys(COMPANY_FALLBACK));
    expect(TEST_A_FROZEN_STATS).toEqual({ yearsExperience: '20', foundingYear: 2020, projectsCompleted: '700+' });
  });
});

describe('frozen en catalog', () => {
  const current = enCatalog();
  const restored = frozenEnMessages(current);

  it('every frozen key exists today and differs from today (no stale entries)', () => {
    for (const path of leaves(frozen.values)) {
      expect(typeof get(current, path), path).toBe('string');
      expect(get(current, path), path).not.toBe(get(frozen.values as Tree, path));
    }
  });

  it('restores the original strings and removes the keys added since the freeze', () => {
    for (const path of leaves(frozen.values)) {
      expect(get(restored, path)).toBe(get(frozen.values as Tree, path));
    }
    for (const path of frozen.added) {
      expect(get(current, path), path).toBeDefined();
      expect(get(restored, path), path).toBeUndefined();
    }
    expect(get(restored, 'stats.yearsExperience')).toBe('Years Combined Team Experience');
    expect(get(restored, 'locationBenefits.experience')).toBe('{years}+ years serving the Lower Mainland');
  });

  it('leaves every other key untouched and in the same order', () => {
    expect(Object.keys(restored)).toEqual(Object.keys(current));
    const changed = new Set([...leaves(frozen.values), ...frozen.added]);
    for (const path of leaves(current)) {
      if (!changed.has(path)) expect(get(restored, path), path).toBe(get(current, path));
    }
    expect(Object.keys(restored.stats as Tree)).toEqual(
      Object.keys(current.stats as Tree).filter((k) => !frozen.added.includes(`stats.${k}`)),
    );
  });
});

describe('company facts in every locale catalog (outside Test A)', () => {
  const root = join(process.cwd(), 'messages');
  const files: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) {
        if (f !== 'admin' && f !== 'test-a-frozen') walk(p);
      } else if (f.endsWith('.json')) files.push(p);
    }
  };
  walk(root);

  it('no message still takes a {years}/{experience} company-years placeholder (warranty years aside)', () => {
    const offenders = files.flatMap((f) =>
      leaves(JSON.parse(readFileSync(f, 'utf8')))
        .map((k) => [k, get(JSON.parse(readFileSync(f, 'utf8')), k)] as const)
        .filter(([k, v]) => typeof v === 'string' && /\{(years|experience|yearsExperience)\}/.test(v) && !k.endsWith('verified.warranty'))
        .map(([k]) => `${f}: ${k}`),
    );
    expect(offenders).toEqual([]);
  });

  it('no company project count of 700+ and no "founded 2020" remains', () => {
    const offenders = files.filter((f) => /700\s?\+|700\s?多|۷۰۰|since 2020|founded in 2020|in 2020, our team/i.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
