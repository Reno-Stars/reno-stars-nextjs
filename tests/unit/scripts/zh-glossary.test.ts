import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  BRAND_PATTERN,
  ZH_GLOSSARY,
  applyBrand,
  applyGlossary,
  applyLocaleLinks,
  buildBrandUpdate,
  buildGlossaryStatements,
  buildReplaceUpdate,
  withChainedRules,
  type ZhScript,
} from '@/scripts/lib/zh-glossary';
import { findUnsafeStatements } from '@/scripts/lib/migration-safety';

const SCRIPTS: ZhScript[] = ['zh', 'zh-Hant'];

describe('glossary integrity', () => {
  it.each(SCRIPTS)('%s: every rule is a multi-character phrase with a different target', (script) => {
    for (const [bad, good] of ZH_GLOSSARY[script]) {
      expect([...bad].length, bad).toBeGreaterThan(1);
      expect(good, bad).not.toBe(bad);
    }
  });

  it.each(SCRIPTS)('%s: no source phrase is listed twice', (script) => {
    const sources = ZH_GLOSSARY[script].map(([bad]) => bad);
    expect(new Set(sources).size).toBe(sources.length);
  });

  // Idempotence is what lets the migration run as sequential UPDATEs and be
  // re-run safely: no replacement may re-introduce any rule's source phrase.
  it.each(SCRIPTS)('%s: no replacement contains any source phrase', (script) => {
    for (const [, good] of ZH_GLOSSARY[script]) {
      for (const [bad] of ZH_GLOSSARY[script]) expect(good.includes(bad), `${good} ⊃ ${bad}`).toBe(false);
    }
  });

  it.each(SCRIPTS)('%s: a longer rule is never shadowed by a shorter one listed before it', (script) => {
    const rules = ZH_GLOSSARY[script];
    rules.forEach(([bad], i) => {
      for (const [earlier] of rules.slice(0, i)) {
        expect(bad.includes(earlier), `"${bad}" is unreachable after "${earlier}"`).toBe(false);
      }
    });
  });
});

describe('applyGlossary — the audit examples', () => {
  it.each([
    ['照明、电器。一支球队，一份合同。', '照明、电器。一个团队，一份合同。'],
    ['符合 BC Building 代码和化妆空气要求', '符合 BC省建筑规范和补风要求'],
    ['厨房翻新 45,000 美元起', '厨房翻新 45,000 加元起'],
    ['如何预算你的虚荣心', '如何预算你的浴室柜'],
    ['BC水电局回扣使净成本接近', 'BC水电局补贴使净成本接近'],
    ['仅化妆品更新：15,000', '仅表面更新：15,000'],
    ['在粗加工通过验收后', '在预埋通过验收后'],
    ['聚星裝修已完成', '聚星装修已完成'],
  ])('zh: %s', (input, expected) => {
    expect(applyGlossary(input, 'zh').text).toBe(expected);
  });

  it.each([
    ['照明、電器。一支球隊，一份合約。', '照明、電器。一個團隊，一份合約。'],
    ['<strong>化妝空氣：</strong>', '<strong>補風：</strong>'],
    ['制櫥櫃、石櫃檯和移動島的', '制櫥櫃、石材檯面和移動島的'],
    ['BC省現在有哪些熱泵回扣？', 'BC省現在有哪些熱泵補貼？'],
    ['聚星装修', '聚星裝修'],
  ])('zh-Hant: %s', (input, expected) => {
    expect(applyGlossary(input, 'zh-Hant').text).toBe(expected);
  });

  // Every legitimate use the audit found that shares characters with a rule.
  it.each([
    '油漆颜色代码',
    '使用正确的本地化密钥格式（而非裸露的区域代码）',
    '浴室柜台盆',
    '早餐点单柜台',
    '城市许可证柜台：1532',
    '允许修剪整齐的前花园',
    '电动牙刷、胡须修剪器',
    '抗牙膏及化妆品日常染色',
    '带独特化妆室的双浴室装修',
    '现有橱柜台面更换',
  ])('zh leaves a legitimate use alone: %s', (text) => {
    expect(applyGlossary(text, 'zh')).toEqual({ text, hits: 0 });
  });

  it.each(['油漆顏色代碼', '浴室櫃檯盆', '某些化妝品會腐蝕大理石'])('zh-Hant leaves alone: %s', (text) => {
    expect(applyGlossary(text, 'zh-Hant')).toEqual({ text, hits: 0 });
  });

  it.each(SCRIPTS)('%s: applying twice equals applying once', (script) => {
    const all = ZH_GLOSSARY[script].map(([bad]) => bad).join('，');
    const once = applyGlossary(all, script).text;
    expect(applyGlossary(once, script)).toEqual({ text: once, hits: 0 });
  });
});

describe('applyBrand', () => {
  it.each([
    ['了解 Reno Stars 如何通过', '了解聚星装修如何通过'],
    ['免費報價Reno Stars。', '免費報價聚星装修。'],
    ['<h3>Reno Stars 能在厨房', '<h3>聚星装修能在厨房'],
    ['联系Reno Stars</a>', '联系聚星装修</a>'],
    ['**Reno Stars 可以帮助', '**聚星装修可以帮助'],
    ['Reno Stars 提供哪些装修服务？', '聚星装修提供哪些装修服务？'],
    ['为什么选择Reno Stars', '为什么选择聚星装修'],
  ])('zh: %s', (input, expected) => {
    expect(applyBrand(input, 'zh').text).toBe(expected);
  });

  it('zh-Hant uses the Traditional name', () => {
    expect(applyBrand('來自 Reno Stars 自己的', 'zh-Hant').text).toBe('來自聚星裝修自己的');
  });

  it.each([
    '聚星装修 Reno Stars 是',
    '温哥华装修公司聚星裝修（Reno Stars）',
    'Reno Stars（聚星装修）的',
    '公司（Reno Stars）',
    '浴室翻新 — Reno Stars Richmond',
    '最近 from Reno Stars items',
    '"name": "Reno Stars", "logo"',
    '| Reno Stars',
    '前和之后 |Reno Stars',
    'Per Reno Stars policy',
  ])('leaves alone: %s', (text) => {
    expect(applyBrand(text, 'zh')).toEqual({ text, hits: 0 });
  });
});

describe('applyLocaleLinks', () => {
  it('repoints markdown and HTML links to the locale', () => {
    const input = '[指南](/en/guides/kitchen-renovation-cost-vancouver/) <a href="/en/contact/">';
    expect(applyLocaleLinks(input, 'zh').text).toBe(
      '[指南](/zh/guides/kitchen-renovation-cost-vancouver/) <a href="/zh/contact/">',
    );
    expect(applyLocaleLinks(input, 'zh-Hant').text).toContain('(/zh-Hant/guides/');
  });

  it('does not touch absolute or non-/en/ links', () => {
    const text = '<a href="https://example.com/en/x">x</a> [y](/zh/y/)';
    expect(applyLocaleLinks(text, 'zh')).toEqual({ text, hits: 0 });
  });
});

describe('SQL generation', () => {
  const col = { table: 'services', column: 'description_zh', script: 'zh' } as const;
  const key = { table: 'services', jsonKey: 'descriptionZhHant', script: 'zh-Hant' } as const;

  it('builds a guarded replace for a column', () => {
    expect(buildReplaceUpdate(col, '一支球队', '一个团队')).toBe(
      "UPDATE services SET description_zh = replace(description_zh, '一支球队', '一个团队') " +
        "WHERE strpos(description_zh, '一支球队') > 0;",
    );
  });

  it('builds a jsonb_set for a localizations key', () => {
    const sql = buildReplaceUpdate(key, '一支球隊', '一個團隊');
    expect(sql).toContain("jsonb_set(localizations, ARRAY['descriptionZhHant'], to_jsonb(replace(");
    expect(sql).toContain("WHERE strpos((localizations->>'descriptionZhHant'), '一支球隊') > 0;");
  });

  it('escapes single quotes', () => {
    expect(buildReplaceUpdate(col, "it's", 'x')).toContain("'it''s'");
  });

  it('orders a column\'s statements by glossary order, not input order', () => {
    const stmts = buildGlossaryStatements([
      { target: col, bad: 'Building 代码', good: '建筑规范' },
      { target: col, bad: 'BC Building 代码', good: 'BC省建筑规范' },
    ]);
    expect(stmts[1]).toContain("'BC Building 代码'");
    expect(stmts[2]).toContain("'Building 代码'");
  });

  it('adds a later rule that an earlier replacement can create (内阁 → 橱柜 → 橱柜里诺)', () => {
    // Over-approximates (橱柜 ends in 柜, so every 柜台… rule is kept too) — an
    // extra statement matches nothing; a missing one would leave a bad phrase.
    const picked = withChainedRules('zh', new Set(['内阁'])).map(([bad]) => bad);
    expect(picked[0]).toBe('内阁');
    expect(picked).toContain('橱柜里诺');
    const stmts = buildGlossaryStatements([{ target: col, bad: '内阁', good: '橱柜' }]);
    expect(stmts.join('\n')).toContain("'橱柜里诺', '橱柜翻新'");
  });

  it('adds nothing when no replacement can create another rule', () => {
    expect(withChainedRules('zh', new Set(['一支球队'])).map(([bad]) => bad)).toEqual(['一支球队']);
  });

  it('every generated statement passes the migration safety guard', () => {
    const sql = [
      ...buildGlossaryStatements(
        ZH_GLOSSARY.zh.map(([bad, good]) => ({ target: col, bad, good })),
      ),
      buildBrandUpdate(col),
      buildBrandUpdate(key),
    ].join('\n');
    expect(findUnsafeStatements(sql)).toEqual([]);
  });

  it('the brand pattern compiles as a JS regex (PG ARE shares the syntax)', () => {
    expect(() => new RegExp(BRAND_PATTERN, 'g')).not.toThrow();
  });
});

// Regression guard: a re-run of translate-locale-messages.mjs would re-introduce
// these; run `npx tsx scripts/fix-zh-glossary.ts --messages` afterwards.
describe('messages/zh* carry no glossary term', () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
      const p = join(dir, n);
      return statSync(p).isDirectory() ? files(p) : n.endsWith('.json') ? [p] : [];
    });

  it.each(SCRIPTS)('%s', (script) => {
    const offenders = files(join(process.cwd(), 'messages', script)).flatMap((f) => {
      const text = readFileSync(f, 'utf8');
      return ZH_GLOSSARY[script].filter(([bad]) => text.includes(bad)).map(([bad]) => `${f}: ${bad}`);
    });
    expect(offenders).toEqual([]);
  });
});
