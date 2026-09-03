import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findUnsafeStatements, stripSqlNoise } from '@/scripts/lib/migration-safety';

const MIGRATIONS_DIR = join(process.cwd(), 'scripts', 'migrations');

describe('stripSqlNoise', () => {
  it('removes single-quoted string literals', () => {
    expect(stripSqlNoise("UPDATE t SET c = 'DROP TABLE x' WHERE id = 1")).not.toMatch(/DROP/i);
  });

  it('removes line comments', () => {
    expect(stripSqlNoise('-- DROP TABLE users\nUPDATE t SET c = 1')).not.toMatch(/DROP/i);
  });

  it('removes block comments', () => {
    expect(stripSqlNoise('/* ALTER TABLE t */ UPDATE t SET c = 1')).not.toMatch(/ALTER/i);
  });

  it('keeps the real statement intact', () => {
    expect(stripSqlNoise("UPDATE blog_posts SET x = 'y' WHERE id = 'z'")).toMatch(/UPDATE blog_posts/);
  });

  it("handles a doubled '' escape inside a literal", () => {
    expect(stripSqlNoise("UPDATE t SET c = 'it''s DROP safe' WHERE id = 1")).not.toMatch(/DROP/i);
  });
});

describe('findUnsafeStatements', () => {
  it('allows a guarded UPDATE', () => {
    expect(findUnsafeStatements("UPDATE blog_posts SET a = 'b' WHERE id = 'x';")).toEqual([]);
  });

  it.each(['DROP TABLE blog_posts;', 'ALTER TABLE blog_posts ADD COLUMN x int;', 'TRUNCATE blog_posts;'])(
    'rejects DDL: %s',
    (sql) => expect(findUnsafeStatements(sql).length).toBeGreaterThan(0),
  );

  it('rejects DELETE without WHERE', () => {
    expect(findUnsafeStatements('DELETE FROM blog_posts;')).toHaveLength(1);
  });

  it('allows DELETE with WHERE', () => {
    expect(findUnsafeStatements("DELETE FROM blog_posts WHERE id = 'x';")).toEqual([]);
  });

  // The 2026-09-02 false positive: a substring guard refused a legitimate file
  // because Chinese SEO copy contained the phrase "BC renovation grant".
  it('does NOT flag SQL keywords appearing inside content strings', () => {
    const real =
      "UPDATE blog_posts SET seo_keywords_zh = " +
      "'温哥华装修融资,HELOC装修贷款,BC renovation grant' " +
      "WHERE id = 'abc' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');";
    expect(findUnsafeStatements(real)).toEqual([]);
  });

  it('still catches DDL that follows a content string', () => {
    expect(
      findUnsafeStatements("UPDATE t SET c = 'grant' WHERE id = 1; DROP TABLE t;"),
    ).toHaveLength(1);
  });
});

describe('every committed migration is safe to auto-apply', () => {
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'));

  it('finds migration files to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s contains no unsafe statement', (file) => {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    expect(findUnsafeStatements(sql)).toEqual([]);
  });
});
