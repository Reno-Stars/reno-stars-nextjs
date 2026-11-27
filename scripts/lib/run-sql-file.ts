/**
 * The transaction logic behind `pnpm db:query`, separated so it can be tested
 * against a real Postgres engine (PGlite in vitest).
 *
 * The runner owns the transaction: BEGIN → the file → COMMIT, or ROLLBACK for a
 * dry run. A file that carries its own transaction control is REFUSED in dry-run
 * mode before anything is executed — its COMMIT would end the runner's
 * transaction and the "dry run" would write for real (task 170 M-A).
 */
import { findTransactionControl } from './migration-safety';

export interface SqlClient {
  query(sql: string): Promise<unknown>;
}

export class DryRunRefused extends Error {}

function rowCountOf(results: unknown): number {
  let changed = 0;
  for (const r of Array.isArray(results) ? results : [results]) {
    const n = (r as { rowCount?: unknown } | null)?.rowCount;
    if (typeof n === 'number') changed += n;
  }
  return changed;
}

export async function runSqlFile(client: SqlClient, sql: string, opts: { dryRun: boolean }): Promise<{ changed: number }> {
  if (opts.dryRun) {
    const control = findTransactionControl(sql);
    if (control.length > 0) {
      throw new DryRunRefused(
        `dry run refused: the file contains transaction control (${control.slice(0, 3).join(' | ')}); ` +
        'its COMMIT would commit the dry run for real. Remove BEGIN/COMMIT from the file — db:query wraps it in a transaction.',
      );
    }
  }
  await client.query('BEGIN');
  try {
    const changed = rowCountOf(await client.query(sql));
    await client.query(opts.dryRun ? 'ROLLBACK' : 'COMMIT');
    return { changed };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
