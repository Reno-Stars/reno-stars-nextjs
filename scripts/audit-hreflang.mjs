#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Hreflang completeness audit.
 *
 * Crawls a representative set of prerendered URLs against the live site,
 * parses the rendered HTML, extracts every `<link rel="alternate" hreflang>`,
 * and verifies all 14 locales + x-default are present and self-canonical.
 *
 * Usage:
 *   node scripts/audit-hreflang.mjs                      # production
 *   BASE=https://reno-stars-nextjs.vercel.app node scripts/audit-hreflang.mjs
 *
 * Exits 1 if any URL is missing locales or has self-canonical mismatch.
 *
 * Note: buildAlternates() emits hreflang="zh-Hant" (matching the URL path
 * prefix /zh-Hant/ and the sitemap's xhtml:link). An earlier version remapped
 * to zh-TW here in the page <head> only, which caused a head/sitemap mismatch
 * flagged by Semrush. EXPECTED_LOCALES now uses the locale slug directly.
 */

const BASE = process.env.BASE || 'https://www.reno-stars.com';
// Hreflang keys as emitted in the page <head> — identical to URL path prefixes.
// ru/ar/hi/fr added 2026-05-01 for Metro Vancouver demographic expansion.
const EXPECTED_LOCALES = ['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pa', 'tl', 'fa', 'vi', 'ru', 'ar', 'hi', 'fr'];

// Maps hreflang key → URL path prefix when they differ (currently empty).
const HREFLANG_TO_URL_PREFIX = {};

// Pages worth auditing — one of each route shape. If these are correct, the
// generators are correct.
const PATHS = [
  '/',
  '/services/',
  '/services/kitchen/',
  '/services/kitchen/burnaby/',
  '/areas/',
  '/areas/burnaby/',
  '/projects/',
  '/guides/',
  '/guides/kitchen-renovation-cost-vancouver/',
  '/blog/',
  '/contact/',
  '/about/',
];

const SAMPLE_LOCALES = ['en', 'zh', 'ja']; // hit each path in 3 locales

function extractHreflang(html) {
  // Match <link rel="alternate" hreflang="..." href="..." /> — order-agnostic
  const out = {};
  const linkRe = /<link\s+[^>]*rel=["']alternate["'][^>]*>/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const tag = m[0];
    const hreflang = /hreflang=["']([^"']+)["']/i.exec(tag)?.[1];
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
    if (hreflang && href) out[hreflang] = href;
  }
  return out;
}

async function audit(path, locale) {
  const url = `${BASE}/${locale}${path}`;
  let html;
  try {
    const res = await fetch(url, { redirect: 'manual' });
    if (res.status !== 200) {
      return { url, ok: false, reason: `HTTP ${res.status}` };
    }
    html = await res.text();
  } catch (e) {
    return { url, ok: false, reason: `fetch error: ${e.message}` };
  }

  const tags = extractHreflang(html);
  const issues = [];

  // 1. All expected locales present
  for (const loc of EXPECTED_LOCALES) {
    if (!tags[loc]) issues.push(`missing hreflang=${loc}`);
  }

  // 2. x-default present and points to /en/
  if (!tags['x-default']) {
    issues.push('missing hreflang=x-default');
  } else if (!tags['x-default'].includes('/en')) {
    issues.push(`x-default does not point to /en/: ${tags['x-default']}`);
  }

  // 3. Each locale's href contains the matching locale prefix
  for (const loc of EXPECTED_LOCALES) {
    const urlPrefix = HREFLANG_TO_URL_PREFIX[loc] ?? loc;
    if (tags[loc] && !tags[loc].includes(`/${urlPrefix}/`) && !tags[loc].endsWith(`/${urlPrefix}`)) {
      issues.push(`hreflang=${loc} href does not contain /${urlPrefix}/: ${tags[loc]}`);
    }
  }

  // 4. The current page's locale self-references the requested URL
  const expectedSelfHref = url.replace(/\/$/, '');
  const selfHref = tags[locale]?.replace(/\/$/, '');
  if (selfHref && selfHref !== expectedSelfHref) {
    issues.push(`hreflang=${locale} (self) is ${selfHref}, expected ${expectedSelfHref}`);
  }

  return { url, ok: issues.length === 0, issues, foundCount: Object.keys(tags).length };
}

(async () => {
  console.log(`Auditing ${BASE}`);
  console.log(`Expected: ${EXPECTED_LOCALES.length} locales + x-default = ${EXPECTED_LOCALES.length + 1} hreflang tags per page\n`);

  let totalOk = 0;
  let totalFail = 0;
  const failures = [];

  for (const path of PATHS) {
    for (const locale of SAMPLE_LOCALES) {
      const result = await audit(path, locale);
      const status = result.ok ? '✓' : '✗';
      const detail = result.ok
        ? `(${result.foundCount} tags)`
        : `[${result.reason || result.issues.join('; ')}]`;
      console.log(`  ${status} ${result.url} ${detail}`);
      if (result.ok) totalOk++;
      else { totalFail++; failures.push(result); }
    }
  }

  console.log(`\n${totalOk} OK · ${totalFail} FAIL · ${PATHS.length * SAMPLE_LOCALES.length} total`);

  if (failures.length > 0) {
    console.log('\nFailures:');
    for (const f of failures) {
      console.log(`  ${f.url}`);
      for (const i of (f.issues || [f.reason])) console.log(`    - ${i}`);
    }
    process.exit(1);
  }
})();
