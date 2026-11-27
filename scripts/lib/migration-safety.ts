/**
 * Safety guard for auto-applied content migrations.
 *
 * These files are authored by the SEO agent and, once the apply-on-merge
 * CronJob exists, run against production the moment their PR merges. This
 * guard runs in CI so an unsafe file is refused at PR time — before it can
 * reach main — rather than at apply time, where a refusal would already be
 * an outage in the pipeline.
 *
 * It matches on statements, never on raw substrings. A substring guard
 * rejected a legitimate file on 2026-09-02 because Chinese SEO copy contained
 * the phrase "BC renovation grant"; content is data, not SQL.
 */

/** Statements never safe to auto-apply to production content. */
const FORBIDDEN = ['DROP', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE', 'CREATE'] as const;

export interface UnsafeStatement {
  statement: string;
  reason: string;
}

/**
 * Remove comments and string literals so keyword matching sees only SQL.
 * Literals are replaced by an empty literal rather than deleted, so the
 * surrounding statement stays syntactically recognisable.
 */
export function stripSqlNoise(sql: string): string {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')       // block comments
    .replace(/--[^\n]*/g, ' ')                // line comments
    .replace(/'(?:[^']|'')*'/g, "''");        // single-quoted literals, '' escape aware
}

/**
 * Return every statement that must not be auto-applied.
 * An empty array means the file is safe for the CronJob to run unattended.
 */
export function findUnsafeStatements(sql: string): UnsafeStatement[] {
  const found: UnsafeStatement[] = [];

  for (const raw of stripSqlNoise(sql).split(';')) {
    const statement = raw.trim().replace(/\s+/g, ' ');
    if (!statement) continue;

    const leading = statement.toUpperCase().replace(/^\(+/, '').trimStart();

    for (const keyword of FORBIDDEN) {
      if (new RegExp(`\\b${keyword}\\b`).test(leading)) {
        found.push({ statement, reason: `${keyword} is not permitted in an auto-applied migration` });
        break;
      }
    }
    if (found.at(-1)?.statement === statement) continue;

    if (/^INSERT\b/.test(leading)) {
      found.push({
        statement,
        reason: 'INSERT creates new published content; promote it deliberately instead of on merge',
      });
      continue;
    }

    if (/^DELETE\b/.test(leading) && !/\bWHERE\b/.test(leading)) {
      found.push({ statement, reason: 'DELETE without WHERE would empty the table' });
    }
  }

  return found;
}

/**
 * Transaction-control statements (BEGIN, COMMIT, ROLLBACK, END, START TRANSACTION,
 * ABORT, SAVEPOINT, RELEASE, PREPARE TRANSACTION). `pnpm db:query --dry-run` wraps
 * the file in its own BEGIN … ROLLBACK; a COMMIT inside the file would commit that
 * outer transaction for real (task 170 M-A). Literals, comments and dollar-quoted
 * bodies (DO $$ BEGIN … END $$) are ignored, so values containing "commit" or "end"
 * never trip it.
 */
const TXN_CONTROL = /^(?:BEGIN|COMMIT|ROLLBACK|END|ABORT|SAVEPOINT|RELEASE|START\s+TRANSACTION|PREPARE\s+TRANSACTION)\b/;

export function findTransactionControl(sql: string): string[] {
  const withoutDollarQuotes = sql.replace(/\$([A-Za-z_][A-Za-z0-9_]*)?\$[\s\S]*?\$\1\$/g, "''");
  return stripSqlNoise(withoutDollarQuotes)
    .split(';')
    .map((raw) => raw.trim().replace(/\s+/g, ' '))
    .filter((statement) => TXN_CONTROL.test(statement.toUpperCase()));
}
