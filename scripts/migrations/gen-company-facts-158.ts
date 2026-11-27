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
type Acc = { stmts: Stmt[]; skipped: Skipped[]; subcounts: SubcountLeft[] };

function consider(ctx: Ctx, acc: Acc, base: Omit<Stmt, 'rules' | 'mode'>, changes: FactsChange[], snippets: boolean): void {
  if (base.new === base.old) return;
  const reason = skipReason(ctx, base.table, base.id, base.old ?? '', snippets ? changes.map((c) => c.old) : []);
  if (reason) { acc.skipped.push({ table: base.table, id: base.id, field: base.field, reason, changes }); return; }
  const isKey = base.field.startsWith('localizations->');
  acc.stmts.push({ ...base, mode: isKey ? 'fix-key' : 'set', rules: [...new Set(changes.map((c) => c.rule))].sort() });
}

async function scanTable(client: Client, ctx: Ctx, acc: Acc, t: string): Promise<void> {
  const cols = (await textColumns(client, t, "data_type in ('text', 'character varying')")).filter((c) => !NOT_COPY.includes(c));
  const sel = cols.map((c) => `, ${ident(c)}`).join('');
  const rows = (await client.query(`select id::text as id, localizations::text as loc${sel} from ${ident(t)}`)).rows;
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
  const acc: Acc = { stmts: [], skipped: [], subcounts: [] };
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
    guardCheck: guards,
    skipped: [...acc.skipped].sort(cmp),
    subcounts: acc.subcounts,
  };
  const out = writeOutputs(outDir, BASE, renderFile(header(dbName, sorted.length), sorted), report);
  console.log(`${out.sqlPath}: ${sorted.length} statements | skipped ${acc.skipped.length} | sub-counts left ${acc.subcounts.length}`);
  console.log(`${out.reportPath}`);
  if (guards) console.log('guard check:', JSON.stringify(guards));
}

function header(db: string, n: number): string {
  return `-- GENERATED by scripts/migrations/gen-company-facts-158.ts from a read-only snapshot (${db}).
-- ${n} statements. NOT APPLIED to production — applying it is Ryan's decision (docs/database.md runbook).
-- APPLY AFTER the zh-Hant migration: some ZhHant guards expect the Traditional text it writes.
-- Founded May 2021 / 900+ projects / no years-of-experience claim / licence number removed, every locale.
-- Each UPDATE writes ONE column (or one localizations key), guarded on the EXACT old value: a re-run
-- changes 0 rows. Test-A-rendered and tied-sort-key rows are skipped (see the .report.json).
-- After applying: revalidate the affected pages (POST /api/revalidate) and purge Cloudflare.`;
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
