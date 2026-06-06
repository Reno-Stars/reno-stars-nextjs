#!/usr/bin/env node
/* global process, console, setTimeout */
/**
 * Tail the Neon log tables — our replacement for `vercel logs` (which emits
 * nothing in non-interactive shells). Reads DATABASE_URL from the environment
 * or the repo's .env.local (created by `vercel env pull`).
 *
 *   node scripts/logs.mjs                      # last 50 app_log rows, past 1h
 *   node scripts/logs.mjs --level error        # only errors
 *   node scripts/logs.mjs --event revalidate   # only revalidations
 *   node scripts/logs.mjs --path /fr           # path prefix filter
 *   node scripts/logs.mjs --since '10 min' --n 100
 *   node scripts/logs.mjs --vercel             # raw Vercel runtime logs (drain)
 *   node scripts/logs.mjs --watch              # poll every 3s
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getConnString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const env = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
    const m = env.match(/^DATABASE_URL=(.*)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  } catch { /* no .env.local */ }
  console.error('No DATABASE_URL. Set it or run `vercel env pull .env.local`.');
  process.exit(1);
}

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}

const opts = {
  level: arg('level'),
  event: arg('event'),
  path: arg('path'),
  n: Number(arg('n', 50)),
  since: String(arg('since', '1 hour')),
  vercel: !!arg('vercel', false),
  watch: !!arg('watch', false),
};

const client = new pg.Client({ connectionString: getConnString() });
await client.connect();

function buildQuery() {
  const where = [`ts > now() - interval '${opts.since.replace(/'/g, '')}'`];
  const params = [];
  if (opts.level) { params.push(opts.level); where.push(`level = $${params.length}`); }
  if (opts.event) { params.push(opts.event); where.push(`event = $${params.length}`); }
  if (opts.path) { params.push(opts.path + '%'); where.push(`path like $${params.length}`); }
  const cols = opts.vercel
    ? `to_char(ts,'HH24:MI:SS') t, source, level, status, path, left(message,90) message`
    : `to_char(ts,'HH24:MI:SS') t, level, event, source, coalesce(digest,'') digest, coalesce(path,'') path, left(coalesce(msg,''),70) msg`;
  const table = opts.vercel ? 'vercel_log' : 'app_log';
  // app_log has no `event` filter on vercel table — drop unsupported filters
  const filtered = opts.vercel ? where.filter((w) => !w.startsWith('event')) : where;
  return {
    text: `SELECT ${cols} FROM ${table} WHERE ${filtered.join(' AND ')} ORDER BY ts DESC LIMIT ${opts.n}`,
    params,
  };
}

async function run() {
  const { text, params } = buildQuery();
  const { rows } = await client.query(text, params);
  if (!rows.length) { console.log(`(no ${opts.vercel ? 'vercel_log' : 'app_log'} rows in the last ${opts.since})`); return; }
  console.table(rows.reverse());
}

if (opts.watch) {
  console.log('Watching (Ctrl-C to stop)…');
  for (;;) { console.clear(); await run(); await new Promise((r) => setTimeout(r, 3000)); }
} else {
  await run();
  await client.end();
}
