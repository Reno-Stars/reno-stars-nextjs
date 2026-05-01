#!/usr/bin/env node
// Translate home FAQs (4 rows) + service_areas.name to ru/ar/hi/fr via gtx.
// bulk-translate.py doesn't cover faqs at all, and protects city names in glossary
// (so name field never gets translated). Handle both here.
import fs from 'fs';
import { neon } from '@neondatabase/serverless';

const env = JSON.parse(
  fs.readFileSync(process.env.HOME + '/reno-star-business-intelligent/config/env.json', 'utf8'),
) as { services: { neon_db: string } };
const sql = neon(env.services.neon_db);

type LocaleKey = 'ru' | 'ar' | 'hi' | 'fr';

// City name transliterations — manual, accurate.
const CITY_NAMES: Record<string, Record<LocaleKey, string>> = {
  vancouver: { ru: 'Ванкувер', ar: 'فانكوفر', hi: 'वैंकूवर', fr: 'Vancouver' },
  richmond: { ru: 'Ричмонд', ar: 'ريتشموند', hi: 'रिचमंड', fr: 'Richmond' },
  burnaby: { ru: 'Бернаби', ar: 'برنابي', hi: 'बर्नबी', fr: 'Burnaby' },
  surrey: { ru: 'Суррей', ar: 'ساري', hi: 'सरे', fr: 'Surrey' },
  coquitlam: { ru: 'Кокитлам', ar: 'كوكويتلام', hi: 'कोक्विटलम', fr: 'Coquitlam' },
  'west-vancouver': { ru: 'Уэст-Ванкувер', ar: 'ويست فانكوفر', hi: 'वेस्ट वैंकूवर', fr: 'West Vancouver' },
  'new-westminster': { ru: 'Нью-Уэстминстер', ar: 'نيو وستمنستر', hi: 'न्यू वेस्टमिंस्टर', fr: 'New Westminster' },
  delta: { ru: 'Дельта', ar: 'دلتا', hi: 'डेल्टा', fr: 'Delta' },
  'north-vancouver': { ru: 'Норт-Ванкувер', ar: 'نورث فانكوفر', hi: 'नॉर्थ वैंकूवर', fr: 'North Vancouver' },
  langley: { ru: 'Лэнгли', ar: 'لانغلي', hi: 'लैंगली', fr: 'Langley' },
  'port-moody': { ru: 'Порт-Муди', ar: 'بورت مودي', hi: 'पोर्ट मूडी', fr: 'Port Moody' },
  'maple-ridge': { ru: 'Мейпл-Ридж', ar: 'مابل ريدج', hi: 'मेपल रिज', fr: 'Maple Ridge' },
  'white-rock': { ru: 'Уайт-Рок', ar: 'وايت روك', hi: 'व्हाइट रॉक', fr: 'White Rock' },
  'port-coquitlam': { ru: 'Порт-Кокитлам', ar: 'بورت كوكويتلام', hi: 'पोर्ट कोक्विटलम', fr: 'Port Coquitlam' },
};

async function gtxTranslate(text: string, target: string, source = 'en'): Promise<string> {
  const url =
    'https://translate.googleapis.com/translate_a/single?' +
    new URLSearchParams({ client: 'gtx', sl: source, tl: target, dt: 't', q: text });
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

interface AreaRow {
  slug: string;
  name_en: string | null;
  localizations: Record<string, string> | null;
}

interface FaqRow {
  id: string;
  question_en: string | null;
  answer_en: string | null;
  localizations: Record<string, string> | null;
}

async function backfillCityNames() {
  const areas = (await sql`
    SELECT slug, name_en, localizations FROM service_areas
  `) as unknown as AreaRow[];
  console.log(`Backfilling city names for ${areas.length} areas...`);
  let n = 0;
  for (const a of areas) {
    const map = CITY_NAMES[a.slug];
    if (!map) {
      console.log(`  SKIP ${a.slug}: no transliteration map`);
      continue;
    }
    const locs = a.localizations || {};
    const updates: Record<string, string> = {};
    for (const loc of ['ru', 'ar', 'hi', 'fr'] as const) {
      const key = 'name' + loc[0].toUpperCase() + loc.slice(1);
      if (locs[key]) continue;
      updates[key] = map[loc];
    }
    if (Object.keys(updates).length === 0) continue;
    await sql`
      UPDATE service_areas
      SET localizations = COALESCE(localizations, '{}'::jsonb) || ${JSON.stringify(updates)}::jsonb,
          updated_at = NOW()
      WHERE slug = ${a.slug}
    `;
    console.log(`  ✓ ${a.slug}: +${Object.keys(updates).length} names`);
    n += Object.keys(updates).length;
  }
  console.log(`Names backfilled: ${n}`);
}

async function backfillFaqs() {
  const faqs = (await sql`
    SELECT id, question_en, answer_en, localizations FROM faqs
  `) as unknown as FaqRow[];
  console.log(`\nBackfilling FAQs for ${faqs.length} rows (4 locales × 2 fields each)...`);
  let n = 0;
  for (const f of faqs) {
    const locs = f.localizations || {};
    const updates: Record<string, string> = {};
    for (const [loc, gtxLoc] of [
      ['ru', 'ru'],
      ['ar', 'ar'],
      ['hi', 'hi'],
      ['fr', 'fr'],
    ] as const) {
      const cap = loc[0].toUpperCase() + loc.slice(1);
      const qKey = 'question' + cap;
      const aKey = 'answer' + cap;
      if (!locs[qKey] && f.question_en) {
        process.stdout.write(`  ${f.id.slice(0, 8)} q→${loc}... `);
        try {
          updates[qKey] = await gtxTranslate(f.question_en, gtxLoc);
          process.stdout.write('ok\n');
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          process.stdout.write('ERR ' + msg.slice(0, 50) + '\n');
        }
        await new Promise((s) => setTimeout(s, 200));
      }
      if (!locs[aKey] && f.answer_en) {
        process.stdout.write(`  ${f.id.slice(0, 8)} a→${loc}... `);
        try {
          updates[aKey] = await gtxTranslate(f.answer_en, gtxLoc);
          process.stdout.write('ok\n');
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          process.stdout.write('ERR ' + msg.slice(0, 50) + '\n');
        }
        await new Promise((s) => setTimeout(s, 200));
      }
    }
    if (Object.keys(updates).length === 0) continue;
    await sql`
      UPDATE faqs
      SET localizations = COALESCE(localizations, '{}'::jsonb) || ${JSON.stringify(updates)}::jsonb,
          updated_at = NOW()
      WHERE id = ${f.id}
    `;
    n += Object.keys(updates).length;
  }
  console.log(`FAQs backfilled: ${n} fields`);
}

(async () => {
  await backfillCityNames();
  await backfillFaqs();
  console.log('\nDONE');
})().catch((e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error('FATAL', msg);
  process.exit(1);
});
