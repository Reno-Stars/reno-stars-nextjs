/**
 * Generate the task-158 zh-Hant migration from a READ-ONLY DB snapshot.
 *
 *  A) `<field>ZhHant` key missing while `<field>_zh` has text → ADD the key, converted
 *     (guard: the key is still absent);
 *  B) `<field>ZhHant` present but still carrying Simplified → FIX, guarded on the EXACT old value.
 * Conversion rules: scripts/migrations/content-158/zh-rules.ts. Skip rules: content-158/snapshot.ts.
 *
 * Usage (outputs are NOT committed — .migration-out/ is gitignored):
 *   SNAPSHOT_DATABASE_URL=… pnpm exec tsx scripts/migrations/gen-zh-hant-traditional-158.ts \
 *     --db-env SNAPSHOT_DATABASE_URL --testa-html <dir with the 14 saved Test A pages> \
 *     [--out-dir .migration-out/158] [--check-db-env TARGET_DATABASE_URL]
 * Writes <out-dir>/2026-11-26-zh-hant-traditional-158.sql and …report.json.
 * Apply this file BEFORE generating the company-facts migration (see docs/database.md).
 */
import * as OpenCC from 'opencc-js';
import type { Client } from 'pg';
import { ZhConverter, zhHantKey } from './content-158/zh-rules';
import {
  arg, connectReadOnly, closeReadOnly, ident, textColumns, tiedIds, testACorpus, skipReason,
  sortStmts, renderFile, checkGuards, writeOutputs, countBy, type Stmt, type SkipReason,
} from './content-158/snapshot';

const BASE = '2026-11-26-zh-hant-traditional-158';
type Job = { table: string; id: string; key: string; mode: 'add-key' | 'fix-key'; old: string | null; src: string };

async function collectJobs(client: Client): Promise<Job[]> {
  const tabs = (await client.query<{ t: string }>(
    "select table_name::text as t from information_schema.columns where table_schema = 'public' and column_name = 'localizations' order by 1",
  )).rows.map((r) => r.t);
  const jobs: Job[] = [];
  for (const t of tabs) {
    const cols = await textColumns(client, t, "column_name like '%\\_zh'");
    const sel = cols.map((c) => `, ${ident(c)}::text as ${ident(c)}`).join('');
    const rows = (await client.query(`select id::text as id, localizations::text as loc${sel} from ${ident(t)}`)).rows;
    for (const r of rows) jobs.push(...rowJobs(t, r, cols));
  }
  return jobs;
}

function rowJobs(table: string, r: Record<string, string | null>, cols: string[]): Job[] {
  const loc: Record<string, unknown> = r.loc ? JSON.parse(r.loc) ?? {} : {};
  const out: Job[] = [];
  for (const c of cols) {
    const key = zhHantKey(c);
    const zh = r[c];
    if (!(key in loc) && zh && !['null', '[]', '{}'].includes(zh)) out.push({ table, id: r.id as string, key, mode: 'add-key', old: null, src: zh });
  }
  for (const [key, v] of Object.entries(loc)) {
    if (key.endsWith('ZhHant') && typeof v === 'string' && v) out.push({ table, id: r.id as string, key, mode: 'fix-key', old: v, src: v });
  }
  return out;
}

async function main(): Promise<void> {
  const testaDir = arg('--testa-html');
  if (!testaDir) throw new Error('--testa-html <dir> is required (the 14 saved base Test A pages)');
  const outDir = arg('--out-dir', '.migration-out/158') as string;
  const { client, dbName } = await connectReadOnly(arg('--db-env', 'SNAPSHOT_DATABASE_URL') as string);
  const ctx = { corpus: testACorpus(testaDir), tied: await tiedIds(client) };
  const jobs = await collectJobs(client);
  await closeReadOnly(client);

  const conv = OpenCC.Converter({ from: 'cn', to: 'tw' });
  const zh = new ZhConverter((xs) => xs.map((x) => conv(x)), jobs.map((j) => j.src).join(''));
  const { texts, residues } = zh.convertWithSecondPass(jobs.map((j) => j.src));

  const stmts: Stmt[] = [];
  const skipped: Array<{ table: string; id: string; field: string; reason: SkipReason; mode: string; valueHead: string }> = [];
  const protectedLeft: Array<{ table: string; id: string; field: string; chars: string }> = [];
  jobs.forEach((j, n) => {
    const next = texts[n];
    if (j.mode === 'fix-key' && next === j.old) return;
    const field = `localizations->${j.key}`;
    const reason = skipReason(ctx, j.table, j.id, j.src);
    if (reason) { skipped.push({ table: j.table, id: j.id, field, reason, mode: j.mode, valueHead: Array.from(j.src).slice(0, 80).join('') }); return; }
    stmts.push({ table: j.table, id: j.id, field, mode: j.mode, old: j.old, new: next, rules: [`zh-hant:${j.mode}`] });
    if (residues[n].length) protectedLeft.push({ table: j.table, id: j.id, field, chars: residues[n].map((x) => x.original).join('') });
  });

  const sorted = sortStmts(stmts);
  const checkEnv = arg('--check-db-env');
  let guards: unknown = null;
  if (checkEnv) {
    const t = await connectReadOnly(checkEnv);
    guards = { db: t.dbName, ...(await checkGuards(t.client, sorted)) };
    await closeReadOnly(t.client);
  }
  const report = {
    generator: 'gen-zh-hant-traditional-158', sourceDb: dbName, statements: sorted.length,
    rowsHitPerRule: countBy(sorted, (s) => s.rules),
    rowsHitPerTableKey: countBy(sorted, (s) => `${s.table}.${s.field.slice(15)} ${s.mode}`),
    skippedByReason: countBy(skipped, (s) => s.reason),
    warrantyClausesLeftAsIs: protectedLeft,
    guardCheck: guards,
    skipped: [...skipped].sort((a, b) => { const x = `${a.table}|${a.id}|${a.field}`, y = `${b.table}|${b.id}|${b.field}`; return x < y ? -1 : x > y ? 1 : 0; }),
  };
  const out = writeOutputs(outDir, BASE, renderFile(header(dbName, sorted.length), sorted), report);
  console.log(`${out.sqlPath}: ${sorted.length} statements | skipped ${skipped.length} | warranty clauses left ${protectedLeft.length}`);
  console.log(`${out.reportPath}`);
  if (guards) console.log('guard check:', JSON.stringify(guards));
}

function header(db: string, n: number): string {
  return `-- GENERATED by scripts/migrations/gen-zh-hant-traditional-158.ts from a read-only snapshot (${db}).
-- ${n} statements. NOT APPLIED to production — applying it is Ryan's decision (docs/database.md runbook).
-- Apply BEFORE generating / applying the company-facts migration.
-- ADD: a missing <field>ZhHant key, converted from <field>_zh (guard: key absent).
-- FIX: an existing ZhHant value that still carries Simplified sentences (guard: EXACT old value).
-- Warranty clauses keep their original characters; Test-A-rendered and tied-sort-key rows are skipped
-- (see the .report.json next to this file). Re-running changes 0 rows.`;
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
