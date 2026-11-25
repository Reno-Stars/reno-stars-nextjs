import { describe, it, expect } from 'vitest';
import {
  stripPriceProse, stripPriceMarkdown, hasPriceCopy, hasInsuranceAmount, firstPriceFree, stripPriceTitle,
} from '@/lib/seo/strip-price-copy';
import { containsPrice } from '@/lib/projects/strip-prices';

/** Task 138 (Captain A/B round 1): Arabic spelled-thousand prices, CJK joins, rebate totals. */

describe('Arabic spelled-thousand / million prices are prices', () => {
  it('drops the ألف دولار range and keeps the free-estimate sentence', () => {
    expect(stripPriceProse('يكلف المطبخ 25 ألف دولار - 72 ألف دولار. نقدم تقديرا مجانيا.'))
      .toBe('نقدم تقديرا مجانيا.');
  });
  it('drops a sentence of spelled ranges (incl. "200 ألف دولار +")', () => {
    const s = 'تكاليف تجديد فانكوفر الحقيقية من أكثر من 100 مشروع. المطبخ 15 ألف دولار - 72 ألف دولار، الحمام 10 ألف - 60 ألف دولار، المنزل بأكمله 50 ألف - 200 ألف دولار +، الطابق السفلي 30 ألف - 120 ألف دولار. نحن نساعدك.';
    expect(stripPriceProse(s)).toBe('تكاليف تجديد فانكوفر الحقيقية من أكثر من 100 مشروع. نحن نساعدك.');
  });
  it.each([
    'تكلفة التجديد في فانكوفر 2026: 4 آلاف دولار - 200 ألف دولار + حسب نوع المشروع',
    'تكلفة تجديد الحمام في فانكوفر 2026: 10 آلاف دولار - 60 ألف دولار بيانات حقيقية',
    'قد يكلف التجديد الكامل 1 مليون دولار.',
  ])('detects %s as a price', (s) => {
    expect(hasPriceCopy(s)).toBe(true);
    expect(containsPrice(s)).toBe(true);
    expect(stripPriceProse(s)).not.toMatch(/ألف|آلاف|مليون/);
  });
  it('"1 مليون دولار" as a renovation price goes; the next sentence stays', () => {
    expect(stripPriceProse('قد يكلف التجديد الكامل 1 مليون دولار. اتصل بنا.')).toBe('اتصل بنا.');
  });
  it('a bare "+" before Latin text is not eaten ("$5,000 + tax")', () => {
    expect(stripPriceProse('Budget $5,000 + tax. Call us.')).toBe('Call us.');
  });
});

describe('Arabic insurance and grant amounts still stay', () => {
  it.each([
    'نحن مؤمنون بمبلغ 5 ملايين دولار تأمين مسؤولية.',
    'تأمين CGL بقيمة $5M.',
  ])('keeps insurance: %s', (s) => {
    expect(hasInsuranceAmount(s)).toBe(true);
    expect(stripPriceProse(s)).toBe(s);
  });
  it.each([
    'تقدم BC Hydro منحة تصل إلى 3,000 دولار لمضخات الحرارة.',
    'تتوفر 3,000 دولار إضافية من BC Hydro كمنحة لذوي الدخل المنخفض.',
    'تقدم منحة Greener Homes ما يصل إلى 5,000 دولار.',
    'يغطي برنامج منحة HAFI ما يصل إلى 20,000 دولار.',
  ])('keeps grant: %s', (s) => {
    expect(stripPriceProse(s)).toBe(s);
  });
  it('mixed sentence: the price clause goes, the grant clause stays', () => {
    expect(stripPriceProse('يكلف تركيب المضخة 15 ألف دولار، وتقدم BC Hydro منحة تصل إلى 3,000 دولار.'))
      .toBe('وتقدم BC Hydro منحة تصل إلى 3,000 دولار.');
  });
});

describe('rebate totals', () => {
  it('ko heat-pump FAQ keeps its total sentence (verbatim messages/ko/faq.json)', () => {
    const a = 'BC Hydro는 열 펌프 설치에 대해 최대 $3,000를 제공하고 연방 Greener Homes Grant는 최대 $5,000를 추가하며 소득 자격을 갖춘 저소득 가구는 추가로 $3,000의 BC Hydro 충전을 쌓을 수 있습니다. 이를 합하면 최대 $11,000까지 가능합니다. 자격은 주택 에너지 감사 결과와 소득에 따라 달라집니다. 서류작업을 도와드리겠습니다.';
    expect(stripPriceProse(a)).toBe(a);
  });
  it('ar total after a grant sentence stays', () => {
    const a = 'تقدم BC Hydro منحة تصل إلى 3,000 دولار. الإجمالي يصل إلى 11,000 دولار.';
    expect(stripPriceProse(a)).toBe(a);
  });
  it('en "grants up to … plus … combined up to" stays whole', () => {
    const a = 'Federal grants up to $5,000 plus $3,000 from BC Hydro, combined up to $11,000.';
    expect(stripPriceProse(a)).toBe(a);
  });
  it('a lone total with no subsidy before it is still a price', () => {
    expect(stripPriceProse('Kitchen cabinets cost a lot. Combined up to $50,000 for the full job. Call us.'))
      .toBe('Kitchen cabinets cost a lot. Call us.');
    expect(stripPriceProse('الإجمالي يصل إلى 11,000 دولار.')).toBe('');
  });
  it('ar rebate list total item under its lead-in stays', () => {
    const md = '**خصومات BC Hydro / المقاطعة المتاحة:**\n\n- خصم على المضخة الحرارية: يصل إلى **3000 دولار** (BC Hydro)\n- **الخصم المشترك المحتمل: ما يصل إلى 11000 دولار** حسب الأهلية';
    expect(stripPriceMarkdown(md)).toBe(md);
  });
});

describe('CJK sentences rejoin without a space after 。', () => {
  it('zh paragraph that loses a priced sentence', () => {
    expect(stripPriceProse('列治文浴室装修$12K–$45K。展厅Gordon Way 21300号，英粤普双语服务。Steveston，Brighouse。$500万保险，免费报价。'))
      .toBe('展厅Gordon Way 21300号，英粤普双语服务。Steveston，Brighouse。$500万保险，免费报价。');
  });
  it('zh-Hant and ja middle sentence removed', () => {
    expect(stripPriceProse('我們提供免費估價。廚房翻新$25K–$55K。投保 500 萬加元。')).toBe('我們提供免費估價。投保 500 萬加元。');
    expect(stripPriceProse('無料見積もり。キャビネット$4K〜$8K。500万保険、3年工事保証。')).toBe('無料見積もり。500万保険、3年工事保証。');
  });
  it('a price clause cut inside a CJK sentence leaves no space after "，"', () => {
    expect(stripPriceProse('约3万至5万加元，我们持有500万加元责任险。')).toBe('我们持有500万加元责任险。');
  });
  it('no "。 " is produced anywhere in a stripped zh paragraph', () => {
    const out = stripPriceProse('厨房翻新$25K–$55K。浴室翻新$15K–$30K。我们持有$500万保险。三年保修。');
    expect(out).toBe('我们持有$500万保险。三年保修。');
    expect(out).not.toMatch(/。 /);
  });
  it('Latin sentences are still joined with a space', () => {
    expect(stripPriceProse('Kitchens from $25,000. Licensed. Insured.')).toBe('Licensed. Insured.');
  });
});

describe('firstPriceFree never returns "" (explicit fallback)', () => {
  it('all-price candidates return the fallback', () => {
    expect(firstPriceFree(stripPriceTitle, ['$20K–$55K', '25 ألف دولار - 72 ألف دولار'], 'Surrey | Reno Stars'))
      .toBe('Surrey | Reno Stars');
  });
});
