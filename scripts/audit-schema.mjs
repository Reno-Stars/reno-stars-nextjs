#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Schema firing audit. Fetches representative URLs in multiple locales,
 * extracts every JSON-LD block, validates required fields, and reports
 * any missing schemas or missing inLanguage tags.
 *
 * Usage:
 *   node scripts/audit-schema.mjs
 *   BASE=https://reno-stars-nextjs-staging.vercel.app node scripts/audit-schema.mjs
 */

const BASE = process.env.BASE || 'https://www.reno-stars.com';

// One URL per route shape, in 4 locales (en is control, others are the worry list).
const URLS = [
  { path: '/',                                                 expect: ['WebSite', 'HomeAndConstructionBusiness'] },
  { path: '/services/kitchen/',                                expect: ['Service', 'BreadcrumbList', 'FAQPage'] },
  { path: '/services/kitchen/burnaby/',                        expect: ['Service', 'BreadcrumbList', 'FAQPage'] },
  { path: '/areas/burnaby/',                                   expect: ['HomeAndConstructionBusiness', 'BreadcrumbList', 'FAQPage'] },
  { path: '/projects/',                                        expect: ['BreadcrumbList', 'FAQPage', 'ItemList'] },
  { path: '/guides/',                                          expect: ['BreadcrumbList', 'FAQPage', 'ItemList'] },
  { path: '/guides/kitchen-renovation-cost-vancouver/',        expect: ['BreadcrumbList', 'FAQPage', 'HowTo', 'BlogPosting'] },
  { path: '/guides/bathroom-renovation-cost-vancouver/',       expect: ['BreadcrumbList', 'FAQPage', 'HowTo', 'BlogPosting'] },
  { path: '/blog/',                                            expect: ['BreadcrumbList', 'ItemList'] },
];

const LOCALES = ['en', 'zh', 'ja', 'vi'];

function extractJsonLd(html) {
  const out = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const body = m[1].trim();
    try {
      out.push(JSON.parse(body));
    } catch {
      out.push({ __parseError: true, snippet: body.slice(0, 100) });
    }
  }
  return out;
}

function flatten(node) {
  // A JSON-LD payload can be a single object, an array, or have @graph
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(flatten);
  if (node['@graph']) return flatten(node['@graph']);
  return [node];
}

async function audit(path, locale) {
  const url = `${BASE}/${locale}${path}`;
  let html;
  try {
    const res = await fetch(url, { redirect: 'manual' });
    if (res.status !== 200) return { url, ok: false, reason: `HTTP ${res.status}` };
    html = await res.text();
  } catch (e) {
    return { url, ok: false, reason: `fetch error: ${e.message}` };
  }

  const blocks = extractJsonLd(html);
  const nodes = blocks.flatMap(flatten);
  const types = nodes.map(n => n['@type']).filter(Boolean);
  const inLanguageNodes = nodes.filter(n => n.inLanguage);
  const parseErrors = blocks.filter(b => b.__parseError);

  return {
    url, ok: true,
    types, inLanguageValues: inLanguageNodes.map(n => `${n['@type']}=${n.inLanguage}`),
    parseErrors: parseErrors.length,
    nodeCount: nodes.length,
  };
}

(async () => {
  console.log(`Schema firing audit — ${BASE}\n`);
  let totalUrls = 0, urlsWithGaps = 0;
  const gapDetails = [];

  for (const { path, expect } of URLS) {
    console.log(`\n=== ${path} ===`);
    for (const locale of LOCALES) {
      const r = await audit(path, locale);
      totalUrls++;
      if (!r.ok) {
        console.log(`  ✗ /${locale}${path} — ${r.reason}`);
        urlsWithGaps++;
        gapDetails.push({ url: r.url, issue: r.reason });
        continue;
      }
      const missing = expect.filter(t => !r.types.includes(t));
      const extra = r.types.filter(t => !expect.includes(t));
      const status = missing.length === 0 ? '✓' : '⚠';
      const inLangCount = r.inLanguageValues.length;
      console.log(`  ${status} /${locale}${path}`);
      console.log(`      types: [${r.types.join(', ')}]`);
      console.log(`      inLanguage: ${inLangCount > 0 ? r.inLanguageValues.join(', ') : 'NONE'}`);
      if (missing.length > 0) {
        console.log(`      MISSING: ${missing.join(', ')}`);
        urlsWithGaps++;
        gapDetails.push({ url: r.url, issue: `missing schemas: ${missing.join(', ')}` });
      }
      if (locale !== 'en' && inLangCount === 0) {
        console.log(`      WARN: no inLanguage on a non-EN page`);
      }
      if (r.parseErrors > 0) {
        console.log(`      PARSE ERROR in ${r.parseErrors} block(s)`);
        gapDetails.push({ url: r.url, issue: `${r.parseErrors} JSON-LD parse errors` });
      }
    }
  }

  console.log(`\n${totalUrls} URLs audited · ${urlsWithGaps} with gaps`);
  if (gapDetails.length > 0) {
    console.log('\nGaps:');
    for (const g of gapDetails) console.log(`  ${g.url} — ${g.issue}`);
  }
  process.exit(urlsWithGaps > 0 ? 1 : 0);
})();
