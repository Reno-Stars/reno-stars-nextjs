import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A data migration that writes several columns in one UPDATE must guard on
 * EVERY column it writes — not just one of them.
 *
 * The failure is silent, which is what makes it worth a test. On 2026-08-24
 * `2026-08-24-projects-meta-description-en-zh-batch1.sql` set
 * meta_description_en AND _zh but guarded only on _zh. A sibling file set _zh
 * first, so the guard stopped matching and the ENGLISH half could never land.
 * Production sat at en_set=0 / zh_set=7 and nothing reported an error: the file
 * "succeeded", updating 0 rows.
 *
 * Split one UPDATE per column instead, each guarded on the column it writes:
 *
 *   UPDATE t SET a = '…' WHERE id = '…' AND (a IS NULL OR a = '');
 *   UPDATE t SET b = '…' WHERE id = '…' AND (b IS NULL OR b = '');
 */

const DIRS = ['scripts/migrations', 'scripts/migrations/pending'];

/** Split a SET clause on top-level commas, respecting '' escapes inside literals. */
function splitAssignments(setPart: string): string[] {
  const out: string[] = [];
  let buf = '', inQuote = false;
  for (let i = 0; i < setPart.length; i++) {
    const ch = setPart[i];
    if (ch === "'") {
      if (inQuote && setPart[i + 1] === "'") { buf += "''"; i++; continue; }
      inQuote = !inQuote; buf += ch;
    } else if (ch === ',' && !inQuote) { out.push(buf); buf = ''; }
    else buf += ch;
  }
  if (buf.trim()) out.push(buf);
  return out.map((a) => a.trim()).filter(Boolean);
}

function sqlFiles(): string[] {
  return DIRS.flatMap((d) =>
    existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.sql')).map((f) => join(d, f)) : [],
  );
}

describe('data migrations: every written column is guarded', () => {
  const files = sqlFiles();

  it('finds migration files to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('has no multi-column UPDATE guarded on only a subset of its columns', () => {
    const offenders: string[] = [];

    for (const path of files) {
      const raw = readFileSync(path, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*--.*$/gm, '');

      const stmt = /UPDATE\s+(\w+)\s+SET\s+([\s\S]*?)\bWHERE\b([\s\S]*?);/gi;
      for (const m of raw.matchAll(stmt)) {
        const [, , setPart, where] = m;
        const cols = splitAssignments(setPart)
          .map((a) => a.split('=')[0].trim().toLowerCase())
          .filter((c) => c && c !== 'updated_at');
        if (new Set(cols).size < 2) continue;

        const guarded = new Set(
          [...where.matchAll(/(\w+)\s+IS\s+NULL/gi)].map((g) => g[1].toLowerCase()),
        );
        if (guarded.size === 0) continue; // unguarded writes are a different (loud) choice

        const unguarded = [...new Set(cols)].filter((c) => !guarded.has(c));
        if (unguarded.length > 0) {
          offenders.push(`${path}: sets [${[...new Set(cols)].join(', ')}] but guards only [${[...guarded].join(', ')}] — ${unguarded.join(', ')} can be silently skipped`);
        }
      }
    }

    expect(offenders, `\n${offenders.join('\n')}\n`).toEqual([]);
  });
});
