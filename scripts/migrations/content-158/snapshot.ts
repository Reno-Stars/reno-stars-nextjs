/**
 * Shared plumbing for the task-158 content-migration generators:
 * read-only DB access, the Test A skip rules, SQL literal quoting, guard checks
 * and the report file. No rule logic lives here.
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';
import { pyStrip, cpLen, cpSlice } from './pyre';

// ---------- CLI + DB ----------

export function arg(flag: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i === -1 ? fallback : process.argv[i + 1];
}

/** Connect using the URL held in the env var NAMED by `envName` (never a URL on the command line). */
export async function connectReadOnly(envName: string): Promise<{ client: Client; dbName: string }> {
  const url = process.env[envName];
  if (!url) throw new Error(`env var ${envName} is not set (it must hold the snapshot DB connection URL)`);
  const client = new Client({ connectionString: url });
  await client.connect();
  await client.query('BEGIN TRANSACTION READ ONLY');
  const dbName = (await client.query<{ d: string }>('select current_database() as d')).rows[0].d;
  return { client, dbName };
}

export async function closeReadOnly(client: Client): Promise<void> {
  await client.query('ROLLBACK');
  await client.end();
}

export function ident(name: string): string {
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw new Error(`unexpected identifier ${name}`);
  return name;
}

export async function textColumns(client: Client, table: string, where: string): Promise<string[]> {
  const r = await client.query<{ c: string }>(
    `select column_name::text as c from information_schema.columns where table_schema = 'public' and table_name = $1 and ${where} order by 1`,
    [table],
  );
  return r.rows.map((x) => x.c);
}

// ---------- skip rules ----------

/**
 * Rows whose list sort key is shared with another row: an UPDATE moves the row
 * physically and can swap its place among equals on a Test A page. Projects
 * (created_at / per-site order), partners and image pairs. Blog posts are not
 * here: blog lists are totally ordered since c96f51d7 (task 168 M2).
 */
export const TIED_SQL = `select id::text as id from projects p where exists (select 1 from projects o where o.id <> p.id and (o.created_at = p.created_at or (o.site_id = p.site_id and o.display_order_in_site = p.display_order_in_site)))
union select id::text from partners union select id::text from project_image_pairs union select id::text from site_image_pairs`;

export async function tiedIds(client: Client): Promise<Set<string>> {
  return new Set((await client.query<{ id: string }>(TIED_SQL)).rows.map((r) => r.id));
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function htmlUnescape(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e: string) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENTITIES[e.toLowerCase()] ?? all;
  });
}

/** Decoded text of the 14 saved base Test A pages (HTML + RSC flight payload). */
export function testACorpus(dir: string): string {
  const files = readdirSync(dir).filter((f) => f.endsWith('.html')).sort();
  if (files.length !== 14) throw new Error(`${dir}: expected the 14 Test A pages, found ${files.length}`);
  const raw = files.map((f) => readFileSync(join(dir, f), 'utf8').replace(/\r\n?/g, '\n')).join('');
  let t = raw;
  for (let i = 0; i < 3; i++) {
    t = t.replaceAll('\\\\', '\\').replaceAll('\\"', '"').replaceAll('\\n', '\n').replaceAll('\\r', '\r')
      .replaceAll('\\u0026', '&').replaceAll('\\u003c', '<').replaceAll('\\u003e', '>');
  }
  return `${htmlUnescape(raw)}\n${htmlUnescape(t)}`;
}

/** 40-character text probes of a value; markup / JSON-LD scaffolding and short generic openers are not evidence. */
export function probes(v: string): string[] {
  const segs = v.split(/[\r\n]+/).map(pyStrip).filter(Boolean);
  const long = segs.filter((x) => !x.startsWith('<') && !cpSlice(x, 0, 40).includes('script') && cpLen(x) >= 40);
  const cjk = segs.filter((x) => cpLen(x) >= 6 && cpLen(x) < 40 && !x.startsWith('<') && /[㐀-鿿]/.test(x));
  const out = [...long, ...cjk].slice(0, 6).map((x) => cpSlice(x, 0, 40));
  const t = pyStrip(v);
  return out.length ? out : cpLen(t) >= 6 && !t.startsWith('<') ? [cpSlice(t, 0, 40)] : [];
}

export type SkipReason = 'tied-sort-key' | 'testA-rendered:id' | 'testA-rendered:value' | 'testA-rendered:snippet';

/**
 * Skip decision. Blog posts are never skipped: no Test A route (service×city page,
 * layout, footer, nav) reads blog_posts (task 168 M3).
 */
export function skipReason(
  ctx: { corpus: string; tied: Set<string> },
  table: string, id: string, oldValue: string, changedSnippets: string[] = [],
): SkipReason | null {
  if (table === 'blog_posts') return null;
  if (ctx.tied.has(id)) return 'tied-sort-key';
  if (ctx.corpus.includes(id)) return 'testA-rendered:id';
  if (probes(oldValue).some((p) => p && ctx.corpus.includes(p))) return 'testA-rendered:value';
  if (changedSnippets.some((s) => cpLen(s) >= 6 && ctx.corpus.includes(s))) return 'testA-rendered:snippet';
  return null;
}

// ---------- SQL ----------

export function lit(s: string): string {
  return `'${s.replaceAll("'", "''")}'`;
}

/** The migration-safety checker strips `--` comments before literals: split every `--`, `/*`, `*\/` inside a literal. */
export function safeLiterals(stmt: string): string {
  return stmt.replace(/'(?:[^']|'')*'/g, (m) => {
    const inner = m.slice(1, -1).replace(/-(?=-)/g, "-' || '").replaceAll('/*', "/' || '*").replaceAll('*/', "*' || '/");
    return `'${inner}'`;
  });
}

/** One generated UPDATE: writes ONE column or ONE localizations key, guarded on the exact old value / missing key. */
export type Stmt = {
  table: string; id: string;
  /** plain column name, or `localizations->Key` */
  field: string;
  mode: 'set' | 'add-key' | 'fix-key';
  old: string | null; new: string;
  rules: string[];
};

export function renderStmt(s: Stmt): string {
  const t = ident(s.table);
  const where = `WHERE id = ${lit(s.id)}`;
  if (s.mode === 'set') return safeLiterals(`UPDATE ${t} SET ${ident(s.field)} = ${lit(s.new)} ${where} AND ${s.field} = ${lit(s.old ?? '')};`);
  const k = s.field.replace(/^localizations->/, '');
  if (s.mode === 'add-key') {
    return safeLiterals(`UPDATE ${t} SET localizations = coalesce(localizations, '{}'::jsonb) || jsonb_build_object(${lit(k)}, ${lit(s.new)}::text) ${where} AND NOT (coalesce(localizations, '{}'::jsonb) ? ${lit(k)});`);
  }
  return safeLiterals(`UPDATE ${t} SET localizations = jsonb_set(localizations, ARRAY[${lit(k)}], to_jsonb(${lit(s.new)}::text)) ${where} AND localizations->>${lit(k)} = ${lit(s.old ?? '')};`);
}

/** Deterministic order: table, id, field. */
export function sortStmts(stmts: Stmt[]): Stmt[] {
  const key = (s: Stmt) => [s.table, s.id, s.field];
  return [...stmts].sort((a, b) => {
    const ka = key(a), kb = key(b);
    for (let i = 0; i < 3; i++) if (ka[i] !== kb[i]) return ka[i] < kb[i] ? -1 : 1;
    return 0;
  });
}

export function renderFile(header: string, stmts: Stmt[]): string {
  return `${header.trimEnd()}\n\nBEGIN;\n${stmts.map(renderStmt).join('\n')}\nCOMMIT;\n`;
}

// ---------- guard check against a target DB ----------

export type GuardStatus = 'match' | 'already-applied' | 'no-match' | 'row-missing';

/** Would each statement's guard match on the target DB? (read-only) */
export async function checkGuards(client: Client, stmts: Stmt[]): Promise<Record<GuardStatus, number> & { examples: unknown[] }> {
  const counts: Record<GuardStatus, number> = { match: 0, 'already-applied': 0, 'no-match': 0, 'row-missing': 0 };
  const examples: unknown[] = [];
  for (const s of stmts) {
    const k = s.field.replace(/^localizations->/, '');
    const isKey = s.mode !== 'set';
    const q = isKey
      ? `select (coalesce(localizations, '{}'::jsonb) ? $2) as has, localizations->>$2 as v from ${ident(s.table)} where id::text = $1`
      : `select true as has, ${ident(s.field)}::text as v from ${ident(s.table)} where id::text = $1`;
    const r = await client.query<{ has: boolean; v: string | null }>(q, isKey ? [s.id, k] : [s.id]);
    const st = guardStatus(s, r.rows[0]);
    counts[st]++;
    if ((st === 'no-match' || st === 'row-missing') && examples.length < 20) examples.push({ table: s.table, id: s.id, field: s.field, status: st });
  }
  return { ...counts, examples };
}

function guardStatus(s: Stmt, row: { has: boolean; v: string | null } | undefined): GuardStatus {
  if (!row) return 'row-missing';
  if (row.has && row.v === s.new) return 'already-applied';
  if (s.mode === 'add-key') return row.has ? 'no-match' : 'match';
  return row.v === s.old ? 'match' : 'no-match';
}

// ---------- outputs ----------

export function writeOutputs(outDir: string, base: string, sql: string, report: unknown): { sqlPath: string; reportPath: string } {
  mkdirSync(outDir, { recursive: true });
  const sqlPath = join(outDir, `${base}.sql`);
  const reportPath = join(outDir, `${base}.report.json`);
  writeFileSync(sqlPath, sql);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 1)}\n`);
  return { sqlPath, reportPath };
}

export function countBy<T>(items: T[], key: (x: T) => string | string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const x of items) for (const k of ([] as string[]).concat(key(x))) out[k] = (out[k] ?? 0) + 1;
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}
