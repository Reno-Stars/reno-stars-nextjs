#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Generate lib/sitemap/static-page-lastmod.json — the honest <lastmod> for every
 * STATIC_PAGES path, from git history.  Run with full history (not a shallow
 * clone) whenever a static page's code or copy changes:
 *
 *     pnpm sitemap:lastmod
 *
 * Why a committed manifest and not a build step: the Docker build context
 * excludes .git and CI checks out with depth 1, so neither can see history.
 *
 * What counts as "this page's content" (deterministic, documented in the JSON):
 *   1. code — the route file `app/[locale]<path>/page.tsx` plus every file in its
 *      import closure (under app/ and components/) that NO OTHER static page
 *      imports — i.e. the page's own components. Files shared by two or more
 *      static pages (Footer, CTASection, cards…) are the shared layer and are
 *      not counted, for the same reason the shell is not;
 *   2. copy — every next-intl namespace those files read
 *      (`namespace: 'x.y'`, `useTranslations('x')`, `getTranslations('x')`),
 *      compared KEY-BY-KEY across commits, so a change to another page's entry
 *      in the shared metadata.json does not touch this page.
 *   The layout shell (header, footer, nav and the SHELL_NAMESPACES shipped on
 *   every page) is deliberately excluded — counting it would stamp every page
 *   with the same date, which is exactly the signal this replaces.
 * Pages that also render database rows (blog index, projects, home …) get the
 * later of this date and the rows' own date at request time (lib/sitemap/data.ts).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, normalize } from 'node:path';

const ROOT = process.cwd();
const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

if (git('rev-parse', '--is-shallow-repository').trim() === 'true') {
  console.error('refusing to run in a shallow clone: history is incomplete, dates would be wrong');
  process.exit(1);
}

// --- STATIC_PAGES paths, read from config.ts (the single source of the list) ---
const config = readFileSync(join(ROOT, 'lib/sitemap/config.ts'), 'utf8');
const block = config.slice(config.indexOf('export const STATIC_PAGES'), config.indexOf('export const COST_GUIDE_BLOG_SLUGS'));
const paths = [...block.matchAll(/path:\s*'([^']*)'/g)].map((m) => m[1]);

const SHELL = new Set(['common', 'filter', 'footer', 'label', 'nav', 'section', 'services', 'stats']);
const LOCALES = readdirSync(join(ROOT, 'messages')).filter((d) => d !== 'admin' && existsSync(join(ROOT, 'messages', d, 'nav.json')));

function routeFile(path) {
  const route = `app/[locale]${path}/page.tsx`;
  if (!existsSync(join(ROOT, route))) throw new Error(`no route file for ${path}: ${route}`);
  return route;
}

/** Resolve an import specifier to a repo file under app/ or components/ (else null). */
function resolveImport(spec, from) {
  let base;
  if (spec.startsWith('@/')) base = spec.slice(2);
  else if (spec.startsWith('.')) base = normalize(join(dirname(from), spec));
  else return null;
  if (!base.startsWith('app/') && !base.startsWith('components/')) return null;
  for (const ext of ['', '.tsx', '.ts', '/index.tsx', '/index.ts']) {
    if (existsSync(join(ROOT, base + ext)) && /\.(tsx?|jsx?)$/.test(base + ext)) return base + ext;
  }
  return null;
}

function importClosure(root) {
  const seen = new Set();
  const stack = [root];
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    const src = readFileSync(join(ROOT, f), 'utf8');
    for (const m of src.matchAll(/(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      const r = resolveImport(m[1] ?? m[2], f);
      if (r && !seen.has(r)) stack.push(r);
    }
  }
  return seen;
}

const closures = new Map(paths.map((p) => [p, importClosure(routeFile(p))]));
const usage = new Map();
for (const set of closures.values()) for (const f of set) usage.set(f, (usage.get(f) ?? 0) + 1);

/** The route file + closure files used by this static page ONLY. */
function codeFiles(path) {
  const route = routeFile(path);
  return [route, ...[...closures.get(path)].filter((f) => f !== route && usage.get(f) === 1).sort()];
}

function namespacesOf(files) {
  const ns = new Set();
  for (const f of files) {
    const src = readFileSync(join(ROOT, f), 'utf8');
    for (const m of src.matchAll(/namespace:\s*['"]([A-Za-z0-9_.-]+)['"]|(?:useTranslations|getTranslations)\(\s*['"]([A-Za-z0-9_.-]+)['"]\s*\)/g)) {
      const n = m[1] ?? m[2];
      if (!SHELL.has(n.split('.')[0])) ns.add(n);
    }
  }
  return [...ns].sort();
}

/** Files + key path that hold a namespace (guides are split per section, no wrapper key). */
function nsLocation(ns) {
  const [top, ...rest] = ns.split('.');
  if (top === 'guides') {
    return { files: LOCALES.map((l) => `messages/${l}/guides/${rest[0]}.json`), keyPath: rest };
  }
  return { files: LOCALES.map((l) => `messages/${l}/${top}.json`), keyPath: [top, ...rest] };
}

function subtreeAt(rev, file, keyPath) {
  let text;
  try {
    text = execFileSync('git', ['show', `${rev}:${file}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return undefined; // file absent at that revision
  }
  let v;
  try { v = JSON.parse(text); } catch { return '<<unparseable>>'; }
  for (const k of keyPath) v = v == null ? undefined : v[k];
  return JSON.stringify(v ?? null);
}

/** Latest commit date at which the namespace's value changed in any locale file. */
function nsLastChange(ns) {
  const { files, keyPath } = nsLocation(ns);
  const present = files.filter((f) => existsSync(join(ROOT, f)));
  if (present.length === 0) return null;
  const log = git('log', '--format=%H %cI', '--', ...present).trim().split('\n').filter(Boolean);
  for (const line of log) {
    const [sha, date] = line.split(' ');
    const changed = git('diff-tree', '--no-commit-id', '--name-only', '-r', '--root', sha, '--', ...present).trim().split('\n').filter(Boolean);
    for (const f of changed) {
      if (subtreeAt(sha, f, keyPath) !== subtreeAt(`${sha}^`, f, keyPath)) return { date, sha };
    }
  }
  return null;
}

const toIso = (d) => new Date(d).toISOString();
const pages = {};
for (const path of paths) {
  const code = codeFiles(path);
  const codeLog = git('log', '-1', '--format=%H %cI', '--', ...code).trim();
  const [codeSha, codeDate] = codeLog.split(' ');
  const namespaces = namespacesOf(code);
  let best = { date: codeDate, sha: codeSha, source: 'code' };
  const nsDates = {};
  for (const ns of namespaces) {
    const hit = nsLastChange(ns);
    if (!hit) continue;
    nsDates[ns] = toIso(hit.date);
    if (toIso(hit.date) > toIso(best.date)) best = { ...hit, source: `copy:${ns}` };
  }
  pages[path] = {
    lastmod: toIso(best.date),
    from: best.source,
    commit: best.sha.slice(0, 12),
    code,
    namespaces: nsDates,
  };
  console.error(`${path || '/'} -> ${pages[path].lastmod} (${best.source})`);
}

const out = {
  _comment:
    'GENERATED by scripts/sitemap-static-lastmod.mjs — do not hand-edit. Re-run `pnpm sitemap:lastmod` (full git history) after changing a static page or its copy.',
  pages,
};
writeFileSync(join(ROOT, 'lib/sitemap/static-page-lastmod.json'), JSON.stringify(out, null, 2) + '\n');
console.error(`wrote ${Object.keys(pages).length} pages`);
