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

describe('task 170', () => {
  it('generated files carry no BEGIN/COMMIT (db:query owns the transaction) and pass the generation-time check', async () => {
    const { assertSafeSql } = await import('@/scripts/migrations/content-158/snapshot');
    const { findTransactionControl } = await import('@/scripts/lib/migration-safety');
    const stmt: Stmt = { table: 'blog_posts', id: 'a', field: 'content_en', mode: 'set', old: 'please commit; end', new: 'x', rules: ['r'] };
    const sql = renderFile('-- header mentions BEGIN/COMMIT only in a comment', [stmt]);
    expect(findTransactionControl(sql)).toEqual([]);
    expect(() => assertSafeSql(sql)).not.toThrow();
    expect(() => assertSafeSql(`BEGIN;\n${sql}COMMIT;\n`)).toThrow(/transaction-control/);
  });

  it('About line in translated form → "900+ projects" in that language, $5M kept, case kept', () => {
    const sub: SubcountLeft[] = [];
    expect(rewriteLocalization('contentEs', '[Acerca de Reno Stars](/en/about/): más de 20 años, $5M reseñas.', false, sub).value)
      .toBe('[Acerca de Reno Stars](/en/about/): más de 900 proyectos, $5M reseñas.');
    expect(rewriteLocalization('contentEs', '[Aproximadamente Reno Stars](/en/about/) — Más de 20 años, $5M asegurado', false, sub).value)
      .toBe('[Aproximadamente Reno Stars](/en/about/) — Más de 900 proyectos, $5M asegurado');
    expect(rewriteLocalization('contentVi', '[Giới thiệu](/en/about/) - Hơn 20 năm, $5M được bảo hiểm', false, sub).value)
      .toBe('[Giới thiệu](/en/about/) - Hơn 900 dự án, $5M được bảo hiểm');
    expect(rewriteColumn('content_zh', '[关于 Reno Stars](/en/about/) — 20 多年，保险 500 万加元', false, sub).value)
      .toBe('[关于 Reno Stars](/en/about/) — 900+ 个项目，保险 500 万加元');
  });

  it('locale rules stay in their locale: a zh-Hant table cell changes, the same text in Ja does not; broken tags are left', () => {
    const sub: SubcountLeft[] = [];
    const v = '<標題> <tr><td>經驗</td><td>成立10年以上</td><td>20年以上</td></tr> </標題> <正文>';
    expect(rewriteLocalization('contentZhHant', v, false, sub).value).toBe('<標題> <tr><td>經驗</td><td>成立10年以上</td><td>2021 年 5 月成立</td></tr> </標題> <正文>');
    expect(rewriteLocalization('contentJa', '<td>20年以上</td>', false, sub).changes).toEqual([]);
  });

  it('residual scan: company claims count, documented exclusions and skipped rows are reported separately', async () => {
    const { scanResiduals } = await import('@/scripts/migrations/content-158/residuals');
    const r = scanResiduals([
      { table: 'blog_posts', id: 'x1', field: 'content_en', value: 'Reno Stars brings 20+ years to every job.', state: 'new' },
      { table: 'blog_posts', id: '91161717-aaaa', field: 'content_en', value: 'Natural stone: 20+ years if sealed.', state: 'untouched' },
      { table: 'blog_posts', id: 'x2', field: 'content_en', value: 'Faucets from $80 to $700+ and $64,700+ homes.', state: 'untouched' },
      { table: 'services', id: 'x3', field: 'description_en', value: 'over 100 renovation projects', state: 'skipped' },
    ]);
    expect(r.residualsOutsideSkipList).toBe(1);
    expect(r.residuals[0]).toMatchObject({ id: 'x1', detector: 'years20:en' });
    expect(r.excludedByPattern).toEqual({ 'lifespan:tile': 1 });
    expect(r.residualsInSkipList).toBe(1);
  });
});
