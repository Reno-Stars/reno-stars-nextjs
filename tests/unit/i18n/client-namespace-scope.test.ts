import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { SHELL_NAMESPACES } from '@/i18n/clientNamespaces';
import { pickMessages } from '@/i18n/pickMessages';
import { namespaces } from '@/i18n/namespaces';
import { guideSections } from '@/i18n/guideSections';

// Every namespace handed to NextIntlClientProvider is serialized into that
// page's RSC flight payload. Before 2026-08-26 the locale layout passed the
// whole merged catalog (~296 KB/locale), so `guides` (177.6 KB) and `siteVisit`
// (31.9 KB) shipped on every one of ~13k pages in 14 locales — about 44% of the
// bytes, and why Semrush measured a 1.7% text-to-HTML ratio.
//
// Now the layout ships SHELL_NAMESPACES and each route declares the rest via
// <ClientMessages ns={[...]}>. Those are hand-maintained lists, and a
// hand-maintained list drifts: add a useTranslations() call to a client
// component and NOTHING fails at build time — next-intl just renders the raw
// key path ("nav.home") to visitors. So this test recomputes the truth from
// source and asserts the declarations still cover it.

const ROOT = process.cwd();

/**
 * All first-party source files.
 *
 * Enumerated WITHOUT a `**` pathspec on purpose: `git ls-files 'components/**\/*.tsx'`
 * silently omits top-level files like `components/LanguageSupportNotice.tsx`,
 * because git's `**` requires an intervening directory. That mistake hid two
 * routes while this change was being written. An under-count here reads as
 * "no namespaces needed", which is the failure this test exists to catch.
 */
const FILES: string[] = execSync('git ls-files app components lib', {
  cwd: ROOT,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter((f) => /\.tsx?$/.test(f));

const source = new Map<string, string>(
  FILES.map((f) => [f, readFileSync(path.join(ROOT, f), 'utf8')]),
);

/** Real namespaces, read off disk — a prefix that names no file is a typo. */
const TOP_LEVEL = new Set(
  readdirSync(path.join(ROOT, 'messages/en'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -5)),
);
const GUIDE_SECTIONS = new Set(
  readdirSync(path.join(ROOT, 'messages/en/guides'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -5)),
);

const isRealNamespace = (n: string): boolean =>
  n.startsWith('guides.') ? GUIDE_SECTIONS.has(n.slice('guides.'.length)) : TOP_LEVEL.has(n);

const isClient = (f: string): boolean =>
  /^\s*['"]use client['"]/m.test(source.get(f) ?? '');

function resolveImport(spec: string, from: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = spec.slice(2);
  else if (spec.startsWith('.')) base = path.normalize(path.join(path.dirname(from), spec));
  else return null;

  for (const c of [base, `${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`]) {
    if (source.has(c)) return c;
  }
  return null;
}

function importsOf(file: string): string[] {
  const s = source.get(file) ?? '';
  const out = new Set<string>();
  for (const m of s.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    const r = resolveImport(m[1], file);
    if (r) out.add(r);
  }
  for (const m of s.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    const r = resolveImport(m[1], file);
    if (r) out.add(r);
  }
  return [...out];
}

/**
 * Namespaces one client file reads. Two call shapes, and missing the second is
 * what broke this change the first time round:
 *
 *   useTranslations('nearMe')  -> 'nearMe'; later t('hero.title') is a SUB-key.
 *   useTranslations()          -> keys are fully qualified, so t('nav.home')
 *                                 means the namespace is 'nav'.
 *
 * Navbar and Footer use the second shape. A scan that only understands the
 * first concludes the layout needs no messages at all.
 *
 * Prefixes are filtered against the catalog on disk, because a scoped
 * `t('journey.title')` inside useTranslations('aboutPage') would otherwise
 * look like a top-level namespace called `journey`.
 */
function namespacesReadIn(file: string): string[] {
  const s = source.get(file) ?? '';
  const out = new Set<string>();

  for (const m of s.matchAll(/useTranslations\(\s*['"]([^'"]+)['"]/g)) out.add(m[1]);

  if (/useTranslations\(\s*\)/.test(s)) {
    // Two segments, because `guides` has no guides.json — it is assembled from
    // messages/en/guides/*.json, so the real namespace is `guides.index`,
    // `guides.kitchenCost`, and so on. Taking one segment yields a bare
    // `guides`, which fails isRealNamespace and silently drops the page's
    // largest payload. That shipped `guides.index.hero.title` as visible text
    // on /guides until the render diff caught it.
    for (const m of s.matchAll(
      /\bt(?:\.(?:rich|raw|markup|has))?\(\s*[`'"]([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)?/g,
    )) {
      out.add(m[1] === 'guides' && m[2] ? `guides.${m[2]}` : m[1]);
    }
  }
  return [...out].filter(isRealNamespace);
}

/**
 * Namespaces read by the CLIENT subtree reachable from `entry`.
 *
 * Server files are walked but not collected — they read via getTranslations,
 * which never reaches the client payload. Once a `'use client'` file is
 * crossed, everything below it is client too, so collection turns on and stays.
 */
function clientNamespaceClosure(entry: string): string[] {
  const found = new Set<string>();
  const seen = new Set<string>();

  const walk = (file: string, inClient: boolean): void => {
    const key = `${file}|${inClient}`;
    if (seen.has(key)) return;
    seen.add(key);

    const client = inClient || isClient(file);
    if (client) namespacesReadIn(file).forEach((n) => found.add(n));
    for (const dep of importsOf(file)) walk(dep, client);
  };

  walk(entry, false);
  return [...found].sort();
}

/** ns arrays declared by <ClientMessages> in a file. */
function declaredIn(file: string): { sets: string[][]; all: string[] } {
  const s = source.get(file) ?? '';
  const sets = [...s.matchAll(/<ClientMessages\s+ns=\{\[([^\]]*)\]\}/g)].map((m) =>
    [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]),
  );
  return { sets, all: [...new Set(sets.flat())] };
}

const SHELL_ENTRIES = ['app/[locale]/layout.tsx', 'app/[locale]/error.tsx'];
const PAGE_ENTRIES = FILES.filter((f) => /^app\/\[locale\]\/.*\/?page\.tsx$/.test(f));

const covers = (provided: readonly string[], needed: string): boolean =>
  provided.some((p) => p === needed || needed.startsWith(`${p}.`));

describe('client message scope', () => {
  it('enumerates the sources it is supposed to guard', () => {
    // A broken enumeration makes every assertion below vacuously pass.
    expect(FILES.length).toBeGreaterThan(300);
    expect(FILES).toContain('components/LanguageSupportNotice.tsx');
    expect(PAGE_ENTRIES.length).toBeGreaterThan(30);
  });

  it('detects root-scoped useTranslations() in the shared chrome', () => {
    // The regression guard for the bug this change shipped and then caught:
    // Navbar/Footer take no namespace argument, so a naive scan sees nothing
    // and the whole site renders "nav.home" / "footer.quickLinks" as text.
    expect(namespacesReadIn('components/Navbar.tsx')).toContain('nav');
    expect(namespacesReadIn('components/Footer.tsx')).toContain('footer');
  });

  it('SHELL_NAMESPACES matches the layout closure exactly', () => {
    const computed = [
      ...new Set(SHELL_ENTRIES.flatMap((e) => clientNamespaceClosure(e))),
    ].sort();
    expect(
      [...SHELL_NAMESPACES].sort(),
      'the layout ships exactly what its own client subtree reads — no more ' +
        '(it lands on every page in every locale), no less (raw key paths render).',
    ).toEqual(computed);
  });

  it.each(PAGE_ENTRIES)('%s declares every namespace its client subtree reads', (entry) => {
    const needed = clientNamespaceClosure(entry);
    const provided = [...SHELL_NAMESPACES, ...declaredIn(entry).all];
    const missing = needed.filter((n) => !covers(provided, n));

    expect(
      missing,
      `${entry} renders client components reading [${missing.join(', ')}] without ` +
        `providing them — those keys would render as raw paths. Add them to ` +
        `<ClientMessages ns={[...]}> in this file.`,
    ).toEqual([]);
  });

  it.each(PAGE_ENTRIES)('%s keeps its ClientMessages boundaries in agreement', (entry) => {
    // A page may have several return branches (projects/[slug] has three), so
    // several <ClientMessages>. The coverage check unions them, which is only
    // sound while they all declare the SAME set — otherwise a gap in one branch
    // hides behind another branch's declaration.
    const { sets } = declaredIn(entry);
    for (const s of sets) expect([...s].sort()).toEqual([...sets[0]].sort());
  });

  it('every declared namespace resolves against the EN catalog', () => {
    const en: Record<string, unknown> = {};
    for (const ns of namespaces) {
      Object.assign(en, JSON.parse(readFileSync(`messages/en/${ns}.json`, 'utf8')));
    }
    const guides: Record<string, unknown> = {};
    for (const section of guideSections) {
      const f = `messages/en/guides/${section}.json`;
      if (existsSync(f)) Object.assign(guides, JSON.parse(readFileSync(f, 'utf8')));
    }
    en.guides = guides;

    const declared = [
      ...SHELL_NAMESPACES,
      ...PAGE_ENTRIES.flatMap((e) => declaredIn(e).all),
    ];
    const unresolved = [...new Set(declared)].filter(
      (p) => Object.keys(pickMessages(en, [p])).length === 0,
    );

    expect(
      unresolved,
      `declared but absent from messages/en — a typo ships nothing and renders ` +
        `raw key paths: ${unresolved.join(', ')}`,
    ).toEqual([]);
  });

  it('never hands the full catalog to the provider', () => {
    const layout = source.get('app/[locale]/layout.tsx') ?? '';
    expect(layout).toContain('pickMessages');
    expect(
      /messages=\{messages\b/.test(layout),
      'layout must scope the payload, not pass getMessages() straight through',
    ).toBe(false);
  });
});
