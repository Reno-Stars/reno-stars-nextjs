/**
 * Apply one SQL file to the database in a single transaction.
 *
 * Every migration this repo carries prints
 *   Run: pnpm db:query -f scripts/migrations/<file>.sql
 * in its header. That script did not exist until now, so 53 files sat
 * unapplied while the instruction for applying them returned
 * "command not found".
 *
 * Usage:
 *   pnpm db:query -f scripts/migrations/2026-08-16-blog-excerpt-zh.sql
 *   pnpm db:query -f <file> --dry-run     # rolls back, reports what would change
 */
import { readFileSync } from 'node:fs';
import { Client } from 'pg';
import { findUnsafeStatements } from './lib/migration-safety';

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i === -1 ? undefined : process.argv[i + 1];
}

async function main(): Promise<void> {
  const file = arg('-f') ?? arg('--file');
  const dryRun = process.argv.includes('--dry-run');

  if (!file) {
    console.error('usage: pnpm db:query -f <file.sql> [--dry-run]');
    process.exit(2);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set (expected via dotenv -e .env.local)');
    process.exit(2);
  }

  const sql = readFileSync(file, 'utf8');

  // Same guard CI enforces, so a hand-run cannot bypass what the pipeline refuses.
  const unsafe = findUnsafeStatements(sql);
  if (unsafe.length > 0) {
    console.error(`REFUSED ${file} — ${unsafe.length} unsafe statement(s):`);
    for (const u of unsafe) console.error(`  ${u.reason}\n    ${u.statement.slice(0, 120)}`);
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();
  let changed = 0;

  try {
    await client.query('BEGIN');
    const results = await client.query(sql);
    for (const r of Array.isArray(results) ? results : [results]) {
      if (typeof r?.rowCount === 'number') changed += r.rowCount;
    }
    if (dryRun) {
      await client.query('ROLLBACK');
      console.log(`DRY RUN ${file} — would change ${changed} row(s); rolled back`);
    } else {
      await client.query('COMMIT');
      console.log(`APPLIED ${file} — ${changed} row(s) changed`);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`FAILED ${file} — rolled back, no rows changed`);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void main();
