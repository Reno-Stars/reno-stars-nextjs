/**
 * Repair machine-translated renovation terms in Chinese copy — the repo's
 * messages/zh* files and (via a generated migration) the database.
 *
 *   npx tsx scripts/fix-zh-glossary.ts --messages
 *       Rewrite messages/zh/**.json and messages/zh-Hant/**.json in place.
 *
 *   npx tsx scripts/fix-zh-glossary.ts --audit-sql > audit.sql
 *       Print a READ-ONLY query listing every (table, column/key, rule) that
 *       currently hits. Run it against production, save the output (psql -At
 *       -F'|'), then:
 *
 *   npx tsx scripts/fix-zh-glossary.ts --emit-sql <hits.txt> <glossary.sql> <brand.sql>
 *       Write the two migrations from those hits.
 *
 * The glossary and its rules live in scripts/lib/zh-glossary.ts.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BRAND_PATTERN,
  ZH_GLOSSARY,
  applyBrand,
  applyGlossary,
  applyLocaleLinks,
  buildBrandUpdate,
  buildGlossaryStatements,
  buildReplaceUpdate,
  sqlLiteral,
  type GlossaryHit,
  type ZhScript,
  type ZhTarget,
} from './lib/zh-glossary';

/** Every *_zh text column in the website DB (information_schema, 2026-09-24). */
const ZH_COLUMNS: Readonly<Record<string, readonly string[]>> = {
  about_sections: ['lets_build_together_zh', 'our_journey_zh', 'our_values_zh', 'what_we_offer_zh', 'why_choose_us_zh'],
  blog_posts: ['content_zh', 'excerpt_zh', 'focus_keyword_zh', 'meta_description_zh', 'meta_title_zh', 'seo_keywords_zh', 'title_zh'],
  designs: ['title_zh'],
  faqs: ['answer_zh', 'question_zh'],
  partners: ['name_zh'],
  project_external_products: ['label_zh'],
  project_image_pairs: ['after_alt_text_zh', 'before_alt_text_zh', 'caption_zh', 'title_zh'],
  project_scopes: ['scope_zh'],
  project_sites: ['badge_zh', 'description_zh', 'duration_zh', 'excerpt_zh', 'focus_keyword_zh', 'meta_description_zh', 'meta_title_zh', 'seo_keywords_zh', 'space_type_zh', 'title_zh'],
  projects: ['badge_zh', 'category_zh', 'challenge_zh', 'description_zh', 'duration_zh', 'excerpt_zh', 'focus_keyword_zh', 'meta_description_zh', 'meta_title_zh', 'project_story_zh', 'seo_keywords_zh', 'solution_zh', 'space_type_zh', 'title_zh'],
  property_types: ['name_zh'],
  service_areas: ['content_zh', 'description_zh', 'highlights_zh', 'meta_description_zh', 'meta_title_zh', 'name_zh'],
  service_benefits: ['benefit_zh'],
  service_tags: ['tag_zh'],
  services: ['description_zh', 'long_description_zh', 'title_zh'],
  showroom_info: ['appointment_text_zh'],
  site_external_products: ['label_zh'],
  site_image_pairs: ['after_alt_text_zh', 'before_alt_text_zh', 'caption_zh', 'title_zh'],
  social_media_posts: ['facebook_caption_zh', 'facebook_hashtags_zh', 'instagram_caption_zh', 'instagram_hashtags_zh', 'title_zh', 'xiaohongshu_caption_zh', 'xiaohongshu_topic_tags_zh'],
  testimonials: ['text_zh'],
  trust_badges: ['badge_zh'],
};

/** Tables whose `localizations` jsonb carries <field>ZhHant keys. */
const LOCALIZED_TABLES = [
  'about_sections', 'blog_posts', 'designs', 'faqs', 'partners', 'project_external_products',
  'project_image_pairs', 'project_scopes', 'project_sites', 'projects', 'service_areas',
  'service_benefits', 'service_tags', 'services', 'showroom_info', 'site_external_products',
  'site_image_pairs', 'testimonials', 'trust_badges',
] as const;

const LINK_RULES: Readonly<Record<ZhScript, readonly (readonly [string, string])[]>> = {
  zh: [['](/en/', '](/zh/'], ['href="/en/', 'href="/zh/']],
  'zh-Hant': [['](/en/', '](/zh-Hant/'], ['href="/en/', 'href="/zh-Hant/']],
};

// ───────────────────────────── messages ─────────────────────────────

function jsonFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return jsonFiles(p);
    return name.endsWith('.json') ? [p] : [];
  });
}

function fixValue(value: unknown, script: ZhScript, tally: { hits: number }): unknown {
  if (typeof value === 'string') {
    const a = applyGlossary(value, script);
    const b = applyBrand(a.text, script);
    const c = applyLocaleLinks(b.text, script);
    tally.hits += a.hits + b.hits + c.hits;
    return c.text;
  }
  if (Array.isArray(value)) return value.map((v) => fixValue(v, script, tally));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, fixValue(v, script, tally)]),
    );
  }
  return value;
}

function fixMessages(): void {
  for (const script of ['zh', 'zh-Hant'] as const) {
    for (const file of jsonFiles(join('messages', script))) {
      const raw = readFileSync(file, 'utf8');
      const tally = { hits: 0 };
      const fixed = fixValue(JSON.parse(raw), script, tally);
      if (tally.hits === 0) continue;
      writeFileSync(file, `${JSON.stringify(fixed, null, 2)}\n`);
      console.log(`${file}: ${tally.hits} correction(s)`);
    }
  }
}

// ─────────────────────────────── SQL ───────────────────────────────

/** Rows (table, label, value, script) for every Chinese text in the DB. */
function sourceUnion(): string {
  const parts: string[] = [];
  for (const [table, cols] of Object.entries(ZH_COLUMNS)) {
    for (const col of cols) {
      parts.push(`SELECT 'col' k, '${table}' t, '${col}' c, 'zh' s, ${col}::text v FROM ${table}`);
    }
  }
  for (const table of LOCALIZED_TABLES) {
    parts.push(
      `SELECT 'key' k, '${table}' t, key c, 'zh-Hant' s, value v FROM ${table}, ` +
        `jsonb_each_text(coalesce(localizations, '{}'::jsonb)) WHERE key ~ 'ZhHant$'`,
    );
  }
  return parts.join('\nUNION ALL ');
}

function rulesValues(): string {
  const rows: string[] = [];
  for (const script of ['zh', 'zh-Hant'] as const) {
    for (const [bad] of ZH_GLOSSARY[script]) rows.push(`('rule', '${script}', ${sqlLiteral(bad)})`);
    for (const [bad] of LINK_RULES[script]) rows.push(`('link', '${script}', ${sqlLiteral(bad)})`);
  }
  return rows.join(',\n  ');
}

/** Read-only: one line per hit — kind|k|table|column-or-key|script|phrase|rows */
function auditSql(): string {
  return (
    `WITH src AS (\n${sourceUnion()}\n),\n` +
    `rules(kind, s, bad) AS (VALUES\n  ${rulesValues()}\n)\n` +
    `SELECT r.kind, x.k, x.t, x.c, x.s, r.bad, count(*) FROM src x JOIN rules r ON r.s = x.s\n` +
    `WHERE strpos(x.v, r.bad) > 0 GROUP BY 1,2,3,4,5,6\n` +
    `UNION ALL\n` +
    `SELECT 'brand', x.k, x.t, x.c, x.s, '', count(*) FROM src x\n` +
    `WHERE x.v ~ ${sqlLiteral(BRAND_PATTERN)} GROUP BY 1,2,3,4,5,6\n` +
    `ORDER BY 1,3,4,6;`
  );
}

interface HitLine {
  kind: string;
  target: ZhTarget;
  bad: string;
  rows: number;
}

function parseHits(file: string): HitLine[] {
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => {
      const [kind, k, table, col, script, bad, rows] = l.split('|');
      const s = script as ZhScript;
      const target: ZhTarget = k === 'col' ? { table, column: col, script: s } : { table, jsonKey: col, script: s };
      return { kind, target, bad, rows: Number(rows) };
    });
}

const HEADER = (title: string, run: string, body: string) =>
  `-- ${title}\n--   pnpm db:query -f ${run} --dry-run   # then without --dry-run\n` +
  `-- NOT APPLIED to production when authored (2026-09-24). Applying it is a human decision.\n--\n${body}\n`;

function emitSql(hitsFile: string, glossaryOut: string, brandOut: string): void {
  const hits = parseHits(hitsFile);
  const totalRows = (kind: string) => hits.filter((h) => h.kind === kind).reduce((n, h) => n + h.rows, 0);

  const glossaryHits: GlossaryHit[] = hits
    .filter((h) => h.kind === 'rule')
    .map((h) => {
      const rule = ZH_GLOSSARY[h.target.script].find(([bad]) => bad === h.bad);
      if (!rule) throw new Error(`hit for unknown rule ${h.bad}`);
      return { target: h.target, bad: rule[0], good: rule[1] };
    });
  const linkStmts = hits
    .filter((h) => h.kind === 'link')
    .map((h) => {
      const rule = LINK_RULES[h.target.script].find(([bad]) => bad === h.bad);
      if (!rule) throw new Error(`hit for unknown link rule ${h.bad}`);
      return buildReplaceUpdate(h.target, rule[0], rule[1]);
    });

  writeFileSync(
    glossaryOut,
    HEADER(
      'Migration: repair machine-translated renovation terms in zh / zh-Hant copy.',
      glossaryOut,
      [
        '-- GENERATED by scripts/fix-zh-glossary.ts from a read-only production audit on',
        '-- 2026-09-24; the rules and their rationale are in scripts/lib/zh-glossary.ts.',
        '-- Each UPDATE replaces ONE exact phrase in ONE column (or one localizations',
        '-- ZhHant key) and touches only rows containing it. Statements for a column run',
        '-- in glossary order, most specific phrase first. Idempotent: a second run',
        '-- changes 0 rows.',
        '--',
        `-- Pre-audit: ${glossaryHits.length} (column, phrase) hits over ${totalRows('rule')} row-matches;`,
        `-- ${linkStmts.length} (column, /en/-link) hits over ${totalRows('link')} row-matches.`,
        '--',
        '-- Pre-check (expect > 0):   SELECT count(*) FROM services',
        "--   WHERE strpos(description_zh, '一支球队') > 0 OR strpos(long_description_zh, 'Building 代码') > 0;",
        '-- Post-check (expect 0):    same query. Then re-run the audit:',
        '--   npx tsx scripts/fix-zh-glossary.ts --audit-sql | psql ... -At -F"|"',
        "--   and expect no 'rule' / 'link' lines.",
        '-- After applying: revalidate the affected pages (POST /api/revalidate) —',
        '-- direct DB edits do not trigger on-demand revalidation.',
        '',
        ...buildGlossaryStatements(glossaryHits),
        '',
        '-- Chinese copy linking to the English page → same page in this locale',
        ...linkStmts,
      ].join('\n'),
    ),
  );

  const brandTargets = hits.filter((h) => h.kind === 'brand');
  writeFileSync(
    brandOut,
    HEADER(
      'Migration: bare "Reno Stars" inside Chinese prose → 聚星装修 / 聚星裝修.',
      brandOut,
      [
        '-- GENERATED by scripts/fix-zh-glossary.ts (BRAND_PATTERN in scripts/lib/zh-glossary.ts).',
        '-- Matches "Reno Stars" only when it sits inside Chinese text, e.g.',
        '--   了解 Reno Stars 如何…  →  了解聚星装修如何…',
        '-- and never an already-paired name (聚星装修 Reno Stars, 聚星裝修（Reno Stars）),',
        '-- an English run ("Reno Stars Richmond") or a JSON-LD value ("name": "Reno Stars").',
        '-- Titles of the form "… — Reno Stars Burnaby" / "| Reno Stars" are left alone.',
        '--',
        `-- Pre-audit: ${brandTargets.length} columns/keys, ${totalRows('brand')} (column, row) matches.`,
        `-- Pre-check (expect > 0) / post-check (expect 0):`,
        `--   SELECT count(*) FROM blog_posts WHERE content_zh ~ ${sqlLiteral(BRAND_PATTERN)};`,
        '',
        ...brandTargets.map((h) => buildBrandUpdate(h.target)),
      ].join('\n'),
    ),
  );
  const updates = (f: string) => readFileSync(f, 'utf8').split('\n').filter((l) => l.startsWith('UPDATE ')).length;
  console.log(`wrote ${glossaryOut} (${updates(glossaryOut)} UPDATEs), ${brandOut} (${updates(brandOut)} UPDATEs)`);
}

function main(): void {
  const [mode, ...rest] = process.argv.slice(2);
  if (mode === '--messages') return fixMessages();
  if (mode === '--audit-sql') return void process.stdout.write(`${auditSql()}\n`);
  if (mode === '--emit-sql' && rest.length === 3) return emitSql(rest[0], rest[1], rest[2]);
  console.error('usage: fix-zh-glossary.ts --messages | --audit-sql | --emit-sql <hits> <glossary.sql> <brand.sql>');
  process.exit(2);
}

main();
