import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { namespaces } from '@/i18n/namespaces';

/**
 * GUARD: service prices live in lib/pricing.ts and nowhere else.
 *
 * Before 2026-09-24 the site stated kitchen as $15K–$72K, $15K–$75K+, $15K–$80K,
 * $20K–$72K and $25K–$150K on different pages, and AI answer engines quoted
 * whichever they crawled. This test fails when a dollar literal re-appears on a
 * surface that is supposed to read the SSOT — messages use {kitchenRange}-style
 * tokens (resolved in i18n/request.ts), code calls formatPriceRange().
 *
 * Scope (what CAN read a constant): top-level message namespaces + the guides
 * index in every locale, the cost-guide page components, the guide/near-me/
 * service/areas routes that state a range, and /llms.txt. Out of scope, reported
 * in the PR instead: DB prose, the guide article bodies
 * (messages/<locale>/guides/<guide>.json), per-city figures computed from real
 * projects, and lib/data/seo-overrides.ts's non-SSOT services.
 *
 * A figure that is NOT a service price (insurance, a rebate, a permit fee, a
 * component cost, a blog-post summary) goes in the allow-list WITH a reason.
 */

// A dollar amount with a thousands group or a K suffix: $15,000 · $15K · $2.5K.
const DOLLAR = /\$\s?\d{1,3}(?:\.\d)?(?:,\d{3}|K)/g;

/** Money value of one literal, for value-based allow-listing across locales. */
function valueOf(lit: string): number {
  const n = Number(lit.replace(/[$,\s]/g, '').replace(/K$/, ''));
  return /K$/.test(lit) ? n * 1000 : n;
}

// ── Message allow-list: key path → figures (values in CAD) that are allowed
// because they are not a service price. Keyed by KEY, so it holds in all locales.
const MESSAGE_ALLOW: Record<string, { values: number[]; reason: string }> = {
  'careersPage.json::careers.role.pay': { values: [4000], reason: 'salary, not a service price' },
  'nav.json::nav.budgetUnder30k': { values: [30000], reason: 'project-gallery budget filter bucket' },
  'nav.json::nav.budgetMid': { values: [30000, 60000], reason: 'project-gallery budget filter bucket' },
  'nav.json::nav.budgetHigh': { values: [60000], reason: 'project-gallery budget filter bucket' },
  'faq.json::faq.realtor.a2': { values: [3000, 40000], reason: 'pre-listing package — not a SERVICE_PRICES service' },
  'faq.json::faq.heat-pump-hvac.a1': { values: [3000, 5000, 11000], reason: 'government rebates' },
  'faq.json::faq.accessible-bathroom.a1': { values: [3000, 8000, 10000, 25000, 35000, 60000], reason: 'accessible-bathroom scopes — not a SERVICE_PRICES service (owner to decide)' },
  'faq.json::faq.accessible-bathroom.a2': { values: [20000], reason: 'HAFI grant cap' },
  'financing.json::financing.tips.permits.description': { values: [2000], reason: 'permit fees' },
  'metadata.json::metadata.guides.kitchenCabinet.description': { values: [12000], reason: 'average cabinet spend quoted by the guide' },
  'guides/index.json::index.bathroom.passage': { values: [2000, 6000], reason: 'plumbing-relocation add-on cost' },
  'guides/index.json::index.basement.passage': { values: [2000, 5000], reason: 'permit fees' },
  'guides/index.json::index.basementSuite.passage': { values: [1800, 2400], reason: 'monthly rent' },
  'guides/index.json::index.faqs.q2.answer': { values: [1800, 2400], reason: 'monthly rent' },
  'guides/index.json::index.faqs.q3.answer': { values: [2000, 5000], reason: 'permit fees' },
  'guides/index.json::index.commercial.passage': { values: [100000, 300000, 800000, 400000], reason: 'commercial sub-type bands (existing copy; owner to decide)' },
};

// ── Code allow-list: file → literal substrings allowed on a line, with reasons.
const CODE_FILES = [
  ...readdirSync('components/pages').filter((f) => f.endsWith('CostGuidePage.tsx')).map((f) => `components/pages/${f}`),
  'components/pages/FinancingPage.tsx',
  'app/llms.txt/route.ts',
  'app/[locale]/areas/page.tsx',
  'app/[locale]/services/[service-slug]/page.tsx',
  ...['kitchen', 'bathroom', 'basement', 'whole-house'].map((s) => `app/[locale]/${s}-renovation-near-me/page.tsx`),
  'app/[locale]/renovation-near-me/page.tsx',
  ...['kitchen', 'bathroom', 'basement', 'whole-house'].map((s) => `app/[locale]/guides/${s}-renovation-cost-vancouver/page.tsx`),
];
const CODE_ALLOW: Record<string, { literals: string[]; reason: string }> = {
  'components/pages/BathroomCostGuidePage.tsx': {
    literals: ['$2K–$9K+', '$2.5K–$12K+', '$800–$5K+', '$20K–$80K+', '$25K–$120K+', '$18K–$45K+'],
    reason: 'deep-dive cards summarising DB blog posts (vanity/bathtub/toilet/by-size/by-style/average) — change with the post, reported in the PR',
  },
};

function leaves(node: unknown, prefix = '', into: Array<[string, string]> = []): Array<[string, string]> {
  if (typeof node === 'string') into.push([prefix, node]);
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) leaves(v, prefix ? `${prefix}.${k}` : k, into);
  }
  return into;
}

export function messageViolations(root = 'messages'): string[] {
  const out: string[] = [];
  const locales = readdirSync(root).filter((l) => l !== 'admin');
  const rels = [...namespaces.map((n) => `${n}.json`), 'guides/index.json'];
  for (const locale of locales) {
    for (const rel of rels) {
      const file = `${root}/${locale}/${rel}`;
      if (!existsSync(file)) continue;
      for (const [key, value] of leaves(JSON.parse(readFileSync(file, 'utf8')))) {
        const allow = MESSAGE_ALLOW[`${rel}::${key}`];
        for (const m of value.match(DOLLAR) ?? []) {
          if (allow?.values.includes(valueOf(m))) continue;
          out.push(`${locale}/${rel} ${key}: "${m}"`);
        }
      }
    }
  }
  return out;
}

export function codeViolations(): string[] {
  const out: string[] = [];
  for (const file of CODE_FILES) {
    const allow = CODE_ALLOW[file]?.literals ?? [];
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (/^\s*(\/\/|\*)/.test(line)) return; // comments explain history; they render nowhere
      let rest = line;
      for (const lit of allow) rest = rest.split(lit).join('');
      for (const m of rest.match(DOLLAR) ?? []) out.push(`${file}:${i + 1}: "${m}"`);
    });
  }
  return out;
}

// Non-"$" money forms translations use: 15,000 加元 · 15 000 $ · 15 000 долларов ·
// 1.5万 · 15 ألف. Only checked on TOKENISED keys, where EN proves the price moved
// to a token — so any such figure left in a translation is a stale copy.
const LOCAL_MONEY = /(?<![\d,.])\d{5,7}(?![\d,.])|\d{1,3}(?:[,.\s\u00a0\u202f]\d{3})+|\d+(?:\.\d+)?\s?(?:K|万|萬|ألف|हज़ार|ਹਜ਼ਾਰ|천|만|mil)(?![a-z])/g;
const HAS_TOKEN = /\{[a-z][A-Za-z]*(?:Range|From|To|Typical|Budget|Mid|High)(?:Long)?\}/;

function localValue(lit: string): number {
  const unit = lit.match(/(K|万|萬|ألف|हज़ार|ਹਜ਼ਾਰ|천|만|mil)$/)?.[1];
  const n = Number(lit.replace(/[^\d.]/g, unit ? '' : '').replace(/^(\d+)\.(\d{3})$/, '$1$2'));
  const mult: Record<string, number> = { K: 1e3, 万: 1e4, 萬: 1e4, 만: 1e4, 천: 1e3, ألف: 1e3, हज़ार: 1e3, ਹਜ਼ਾਰ: 1e3, mil: 1e3 };
  return unit ? Number(lit.replace(/[^\d.]/g, '')) * mult[unit] : n;
}

export function staleTranslationFigures(root = 'messages'): string[] {
  const out: string[] = [];
  const rels = [...namespaces.map((n) => `${n}.json`), 'guides/index.json'];
  const locales = readdirSync(root).filter((l) => l !== 'admin' && l !== 'en');
  for (const rel of rels) {
    const enFile = `${root}/en/${rel}`;
    if (!existsSync(enFile)) continue;
    const en = new Map(leaves(JSON.parse(readFileSync(enFile, 'utf8'))));
    for (const locale of locales) {
      const file = `${root}/${locale}/${rel}`;
      if (!existsSync(file)) continue;
      for (const [key, value] of leaves(JSON.parse(readFileSync(file, 'utf8')))) {
        const enValue = en.get(key);
        if (!HAS_TOKEN.test(value) && !(enValue && HAS_TOKEN.test(enValue))) continue;
        const kept = new Set([
          ...(enValue?.match(DOLLAR) ?? []).map(valueOf),
          ...(enValue?.match(LOCAL_MONEY) ?? []).map(localValue),
          ...[...(enValue ?? '').matchAll(/\$(\d+(?:\.\d+)?)M/g)].map((m) => Number(m[1]) * 1e6),
        ]);
        for (const m of value.match(LOCAL_MONEY) ?? []) {
          const v = localValue(m);
          if (v < 1000 || kept.has(v)) continue;
          out.push(`${locale}/${rel} ${key}: "${m.trim()}"`);
        }
      }
    }
  }
  return out;
}

describe('price-literal guard — service prices come only from lib/pricing.ts', () => {
  it('tokenised keys carry no stale non-"$" figure in any translation', () => {
    const v = staleTranslationFigures();
    expect(v, `${v.length} stale figure(s):\n  ${v.join('\n  ')}`).toEqual([]);
  });

  it('no message string (any locale) hard-codes a service price', () => {
    const v = messageViolations();
    expect(v, `${v.length} literal price(s) — use a {…Range} token instead:\n  ${v.slice(0, 60).join('\n  ')}`).toEqual([]);
  });

  it('no price-bearing code surface hard-codes a service price', () => {
    const v = codeViolations();
    expect(v, `${v.length} literal price(s) — use formatPriceRange()/formatPriceTier():\n  ${v.join('\n  ')}`).toEqual([]);
  });

  it('every guarded code file exists (a rename must not silently drop coverage)', () => {
    expect(CODE_FILES.filter((f) => !existsSync(f))).toEqual([]);
  });

  it('every message allow-list key still exists in EN (stale allowances hide nothing)', () => {
    const en = new Map<string, string>();
    for (const rel of [...namespaces.map((n) => `${n}.json`), 'guides/index.json']) {
      const file = `messages/en/${rel}`;
      if (!existsSync(file)) continue;
      for (const [k, v] of leaves(JSON.parse(readFileSync(file, 'utf8')))) en.set(`${rel}::${k}`, v);
    }
    expect(Object.keys(MESSAGE_ALLOW).filter((k) => !en.has(k))).toEqual([]);
  });

  it('the detector catches the formats the site has used', () => {
    for (const s of ['$15K–$72K', '$15,000 to $75,000+', '$2.5K', '$ 15,000']) expect(s.match(DOLLAR)).not.toBeNull();
    for (const s of ['$5M CGL', '$150–$400/sq ft', '{kitchenRange}', '$800']) expect(s.match(DOLLAR)).toBeNull();
  });
});
