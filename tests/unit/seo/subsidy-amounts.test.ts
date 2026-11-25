import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { filterPriceFaqs, hasPriceCopy, stripPriceCopy, stripPriceProse, isSubsidyText } from '@/lib/seo/strip-price-copy';

/**
 * Ryan 2026-11-25 (task 136 addendum): government rebate / grant / subsidy
 * amounts (heat-pump rebates, Greener Homes, HAFI) are NOT prices — they stay.
 * Source strings: messages/<locale>/faq.json → faq.heat-pump-hvac.{q1,a1}
 * (en line 70) and faq.accessible-bathroom.{q2,a2} (en line 80).
 */
type Faq = { faq: Record<string, Record<string, string>> };
const LOCALES = readdirSync('messages').filter((d) => existsSync(`messages/${d}/faq.json`));
const CASES = LOCALES.flatMap((loc) => {
  const f = (JSON.parse(readFileSync(`messages/${loc}/faq.json`, 'utf8')) as Faq).faq;
  return [
    [loc, 'heat-pump-hvac q1/a1 (en :70)', f['heat-pump-hvac']?.q1, f['heat-pump-hvac']?.a1],
    [loc, 'accessible-bathroom q2/a2 (en :80)', f['accessible-bathroom']?.q2, f['accessible-bathroom']?.a2],
  ].filter((c) => c[2] && c[3]) as Array<[string, string, string, string]>;
});

describe('subsidy / rebate amounts STAY (faq.json :70 and :80, every locale)', () => {
  it('the strings exist in all 14 site locales (28 cases)', () => {
    expect(LOCALES).toHaveLength(14);
    expect(CASES).toHaveLength(28);
  });

  it.each(CASES)('%s %s: answer kept verbatim', (_loc, _key, q, a) => {
    expect(filterPriceFaqs([{ question: q, answer: a }])).toEqual([{ question: q, answer: a }]);
  });

  it('en :70 — every rebate amount survives the prose filter too', () => {
    const a = CASES.find(([l, k]) => l === 'en' && k.startsWith('heat-pump'))![3];
    expect(stripPriceCopy(a)).toBe(a);
    for (const amt of ['$3,000', '$5,000', '$11,000']) expect(stripPriceCopy(a)).toContain(amt);
  });

  it('en :80 — HAFI "up to $20,000" survives the prose filter too', () => {
    const a = CASES.find(([l, k]) => l === 'en' && k.startsWith('accessible'))![3];
    expect(stripPriceCopy(a)).toBe(a);
    expect(hasPriceCopy(a)).toBe(false);
  });
});

describe('subsidy rule does not let renovation prices through', () => {
  it('a price sentence next to a grant sentence is still stripped', () => {
    const out = stripPriceProse('Kitchens run $25K–$50K. HAFI grants cover up to $20,000 for eligible seniors.');
    expect(out).not.toMatch(/\$25K|\$50K/);
    expect(out).toContain('HAFI grants cover up to $20,000 for eligible seniors.');
  });
  it('"granite" is not "grant"', () => {
    expect(isSubsidyText('Granite countertops')).toBe(false);
    expect(hasPriceCopy('Granite countertops run $3,000–$5,000.')).toBe(true);
  });
  it('"BC Hydro" alone does not protect a price', () => {
    expect(hasPriceCopy('A 200A panel upgrade for BC Hydro runs $2,500–$4,500.')).toBe(true);
  });
  it('a cost question is still dropped when its answer has prices and no subsidy', () => {
    expect(filterPriceFaqs([{ question: 'How much does an accessible bathroom renovation cost?',
      answer: 'Costs depend on scope: $3,000-$8,000 for safety basics.' }])).toEqual([]);
  });
});

// Verbatim DB copy (service heat-pump-hvac long description, zh) as served on
// /zh/services/heat-pump-hvac/surrey/ by main 4795870b — task 136 source check.
describe('rebate lists and mixed sentences in DB copy (heat-pump service, zh)', () => {
  const MD = [
    '| 寒带级中央 + 辅热 | $18,000 – $35,000+ | 整屋、高端配置 |',
    '',
    '**可申请 BC Hydro / 省级退税：**',
    '',
    '- 热泵退税：最高 **$3,000**（BC Hydro）',
    '- 加拿大绿色家园补助：最高 **$5,000**（联邦）',
    '- 低收入家庭补充：额外 **$3,000**（BC Hydro）',
    '- **合计可达 $11,000**，视资格等级而定',
    '',
    '我们代为办理退税申请——包括影响您退税等级的入户能源审计前后流程。',
    '',
    '2. **替换 20 年以上燃气炉。** 联邦碳税让现在升级在经济上合算。中央热泵系统安装 $14–22K，退税可抵 $7–11K。',
  ].join('\n');

  it('keeps every rebate list item under the rebate lead-in, verbatim', () => {
    const out = stripPriceCopy(MD);
    for (const line of [
      '**可申请 BC Hydro / 省级退税：**',
      '- 热泵退税：最高 **$3,000**（BC Hydro）',
      '- 加拿大绿色家园补助：最高 **$5,000**（联邦）',
      '- 低收入家庭补充：额外 **$3,000**（BC Hydro）',
      '- **合计可达 $11,000**，视资格等级而定',
    ]) expect(out).toContain(line);
  });

  it('strips the installation price table row and the installation price clause, keeps the rebate clause', () => {
    const out = stripPriceCopy(MD);
    expect(out).not.toContain('$18,000');
    expect(out).not.toContain('$14–22K');
    expect(out).toContain('退税可抵 $7–11K');
    expect(out).toContain('联邦碳税让现在升级在经济上合算。');
  });

  it('a mixed English sentence: price clause cut, rebate clause kept', () => {
    const out = stripPriceProse('Central heat pump installs run $14K–$22K, and rebates offset $7K–$11K.');
    expect(out).not.toMatch(/\$14K|\$22K/);
    expect(out).toContain('rebates offset $7K–$11K.');
  });

  it('an English rebate list under its lead-in stays', () => {
    const md = '**Available BC Hydro / provincial rebates:**\n\n- Heat pump rebate: up to **$3,000**\n- Low-income supplement: an extra **$3,000**\n- **Combined up to $11,000**';
    expect(stripPriceCopy(md)).toBe(md);
  });

  it('a price list under a NON-subsidy lead-in is still stripped', () => {
    const md = '**Typical costs:**\n\n- Single-zone ductless: $4,500 – $7,500\n- Multi-zone: $8,000 – $15,000';
    expect(stripPriceCopy(md)).not.toMatch(/\$4,500|\$8,000/);
  });
});

// Task 136 final gate (head 5a684109): pages where a subsidy word was matched by
// accident and real prices stayed. Text verbatim from main 4795870b on :3101.
describe('a subsidy word inside another word does not keep prices', () => {
  it('ar /areas/burnaby/: "تمنحك" ("gives you") is not "منح" (grants) — the cost list is stripped', () => {
    const md = [
      'تمنحك مشاريع Burnaby المكتملة لدينا معايير واقعية لتخطيط ميزانيتك:',
      '',
      '- **تجديد الحمامات:** 20,000 دولار - 32,000 دولار حسب النطاق.',
      '- **التجديدات التجارية:** 8000 دولار - 25000 دولار لمساحات البيع بالتجزئة والتجارية.',
    ].join('\n');
    const out = stripPriceCopy(md);
    expect(isSubsidyText('تمنحك مشاريع Burnaby المكتملة')).toBe(false);
    expect(out).not.toMatch(/20,000|32,000|8000|25000/);
  });

  it('ar /areas/west-vancouver/: "المنحدرات" ("slopes") is not a grant', () => {
    const s = 'يؤثر على المنحدرات أو الصرف أو الهياكل الاستنادية؛ ميزانية تتراوح بين 1500 و3500 دولار لهذه المراجعة عند الاقتضاء.';
    expect(isSubsidyText(s)).toBe(false);
    expect(stripPriceProse(s)).not.toMatch(/1500|3500/);
  });

  it('fa /areas/richmond/: "منحصربه‌فرد" ("unique") is not a grant', () => {
    const s = 'دو حمام با دستشویی مهمان منحصربه‌فرد : ۳۳,۰۰۰ تا ۳۵,۰۰۰ دلار، ۶ تا ۸ هفته';
    expect(isSubsidyText(s)).toBe(false);
    expect(hasPriceCopy(stripPriceProse(s))).toBe(false);
  });

  it('Arabic grant words still count: "منحة" / "المنح"', () => {
    expect(isSubsidyText('منحة المنازل الأكثر خضرة')).toBe(true);
    expect(isSubsidyText('ما هي المنح المتاحة؟')).toBe(true);
    expect(isSubsidyText('امنح منزلك مظهرًا جديدًا')).toBe(false);
  });

  it('ja heat-pump: 補助熱 (backup heat) is not 補助 (subsidy) — the install-cost row is stripped', () => {
    const md = '|寒冷地用ダクト + 補助熱 | $18,000 – $35,000+ |家全体、プレミアム層 |\n\n**BC Hydro / 州のリベートが利用可能:**\n\n- ヒートポンプ リベート: 最大 **$3,000** (BC Hydro)';
    const out = stripPriceCopy(md);
    expect(out).not.toContain('$18,000');
    expect(out).toContain('- ヒートポンプ リベート: 最大 **$3,000** (BC Hydro)');
  });

  it('ko heat-pump: an install price in the same comma-less sentence as a rebate is still a price', () => {
    const s = '열 펌프 중앙 시스템은 $14~22K를 설치하고 운영되며 리베이트는 $7~11K를 상쇄할 수 있습니다.';
    expect(stripPriceProse(s)).not.toContain('$14~22K');
  });

  it('a "(before rebates):" lead-in does not keep the installation costs listed under it', () => {
    const md = '**Real Vancouver heat pump install costs (before rebates):**\n\n- Ducted cold-climate: $18,000 – $35,000+\n- Heat pump rebate: up to $3,000';
    const out = stripPriceCopy(md);
    expect(out).not.toContain('$18,000');
    expect(out).toContain('- Heat pump rebate: up to $3,000');
  });
});

// Verbatim rebate list items from the translated heat-pump service copy (main 4795870b).
describe('the translated rebate wording keeps rebate amounts in every locale', () => {
  it.each([
    ['es', 'Reembolso por bomba de calor: hasta $3000 (BC Hydro)'],
    ['fr', 'Rabais sur les thermopompes : jusqu\'à 3 000$ (BC Hydro)'],
    ['ru', 'Скидка на тепловой насос: до 3000 долларов США (BC Hydro)'],
    ['vi', 'Giảm giá bơm nhiệt: lên tới $3.000 (BC Hydro)'],
    ['ar', 'خصم على المضخة الحرارية: يصل إلى 3000 دولار (BC Hydro)'],
    ['fa', 'تخفیف پمپ حرارتی: تا 3000 دلار (BC Hydro)'],
    ['zh-Hant', '熱泵回扣：高達 $3,000 （BC Hydro）'],
    ['hi', 'हीट पंप छूट: $3,000 तक (बीसी हाइड्रो)'],
    ['pa', 'ਹੀਟ ਪੰਪ ਛੋਟ: $3,000 ਤੱਕ (BC Hydro)'],
  ])('%s: %s', (_loc, line) => {
    expect(stripPriceProse(line)).toBe(line);
  });

  it.each([
    ['es', '**Reembolsos de BC Hydro/Provincia disponibles:**', '- Recarga para personas de bajos ingresos calificadas por ingresos: **$3,000 adicionales** (BC Hydro)'],
    ['ar', '**خصومات BC Hydro / المقاطعة المتاحة:**', '- زيادة الدخل المنخفض المؤهل للدخل: **3000 دولار إضافية** (BC Hydro)'],
    ['fr', '**Remises BC Hydro/Province disponibles :**', '- Complément pour faible revenu admissible : **3 000 $ supplémentaires** (BC Hydro)'],
  ])('%s: a top-up item under the rebate lead-in stays', (_loc, lead, item) => {
    const md = `${lead}\n\n${item}`;
    expect(stripPriceCopy(md)).toBe(md);
  });

  it('ਛੋਟਾ ("small") is not ਛੋਟ (rebate): a small-bathroom price is still stripped', () => {
    expect(isSubsidyText('ਛੋਟਾ ਬਾਥਰੂਮ')).toBe(false);
  });
});
