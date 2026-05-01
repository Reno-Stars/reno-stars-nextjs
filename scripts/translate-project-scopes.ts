#!/usr/bin/env node
// Backfill project_scopes.localizations for ALL 12 non-EN locales.
// bulk-translate.py doesn't cover this table.
import fs from 'fs';
import { neon } from '@neondatabase/serverless';

const env = JSON.parse(
  fs.readFileSync(process.env.HOME + '/reno-star-business-intelligent/config/env.json', 'utf8'),
) as { services: { neon_db: string } };
const sql = neon(env.services.neon_db);

const LOCALES: Array<[string, string, string]> = [
  ['zh-Hant', 'zh-TW', 'ZhHant'],
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

async function gtxTranslate(text: string, target: string): Promise<string> {
  const url =
    'https://translate.googleapis.com/translate_a/single?' +
    new URLSearchParams({ client: 'gtx', sl: 'en', tl: target, dt: 't', q: text });
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) {
        await new Promise((s) => setTimeout(s, 1500 * (attempt + 1)));
        continue;
      }
      const data = (await r.json()) as Array<Array<[string, ...unknown[]]>>;
      return data[0].map((c) => c[0]).join('');
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise((s) => setTimeout(s, 1500 * (attempt + 1)));
    }
  }
  throw new Error('exhausted retries');
}

interface ScopeRow {
  id: string;
  scope_en: string | null;
  localizations: Record<string, string> | null;
}

(async () => {
  const rows = (await sql`
    SELECT id, scope_en, localizations FROM project_scopes WHERE scope_en IS NOT NULL
  `) as unknown as ScopeRow[];
  console.log(`Checking ${rows.length} scope rows...`);
  let translated = 0;
  let skipped = 0;
  for (const row of rows) {
    if (!row.scope_en) continue;
    const locs: Record<string, string> = row.localizations || {};
    const updates: Record<string, string> = {};
    for (const [, gtx, suffix] of LOCALES) {
      const key = 'scope' + suffix;
      if (locs[key]) {
        skipped++;
        continue;
      }
      try {
        process.stdout.write(`  ${row.id.slice(0, 8)} → ${suffix.toLowerCase()}... `);
        const t = await gtxTranslate(row.scope_en, gtx);
        if (t && t !== row.scope_en) updates[key] = t;
        process.stdout.write('ok\n');
        translated++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        process.stdout.write('ERR ' + msg.slice(0, 50) + '\n');
      }
      await new Promise((s) => setTimeout(s, 150));
    }
    if (Object.keys(updates).length === 0) continue;
    await sql`
      UPDATE project_scopes
      SET localizations = COALESCE(localizations, '{}'::jsonb) || ${JSON.stringify(updates)}::jsonb
      WHERE id = ${row.id}
    `;
  }
  console.log(`\nDONE: ${translated} translated, ${skipped} skipped (already present)`);
})().catch((e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error('FATAL', msg);
  process.exit(1);
});
