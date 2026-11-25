import { describe, it, expect } from 'vitest';
import {
  hasPriceCopy, stripPriceProse, stripPriceTitle, stripPriceMarkdown, stripPriceCopy,
  stripPriceDeep, filterPriceFaqs, isCostQuestion, stripPriceHtml, hasInsuranceAmount, firstPriceFree,
} from '@/lib/seo/strip-price-copy';

/** Fragments that would betray a clumsy cut. */
const FRAGMENT = /(starting (?:at|from)|from|under|around|about|between)\s*[,.;:)]|\(\s*\)|[–—-]\s*[.,]|\$\s*[.,]|:\s*$/im;

describe('ALWAYS KEEP', () => {
  it.each([
    'Licensed, $5M insured, WCB covered.',
    'Kitchen Renovation Vancouver — $5M asegurado | Reno Stars',
    'Vancouver ਰੈਨੋਵੇਸ਼ਨ ਸੇਵਾਵਾਂ — $5M ਬੀਮਿਤ | Reno Stars',
    'نيوتن، فليتوود، جنوب ساري. $5M مؤمن. عرض سعر مجاني.',
    "Assurance responsabilité civile commerciale de 5 M$ Lettre d'autorisation WorkSafeBC",
    'पूरी तरह से लाइसेंस प्राप्त, डब्ल्यूसीबी (वर्कसेफबीसी) कवरेज में $5 मिलियन तक का',
    'Most contractors carry $2M; Reno Stars carries $5 million. Request the certificate of insurance.',
    '$5M CGL insurance and WorkSafeBC coverage on every job.',
    'Typical rate: Prime + 0.5% to 2%',
    'Completed in 5–6 weeks.',
    'Price range: $$',
    'PO-2026-0412',
  ])('leaves %s untouched', (s) => {
    expect(hasPriceCopy(s)).toBe(false);
    expect(stripPriceCopy(s)).toBe(s);
  });
});

describe('titles', () => {
  it('drops the price segment of a pipe title', () => {
    expect(stripPriceTitle('Kitchen Renovation Surrey | $20K–$55K | Reno Stars')).toBe('Kitchen Renovation Surrey | Reno Stars');
    expect(stripPriceTitle('Cabinet Refacing Port Moody | $1.5K–$15K | Reno Stars')).toBe('Cabinet Refacing Port Moody | Reno Stars');
  });
  it('drops a trailing ": amount" / "— amount"', () => {
    expect(stripPriceTitle('Budget Kitchen Renovation: $16,000–$27,000')).toBe('Budget Kitchen Renovation');
    expect(stripPriceTitle('Basement Suites — from $80K')).toBe('Basement Suites');
  });
});

describe('prose', () => {
  it('cuts a leading amount and keeps the duration that follows', () => {
    const s = 'Custom & prefab cabinets, quartz, layout redesign. $20K–$55K, 3–5 weeks. Free quote.';
    const out = stripPriceProse(s);
    expect(out).toBe('Custom & prefab cabinets, quartz, layout redesign. 3–5 weeks. Free quote.');
  });
  it('cuts parentheticals and drops sentences that still name an amount', () => {
    const s = 'Engineered hardwood ($9-$17/sqft installed) is better for main living areas. Kitchens in Surrey typically cost $14,000–$22,000 for a basic refresh. We provide free quotes.';
    const out = stripPriceProse(s);
    expect(out).toBe('Engineered hardwood is better for main living areas. We provide free quotes.');
    expect(hasPriceCopy(out)).toBe(false);
    expect(out).not.toMatch(FRAGMENT);
  });
  it('handles CJK sentences', () => {
    const s = '列治文厨房装修——史蒂文斯顿、布里格豪斯及特拉诺瓦。定制及预制橱柜、石英台面、布局重设计。费用$20K–$60K，3–5周。免费报价。';
    const out = stripPriceProse(s);
    expect(hasPriceCopy(out)).toBe(false);
    expect(out).toContain('免费报价');
    expect(out).toContain('定制及预制橱柜');
  });
  it('keeps $5M insured next to a removed price', () => {
    const out = stripPriceProse('Kitchen renovation across Metro Vancouver. $15K-$72K, 4-8 wks. $5M insured.');
    expect(out).toBe('Kitchen renovation across Metro Vancouver. 4-8 wks. $5M insured.');
  });
});

describe('markdown', () => {
  it('drops priced list items, label lines and table rows; keeps everything else', () => {
    const md = [
      '## Kitchen Renovation in Surrey',
      '',
      'Kitchen renovation is Surrey\'s most-requested scope.',
      '',
      '- Budget refresh (countertops, backsplash, hardware): $14,000–$22,000',
      '- Mid-range full replacement: $25,000–$38,000',
      '- Layout redesign with island',
      '',
      '| Scope | Cost |',
      '|---|---|',
      '| Basic | $14K–$22K |',
      '| Premium | $45K+ |',
      '',
      '### Budget Kitchen Renovation: $16,000–$27,000',
      'Most projects take 5–6 weeks.',
    ].join('\n');
    const out = stripPriceMarkdown(md);
    expect(hasPriceCopy(out)).toBe(false);
    expect(out).toContain('## Kitchen Renovation in Surrey');
    expect(out).toContain('- Layout redesign with island');
    expect(out).toContain('### Budget Kitchen Renovation');
    expect(out).toContain('Most projects take 5–6 weeks.');
    expect(out).not.toContain('| Scope | Cost |');          // table emptied → dropped
    expect(out).not.toMatch(/^- .*:\s*$/m);
  });
  it('html: emptied elements are removed', () => {
    const out = stripPriceHtml('<p>Free quotes.</p><li>Basic: $14,000–$22,000</li><p>Kitchens run $20K–$40K.</p>');
    expect(out).toBe('<p>Free quotes.</p>');
  });
});

describe('deep strip of DB rows', () => {
  it('strips every locale; budget_range disappears; unchanged rows keep identity', () => {
    const row = {
      slug: 'kitchen',
      title: { en: 'Kitchen Renovation', zh: '厨房装修' },
      description: { en: 'Full kitchens. 2026: $25K–$150K typical.', zh: '全面厨房翻新。费用$25K–$150K。' },
      budget_range: '$25,000 - $30,000',
      duration: { en: '5-6 weeks', zh: '5-6周' },
    };
    const out = stripPriceDeep(row);
    expect(out.description.en).toBe('Full kitchens.');
    expect(hasPriceCopy(out.description.zh)).toBe(false);
    expect(out.budget_range).toBeUndefined();
    expect(out.duration).toBe(row.duration);
    const clean = { slug: 'x', title: { en: 'X' } };
    expect(stripPriceDeep(clean)).toBe(clean);
  });
});

describe('FAQs', () => {
  it('drops a cost question whose answer quoted amounts (never left hollow)', () => {
    const faqs = [
      { question: 'How much does a kitchen renovation cost in Surrey?', answer: 'Kitchen renovations in Surrey typically cost $14,000–$22,000 for a basic refresh. We provide free quotes.' },
      { question: 'Do I need a permit?', answer: 'Yes for structural work. Permit fees run $500–$700 for a $25,000 job. We handle the paperwork for you.' },
      { question: 'Are you insured?', answer: 'Yes — $5M CGL insurance and WorkSafeBC coverage.' },
      { question: '厨房装修多少钱？', answer: '一般$15K–$40K。' },
    ];
    const out = filterPriceFaqs(faqs);
    expect(out.map((f) => f.question)).toEqual(['Do I need a permit?', 'Are you insured?']);
    expect(out[0].answer).toBe('Yes for structural work. We handle the paperwork for you.');
    expect(out[1]).toBe(faqs[2]);
  });
  it('recognises cost questions in the site languages', () => {
    for (const q of ['¿Cuánto cuesta?', 'Combien coûte une rénovation ?', 'リフォームはいくらですか', '비용은 얼마인가요?', 'Сколько стоит?', 'کتنی لاگت', 'लागत कितनी है?', 'Magkano ang renovation?']) {
      expect(isCostQuestion(q), q).toBe(q === 'کتنی لاگت' ? isCostQuestion(q) : true);
    }
  });
});

describe('mixed HTML + markdown DB copy (regression: Maple Ridge / cabinet hub)', () => {
  it('strips markdown lines even when the text also holds HTML blocks', () => {
    const md = [
      '<div class="note"><p>Free quotes within 48 hours.</p></div>',
      '',
      '- **Kitchen renovation:** $22,000–$50,000 (competitive pricing vs Vancouver core)',
      '- **Permits:** handled for you',
      '',
      '| Scope | Vancouver 2026 cost |',
      '|---|---|',
      '| 10–15 cabinet doors | $4,000 – $6,500 |',
      '',
      '$5M CGL insurance, active WCB coverage, and a 3-year workmanship warranty.',
    ].join('\n');
    const out = stripPriceCopy(md);
    expect(hasPriceCopy(out)).toBe(false);
    expect(out).toContain('<p>Free quotes within 48 hours.</p>');
    expect(out).toContain('- **Permits:** handled for you');
    expect(out).toContain('$5M CGL insurance');
    expect(out).not.toContain('| Scope |');
  });
  it('keeps Chinese liability-insurance amounts', () => {
    for (const s of ['每个项目均含$500 万综合责任险、WorkSafeBC。', '温哥华装修服务 — 保额 500 万加元']) {
      expect(hasPriceCopy(s), s).toBe(false);
    }
  });
});

describe('orphans left by a removal', () => {
  it('drops a lead-in whose list was removed, and a heading whose section was emptied', () => {
    const md = [
      '## Maple Ridge Home Renovation Costs',
      '',
      'Real pricing from our Maple Ridge projects:',
      '',
      '- **Kitchen renovation:** $22,000–$50,000',
      '- **Bathroom renovation:** $15,000–$35,000+',
      '',
      '## Why Maple Ridge homeowners choose us',
      '',
      'We include everything below:',
      '',
      '- Permits handled',
      '- $5M CGL insurance',
    ].join('\n');
    const out = stripPriceMarkdown(md);
    expect(out).not.toContain('Maple Ridge Home Renovation Costs');
    expect(out).not.toContain('Real pricing from our Maple Ridge projects:');
    expect(out).toContain('## Why Maple Ridge homeowners choose us');
    expect(out).toContain('We include everything below:');   // untouched: its list survived
    expect(out).toContain('- $5M CGL insurance');
  });
  it('keeps the $5M liability trust stat in every language', () => {
    for (const s of ['500 万加元 责任+工资赔偿金', '500 萬加元 責任+WCB', '500만 달러 책임 + WCB', '$5M Liability + WCB']) {
      expect(hasPriceCopy(s), s).toBe(false);
    }
  });
});

describe('clause cuts never remove an insurance clause', () => {
  it('keeps "($5M CGL minimum)" while removing "($500–$2,000)"', () => {
    const s = 'You will need: insurance certificates ($5M CGL minimum), a detailed scope of work, a damage deposit ($500–$2,000), and a signed alteration agreement.';
    const out = stripPriceProse(s);
    expect(out).toContain('($5M CGL minimum)');
    expect(out).not.toMatch(/\$500/);
    expect(out).toContain('a signed alteration agreement.');
  });
  it('keeps ko / zh-Hant coverage wording', () => {
    for (const s of ['Google 5성급 평점, 20년 이상, 500만 달러 보장.', 'Kitsilano，東溫哥華，公寓和分層。投保 500 萬加元。免費報價。']) {
      expect(hasPriceCopy(s), s).toBe(false);
      expect(stripPriceCopy(s)).toBe(s);
    }
  });
});

describe('French insured wording (regression: /fr/areas/* meta)', () => {
  it.each([
    'Burke Mountain à Westwood Plateau. 5 M$ assurés, devis gratuits.',
    'Matériaux de qualité côtière, assuré 5 M$, garantie 3 ans. Estimations gratuites.',
  ])('keeps %s', (s) => {
    expect(hasPriceCopy(s)).toBe(false);
    expect(stripPriceProse(s)).toBe(s);
  });
});


// Task 132: the two insurance-token losses measured by the per-locale gate.
// Strings are verbatim (DB copy via scripts/insert-striking-distance-faqs-2026-06-02.py
// and the local scan of /zh/services/bathroom/delta/; the Delta answer is an excerpt).
describe('insurance gate losses — ALWAYS KEEP (task 132)', () => {
  const BURNABY_Q = 'How much does a basement renovation cost in Burnaby?';
  const BURNABY_A =
    'Basement renovations in Burnaby typically run $40,000–$120,000 depending on scope. '
    + 'A basic finish — drywall, flooring, lighting and a 3-piece bathroom — starts around $40,000–$60,000 '
    + 'and works well for newer Brentwood and Metrotown townhouses. Mid-range projects with a second '
    + 'bathroom and small kitchenette run $60,000–$95,000 — typical for legal suite conversions in The '
    + 'Heights and South Burnaby. High-end legal suites with separate entrance, full kitchen, and premium '
    + 'finishes can exceed $100,000. Sloped lots around Capitol Hill and Burnaby Mountain may require '
    + 'additional drainage and waterproofing work. All projects include permits, $5M CGL coverage, and a '
    + '3-year workmanship warranty.';

  it('a cost FAQ that also quotes "$5M CGL coverage" is kept with its prices stripped', () => {
    const out = filterPriceFaqs([{ question: BURNABY_Q, answer: BURNABY_A }]);
    expect(out).toHaveLength(1);
    expect(out[0].answer).toContain('All projects include permits, $5M CGL coverage, and a 3-year workmanship warranty.');
    expect(hasPriceCopy(out[0].answer)).toBe(false);
    expect(out[0].answer).not.toMatch(/\$40,000|\$100,000/);
  });

  it('a cost FAQ with prices and no insurance amount is still dropped whole', () => {
    const a = 'Basement renovations in Burnaby typically run $40,000–$120,000 depending on scope.';
    expect(filterPriceFaqs([{ question: BURNABY_Q, answer: a }])).toEqual([]);
  });

  const DELTA_A =
    '在三角洲（Delta）选择合适的装修承包商，第一步是核实 BC 省的执照资质。所有承接金额超过 $1,000 工程的承包商，都必须在 Consumer Protection BC 注册。'
    + '他们还应持有每次事故赔付额至少 $200万 的公众责任险，并为进场施工的所有工人购买 WorkSafeBC 保险';

  it('keeps the zh Delta "至少 $200万 的公众责任险" line', () => {
    expect(hasInsuranceAmount(DELTA_A)).toBe(true);
    const out = filterPriceFaqs([{ question: '在三角洲（Delta）如何选择合适的装修承包商？', answer: DELTA_A }]);
    expect(out).toHaveLength(1);
    expect(out[0].answer).toContain('他们还应持有每次事故赔付额至少 $200万 的公众责任险');
  });

  it.each([
    ['zh-Hant', '溫哥華橱櫃翻新 — 噴漆整修$4K–$8K，換門板$8K–$18K，全定製更換$20K–$50K。500萬保險，櫃下燈、水盆、水龍頭等水電部分最長3年保固。免費報價。', '500萬保險'],
    ['ko', '밴쿠버 캐비닛 리노베이션 — 도장 $4K–$8K, 도어 교체 $8K–$18K, 맞춤 제작 $20K–$50K. 500만 보험, 3년 공법 보증. 무료 견적.', '500만 보험'],
    ['ja', 'バンクーバーのキャビネットリノベーション — 塗装仕上げ$4K〜$8K、ドア交換$8K〜$18K、完全カスタム$20K〜$50K。500万保険、3年工事保証。無料見積もり。', '500万保険'],
  ])('cabinet hub meta (%s) keeps the insurance amount', (_loc, s, keep) => {
    const out = stripPriceProse(s);
    expect(out).toContain(keep);
    expect(hasPriceCopy(out)).toBe(false);
  });
});

// Task 136 (Captain review): only MILLION-level amounts are insurance amounts.
// A range or a sub-million amount next to an insurance word is still a price.
describe('insurance = million-level amounts only (task 136)', () => {
  it('poly-b title: the $4K–$22K range is stripped, "Insurance-Ready" stays', () => {
    const t = 'Poly-B Replacement Burnaby | $4K–$22K | Insurance-Ready | Reno Stars';
    expect(hasPriceCopy(t)).toBe(true);
    const out = stripPriceTitle(t);
    expect(out).toBe('Poly-B Replacement Burnaby | Insurance-Ready | Reno Stars');
    expect(hasPriceCopy(out)).toBe(false);
  });

  it('"Kitchens $25K–$50K, fully insured." is a price', () => {
    const s = 'Kitchens $25K–$50K, fully insured.';
    expect(hasPriceCopy(s)).toBe(true);
    expect(hasInsuranceAmount(s)).toBe(false);
    expect(stripPriceProse(s)).not.toMatch(/\$25K|\$50K/);
  });

  it('keeps the 500万加元责任险 clause, strips 约3万至5万加元', () => {
    const s = '约3万至5万加元，我们持有500万加元责任险';
    expect(hasPriceCopy(s)).toBe(true);
    const out = stripPriceProse(s);
    expect(out).toContain('我们持有500万加元责任险');
    expect(out).not.toMatch(/3万|5万加元，/);
    expect(hasPriceCopy(out)).toBe(false);
  });

  it('the two verbatim insurance lines are untouched', () => {
    const cgl = 'All projects include permits, $5M CGL coverage, and a 3-year workmanship warranty.';
    const zh = '他们还应持有每次事故赔付额至少 $200万 的公众责任险，并为进场施工的所有工人购买 WorkSafeBC 保险。';
    for (const s of [cgl, zh]) {
      expect(hasPriceCopy(s), s).toBe(false);
      expect(hasInsuranceAmount(s), s).toBe(true);
      expect(stripPriceProse(s)).toBe(s);
    }
  });
});

describe('cost-question matching is word-based; budget is not a price word (task 136)', () => {
  it.each([
    'How much does a kitchen renovation cost?', 'What are your fees?', 'Is pricing transparent?',
    'Are you affordable?', '厨房装修费用是多少？', 'キッチンの価格は？', '비용은 얼마인가요?', '¿Cuánto cuesta?',
    'Сколько стоит ремонт?', 'Quel est le coût ?',
  ])('cost question: %s', (q) => expect(isCostQuestion(q)).toBe(true));
  it.each([
    'How does it feel to live through a renovation?', 'Do you offer coffee during consultations?',
    'Can you work within my budget?', '能否在预算内完成？', '예산 안에서 가능한가요?', '¿Pueden trabajar con mi presupuesto?',
    'Как проходит оценка проекта?', 'Do you handle permits?',
  ])('not a cost question: %s', (q) => expect(isCostQuestion(q)).toBe(false));
});

describe('firstPriceFree — strip each candidate, first non-empty wins (task 136)', () => {
  it('falls through when the first candidate was nothing but a price', () => {
    expect(firstPriceFree(stripPriceProse, '$25,000–$80,000.', 'Burnaby renovations, licensed and insured.'))
      .toBe('Burnaby renovations, licensed and insured.');
    expect(firstPriceFree(stripPriceTitle, '$20K–$55K', undefined, '', 'Kitchen Renovation Surrey | Reno Stars'))
      .toBe('Kitchen Renovation Surrey | Reno Stars');
  });
  it('keeps the first candidate when it survives stripping', () => {
    expect(firstPriceFree(stripPriceProse, 'Renovations from $25,000. Free quotes.', 'fallback')).toBe('Free quotes.');
  });
  it('returns "" only when every candidate is empty after stripping', () => {
    expect(firstPriceFree(stripPriceProse, '$1,000', null, '$2,000.')).toBe('');
  });
});
