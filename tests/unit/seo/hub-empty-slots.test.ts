/**
 * Task 155 (Captain CAP-15): the service HUB copy (DB long_description, all 14 locales) must not be left with
 * an empty slot where a price was cut. Every case is the BASE string (main, raw DB copy) — see
 * fixtures/task155-hub-cases.json, built from the main build's hub RSC props.
 */
import { describe, expect, it } from 'vitest';
import { hasPriceCopy, hasDuration, stripPriceCopy } from '@/lib/seo/strip-price-copy';
import { PRICE_SOURCE } from '@/lib/projects/strip-prices';
import cases from './fixtures/task155-hub-cases.json';

interface HubCase { id: string; family: 'floor-heading' | 'cabinet' | 'amount-subject'; base: string }
const all = cases as HubCase[];
const byId = (id: string) => {
  const c = all.find((x) => x.id === id);
  if (!c) throw new Error(`no fixture ${id}`);
  return stripPriceCopy(c.base);
};

/** What a cut leaves behind: glue words that now touch, number debris, a sentence that opens on a back-reference. */
const SLOTS: Array<[string, RegExp]> = [
  ['en "is and Not"', /\b(?:is|of|for|from)\s+(?:and|or)\b/i],
  ['es "de y no de"', /\bde\s+y\s+no\s+de\b/i],
  ['fr "coûte et non"', /\bcoûte\s+et\s+non\b/i],
  ['ru "составляет, а не"', /составляет\s*,\s*а не/],
  ['zh "是 而不是"', /(?:是|为|為)\s+而不是/],
  ['ja "ではなく である"', /(?:が|は)\s+ではなく\s+である/],
  ['ko "이 아닌 인"', /\s이\s+아닌\s+인\s|아니라\s+인\s|있는짜리/],
  ['vi "là chứ không phải"', /là\s+chứ không phải/],
  ['ar "قيمته والذي"', /قيمته\s+والذي/],
  ['tl "ay at Hindi"', /\bay\s+at\s+hindi\b/i],
  ['hi "का क्यों है, का नहीं"', /(?:का|की)\s+क्यों\s+है/],
  ['comma-decimal debris', /(?<![\d.,])[,]\d{1,2}\s?(?:mil|K|тысяч|nghìn|000)|(?:за|de|trị giá)\s+\d{1,2},(?=\s)/i],
  ['opens on a back-reference', /(?:^|\n)\s*(?:c['’]est ce que|это то)/i],
];

describe('task 155: hub copy has no price and no empty slot (base strings, all locales)', () => {
  it.each(all.map((c) => [c.id, c] as const))('%s', (_id, c) => {
    const out = stripPriceCopy(c.base);
    expect(hasPriceCopy(out)).toBe(false);
    for (const [name, re] of SLOTS) expect(out, name).not.toMatch(re);
    // no heading of the base section keeps an amount-shaped hole: every kept heading is a base heading without a price
    for (const line of out.split('\n').filter((l) => /^\s*#{1,6}\s/.test(l))) {
      expect(c.base.split('\n')).toContain(line);
      expect(hasPriceCopy(line)).toBe(false);
    }
    // a timeline table row is never touched
    for (const row of c.base.split('\n').filter((l) => /^\s*\|/.test(l) && hasDuration(l) && !hasPriceCopy(l))) {
      expect(out).toContain(row);
    }
  });
});

describe('task 155 item 1: a heading with the amount inside its wording goes, and so does the list it introduced', () => {
  it.each(['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'fr', 'ru', 'ar', 'fa', 'hi', 'pa', 'tl', 'vi'])('basement %s', (L) => {
    const c = all.find((x) => x.id === `basement__${L}`) as HubCase;
    const out = stripPriceCopy(c.base);
    const lines = c.base.split('\n');
    const heading = lines.find((l) => /^###\s+6\./.test(l)) as string;
    expect(out).not.toContain(heading.replace(/^###\s+/, '').slice(0, 6));
    // the list that hung on "Below $50K …, you're either:" is gone with its lead-in
    for (const item of lines.filter((l) => /^- /.test(l))) expect(out).not.toContain(item);
    // the timeline above stays whole, and the price-free closing sentence stays
    expect(out).toContain(lines.find((l) => /^###\s+5\./.test(l)) as string);
    expect(out.split('\n').filter((l) => /^\|/.test(l)).length).toBe(lines.filter((l) => /^\|/.test(l)).length);
    expect(out.split('\n').pop()?.trim().length).toBeGreaterThan(10);
  });
  it('en reads naturally', () => {
    expect(byId('basement__en')).toMatch(/\| Legal 2-bed \+ ensuite \| 16–22 weeks \|\n\nWe do permitted, code-legal basements\.$/);
  });
  it('whole-house: the "Why Our Floor is $150K" section goes whole, the timeline stays', () => {
    const out = byId('whole-house__en');
    expect(out).toMatch(/^### 4\. Timeline/);
    expect(out).toContain('| Luxury / addition | 14–24 months |');
    expect(out).not.toMatch(/Floor|Asbestos|Anyone quoting/);
    // hi: "abatement" was translated as छूट (discount) — the item is not a rebate and must not dangle alone
    expect(byId('whole-house__hi')).not.toMatch(/एस्बेस्टस|छूट/);
  });
});

describe('task 155 item 2: cabinet — a comma-decimal amount is ONE amount, an attributive amount goes with its connector', () => {
  const amount = (s: string) => new RegExp(PRICE_SOURCE).exec(s)?.[0];
  it.each([
    ['es', 'Una renovación de $ 1,5 mil que se ve', '$ 1,5 mil'],
    ['es', 'nuestro piso es de $4 mil y no de $1,5 mil', '$4 mil'],
    ['vi', 'chứ không phải $1,5K', '$1,5K'],
    ['vi', 'trị giá 1,5 nghìn đô la mà bạn thấy', '1,5 nghìn đô la'],
    ['ru', 'за 1,5 тысячи долларов, которое', '1,5 тысячи долларов'],
    ['fr', 'de 1,5 000 $ que vous voyez', '1,5 000 $'],
  ])('%s "%s" → %s', (_L, text, whole) => {
    expect(amount(text)).toBe(whole);
  });
  it('plain thousands and comma lists are untouched', () => {
    expect(amount('a $1,500 deposit')).toBe('$1,500');
    expect(amount('les étapes 1,2 et 3')).toBeUndefined();
  });
  it.each([
    ['en', /^A "cabinet refresh" you see on Kijiji or Facebook Marketplace is roller-applied paint that peels in 12–18 months\./m],
    ['es', /^Una "renovación de gabinete" que se ve en Kijiji o Facebook Marketplace es pintura aplicada con rodillo que se pela en 12 a 18 meses\./m],
    ['fr', /^Un « rafraîchissement d'armoire » que vous voyez sur Kijiji ou sur Facebook Marketplace est une peinture appliquée au rouleau qui s'écaille en 12 à 18 mois\./m],
    ['ru', /^«Обновление шкафа», которое вы видите на Kijiji или Facebook Marketplace, представляет собой краску, наносимую валиком, которая отслаивается через 12–18 месяцев\./m],
    ['vi', /^Một sản phẩm "làm mới tủ" mà bạn thấy trên Kijiji hoặc Facebook Marketplace là loại sơn lăn có khả năng bong tróc sau 12–18 tháng\./m],
    ['ko', /^Kijiji 또는 Facebook Marketplace에서 볼 수 있는 "캐비닛 새로 고침"은 12~18개월 안에 벗겨지는 롤러 도포 페인트입니다\./m],
    ['ar', /^إن "تحديث الخزانة" الذي تراه في Kijiji أو Facebook Marketplace عبارة عن طلاء مطبق على الأسطوانة والذي يتقشر خلال 12-18 شهرًا\./m],
    ['zh', /^您在 Kijiji 或 Facebook Marketplace 上看到的“橱柜翻新”是滚涂油漆，可在 12 至 18 个月内剥落。/m],
    ['zh-Hant', /^Kijiji \/ Facebook Marketplace 上"橱柜翻新"是滚涂油漆——12–18 个月就会脱皮。/m],
    ['ja', /^Kijiji や Facebook マーケットプレイスで見かける「キャビネット リフレッシュ」は、ローラーで塗布されたペイントで、12 ～ 18 か月で剥がれます。/m],
    ['tl', /^Ang "cabinet refresh" na makikita mo sa Kijiji o Facebook Marketplace ay roller-applied paint na bumabalat sa loob ng 12–18 buwan\./m],
    ['fa', /^یک "نوسازی کابینت" که در Kijiji یا Facebook Marketplace مشاهده می کنید، رنگ غلتکی است که در 12 تا 18 ماه پوسته می شود\./m],
  ])('%s: the Kijiji sentence keeps its subject and its 12–18-month duration', (L, re) => {
    const out = byId(`cabinet__${L}`);
    expect(out).toMatch(re);
    expect(out).not.toMatch(/^##\s.*(?:Floor|piso|étage|цена|tầng|층|フロア|底价|底线|طبقه|الطابق|Floor)/m);
  });
});

describe('task 155 item 3: a sentence whose subject was the amount goes whole (kitchen / bathroom hubs)', () => {
  it.each(['kitchen', 'bathroom'])('%s: the "why our floor" paragraph leaves no orphan in any locale', (slug) => {
    for (const c of all.filter((x) => x.id.startsWith(`${slug}__`))) {
      const out = stripPriceCopy(c.base);
      expect(out, c.id).not.toMatch(/c['’]est ce que coûte|это то,|es lo que realmente|is what/i);
      expect(hasPriceCopy(out), c.id).toBe(false);
    }
  });
  it.each([
    ['fr', "Toute personne citant. 25 000 $, c'est ce que coûte réellement un rafraîchissement honnête de qualité moyenne. Lire."],
    ['ru', 'Любой, кто цитирует. 25 тысяч долларов — это то, во что на самом деле будет стоить честное обновление. Подробнее.'],
    ['ru', '20 тысяч долларов — это то, сколько на самом деле стоит ванная комната Vancouver.'],
  ])('%s: "amount, c\'est ce que …" / "amount — это то …" is dropped, not cut', (_L, text) => {
    const out = stripPriceCopy(text);
    expect(out).not.toMatch(/c['’]est ce que|это то/);
    expect(hasPriceCopy(out)).toBe(false);
  });
  it('a leading amount before a label-like remainder is still cut (unchanged): "$20K–$55K, 3–5 weeks."', () => {
    expect(stripPriceCopy('**Mid-range:** $20K–$55K, 3–5 weeks.')).toBe('**Mid-range:** 3–5 weeks.');
  });
});
