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
    expect(r.value).toBe('Reno Stars has been serving Metro Vancouver since May 2021 with 20+ years of industry experience and 900+ projects.');
    expect(r.changes.map((c) => c.rule).sort()).toEqual(['count:company-total', 'since:en', 'years:en:experience']);
  });

  it('keeps the embedded English About line as industry experience (168 M1 / 172), keeping $5M', () => {
    const v = 'Texte.\n[About Reno Stars](/fr/about/) — 20+ years, $5M insured';
    expect(rewriteLocalization('contentFr', v, false, sub).value).toBe('Texte.\n[About Reno Stars](/fr/about/) — 20+ yrs industry experience, $5M insured');
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

  it('About line in translated form → industry experience in that language, $5M kept, case kept (172)', () => {
    const sub: SubcountLeft[] = [];
    expect(rewriteLocalization('contentEs', '[Acerca de Reno Stars](/en/about/): más de 20 años, $5M reseñas.', false, sub).value)
      .toBe('[Acerca de Reno Stars](/en/about/): más de 20 años de experiencia en el sector, $5M reseñas.');
    expect(rewriteLocalization('contentEs', '[Aproximadamente Reno Stars](/en/about/) — Más de 20 años, $5M asegurado', false, sub).value)
      .toBe('[Aproximadamente Reno Stars](/en/about/) — Más de 20 años de experiencia en el sector, $5M asegurado');
    expect(rewriteLocalization('contentVi', '[Giới thiệu](/en/about/) - Hơn 20 năm, $5M được bảo hiểm', false, sub).value)
      .toBe('[Giới thiệu](/en/about/) - Hơn 20 năm kinh nghiệm trong ngành, $5M được bảo hiểm');
    expect(rewriteColumn('content_zh', '[关于 Reno Stars](/en/about/) — 20 多年，保险 500 万加元', false, sub).value)
      .toBe('[关于 Reno Stars](/en/about/) — 20 多年行业经验，保险 500 万加元');
  });

  it('locale rules stay in their locale: a zh-Hant table cell changes, the same text in Ja does not; broken tags are left', () => {
    const sub: SubcountLeft[] = [];
    const v = '<標題> <tr><td>經驗</td><td>成立10年以上</td><td>20年以上</td></tr> </標題> <正文>';
    expect(rewriteLocalization('contentZhHant', v, false, sub).value).toBe('<標題> <tr><td>經驗</td><td>成立10年以上</td><td>20 多年業界經驗 · 2021 年 5 月成立</td></tr> </標題> <正文>');
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

describe('task 172 — "20+ years" kept as INDUSTRY experience (Ryan 2026-11-27)', () => {
  const sub = (): SubcountLeft[] => [];

  it('one industry form per locale, never company age', () => {
    expect(rewriteColumn('content_en', 'The company brings <strong>20+ years of renovation experience</strong>.', false, sub()).value)
      .toBe('The company brings <strong>20+ years of industry experience</strong>.');
    expect(rewriteColumn('content_en', '- 20+ years renovating across Metro Vancouver', false, sub()).value)
      .toBe('- 20+ years of industry experience across Metro Vancouver');
    expect(rewriteColumn('content_zh', '在大温哥华超过20年装修经验', false, sub()).value).toBe('在大温哥华拥有 20 多年行业经验');
    expect(rewriteLocalization('contentJa', '20 年以上の改修経験', false, sub()).value).toBe('20年以上の業界経験');
    expect(rewriteLocalization('contentKo', '20년 이상의 경험', false, sub()).value).toBe('20년 이상의 업계 경험');
    expect(rewriteLocalization('contentRu', '20+ лет опыта', false, sub()).value).toBe('Более 20 лет опыта в отрасли');
    expect(rewriteLocalization('contentVi', 'Hơn 20 năm kinh nghiệm', false, sub()).value).toBe('Hơn 20 năm kinh nghiệm trong ngành');
  });

  it('the comparison-table cell reads industry experience + est. May 2021', () => {
    expect(rewriteColumn('content_en', '<td>10+ years, established</td><td>20+ years</td>', false, sub()).value)
      .toBe('<td>10+ years, established</td><td>20+ years industry experience · est. May 2021</td>');
  });

  it('a re-run on migrated text is a no-op (fixpoint), and existing industry wording is left alone', () => {
    for (const [k, v] of [
      ['contentEs', 'con más de 20 años de experiencia en el sector, calidad'],
      ['contentFr', "Plus de 20 ans d'expérience dans le secteur"],
      ['contentRu', 'более 20 лет опыта в отрасли'],
      ['contentAr', 'أكثر من 20 عامًا من الخبرة في القطاع'],
      ['contentFa', 'بیش از ۲۰ سال تجربه در صنعت'],
      ['contentTl', '20+ taong karanasan sa industriya'],
      ['contentVi', 'Hơn 20 năm kinh nghiệm trong ngành'],
      ['contentZhHant', '20 多年業界經驗'],
    ] as const) {
      expect(rewriteLocalization(k, v, false, sub()).changes).toEqual([]);
    }
    expect(rewriteColumn('content_zh', '我们拥有20多年行业经验', false, sub()).changes).toEqual([]);
    expect(rewriteColumn('content_en', 'About Reno Stars — 20+ yrs industry experience, $5M insured', false, sub()).changes).toEqual([]);
  });

  it('residual scan: industry-experience wording is its own pattern id, a bare company claim still counts', async () => {
    const { scanResiduals } = await import('@/scripts/migrations/content-158/residuals');
    const r = scanResiduals([
      { table: 'blog_posts', id: 'a', field: 'content_en', value: 'We bring 20+ years of industry experience.', state: 'new' },
      { table: 'blog_posts', id: 'b', field: 'content_zh', value: '团队拥有 20 多年行业经验。', state: 'new' },
      { table: 'blog_posts', id: 'c', field: 'content_en', value: 'In business for 20+ years.', state: 'new' },
    ]);
    expect(r.excludedByPattern['industry-experience']).toBe(2);
    expect(r.residualsOutsideSkipList).toBe(1);
    expect(r.residuals[0]).toMatchObject({ id: 'c' });
  });
});

describe('task 172 B — warranty "up to 3 years" in the four warranty-wording rows (Ryan 2026-11-27)', () => {
  it('changes only the duration phrase, only in those rows, and a re-run is a no-op', async () => {
    const { rewriteWarranty } = await import('@/scripts/migrations/content-158/facts-rules');
    const faq = '59dc7aba-5dd9-4fc1-8a67-4167425e8abd';
    const v = 'All Delta projects include permits, $5M CGL coverage, and a 3-year workmanship warranty.';
    const r = rewriteWarranty(faq, 'answer_en', v);
    expect(r.value).toBe('All Delta projects include permits, $5M CGL coverage, and a workmanship warranty of up to 3 years.');
    expect(rewriteWarranty(faq, 'answer_en', r.value).changes).toEqual([]);
    expect(rewriteWarranty('00000000-other-row', 'answer_en', v).value).toBe(v);
    const svc = 'cc1effef-49f0-417b-9751-b95c99636f68';
    const ko = rewriteWarranty(svc, 'localizations->longDescriptionKo', 'WorkSafeBC 및 2년 기술 보증이 포함됩니다.');
    expect(ko.value).toBe('WorkSafeBC 및 최대 3년 기술 보증이 포함됩니다.');
    expect(rewriteWarranty(svc, 'localizations->longDescriptionKo', ko.value).changes).toEqual([]);
    const zht = rewriteWarranty('2657bf9d-b4cb-4fa4-8138-d67f223b98ef', 'localizations->longDescriptionZhHant', 'WorkSafeBC、3 年施工質保。 - 3 年施工質保 -');
    expect(zht.value).toBe('WorkSafeBC、最長 3 年施工質保。 - 最長 3 年施工質保 -');
    expect(rewriteWarranty('2657bf9d-b4cb-4fa4-8138-d67f223b98ef', 'localizations->longDescriptionZhHant', zht.value).changes).toEqual([]);
  });

  it('zh-Hant converts the warranty clauses of WARRANTY_ROWS only; other rows keep them as written', () => {
    const cc = OpenCC.Converter({ from: 'cn', to: 'tw' });
    const opencc = (xs: string[]) => xs.map((x) => cc(x));
    const texts = ['提供 2 年施工质保，并且免费检查。', '提供 2 年施工质保，并且免费检查。'];
    const z = new ZhConverter(opencc, texts.join(''));
    const { texts: out, residues } = z.convertWithSecondPass(texts, [true, false]);
    expect(out[0]).toContain('施工质保');
    expect(residues[0].length).toBeGreaterThan(0);
    expect(out[1]).toBe('提供 2 年施工質保，並且免費檢查。');
    expect(residues[1]).toEqual([]);
  });
});
