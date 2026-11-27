/**
 * Generate the task-158 company-facts migration from a READ-ONLY DB snapshot
 * (founded May 2021, 900+ projects, no years-of-experience claim, licence number removed).
 *
 * For every text column and every localizations key of the content tables, the rules in
 * scripts/migrations/content-158/facts-rules.ts are applied; each changed value becomes ONE
 * UPDATE guarded on the EXACT old value. Skip rules: content-158/snapshot.ts.
 *
 * The snapshot must ALREADY carry the zh-Hant migration (some ZhHant guards expect its
 * Traditional text): generate + apply zh-Hant on the snapshot copy first.
 *
 * Usage (outputs are NOT committed — .migration-out/ is gitignored):
 *   SNAPSHOT_DATABASE_URL=… pnpm exec tsx scripts/migrations/gen-company-facts-158.ts \
 *     --db-env SNAPSHOT_DATABASE_URL --testa-html <dir with the 14 saved Test A pages> \
 *     [--out-dir .migration-out/158] [--check-db-env TARGET_DATABASE_URL]
 */
import type { Client } from 'pg';
import {
  rowMakesSinceClaim, rewriteColumn, rewriteLocalization, type FactsChange, type SubcountLeft,
} from './content-158/facts-rules';
import { scanResiduals, type ScannedValue } from './content-158/residuals';
import {
  arg, connectReadOnly, closeReadOnly, ident, textColumns, tiedIds, testACorpus, skipReason,
  sortStmts, renderFile, checkGuards, writeOutputs, countBy, type Stmt, type SkipReason,
} from './content-158/snapshot';

const BASE = '2026-11-26-company-facts-158';
export const TABLES = ['blog_posts', 'faqs', 'projects', 'project_sites', 'service_areas', 'service_benefits', 'services',
  'project_image_pairs', 'site_image_pairs', 'partners', 'testimonials', 'trust_badges', 'designs', 'service_tags', 'project_scopes'];
const NOT_COPY = ['id', 'slug', 'image_url', 'hero_image_url', 'featured_image_url'];

type Skipped = { table: string; id: string; field: string; reason: SkipReason; changes: FactsChange[] };
type Ctx = { corpus: string; tied: Set<string> };
type Acc = { stmts: Stmt[]; skipped: Skipped[]; subcounts: SubcountLeft[]; values: ScannedValue[] };

function consider(ctx: Ctx, acc: Acc, base: Omit<Stmt, 'rules' | 'mode'>, changes: FactsChange[], snippets: boolean): void {
  const seen = (value: string, state: ScannedValue['state']) => acc.values.push({ table: base.table, id: base.id, field: base.field, value, state });
  if (base.new === base.old) { seen(base.old ?? '', 'untouched'); return; }
  const reason = skipReason(ctx, base.table, base.id, base.old ?? '', snippets ? changes.map((c) => c.old) : []);
  if (reason) {
    acc.skipped.push({ table: base.table, id: base.id, field: base.field, reason, changes });
    seen(base.old ?? '', 'skipped');
    return;
  }
  const isKey = base.field.startsWith('localizations->');
  acc.stmts.push({ ...base, mode: isKey ? 'fix-key' : 'set', rules: [...new Set(changes.map((c) => c.rule))].sort() });
  seen(base.new, 'new');
}

async function scanTable(client: Client, ctx: Ctx, acc: Acc, t: string): Promise<void> {
  const cols = (await textColumns(client, t, "data_type in ('text', 'character varying')")).filter((c) => !NOT_COPY.includes(c));
  const sel = cols.map((c) => `, ${ident(c)}`).join('');
  const rows = (await client.query(`select id::text as id, localizations::text as loc${sel} from ${ident(t)} order by id`)).rows;
  for (const r of rows) {
    const since = rowMakesSinceClaim(r, cols);
    for (const c of cols) {
      const v = r[c];
      if (typeof v !== 'string' || !v) continue;
      const x = rewriteColumn(c, v, since, acc.subcounts);
      consider(ctx, acc, { table: t, id: r.id, field: c, old: v, new: x.value }, x.changes, true);
    }
    const loc: Record<string, unknown> = r.loc ? JSON.parse(r.loc) ?? {} : {};
    for (const [k, v] of Object.entries(loc)) {
      if (typeof v !== 'string' || !v) continue;
      const x = rewriteLocalization(k, v, since, acc.subcounts);
      consider(ctx, acc, { table: t, id: r.id, field: `localizations->${k}`, old: v, new: x.value }, x.changes, false);
    }
  }
}

async function main(): Promise<void> {
  const testaDir = arg('--testa-html');
  if (!testaDir) throw new Error('--testa-html <dir> is required (the 14 saved base Test A pages)');
  const outDir = arg('--out-dir', '.migration-out/158') as string;
  const { client, dbName } = await connectReadOnly(arg('--db-env', 'SNAPSHOT_DATABASE_URL') as string);
  const ctx = { corpus: testACorpus(testaDir), tied: await tiedIds(client) };
  const acc: Acc = { stmts: [], skipped: [], subcounts: [], values: [] };
  for (const t of TABLES) await scanTable(client, ctx, acc, t);
  await closeReadOnly(client);

  const sorted = sortStmts(acc.stmts);
  const checkEnv = arg('--check-db-env');
  let guards: unknown = null;
  if (checkEnv) {
    const t = await connectReadOnly(checkEnv);
    guards = { db: t.dbName, ...(await checkGuards(t.client, sorted)) };
    await closeReadOnly(t.client);
  }
  const cmp = (a: Skipped, b: Skipped) => { const x = `${a.table}|${a.id}|${a.field}`, y = `${b.table}|${b.id}|${b.field}`; return x < y ? -1 : x > y ? 1 : 0; };
  const report = {
    generator: 'gen-company-facts-158', sourceDb: dbName, statements: sorted.length,
    rowsHitPerRule: countBy(sorted, (s) => s.rules),
    rowsHitPerTable: countBy(sorted, (s) => s.table),
    skippedByReason: countBy(acc.skipped, (s) => s.reason),
    subcountsLeft: acc.subcounts.length,
    residualCompanyClaims: scanResiduals(acc.values),
    manualIncludeAfterDump: manualIncludes(acc.skipped),
    laterFixes: laterFixes(acc.values),
    guardCheck: guards,
    skipped: [...acc.skipped].sort(cmp),
    subcounts: [...acc.subcounts].sort((a, b) => (a.context < b.context ? -1 : a.context > b.context ? 1 : 0)),
  };
  const out = writeOutputs(outDir, BASE, renderFile(header(dbName, sorted.length), sorted), report);
  const r = report.residualCompanyClaims;
  console.log(`${out.sqlPath}: ${sorted.length} statements | skipped ${acc.skipped.length} | sub-counts left ${acc.subcounts.length}`);
  console.log(`residual company claims: ${r.residualsOutsideSkipList} outside the skip list, ${r.residualsInSkipList} in skipped rows, excluded ${JSON.stringify(r.excludedByPattern)}`);
  console.log(`${out.reportPath}`);
  if (guards) console.log('guard check:', JSON.stringify(guards));
}

/**
 * Values the skip rules hold back although they look safe to include: a short-string
 * Test A probe matched page copy that is NOT this row (Captain 170). Re-check against
 * the fresh dump's Test A corpus and include by hand if confirmed — never automatically.
 */
const MANUAL_INCLUDE_AFTER_DUMP = [
  { table: 'service_benefits', id: '163a796b-24ae-4d46-b831-677f6f4c66ad', fields: ['localizations->benefitJa', 'localizations->benefitKo'],
    why: '「20年以上の経験」/「20년 이상」 skipped as testA-rendered:value — the short probe matches other Test A copy, not this benefit (benefit_en is not on Test A)' },
];
function manualIncludes(skipped: Skipped[]) {
  return MANUAL_INCLUDE_AFTER_DUMP.map((m) => ({
    ...m,
    currentlySkipped: skipped.filter((s) => s.table === m.table && s.id === m.id && m.fields.includes(s.field)).map((s) => ({ field: s.field, reason: s.reason, changes: s.changes })),
  }));
}

/** Defects in existing values that this migration must NOT touch (separate fix later). */
const LATER_FIXES = [
  { table: 'blog_posts', id: 'c771922c-556e-4f74-b573-3b609ad8f9ba', field: 'localizations->contentZhHant', marker: '</標題> <正文>',
    issue: 'translated HTML tags (<表> <標題> … </標題> <正文>) in the zh-Hant body — broken table markup; fix separately, keep it out of this migration' },
  { table: 'blog_posts', id: 'c771922c-556e-4f74-b573-3b609ad8f9ba', field: 'localizations->contentFr', marker: '</tête> <corps>',
    issue: 'same machine-translated table tags in the fr body (<tête>, <corps>); fix together with the zh-Hant one' },
  { table: 'blog_posts', id: 'c771922c-556e-4f74-b573-3b609ad8f9ba', field: 'localizations->contentRu', marker: '<тело>',
    issue: 'same machine-translated table tag in the ru body (<тело>); fix together with the zh-Hant one' },
];
function laterFixes(values: ScannedValue[]) {
  return LATER_FIXES.map((f) => {
    const v = values.find((x) => x.table === f.table && x.id === f.id && x.field === f.field);
    const marker = new RegExp(f.marker.split(' ').map((x) => x.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('\\s*'), 'u');
    return { ...f, state: v?.state ?? 'not-found', markerStillPresent: v ? marker.test(v.value) : null };
  });
}

function header(db: string, n: number): string {
  return `-- GENERATED by scripts/migrations/gen-company-facts-158.ts from a read-only snapshot (${db}).
-- ${n} statements. NOT APPLIED to production — applying it is Ryan's decision (docs/database.md runbook).
-- APPLY AFTER the zh-Hant migration: some ZhHant guards expect the Traditional text it writes.
-- Founded May 2021 / 900+ projects / no years-of-experience claim / licence number removed, every locale.
-- Each UPDATE writes ONE column (or one localizations key), guarded on the EXACT old value: a re-run
-- changes 0 rows. Test-A-rendered and tied-sort-key rows are skipped (see the .report.json).
-- After applying: revalidate the affected pages (POST /api/revalidate) and purge Cloudflare.
-- No BEGIN/COMMIT: pnpm db:query owns the transaction (--dry-run rolls back).`;
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
