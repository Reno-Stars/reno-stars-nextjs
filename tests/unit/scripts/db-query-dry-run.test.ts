import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { runSqlFile, DryRunRefused, type SqlClient } from '@/scripts/lib/run-sql-file';
import { findTransactionControl } from '@/scripts/lib/migration-safety';

/**
 * Task 170 M-A: `pnpm db:query --dry-run` must not write.
 * db:query wraps the file in BEGIN … ROLLBACK; a COMMIT inside the file used to
 * commit that outer transaction, so the "dry run" applied the migration for real.
 * These run the same code path (runSqlFile) against a real Postgres engine (PGlite).
 */

const GENERATED_STYLE = `-- GENERATED … (no BEGIN/COMMIT: the runner owns the transaction)
UPDATE blog_posts SET content_en = 'serving Vancouver since May 2021 -' || '- commit and end are just words' WHERE id = 'a' AND content_en = 'serving Vancouver since 2019';
UPDATE blog_posts SET localizations = jsonb_set(localizations, ARRAY['contentEs'], to_jsonb('desde mayo de 2021'::text)) WHERE id = 'a' AND localizations->>'contentEs' = 'desde 2019';
`;
const WITH_TXN = `BEGIN;\n${GENERATED_STYLE}COMMIT;\n`;

let db: PGlite;
const client = (): SqlClient => ({
  // PGlite's exec() returns one result per statement with a pg-style rowCount, like pg's multi-statement query().
  query: (sql: string) => db.exec(sql),
});
const row = async () => (await db.query<{ content_en: string; es: string }>(
  "select content_en, localizations->>'contentEs' as es from blog_posts where id = 'a'",
)).rows[0];

beforeEach(async () => {
  db = new PGlite();
  await db.exec(`create table blog_posts (id text primary key, content_en text, localizations jsonb);
    insert into blog_posts values ('a', 'serving Vancouver since 2019', '{"contentEs": "desde 2019"}');`);
});
afterEach(async () => { await db.close(); });

describe('db:query dry run (runSqlFile)', () => {
  it('a dry run of a generated-style file reports the changes and leaves every row UNCHANGED', async () => {
    const r = await runSqlFile(client(), GENERATED_STYLE, { dryRun: true });
    expect(r.changed).toBe(2);
    expect(await row()).toEqual({ content_en: 'serving Vancouver since 2019', es: 'desde 2019' });
  });

  it('the real run of the same file applies it', async () => {
    await runSqlFile(client(), GENERATED_STYLE, { dryRun: false });
    expect(await row()).toEqual({ content_en: 'serving Vancouver since May 2021 -- commit and end are just words', es: 'desde mayo de 2021' });
  });

  it('a dry run of a file with BEGIN/COMMIT is REFUSED and changes nothing', async () => {
    await expect(runSqlFile(client(), WITH_TXN, { dryRun: true })).rejects.toBeInstanceOf(DryRunRefused);
    expect(await row()).toEqual({ content_en: 'serving Vancouver since 2019', es: 'desde 2019' });
  });

  it('why: without the refusal, BEGIN → file with COMMIT → ROLLBACK commits for real (the old db:query flow)', async () => {
    await db.exec('BEGIN');
    await db.exec(WITH_TXN);
    await db.exec('ROLLBACK');
    expect((await row()).es).toBe('desde mayo de 2021');
  });
});

describe('findTransactionControl', () => {
  it('finds every transaction-control form', () => {
    const sql = 'BEGIN; START TRANSACTION; SAVEPOINT s; RELEASE SAVEPOINT s; ROLLBACK TO SAVEPOINT s; ABORT; END; COMMIT; begin work;';
    expect(findTransactionControl(sql)).toHaveLength(9);
  });

  it('ignores words inside literals, comments and dollar-quoted bodies', () => {
    const sql = `-- COMMIT here is a comment
/* ROLLBACK */
UPDATE t SET c = 'please commit; end; begin' WHERE id = 'x';
DO $$ BEGIN UPDATE t SET c = 'y'; END $$;
UPDATE t SET c = $body$COMMIT;$body$ WHERE id = 'z';`;
    expect(findTransactionControl(sql)).toEqual([]);
  });
});
