#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Backfill localizations for service_tags, service_benefits, and
 * service_areas.highlights into Ja/Ko/Es/Pa/Tl/Fa/Vi.
 *
 * Caught 2026-05-01: /ja/services/kitchen/coquitlam/ rendered the chips
 * (Custom Cabinets, Quartz Countertops...) and "Why Choose" bullets in
 * English because the DB only had en/zh/zh-Hant for these fields.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... node scripts/backfill-tag-highlight-translations.mjs           # dry run
 *   DATABASE_URL=postgresql://... node scripts/backfill-tag-highlight-translations.mjs --apply
 */
import { neon } from '@neondatabase/serverless';

const APPLY = process.argv.includes('--apply');
const sql = neon(process.env.DATABASE_URL);

const LOCALES = [
  ['ja', 'ja', 'Ja'],
  ['ko', 'ko', 'Ko'],
  ['es', 'es', 'Es'],
  ['pa', 'pa', 'Pa'],
  ['tl', 'tl', 'Tl'],
  ['fa', 'fa', 'Fa'],
  ['vi', 'vi', 'Vi'],
  ['ru', 'ru', 'Ru'],
  ['ar', 'ar', 'Ar'],
  ['hi', 'hi', 'Hi'],
  ['fr', 'fr', 'Fr'],
];

const GTX = 'https://translate.googleapis.com/translate_a/single';

async function gtx(text, target) {
  const params = new URLSearchParams({ client: 'gtx', sl: 'en', tl: target, dt: 't', q: text });
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const r = await fetch(`${GTX}?${params}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const text = await r.text();
      if (text.startsWith('<')) throw new Error('HTML response (rate-limited)');
      const data = JSON.parse(text);
      return data[0].map(seg => seg[0]).filter(Boolean).join('');
    } catch (e) {
      if (attempt === 4) throw e;
      const delay = 2000 * Math.pow(2, attempt); // 2s, 4s, 8s, 16s
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

async function backfillTags() {
  const rows = await sql`SELECT id, tag_en, tag_zh, localizations FROM service_tags ORDER BY id`;
  console.log(`\nservice_tags: ${rows.length} rows`);
  let written = 0;
  for (const row of rows) {
    const loc = row.localizations || {};
    const updates = {};
    for (const [, tgt, suffix] of LOCALES) {
      const key = `tag${suffix}`;
      if (loc[key]) continue;
      const t = await gtx(row.tag_en, tgt);
      updates[key] = t;
      await new Promise(r => setTimeout(r, 250));
    }
    if (Object.keys(updates).length === 0) continue;
    const merged = { ...loc, ...updates };
    if (APPLY) {
      await sql`UPDATE service_tags SET localizations = ${merged}::jsonb WHERE id = ${row.id}`;
    }
    written++;
    console.log(`  [${row.tag_en}] +${Object.keys(updates).length} (${row.id.slice(0, 8)})`);
  }
  console.log(`  → ${written} rows ${APPLY ? 'updated' : 'would update'}`);
}

async function backfillBenefits() {
  const rows = await sql`SELECT id, benefit_en, benefit_zh, localizations FROM service_benefits ORDER BY id`;
  console.log(`\nservice_benefits: ${rows.length} rows`);
  let written = 0;
  for (const row of rows) {
    const loc = row.localizations || {};
    const updates = {};
    for (const [, tgt, suffix] of LOCALES) {
      const key = `benefit${suffix}`;
      if (loc[key]) continue;
      const t = await gtx(row.benefit_en, tgt);
      updates[key] = t;
      await new Promise(r => setTimeout(r, 250));
    }
    if (Object.keys(updates).length === 0) continue;
    const merged = { ...loc, ...updates };
    if (APPLY) {
      await sql`UPDATE service_benefits SET localizations = ${merged}::jsonb WHERE id = ${row.id}`;
    }
    written++;
    console.log(`  [${row.benefit_en.slice(0, 50)}] +${Object.keys(updates).length}`);
  }
  console.log(`  → ${written} rows ${APPLY ? 'updated' : 'would update'}`);
}

async function backfillAreaHighlights() {
  const rows = await sql`SELECT id, slug, highlights_en, localizations FROM service_areas WHERE highlights_en IS NOT NULL AND highlights_en != ''`;
  console.log(`\nservice_areas.highlights: ${rows.length} rows`);
  let written = 0;
  for (const row of rows) {
    const loc = row.localizations || {};
    const lines = row.highlights_en.split('\n').map(s => s.trim()).filter(Boolean);
    const updates = {};
    for (const [, tgt, suffix] of LOCALES) {
      const key = `highlights${suffix}`;
      if (loc[key]) continue;
      const translatedLines = [];
      for (const line of lines) {
        const t = await gtx(line, tgt);
        translatedLines.push(t);
        await new Promise(r => setTimeout(r, 250));
      }
      updates[key] = translatedLines.join('\n');
    }
    if (Object.keys(updates).length === 0) continue;
    const merged = { ...loc, ...updates };
    if (APPLY) {
      await sql`UPDATE service_areas SET localizations = ${merged}::jsonb WHERE id = ${row.id}`;
    }
    written++;
    console.log(`  [${row.slug}] +${Object.keys(updates).length}`);
  }
  console.log(`  → ${written} rows ${APPLY ? 'updated' : 'would update'}`);
}

async function backfillProjectScopes() {
  const rows = await sql`SELECT id, scope_en, localizations FROM project_scopes ORDER BY scope_en, id`;
  console.log(`\nproject_scopes: ${rows.length} rows`);

  // Dedupe by scope_en — translate each unique string ONCE.
  const uniqueScopes = [...new Set(rows.map(r => r.scope_en))];
  console.log(`  ${uniqueScopes.length} unique scope strings`);
  const translations = {};
  for (const s of uniqueScopes) {
    translations[s] = {};
    for (const [, tgt, suffix] of LOCALES) {
      const t = await gtx(s, tgt);
      translations[s][`scope${suffix}`] = t;
      await new Promise(r => setTimeout(r, 250));
    }
  }

  let written = 0;
  for (const row of rows) {
    const loc = row.localizations || {};
    const tx = translations[row.scope_en];
    const updates = {};
    for (const k of Object.keys(tx)) {
      if (!loc[k]) updates[k] = tx[k];
    }
    if (Object.keys(updates).length === 0) continue;
    const merged = { ...loc, ...updates };
    if (APPLY) {
      await sql`UPDATE project_scopes SET localizations = ${merged}::jsonb WHERE id = ${row.id}`;
    }
    written++;
  }
  console.log(`  → ${written} rows ${APPLY ? 'updated' : 'would update'}`);
}

await backfillTags();
await backfillBenefits();
await backfillAreaHighlights();
await backfillProjectScopes();
console.log(`\nDone. ${APPLY ? '' : 'Dry run — pass --apply to write.'}`);
