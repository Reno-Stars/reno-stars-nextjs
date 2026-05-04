/**
 * Translates service_tags + service_benefits rows into the 12 non-EN/non-ZH
 * locales using Google's free translate.googleapis.com gtx endpoint (same
 * pattern as bulk-translate.py per memory feedback_seo_translation_backfill_pattern.md).
 *
 * The bulk-translate.py script doesn't yet support these two tables — adding
 * a one-off TS script here. Idempotent: skips a row+locale combo if its key
 * already exists in localizations JSONB.
 *
 * Coverage: tag_en + benefit_en → 12 missing locales (zh-Hant, ja, ko, es,
 * pa, tl, fa, vi, ru, ar, hi, fr). Each row's localizations gets keys like
 * `tagJa`, `tagKo`, etc.
 */
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

// Locale → Google Translate code + camelCase suffix (matches bulk-translate.py).
const LOCALES: { locale: string; gtx: string; suffix: string }[] = [
  { locale: 'zh-Hant', gtx: 'zh-TW', suffix: 'ZhHant' },
  { locale: 'ja',      gtx: 'ja',    suffix: 'Ja' },
  { locale: 'ko',      gtx: 'ko',    suffix: 'Ko' },
  { locale: 'es',      gtx: 'es',    suffix: 'Es' },
  { locale: 'pa',      gtx: 'pa',    suffix: 'Pa' },
  { locale: 'tl',      gtx: 'tl',    suffix: 'Tl' },
  { locale: 'fa',      gtx: 'fa',    suffix: 'Fa' },
  { locale: 'vi',      gtx: 'vi',    suffix: 'Vi' },
  { locale: 'ru',      gtx: 'ru',    suffix: 'Ru' },
  { locale: 'ar',      gtx: 'ar',    suffix: 'Ar' },
  { locale: 'hi',      gtx: 'hi',    suffix: 'Hi' },
  { locale: 'fr',      gtx: 'fr',    suffix: 'Fr' },
];

// Brand glossary — proper nouns we DON'T want translated. Replaced with
// all-caps Latin markers before sending to gtx, swapped back after.
const GLOSSARY: { term: string; marker: string }[] = [
  { term: 'Reno Stars',     marker: 'XQXAAYQY' },
  { term: 'BC Hydro',       marker: 'XQXABYQY' },
  { term: 'BC Code',        marker: 'XQXACYQY' },
  { term: 'BC Building',    marker: 'XQXADYQY' },
  { term: 'CSA B651',       marker: 'XQXAEYQY' },
  { term: 'PEX-A',          marker: 'XQXAFYQY' },
  { term: 'PEX-B',          marker: 'XQXAGYQY' },
  { term: 'PEX',            marker: 'XQXAHYQY' },
  { term: 'Powerwall',      marker: 'XQXAIYQY' },
  { term: 'Enphase',        marker: 'XQXAJYQY' },
  { term: 'WSBC',           marker: 'XQXAKYQY' },
  { term: 'Mitsubishi',     marker: 'XQXALYQY' },
  { term: 'Daikin',         marker: 'XQXAMYQY' },
  { term: 'Fujitsu',        marker: 'XQXANYQY' },
  { term: 'Vancouver',      marker: 'XQXAOYQY' },
];

// Sort longest-first so multi-word terms substitute before single-word terms
GLOSSARY.sort((a, b) => b.term.length - a.term.length);

function applyGlossary(text: string): string {
  let out = text;
  for (const { term, marker } of GLOSSARY) {
    out = out.split(term).join(marker);
  }
  return out;
}

function unprotectGlossary(text: string): string {
  let out = text;
  for (const { term, marker } of GLOSSARY) {
    // Tolerate inserted spaces between marker chars — gtx sometimes injects them
    const tolerantPattern = new RegExp(marker.split('').join('\\s*'), 'g');
    out = out.replace(tolerantPattern, term);
  }
  return out;
}

async function gtxTranslate(text: string, target: string): Promise<string> {
  if (!text || !text.trim()) return text;
  const protected_ = applyGlossary(text);
  const params = new URLSearchParams({
    client: 'gtx', sl: 'en', tl: target, dt: 't', q: protected_,
  });
  const url = `https://translate.googleapis.com/translate_a/single?${params}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data: unknown = await r.json();
      if (!Array.isArray(data) || !Array.isArray((data as unknown[][])[0])) throw new Error('unexpected response shape');
      const segments = (data as unknown[][])[0] as unknown[][];
      const translated = segments.map((s) => (Array.isArray(s) && typeof s[0] === 'string') ? s[0] : '').filter(Boolean).join('');
      return unprotectGlossary(translated);
    } catch (e) {
      if (attempt === 2) {
        console.warn(`  gtx fail [${target}]: ${(e as Error).message} — keeping en`);
        return text;
      }
      await new Promise((res) => setTimeout(res, 1000 * (attempt + 1)));
    }
  }
  return text;
}

async function translateTable(table: 'service_tags' | 'service_benefits'): Promise<void> {
  const baseField = table === 'service_tags' ? 'tag_en' : 'benefit_en';
  const keyField = table === 'service_tags' ? 'tag' : 'benefit';
  // Only translate rows for the 4 NEW services (poly-b, heat-pump, accessible, critical-load).
  // Existing services already have full localizations from the 2026-04-30 backfill.
  const rows = await pool.query<{ id: string; en: string; localizations: Record<string, string> | null }>(
    `SELECT t.id, t.${baseField} AS en, t.localizations
       FROM ${table} t
       JOIN services s ON s.id = t.service_id
      WHERE s.slug IN ('poly-b-replacement', 'heat-pump-hvac', 'accessible-bathroom', 'critical-load-panel')`,
  );
  console.log(`=== ${table} (${rows.rows.length} rows × ${LOCALES.length} locales) ===`);

  let totalTranslated = 0;
  let totalSkipped = 0;

  for (const row of rows.rows) {
    const existing = row.localizations || {};
    const updates: Record<string, string> = { ...existing };
    for (const { gtx, suffix } of LOCALES) {
      const key = `${keyField}${suffix}`;
      if (typeof existing[key] === 'string' && existing[key].length > 0) {
        totalSkipped++;
        continue;
      }
      const translated = await gtxTranslate(row.en, gtx);
      updates[key] = translated;
      totalTranslated++;
      // Polite throttle — gtx free endpoint, don't get rate-limited
      await new Promise((res) => setTimeout(res, 100));
    }
    if (totalTranslated % 12 === 0) {
      // Show progress every full row
      process.stdout.write(`  ${row.en.slice(0, 50)}... done\n`);
    }
    await pool.query(
      `UPDATE ${table} SET localizations = $1 WHERE id = $2`,
      [JSON.stringify(updates), row.id],
    );
  }
  console.log(`  ${table} done: ${totalTranslated} translated, ${totalSkipped} skipped`);
}

async function run() {
  await translateTable('service_tags');
  await translateTable('service_benefits');
  await pool.end();
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
