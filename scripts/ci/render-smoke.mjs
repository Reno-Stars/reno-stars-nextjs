#!/usr/bin/env node
/* global process, console, fetch, setTimeout */
/**
 * Render smoke gate — the check that reads OUTPUT, not source.
 *
 * Why it exists: on 2026-08-26 a change scoped the i18n client payload per
 * route and shipped a build where every page rendered "nav.home" and
 * "footer.quickLinks" as visible text. Lint, typecheck, 1,274 unit tests and
 * the production build were ALL green, because every one of them inspects
 * source. The bug only existed in rendered HTML.
 *
 * The same blind spot is why /en/guides/vancouver-kitchen-cabinet-renovation/
 * has been serving 44 raw key paths to real visitors, unnoticed.
 *
 * Three checks per page, no browser needed (the failures are server-rendered):
 *   1. status 200
 *   2. no raw i18n key paths in visible text
 *   3. namespaces that must not be in this route's payload are absent
 *
 * Usage:  BASE_URL=http://localhost:3000 node scripts/ci/render-smoke.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const ROOT = process.cwd();
const cfg = JSON.parse(readFileSync(path.join(ROOT, 'scripts/ci/smoke-config.json'), 'utf8'));

// ---------------------------------------------------------------- namespaces
// Read off disk so the gate needs no maintenance when a namespace is added.
// `guides` has no guides.json — it is assembled from messages/en/guides/*.
const NAMESPACES = [
  ...readdirSync(path.join(ROOT, 'messages/en'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -5)),
  'guides',
].sort();

// Trailing segments allow any Unicode letter on purpose. The MT pipeline
// translated an ENUM stored in the catalog (blocker -> 阻挡者), so the leaked
// path is `siteVisit.ui.阻挡者`. An ASCII-only matcher truncates that to
// `siteVisit.ui` and then no sane allowlist prefix matches it.
const KEY_PATH = new RegExp(
  String.raw`(?:${NAMESPACES.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})` +
    String.raw`\.[a-z][A-Za-z0-9_]*(?:\.[\p{L}\p{N}_]+)*`,
  'gu',
);

/** A long, distinctive string from a namespace — used to prove it did NOT ship. */
function sentinel(ns) {
  const rel = ns.startsWith('guides.')
    ? `guides/${ns.slice('guides.'.length)}`
    : ns;
  const json = JSON.parse(readFileSync(path.join(ROOT, `messages/en/${rel}.json`), 'utf8'));
  let best = '';
  const walk = (node) => {
    if (typeof node === 'string') {
      if (node.length > best.length && node.length < 200) best = node;
    } else if (node && typeof node === 'object') {
      Object.values(node).forEach(walk);
    }
  };
  walk(json);
  if (best.length < 25) throw new Error(`no usable sentinel for namespace "${ns}"`);
  return best;
}

// ------------------------------------------------------------------ fetching
const visibleText = (html) =>
  html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

async function fetchPage(route) {
  const res = await fetch(`${BASE}${route}`, {
    redirect: 'follow',
    headers: { 'user-agent': 'reno-stars-ci-smoke' },
  });
  return { status: res.status, html: await res.text() };
}

// ------------------------------------------------------------------- readiness
/**
 * Wait for the server rather than assuming a `sleep` was long enough.
 *
 * Done in-process because the Gitea act_runner image has NO curl (its own
 * workflow header lists that among the runner differences), so the usual
 * `until curl -sf ...` readiness loop is not available there.
 */
async function waitForServer(timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  let lastErr = 'no attempt made';
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/en/`, { redirect: 'follow' });
      if (res.status < 500) return;
      lastErr = `HTTP ${res.status}`;
    } catch (err) {
      lastErr = err.message;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.error(`server at ${BASE} never became ready (${timeoutMs}ms): ${lastErr}`);
  process.exit(1);
}

await waitForServer();

// -------------------------------------------------------------- route matrix
const routes = [
  ...cfg.locales.flatMap((loc) => cfg.routes.map((r) => `/${loc}${r}`)),
  ...(cfg.extraRoutes ?? []),
];

const failures = [];
const notes = [];
let checked = 0;

for (const route of routes) {
  let page;
  try {
    page = await fetchPage(route);
  } catch (err) {
    failures.push(`${route}\n    unreachable: ${err.message}`);
    continue;
  }
  checked += 1;

  // 1 ── status
  if (page.status !== 200) {
    failures.push(`${route}\n    HTTP ${page.status}`);
    continue;
  }

  // 2 ── raw i18n key paths in visible text
  const allowed = cfg.knownBroken?.[route] ?? [];
  const leaks = [...new Set(visibleText(page.html).match(KEY_PATH) ?? [])].filter(
    (k) => !allowed.some((prefix) => k.startsWith(prefix)),
  );
  if (leaks.length) {
    failures.push(
      `${route}\n    ${leaks.length} raw i18n key path(s) rendered as visible text:\n` +
        leaks.slice(0, 8).map((k) => `      ${k}`).join('\n') +
        (leaks.length > 8 ? `\n      ... +${leaks.length - 8} more` : '') +
        `\n    -> the namespace is missing from this route's <ClientMessages ns={[...]}>,` +
        `\n       or the key is absent from messages/en.`,
    );
  }
  if (allowed.length) {
    const stillBroken = [...new Set(visibleText(page.html).match(KEY_PATH) ?? [])].filter((k) =>
      allowed.some((p) => k.startsWith(p)),
    );
    notes.push(
      stillBroken.length
        ? `${route}: ${stillBroken.length} known-broken key path(s) still present (allowlisted)`
        : `${route}: allowlist is now STALE — nothing broken here. Remove it from smoke-config.json.`,
    );
    if (!stillBroken.length) {
      failures.push(
        `${route}\n    knownBroken allowlist is stale — the page is clean now.` +
          `\n    -> delete this route from knownBroken in scripts/ci/smoke-config.json,` +
          `\n       so the gate cannot silently stop protecting it.`,
      );
    }
  }

  // 3 ── scoping invariant: these namespaces must not be in the payload
  for (const ns of cfg.absentNamespaces?.[route] ?? []) {
    if (page.html.includes(sentinel(ns))) {
      failures.push(
        `${route}\n    namespace "${ns}" IS in the payload but must not be.` +
          `\n    -> the layout is shipping the whole catalog again, or this route over-declares.`,
      );
    }
  }
}

// -------------------------------------------------------------------- report
console.log(`render smoke — ${BASE}`);
console.log(`  ${checked}/${routes.length} routes fetched, ${NAMESPACES.length} namespaces known\n`);
for (const n of notes) console.log(`  note: ${n}`);
if (notes.length) console.log('');

if (failures.length) {
  console.error(`FAIL — ${failures.length} problem(s):\n`);
  for (const f of failures) console.error(`  ${f}\n`);
  process.exit(1);
}
console.log(`PASS — ${checked} routes render clean.`);
