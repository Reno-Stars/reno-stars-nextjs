import { describe, it, expect } from 'vitest';
import { stripPriceProse, stripPriceMarkdown, filterPriceFaqs, hasDuration, hasPriceCopy } from '@/lib/seo/strip-price-copy';

/** Task 145: a duration that shares a sentence with a price stays; only the price goes. */

describe('durations survive when their sentence also quotes a price (verbatim nearMe.services.*.desc)', () => {
  it.each([
    ['ar kitchen', 'تحديث صديق للميزانية إلى التخصيص الكامل. نموذجي 4-8 أسابيع، 15 ألف دولار - 72 ألف دولار.',
      'تحديث صديق للميزانية إلى التخصيص الكامل. نموذجي 4-8 أسابيع.'],
    ['ar bathroom', 'ومنضدة زينة، وتركيبات. 3-6 أسابيع نموذجية، 10 ألف دولار - 60 ألف دولار.',
      'ومنضدة زينة، وتركيبات. 3-6 أسابيع نموذجية.'],
    ['ar cabinet', 'أبواب وأجهزة وكوارتز جديدة لنفس المساحة. 1-2 أسابيع، 8 آلاف دولار - 20 ألف دولار.',
      'أبواب وأجهزة وكوارتز جديدة لنفس المساحة. 1-2 أسابيع.'],
    ['pa kitchen', "ਬਜਟ-ਅਨੁਕੂਲ ਰਿਫਰੈਸ਼ ਤੋਂ ਪੂਰਾ ਕਸਟਮ ਤੱਕ। ਆਮ ਤੌਰ 'ਤੇ 4-8 ਹਫ਼ਤੇ, $15K-$72K।",
      "ਬਜਟ-ਅਨੁਕੂਲ ਰਿਫਰੈਸ਼ ਤੋਂ ਪੂਰਾ ਕਸਟਮ ਤੱਕ। ਆਮ ਤੌਰ 'ਤੇ 4-8 ਹਫ਼ਤੇ।"],
    ['pa bathroom', 'ਵੈਨਿਟੀਆਂ, ਫਿਟਿੰਗਜ਼। ਆਮ 3-6 ਹਫ਼ਤੇ, $10K-$60K।', 'ਵੈਨਿਟੀਆਂ, ਫਿਟਿੰਗਜ਼। ਆਮ 3-6 ਹਫ਼ਤੇ।'],
    ['pa cabinet', 'ਅਤੇ ਕੁਆਰਟਜ਼। 1-2 ਹਫ਼ਤੇ, $8K-$20K।', 'ਅਤੇ ਕੁਆਰਟਜ਼। 1-2 ਹਫ਼ਤੇ।'],
    ['zh cabinet', '在相同占地面积的情况下使用新门、硬件和石英。 1-2 周，8000 加元到 20000 加元。',
      '在相同占地面积的情况下使用新门、硬件和石英。1-2 周。'],
    ['zh kitchen', '预算友好的更新为完全定制。通常 4-8 周，$15K-$72K。', '预算友好的更新为完全定制。通常 4-8 周。'],
    ['zh-Hant cabinet', '在原有格局下換上新門板、五金和石英檯面。1-2 週，8,000 加元至 20,000 加元。',
      '在原有格局下換上新門板、五金和石英檯面。1-2 週。'],
    ['zh-Hant bathroom', '浴室櫃、固定裝置。一般 3-6 週，10000-60000 加元。', '浴室櫃、固定裝置。一般 3-6 週。'],
    ['fr kitchen', 'Actualisation économique pour une personnalisation complète. Typique 4 à 8 semaines, 15 000 $ à 72 000 $.',
      'Actualisation économique pour une personnalisation complète. Typique 4 à 8 semaines.'],
    ['fr bathroom', 'Vanités, luminaires. 3 à 6 semaines typiques, 10 000 $ à 60 000 $.', 'Vanités, luminaires. 3 à 6 semaines typiques.'],
    ['fr cabinet', 'Quartz pour le même encombrement. 1 à 2 semaines, 8 000 $ à 20 000 $.', 'Quartz pour le même encombrement. 1 à 2 semaines.'],
    ['en kitchen', 'Budget-friendly refresh to full custom. Typical 4-8 weeks, $15K-$72K.', 'Budget-friendly refresh to full custom. Typical 4-8 weeks.'],
  ])('%s keeps its weeks', (_name, input, out) => {
    expect(stripPriceProse(input)).toBe(out);
    expect(hasPriceCopy(stripPriceProse(input))).toBe(false);
  });
});

describe('synthetic duration + price sentences (verify.json)', () => {
  it('"预计5–6周完成，约$3万。" keeps 5–6周 and is not empty', () => {
    expect(stripPriceProse('预计5–6周完成，约$3万。')).toBe('预计5–6周完成。');
  });
  it('"Takes 5-6 weeks and costs $20K–$55K." keeps the weeks', () => {
    expect(stripPriceProse('Takes 5-6 weeks and costs $20K–$55K.')).toBe('Takes 5-6 weeks.');
  });
  it('a duration-only sentence is untouched', () => {
    expect(stripPriceProse('Typical timeline 5–6 weeks.')).toBe('Typical timeline 5–6 weeks.');
    expect(stripPriceProse('Completed in 5–6 weeks. Kitchens from $25,000.')).toBe('Completed in 5–6 weeks.');
  });
  it('a price-only sentence still goes whole', () => {
    expect(stripPriceProse('Kitchens from $25,000. Licensed. Insured.')).toBe('Licensed. Insured.');
  });
});

describe('Persian / Arabic digits after a comma are a thousands separator, not a clause break', () => {
  it('fa: "۳۳,۰۰۰ تا ۳۵,۰۰۰ دلار" goes whole, "۶ تا ۸ هفته" stays', () => {
    const out = stripPriceProse('دو حمام با دستشویی مهمان: ۳۳,۰۰۰ تا ۳۵,۰۰۰ دلار، ۶ تا ۸ هفته');
    expect(out).toBe('۶ تا ۸ هفته');
    expect(hasPriceCopy(out)).toBe(false);
  });
});

describe('area copy: a duration between two prices (verbatim DB area copy)', () => {
  it('Coquitlam: "(5-6 weeks …)" stays, both prices go', () => {
    const out = stripPriceProse('Real Coquitlam project pricing from our portfolio: kitchen renovations from $25,000–$27,000 (5-6 weeks for a budget-friendly condo kitchen with quartz countertops) to $35,000+ for custom layouts.');
    expect(out).toContain('(5-6 weeks for a budget-friendly condo kitchen with quartz countertops)');
    expect(hasPriceCopy(out)).toBe(false);
  });
  it('Maple Ridge: a comma inside the parenthetical does not split it', () => {
    const out = stripPriceProse('Real Maple Ridge project pricing: bathroom renovations from $18,000–$21,000 (3-4 weeks, including custom glass door and tiled walls) to $35,000+ for full master bath suites with heated floors.');
    expect(out).toContain('(3-4 weeks, including custom glass door and tiled walls)');
    expect(hasPriceCopy(out)).toBe(false);
  });
});

describe('ranges with the currency after each number are ONE price', () => {
  it.each(['15 ألف دولار - 72 ألف دولار', '15 000 $ à 72 000 $', '8000 加元到 20000 加元'])('%s', (s) => {
    expect(stripPriceProse(`A, ${s}.`)).toBe('A.');
  });
});

describe('hasDuration recognises fr / pa / ar / CJK forms', () => {
  it.each(['4 à 8 semaines', '4-8 ਹਫ਼ਤੇ', '4-8 أسابيع', '1-2 週', '5–6周', '3-6 weeks', '2-6 個月'])('%s', (s) => {
    expect(hasDuration(s)).toBe(true);
  });
  it('a year or a price is not a duration', () => {
    expect(hasDuration('2026')).toBe(false);
    expect(hasDuration('$15K-$72K')).toBe(false);
  });
});

describe('task 148: durations in cost FAQs, tables and Arabic area copy stay', () => {
  it('a cost FAQ whose answer states a duration is kept, price-free (West Vancouver basement FAQ)', () => {
    const out = filterPriceFaqs([{ question: 'How much does a basement suite cost in West Vancouver?',
      answer: 'A full unfinished-to-suite conversion typically costs $65,000–$95,000 (8–10 weeks) given the higher labour and finish standards. A finished-basement conversion runs $45,000–$70,000 (6–8 weeks). A building permit and stamped drawings are required.' }]);
    expect(out).toHaveLength(1);
    expect(out[0].answer).toContain('(8–10 weeks)');
    expect(out[0].answer).toContain('(6–8 weeks)');
    expect(out[0].answer).toContain('typically (8–10 weeks)');
    expect(hasPriceCopy(out[0].answer)).toBe(false);
  });
  it('a cost FAQ with no duration (and no insurance) is still dropped', () => {
    expect(filterPriceFaqs([{ question: 'How much does a kitchen cost?', answer: 'Kitchens run $25,000–$55,000 depending on finishes and layout changes.' }])).toEqual([]);
  });
  it('ar Burnaby: "ويستغرق من 2 إلى 3 أسابيع" stays when the price goes', () => {
    expect(stripPriceProse('يكلف ما بين 20000 إلى 25000 دولار ويستغرق من 2 إلى 3 أسابيع.')).toBe('ويستغرق من 2 إلى 3 أسابيع.');
    expect(stripPriceProse('يستغرق الحمام الرئيسي الكامل مع الميزات المخصصة من 3 إلى 5 أسابيع ويكلف 26000 إلى 32000 دولار.'))
      .toBe('يستغرق الحمام الرئيسي الكامل مع الميزات المخصصة من 3 إلى 5 أسابيع.');
  });
  it('zh Richmond: "$15,000–$18,000（2–3 周）" keeps （2–3 周）', () => {
    const out = stripPriceProse('标准翻新（壁挂式浴室柜、无框淋浴、地铁砖）为 $15,000–$18,000（2–3 周）。');
    expect(out).toContain('（2–3 周）');
    expect(hasPriceCopy(out)).toBe(false);
  });
  it('a table row with a duration keeps it and empties only the price cell', () => {
    expect(stripPriceMarkdown('| Scope | Cost | Time |\n|---|---|---|\n| Suite | $65K–$95K | 8–10 weeks |\n| Rec room | $50K–$90K | |'))
      .toBe('| Scope | Cost | Time |\n|---|---|---|\n| Suite | | 8–10 weeks |');
  });
});
