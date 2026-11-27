import { describe, it, expect } from 'vitest';
import * as OpenCC from 'opencc-js';
import { rewriteColumn, rewriteLocalization, rowMakesSinceClaim, type SubcountLeft } from '@/scripts/migrations/content-158/facts-rules';
import { ZhConverter, zhHantKey } from '@/scripts/migrations/content-158/zh-rules';
import { renderStmt, renderFile, sortStmts, skipReason, safeLiterals, type Stmt } from '@/scripts/migrations/content-158/snapshot';
import { findUnsafeStatements } from '@/scripts/lib/migration-safety';

/**
 * Task 169: the task-158 content migrations are generated, not committed. These pin
 * the rules on a small fixture so a rule change shows up as a diff here, and the
 * output stays deterministic (same input → same bytes).
 */

describe('company-facts rules', () => {
  const sub: SubcountLeft[] = [];

  it('rewrites the English claims', () => {
    const v = 'Reno Stars has been serving Metro Vancouver since 2019 with 20+ years of renovation experience and 700+ projects.';
    const r = rewriteColumn('content_en', v, true, sub);
    expect(r.value).toBe('Reno Stars has been serving Metro Vancouver since May 2021 with 900+ completed projects and 900+ projects.');
    expect(r.changes.map((c) => c.rule).sort()).toEqual(['count:company-total', 'since:en', 'years:en:experience']);
  });

  it('replaces the embedded English About line inside a localized body (168 M1), keeping $5M', () => {
    const v = 'Texte.\n[About Reno Stars](/fr/about/) — 20+ years, $5M insured';
    expect(rewriteLocalization('contentFr', v, false, sub).value).toBe('Texte.\n[About Reno Stars](/fr/about/) — 900+ projects, $5M insured');
  });

  it('localized "since 2019" follows only when the en text makes the company claim', () => {
    expect(rewriteLocalization('contentEs', 'al servicio de Vancouver desde 2019', true, sub).value).toBe('al servicio de Vancouver desde mayo de 2021');
    expect(rewriteLocalization('contentEs', 'al servicio de Vancouver desde 2019', false, sub).value).toBe('al servicio de Vancouver desde 2019');
    expect(rowMakesSinceClaim({ content_en: 'serving Burnaby since 2019' }, ['content_en'])).toBe(true);
  });

  it('leaves non-company numbers and sub-counts alone', () => {
    const left: SubcountLeft[] = [];
    expect(rewriteColumn('content_en', 'Natural stone: 20+ years if properly sealed.', false, left).changes).toEqual([]);
    expect(rewriteColumn('content_en', 'Paint colours have shown popularity since 2019.', false, left).changes).toEqual([]);
    expect(rewriteColumn('content_en', 'We have completed 100+ strata renovations.', false, left).changes).toEqual([]);
    expect(left).toHaveLength(1);
  });

  it('removes the licence number and maps 2020 → May 2021', () => {
    expect(rewriteColumn('content_en', 'Licensed (License #52603). We were founded in 2020.', false, sub).value).toBe('Licensed. We were founded in May 2021.');
  });
});

describe('zh-Hant rules', () => {
  const cc = OpenCC.Converter({ from: 'cn', to: 'tw' });
  const opencc = (xs: string[]) => xs.map((x) => cc(x));

  it('converts only Simplified sentences and keeps warranty clauses + place names', () => {
    const texts = ['我们在素里完成了厨房翻新。已經是繁體的句子。', '提供 2 年施工质保，并且免费检查。'];
    const z = new ZhConverter(opencc, texts.join(''));
    const { texts: out, residues } = z.convertWithSecondPass(texts);
    expect(out[0]).toBe('我們在素里完成了廚房翻新。已經是繁體的句子。');
    expect(out[1]).toContain('施工质保');
    expect(residues[1].length).toBeGreaterThan(0);
  });

  it('maps a _zh column to its ZhHant key', () => {
    expect(zhHantKey('meta_description_zh')).toBe('metaDescriptionZhHant');
  });
});

describe('statement rendering + skip rules', () => {
  const stmts: Stmt[] = [
    { table: 'services', id: 'b', field: 'localizations->longDescriptionZhHant', mode: 'fix-key', old: "舊's", new: '新', rules: ['x'] },
    { table: 'faqs', id: 'z', field: 'localizations->answerZhHant', mode: 'add-key', old: null, new: 'a -- b', rules: ['x'] },
    { table: 'blog_posts', id: 'a', field: 'content_en', mode: 'set', old: 'old', new: 'new', rules: ['x'] },
  ];

  it('renders guarded statements the safety checker accepts', () => {
    const sql = sortStmts(stmts).map(renderStmt);
    expect(sql[0]).toBe("UPDATE blog_posts SET content_en = 'new' WHERE id = 'a' AND content_en = 'old';");
    expect(sql[1]).toContain("NOT (coalesce(localizations, '{}'::jsonb) ? 'answerZhHant')");
    expect(sql[1]).toContain("'a -' || '- b'");
    expect(sql[2]).toContain("localizations->>'longDescriptionZhHant' = '舊''s'");
    expect(findUnsafeStatements(renderFile('-- t', sortStmts(stmts)))).toEqual([]);
  });

  it('is deterministic regardless of input order', () => {
    expect(renderFile('-- t', sortStmts([...stmts].reverse()))).toBe(renderFile('-- t', sortStmts(stmts)));
  });

  it('splits -- and comment markers inside literals only', () => {
    expect(safeLiterals("SET c = '--x/*y*/' -- real")).toBe("SET c = '-' || '-x/' || '*y*' || '/' -- real");
  });

  it('skips tied / Test-A-rendered rows but never blog posts (168 M3)', () => {
    const ctx = { corpus: 'id-on-page … This forty-character sentence renders on Test A pages.', tied: new Set(['tied-id']) };
    expect(skipReason(ctx, 'projects', 'tied-id', 'x')).toBe('tied-sort-key');
    expect(skipReason(ctx, 'services', 'id-on-page', 'x')).toBe('testA-rendered:id');
    expect(skipReason(ctx, 'services', 'other', 'This forty-character sentence renders on Test A pages.')).toBe('testA-rendered:value');
    expect(skipReason(ctx, 'blog_posts', 'id-on-page', 'x')).toBeNull();
    expect(skipReason(ctx, 'services', 'other', 'unrelated text')).toBeNull();
  });
});
