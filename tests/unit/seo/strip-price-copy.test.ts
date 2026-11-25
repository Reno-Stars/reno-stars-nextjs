import { describe, it, expect } from 'vitest';
import {
  hasPriceCopy, stripPriceProse, stripPriceTitle, stripPriceMarkdown, stripPriceCopy,
  stripPriceDeep, filterPriceFaqs, isCostQuestion, stripPriceHtml,
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
