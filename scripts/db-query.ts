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
 *   pnpm db:query -f <file> --dry-run     # rolls back, reports what would change;
 *                                         # refused if the file has its own BEGIN/COMMIT
 */
import { readFileSync } from 'node:fs';
import { Client } from 'pg';
import { findUnsafeStatements, findTransactionControl } from './lib/migration-safety';
import { runSqlFile, DryRunRefused } from './lib/run-sql-file';

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

  // A file with its own BEGIN/COMMIT would commit the dry run for real: refuse before connecting.
  const control = dryRun ? findTransactionControl(sql) : [];
  if (control.length > 0) {
    console.error(`REFUSED ${file} — --dry-run on a file with transaction control (${control.slice(0, 3).join(' | ')}).`);
    console.error('  Its COMMIT would commit the dry run for real. Remove BEGIN/COMMIT from the file: db:query wraps it in a transaction.');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    const { changed } = await runSqlFile(client, sql, { dryRun });
    console.log(dryRun
      ? `DRY RUN ${file} — would change ${changed} row(s); rolled back`
      : `APPLIED ${file} — ${changed} row(s) changed`);
  } catch (error) {
    if (error instanceof DryRunRefused) console.error(`REFUSED ${file} — ${error.message}`);
    else console.error(`FAILED ${file} — rolled back, no rows changed\n${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

void main();
