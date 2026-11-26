/**
 * Site-wide price-copy removal (DI-15 / 118B2 — Ryan 11-24 19:13 via Captain:
 * 「费用指南和博客先留价格，其他页去掉」).
 *
 * Applied at RENDER time to the REMOVE surfaces only: home, area pages,
 * near-me, NON-test-A service×city pages, service hubs and /services/, and
 * the cost section of /financing/. Blogs, the 7 cost guides, /guides/, /blog/
 * and /careers/ keep their prices; the 14 TEST A pages always take the
 * untouched path (lib/seo/test-a.ts). The database is never written — DB copy
 * (services.description_*, long_description_*, service_areas.content_*,
 * faqs.answer_*, projects.budget_range) is filtered on its way to the page.
 *
 * Detection is the SAME as the project-area filter (PRICE_SOURCE from
 * lib/projects/strip-prices.ts), with a wider insurance guard: the company's
 * "$5M CGL" is written in every language ("$5M asegurado", "$5M ਬੀਮਿਤ",
 * "$5M مؤمن", "5 M$ responsabilité civile", "$5 मिलियन … कवरेज") and must
 * survive. Never touched: "$$" (no digits), "5–6 weeks" and other durations,
 * PO numbers, percentages — none carries a currency.
 *
 * Removal never leaves fragments: a price clause is cut together with its
 * connector ("$20K–$55K, 3–5 weeks." → "3–5 weeks."; "(… $9–$17/sqft …)" →
 * gone); any sentence that still names an amount is dropped whole; a markdown
 * list item / table row / label line that held only a price is dropped; an FAQ
 * whose question asks about cost and whose answer quoted amounts is dropped
 * whole rather than left hollow (filterPriceFaqs).
 */
import { PRICE_SOURCE } from '@/lib/projects/strip-prices';
import { joinAroundCut, salvageRangeNotes, rewriteNotedAmounts } from '@/lib/seo/price-cut-joins';

/** Insurance wording in all 14 site languages. An amount near one is NOT a price. */
const INSURANCE = new RegExp(
  [
    'CGL', 'liabilit', 'insur', 'coverage',            // en
    '保险', '保險', '保険', '보험', '責任險', '责任险', '保额', '保額', '投保', '보장',   // zh / zh-Hant / ja / ko
    'seguro', 'asegura', 'cobertura',                   // es
    'assur', 'responsabilit', 'couverture',             // fr (assuré / assurés / assurance)
    'bảo hiểm', 'страх', 'تأمين', 'مؤمن', 'بیمه',        // vi / ru / ar / fa
    'बीमा', 'बीमे', 'सीजीएल', 'कवरेज', 'ਬੀਮਾ', 'ਬੀਮੇ', 'ਬੀਮਿ', 'ਕਵਰੇਜ',   // ਬੀਮੇ / बीमे: oblique form   // hi / pa
    'nakaseguro', 'siguro', 'assicura',                  // tl / it-style
    // plain "liability" — near a MILLION-sized amount only (see MILLION_WINDOW):
    // trust stats like "500 万加元 责任+工资赔偿金" ("$5M liability + WCB").
    '责任', '責任', '책임', 'ответствен', 'مسؤولية', 'مسئولیت', 'दायित्व', 'ਦੇਣਦਾਰੀ', 'trách nhiệm', 'pananagutan',
  ].join('|'),
  'i',
);
/** "Million" written after the amount, in the site languages ("$5 million", "$5 मिलियन"). */
const MILLION_WORD = /^\s?(?:million|millón|millones|millions|milhões|мил|млн|ملي|ملاي|میلیون|मिलियन|ਮਿਲੀਅਨ|triệu|milyon|百万|百萬)/i;
/** A million-level amount with an insurance word this close is the liability cover. */
const MILLION_WINDOW = 90;
/** One number inside an amount: "25,000" / "2.5" / "500". Two of them = a range. */
const NUMBER = /[0-9٠-٩۰-۹]{1,3}(?:[,.\u00A0\u202F ][0-9٠-٩۰-۹]{3})+|[0-9٠-٩۰-۹]+(?:\.[0-9٠-٩۰-۹]+)?/g;

/**
 * Liability cover is quoted in MILLIONS: "$5M", "5 M$", "$5 million", "$5 मिलियन",
 * "500万" / "500萬" / "500만" (≥ 100 万 = ≥ 1 million). Sub-million amounts
 * ("$25K–$50K", "3万至5万加元") are renovation prices even next to "insured".
 */
function isMillionLevel(text: string, end: number, match: string): boolean {
  if (/[0-9٠-٩۰-۹]\s?[Mm](?![A-Za-z])/.test(match)) return true;
  // Arabic million spelled inside the amount: "5 ملايين دولار" (task 138)
  // … and, since task 153 lets a magnitude word sit inside the amount, "بیمه 5 میلیون دلاری" / "5 млн долларов"
  if (/[0-9٠-٩۰-۹]\s?(?:مليون|ملايين|میلیون|млн|million)/.test(match)) return true;
  if (MILLION_WORD.test(text.slice(end, end + 14))) return true;
  const wan = /([0-9][0-9,.]*)\s?(?:万|萬|만)/.exec(match);
  if (wan) return parseFloat(wan[1].replace(/,/g, '')) >= 100;
  // "$500万CGL责任险": the amount match can stop before the 万 that follows it
  const nums = match.match(NUMBER) ?? [];
  return nums.length === 1 && /^\s?(?:万|萬|만)/.test(text.slice(end, end + 3)) &&
    parseFloat(nums[0].replace(/,/g, '')) >= 100;
}

interface Hit { start: number; end: number }

/** A single million-level amount with an insurance word nearby. A range is always a price. */
function isInsuranceAmount(text: string, start: number, end: number, match: string): boolean {
  if ((match.match(NUMBER) ?? []).length > 1) return false;
  if (!isMillionLevel(text, end, match)) return false;
  return INSURANCE.test(text.slice(Math.max(0, start - MILLION_WINDOW), end + MILLION_WINDOW));
}

/** Price amounts in `text`, insurance amounts excluded. */
/**
 * Government rebates / grants / subsidies (heat-pump rebates, Greener Homes,
 * HAFI …) are NOT renovation prices — Ryan 2026-11-25: their amounts STAY.
 * Latin-script words are matched whole ("grant" ≠ "granite"); "BC Hydro" alone
 * is not a marker (it also sits next to real prices, e.g. panel upgrades).
 */
const SUBSIDY = new RegExp(
  [
    String.raw`(?<![\p{L}])(?:rebates?|grants?|subsid\p{L}*|incentives?|top-ups?|HAFI|CleanBC|Greener Homes|Home Adaptation for Independence|subvenci[oó]n\p{L}*|subventions?|грант\p{L}*|субсиди\p{L}*|subsidiya|trợ cấp)(?![\p{L}])`,
    // 補助 also means "auxiliary" in Japanese: 補助熱 / 補助暖房 (backup heat) is not a subsidy.
    '补助', '補助(?![熱暖])', '补贴', '補貼', '拨款', '撥款', '退税', '退稅', '助成金', '補助金', 'リベート', '보조금', '지원금', '환급', '리베이트',
    // Arabic-script words are matched whole: منح sits inside تمنحك ("gives you"),
    // المنحدرات ("slopes") and منحصربه‌فرد ("unique").
    String.raw`(?<![\p{L}])(?:و?(?:ال|بال|لل|ب|ل|كال|ك))?منح(?:ة|ات)?(?![\p{L}])`,
    'کمک هزینه', 'یارانه', 'अनुदान', 'ग्रांट', 'सब्सिडी', 'ਗ੍ਰਾਂਟ', 'ਸਬਸਿਡੀ',
    // the word the translated rebate copy uses in each locale (whole words: ਛੋਟਾ = "small")
    String.raw`(?<![\p{L}\p{M}])(?:reembolsos?|remises?|rabais|rabats?|скидк\p{L}*|giảm giá|(?:و?(?:ال|بال|لل|ب|ل|كال|ك))?(?:خصم|خصومات)|تخفیف|छूट|ਛੋਟ(?:ਾਂ)?)(?![\p{L}\p{M}])`,
    '回扣',
  ].join('|'),
  'iu',
);
/** Sentence ends: ". " / "! " / "? " and the full-width 。！？ (a "3,000.00" decimal point is not one). */
const SENTENCE_END = /[.!?।۔؟](?=\s|$)|[。！？\n]/g;

/** [from, to) of the sentence of `text` that holds [start, end). */
function sentenceBounds(text: string, start: number, end: number): [number, number] {
  let from = 0;
  let to = text.length;
  SENTENCE_END.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = SENTENCE_END.exec(text))) {
    if (m.index < start) from = m.index + 1;
    else if (m.index >= end) { to = m.index + 1; break; }
  }
  return [from, to];
}

/** Clause separators inside a sentence (a comma followed by a digit is a thousands separator: "$3,000"). */
const CLAUSE_SEP = /[，;；،]|が、|,(?![0-9٠-٩۰-۹])/g;
/**
 * Phrasing that marks a rebate amount inside a sentence that names a subsidy
 * ("BC Hydro offers up to $3,000", "额外 $3,000", "退税可抵 $7–11K", "combined up to $11,000").
 */
const SUBSIDY_PHRASE = new RegExp(
  String.raw`(?<![\p{L}])(?:up to|additional|extra|offsets?|combined|stack|hasta|adicional(?:es)?|jusqu|suppl[ée]mentaires?|до|дополнительн\p{L}*|tối đa|tới|thêm|hanggang|karagdagang|plus|تا|إضافية?|اضافی|تصل إلى|يصل إلى)(?![\p{L}])` +
  '|最高|高达|高達|额外|額外|可抵|抵扣|合计|合計|最大|まで|さらに|追加|최대|최고|추가|تا سقف|ما يصل إلى|तक|अतिरिक्त|ਤੱਕ|ਵਾਧੂ',
  'iu',
);

/** [from, to) of the clause of `text` (inside [from, to)) that holds [start, end). */
function clauseBounds(text: string, from: number, to: number, start: number, end: number): [number, number] {
  let cFrom = from;
  let cTo = to;
  CLAUSE_SEP.lastIndex = from;
  let m: RegExpExecArray | null;
  while ((m = CLAUSE_SEP.exec(text)) && m.index < to) {
    if (m.index < start) cFrom = m.index + m[0].length;
    else if (m.index >= end) { cTo = m.index; break; }
  }
  return [cFrom, cTo];
}

/** Characters after an amount that may still mark it ("$5,000 तक", "3000 دلار اضافی"). */
const SUBSIDY_TAIL = 12;

/** The words that belong to ONE amount: since the previous amount in its clause, plus a short tail. */
function amountContext(text: string, cFrom: number, cTo: number, start: number, end: number): string {
  const re = new RegExp(PRICE_SOURCE, 'g');
  let leadFrom = cFrom;
  let tailTo = Math.min(cTo, end + SUBSIDY_TAIL);
  re.lastIndex = cFrom;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) && m.index < cTo) {
    if (m[0].length === 0) { re.lastIndex++; continue; }
    if (m.index + m[0].length <= start) leadFrom = m.index + m[0].length;
    else if (m.index >= end) { tailTo = Math.min(tailTo, m.index); break; }
  }
  return text.slice(leadFrom, start) + ' ' + text.slice(end, tailTo);
}

/** True when `words` name a subsidy or use rebate phrasing ("up to", "额外", "तक" …). */
function marksSubsidy(words: string): boolean {
  return SUBSIDY.test(words) || SUBSIDY_PHRASE.test(words);
}

/**
 * A government rebate / grant / subsidy amount (Ryan 2026-11-25: these STAY).
 * Its sentence must name the subsidy, and the words of the amount itself — since
 * the previous amount in its clause, plus a short tail — must name it or use
 * rebate phrasing. So in "中央热泵系统安装 $14–22K，退税可抵 $7–11K" and in the
 * comma-less "열 펌프 중앙 시스템은 $14–22K를 설치하고 … 리베이트는 $7–11K를 상쇄" the
 * installation price is still a price and only the rebate amount stays.
 */
function isSubsidyAmount(text: string, start: number, end: number): boolean {
  const [from, to] = sentenceBounds(text, start, end);
  const [cFrom, cTo] = clauseBounds(text, from, to, start, end);
  const words = amountContext(text, cFrom, cTo, start, end);
  if (SUBSIDY.test(text.slice(from, to))) return marksSubsidy(words);
  return isSubsidyTotal(text, from, words);
}

/** "Combined / in total / 합하면 / الإجمالي …" — the wording of a rebate TOTAL. */
const SUBSIDY_TOTAL = new RegExp(
  String.raw`(?<![\p{L}])(?:combined|in total|altogether|en total|au total|в сумме|итого|tổng|kabuuan|الإجمالي|إجمالي|مجتمعة|مجموع|مجموعاً)(?![\p{L}])` +
  '|合计|合計|总计|總計|合わせて|합하면|합산|합계|कुल|ਕੁੱਲ',
  'iu',
);

/**
 * A rebate TOTAL in a sentence of its own ("이를 합하면 최대 $11,000까지 가능합니다.")
 * stays when its own words say "total" with rebate phrasing AND the sentence just
 * before it names a subsidy (task 138). A lone "total up to $50,000" is still a price.
 */
function isSubsidyTotal(text: string, from: number, words: string): boolean {
  if (!SUBSIDY_TOTAL.test(words) || !SUBSIDY_PHRASE.test(words) || from === 0) return false;
  const [pFrom, pTo] = sentenceBounds(text, Math.max(0, from - 2), Math.max(0, from - 1));
  return SUBSIDY.test(text.slice(pFrom, pTo));
}

/** True when `text` names a government rebate / grant / subsidy (the amounts near it stay). */
export function isSubsidyText(text: string | undefined | null): boolean {
  return !!text && SUBSIDY.test(text);
}

function priceHits(text: string): Hit[] {
  const re = new RegExp(PRICE_SOURCE, 'g');
  const out: Hit[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const end = m.index + m[0].length;
    if (!isInsuranceAmount(text, m.index, end, m[0]) && !isSubsidyAmount(text, m.index, end)) {
      out.push({ start: m.index, end });
    }
    if (m[0].length === 0) re.lastIndex++;
  }
  return out;
}

/** True when `text` quotes an insurance amount ("$5M CGL", "至少 $200万 的公众责任险"). */
export function hasInsuranceAmount(text: string | undefined | null): boolean {
  if (!text) return false;
  const re = new RegExp(PRICE_SOURCE, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (isInsuranceAmount(text, m.index, m.index + m[0].length, m[0])) return true;
    if (m[0].length === 0) re.lastIndex++;
  }
  return false;
}

/** True when `text` names a price (insurance amounts excluded). */
export function hasPriceCopy(text: string | undefined | null): boolean {
  return !!text && priceHits(text).length > 0;
}

// ---------------------------------------------------------------------------
// Prose
// ---------------------------------------------------------------------------
const P = PRICE_SOURCE;
/** Per-unit suffixes that belong to the amount ("$5–$10/sqft", "$1,400/month"). */
const UNIT = String.raw`(?:\s?(?:/|per\s)\s?(?:sq\.?\s?ft|sqft|square foot|sf|ft|month|mo|year|hr|hour|night|linear foot|each|unit)\b\.?)?`;
const AMT = `(?:${P})${UNIT}`;

/**
 * Clause cuts that read cleanly once removed, applied before the sentence
 * fallback. Each consumes its connector so no "starting from ," / "– ." is left.
 */
const CLAUSE_CUTS: Array<[RegExp, string]> = [
  // Parenthetical holding an amount: "(about $5,000)", "($9–$17/sqft installed)".
  [new RegExp(String.raw`\s*[(（][^()（）]{0,80}?${AMT}[^()（）]{0,80}?[)）]`, 'g'), ''],
  // Leading amount before a comma / middle dot / semicolon / dash: "$20K–$55K, 3–5 weeks."
  [new RegExp(String.raw`(^|[.!?。！？:：]\s*|\s[—–-]\s|·\s*)${AMT}\s*(?:[,，;；·](?![0-9٠-٩۰-۹])|\s[—–-])\s*`, 'g'), '$1'],
  // Trailing / middle amount after a separator: "…, $20K–$55K", " — $1.5K+", " · $4K".
  [new RegExp(String.raw`\s*(?:[,，;；،·]|\s[—–-])\s*(?:from|starting (?:at|from)|about|around|roughly|typically|under|over|up to)?\s*${AMT}(?=\s*(?:[,，;；،.。!?！？।)](?![0-9٠-٩۰-۹])|$))`, 'gim'), ''],
];


const PAIR_LIST = () => new RegExp(
  String.raw`(^|[.!?。！？\n]\s*)[^.!?。！？\n]{0,80}?\s[—–-]\s${AMT}(?:\s*[,，;；،]\s*[^.!?。！？\n,，;；،]{1,40}?\s[—–-]\s${AMT})+\s*[.。]?`,
  'g',
);

function tidyProse(s: string): string {
  return s
    .replace(/[ \t]{2,}/g, ' ')
    // CJK sentences are not space-separated: a string we edit leaves no "。 " behind,
    // including the copy's own space after a cut ("項目（3.5 萬…）。 Moody" → "項目。Moody").
    .replace(/([。！？])[ \t]+(?=\S)/g, '$1')
    // French typography keeps its (non-breaking) space before " : " ("pour la même portée : plus de maison…", task 153)
    .replace(/\s+([,.;:!?，。；：！？)）])/g, (m: string, c: string, at: number, all: string) =>
      (/^[ \u00A0\u202F]:$/.test(m) && /\p{L}/u.test(all[at - 1] ?? '') && / /.test(all[at + 2] ?? '') ? m : c))
    .replace(/([,，;；:：])\s*([.。!?！？])/g, '$2')
    .replace(/([.。])\s*\1+/g, '$1')
    .replace(/[(（]\s*[)）]/g, '')
    // "Richmond BC: $12K–$45K, plus basement suites" → "Richmond BC, plus basement suites" (task 152)
    // (never French " : ", which is the language's own spacing: "pour la même portée : plus de maison…", task 153)
    .replace(/(?<=\S):\s+(plus|and)\s/g, ', $1 ')
    .replace(/^[\s,，;；:：·—–-]+/, '')
    .replace(/[\s,，;；:：·—–-]+$/, (m) => (/[.。]/.test(m) ? '.' : ''))
    .trim();
}

/** Remove price copy from one plain-text run (no markdown structure). */
/** True when [start, end) of `text` holds a real (non-insurance) price. */
function spanHasPrice(text: string, start: number, end: number): boolean {
  return priceHits(text).some((h) => h.start >= start && h.end <= end);
}

export function stripPriceProse(text: string): string {
  if (!text || !hasPriceCopy(text)) return text;
  // "Реальные затраты на проект: ванные комнаты — 20–32 тыс. долларов, кухни — 30–40 тыс. долларов." — a sentence
  // that is only "noun — amount" pairs goes whole; the dash cuts below would leave "ванные комнаты — кухни." (task 153)
  let out = text.replace(PAIR_LIST(), (m: string, lead: string) => (hasDuration(m) || !hasPriceCopy(m) ? m : lead));
  // Each cut fires only when the clause holds a REAL price — never on an
  // insurance clause such as "($5M CGL minimum)" (ALWAYS KEEP).
  for (const [re, dst] of CLAUSE_CUTS) {
    const src = out;
    out = src.replace(re, (...args: unknown[]) => {
      const match = args[0] as string;
      const offset = args[args.length - 2] as number;
      if (!spanHasPrice(src, offset, offset + match.length)) return match;
      return match.replace(re, dst);
    });
  }
  if (hasPriceCopy(out)) out = dropPriceSentences(out);
  // "这些价格包括劳动力…" / "These prices include…" only made sense next to the amounts (task 152)
  if (!hasPriceCopy(out)) out = dropPriceBackrefs(out);
  return tidyProse(out);
}

/**
 * A sentence that only refers back to amounts that are gone: "这些价格包括劳动力、材料和许可证。",
 * "These prices include labour…", "وتشمل هذه الأسعار…", "این قیمت‌ها شامل…" (task 152). Only called
 * on text that HAD prices and has none left.
 */
const PRICE_BACKREF = new RegExp(
  [
    String.raw`(?<![\p{L}])(?:these|those|the above|all) (?:prices|price ranges|costs|figures|estimates)(?![\p{L}])`,
    String.raw`(?<![\p{L}])(?:estos|esos) (?:precios|costos|rangos)(?![\p{L}])`, String.raw`(?<![\p{L}])ces (?:prix|tarifs|coûts|montants)(?![\p{L}])`,
    String.raw`(?<![\p{L}])эт(?:и|о)[\s ]+(?:цен\p{L}*|стоимост\p{L}*)`, String.raw`(?:các|những) mức giá (?:này|trên)`, String.raw`(?<![\p{L}])(?:ang )?mga presyong ito(?![\p{L}])`,
    '这些价格', '這些價格', '以上价格', '以上價格', '上述价格', '上述價格', 'これらの価格', 'この価格', '이 가격', '이러한 가격', '위 가격',
    'هذه الأسعار', 'هذه التكاليف', 'این قیمت‌ها', 'این قیمتها', 'این هزینه‌ها',
    'इन कीमतों', 'ये कीमतें', 'इन लागतों', 'ਇਨ੍ਹਾਂ ਕੀਮਤਾਂ', 'ਇਹ ਕੀਮਤਾਂ', 'ਇਨ੍ਹਾਂ ਲਾਗਤਾਂ',
  ].join('|'),
  'iu',
);
/** A clause comparing to a fee that was cut: "兰里乡…审批需要 3–5 周；兰里市收费相近，审批约 4–6 周" (task 153). */
const CLAUSE_BACKREF = /(收费|收費|费用|費用)(相近|相若|类似|類似|差不多)[，,]\s*/g;
function dropPriceBackrefs(text: string): string {
  text = text.replace(CLAUSE_BACKREF, '');
  if (!PRICE_BACKREF.test(text)) return text;
  return joinKept(pieces(text, SENTENCE_GAP).map(([a, b]) => text.slice(a, b)).filter((x) => !PRICE_BACKREF.test(x)));
}

/**
 * Durations ("4-8 weeks", "4 à 8 semaines", "4-8 أسابيع", "4-8 ਹਫ਼ਤੇ", "5–6周", "1-2 週") are not
 * prices: a sentence that states one is never dropped whole — only its price goes (task 145).
 */
const DURATION = new RegExp(
  String.raw`[0-9٠-٩۰-۹]+(?:\s?(?:[-–—~～]|to|à|a|bis|до|đến|से|ਤੋਂ|إلى|تا|〜)\s?[0-9٠-٩۰-۹]+)?\s?` +
  String.raw`(?:weeks?|wks?|days?|months?|semaines?|semanas?|jours?|mois|meses|días|周|週|天|个月|個月|週間|ヶ月|か月|주(?![방택])|개월|недел\p{L}*|месяц\p{L}*|tuần|tháng|ngày|linggo|buwan|araw|सप्ताह|हफ़्ते|हफ्ते|महीने|ਹਫ਼ਤੇ|ਹਫ਼ਤਿਆਂ|ਹਫ਼ਤਾ|ਮਹੀਨੇ|أسابيع|أسبوع|أسبوعين|أشهر|شهر|أيام|هفته|ماه)`,
  'iu',
);
export function hasDuration(text: string): boolean {
  return DURATION.test(text);
}

/** Remove the [start, end) price spans from a clause that keeps its duration. */
function cutPriceSpans(clause: string, spans: ReadonlyArray<[number, number]>): string {
  let out = clause;
  for (const [s, e] of [...spans].sort((x, y) => y[0] - x[0])) {
    out = joinAroundCut(out.slice(0, s), out.slice(e));
  }
  return out;
}

/** Join kept pieces: CJK punctuation is not followed by a space ("…独立屋。PEX…"). */
function joinKept(parts: readonly string[]): string {
  return parts.reduce((acc, s) => (acc ? acc + (/[。！？，；：]$/.test(acc) ? '' : ' ') + s : s), '');
}

/** [start, end) pieces of `text` split by `re` (a global regex matching the separators). */
function pieces(text: string, re: RegExp, skip?: (at: number) => boolean): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const at = m.index ?? 0;
    if (skip?.(at)) continue;
    out.push([last, at]);
    last = at + m[0].length;
  }
  out.push([last, text.length]);
  return out.filter(([a, b]) => text.slice(a, b).trim());
}

/** Abbreviations whose period is not a sentence end ("(см. наш [Справочник…])" — task 153). */
const SENTENCE_GAP = /(?<=[.!?。！？।۔؟])(?<!(?:^|[\s(（])(?:см|ср|тыс|млн|т\.е|т\.к|e\.g|i\.e|approx|vs|a\.m|p\.m)\.)\s+|(?<=[。！？])(?=\S)/g;
/** Japanese 「…ですが、…」 joins a priced clause to a rebate one: a clause break too (task 153c). */
const CLAUSE_GAP = /(?<=[，;；،]|が、|,(?![0-9٠-٩۰-۹]))\s*/g;

/** True when `at` sits inside ( … ) / （ … ） of `text`: a comma there does not end a clause. */
function inParens(text: string, at: number): boolean {
  let depth = 0;
  for (let i = 0; i < at; i++) {
    const c = text[i];
    if (c === '(' || c === '（') depth++;
    else if ((c === ')' || c === '）') && depth > 0) depth--;
  }
  return depth > 0;
}

/**
 * Drop every sentence that still names a price — unless it also quotes the
 * insurance amount or names a government subsidy (both ALWAYS KEEP): then only
 * its price clauses go. Prices are found on the WHOLE text, so a rebate total
 * that leans on the previous sentence ("…BC Hydro 충전… 이를 합하면 최대 $11,000")
 * is judged in context, not as a lone sentence.
 */
/** "**[Minimalist Bathroom](/en/projects/…/):**" — a lead label with nothing after its colon. */
const isLabelOnly = (s: string) => /^[\s*_`>#-]*\S[^.!?。！？]{0,200}[:：][\s*_`]*$/.test(s);

/**
 * "…suite run $1,500–$3,500, with a 3–5 week processing window" / "約 $20,000–$25,000，工期 2–3 周":
 * the clause after the comma is the timed predicate OF the priced one — split there, the priced half
 * (with its subject) is dropped and "with a 3–5 week …" / "工期 2–3 周" is left alone (task 152).
 */
const TIMED_PREDICATE = /^\s*(?:with\s|工期|需要|需時|需时|耗时|耗時|施工期)/i;
function continuesAmount(sentence: string, at: number, hits: ReadonlyArray<{ start: number; end: number }>): boolean {
  // `at` is just after the separator (CLAUSE_GAP matches behind it)
  return TIMED_PREDICATE.test(sentence.slice(at)) && hits.some((h) => h.end <= at && /^[\s,，;；،]*$/.test(sentence.slice(h.end, at)));
}

function dropPriceSentences(text: string): string {
  const hits = priceHits(text);
  const inside = (a: number, b: number) => hits.some((h) => h.start >= a && h.end <= b);
  // never split inside an amount: "25–150 тыс. долларов США" has a sentence-looking gap after "тыс." (task 153)
  const kept = pieces(text, SENTENCE_GAP, (at) => hits.some((h) => h.start < at && at < h.end)).map(([a, b]) => {
    const sentence = text.slice(a, b);
    if (!inside(a, b)) return sentence;
    const timed = hasDuration(sentence);
    if (!timed && !hasInsuranceAmount(sentence) && !isSubsidyText(sentence)) return '';
    // "from $18K (3-4 weeks, …) to $35K+ for …": the duration is only a note on an amount (task 151)
    const rel = hits.filter((h) => h.start >= a && h.end <= b).map((h) => ({ start: h.start - a, end: h.end - a }));
    const salvaged = timed && !hasInsuranceAmount(sentence) && !isSubsidyText(sentence)
      ? salvageRangeNotes(sentence, rel, hasDuration) : null;
    if (salvaged) return salvaged;
    // "costs $X for a standard conversion (8–10 weeks), or $Y to convert … (6–8 weeks)" (task 152)
    const rewritten = timed && !hasInsuranceAmount(sentence) && !isSubsidyText(sentence)
      ? rewriteNotedAmounts(sentence, rel, hasDuration) : null;
    if (rewritten) return rewritten;
    const end = /[.!?。！？।۔؟]\s*$/.exec(sentence)?.[0].trim() ?? '';
    const clauses = pieces(sentence, CLAUSE_GAP, (at) => inParens(sentence, at) || continuesAmount(sentence, at, rel))
      .map(([ca, cb]) => {
        const clause = sentence.slice(ca, cb);
        if (!inside(a + ca, a + cb)) return clause;
        const spans = hits.filter((h) => h.start >= a + ca && h.end <= a + cb)
          .map((h) => [h.start - a - ca, h.end - a - ca] as [number, number]);
        // A clause that also states a duration keeps it: only the price span goes (task 145).
        // One without a duration goes — except the label it carried ("**Project:** $15K, 2-3 weeks", task 151).
        if (!hasDuration(clause)) {
          const label = cutPriceSpans(clause, spans).replace(/[\s,，;；،、]+$/, '');
          return isLabelOnly(label) ? label : '';
        }
        return cutPriceSpans(clause, spans);
      })
      .filter((c) => c.trim() && /[^\s,，;；،:：·—–-]/.test(c));
    const body = joinKept(clauses)
      // "装修费用方面：未完工的毛坯空间需要 8–10 周" — the amounts are gone, what is left is the time (task 152)
      .replace(/(费用|費用|成本)方面([:：])/g, '工期方面$2')
      .replace(/[\s,，;；،:：·—–-]+$/, '')
      .replace(/^[\s,，;；،:：·—–-]+/, '')
      .replace(/[.!?。！？।۔؟]$/, '');
    return body ? body + end : '';
  });
  return joinKept(kept.filter(Boolean));
}


// ---------------------------------------------------------------------------
// Titles / headings / labels
// ---------------------------------------------------------------------------
/**
 * "Kitchen Renovation Surrey | $20K–$55K | Reno Stars" → "Kitchen Renovation Surrey | Reno Stars";
 * "Budget Kitchen Renovation: $16,000–$27,000" → "Budget Kitchen Renovation".
 */
const TITLE_AMOUNT = () => new RegExp(String.raw`\s*(?:[:：—–-]|\bfrom\b|\bunder\b|\bstarting (?:at|from)\b|\bот\b|\bdesde\b|\bà partir de\b|از)?\s*${AMT}\s*(?:真實報價|真实报价|起)?`, 'giu');
/** The amounts (and a "from / от / از" lead-in) cut out of one title cell; '' when nothing with words is left. */
function cutTitleAmounts(cell: string): string {
  const rest = cell.replace(TITLE_AMOUNT(), ' ').replace(/\s{2,}/g, ' ').replace(/^[\s:：—–-]+|[\s:：—–-]+$/g, '').trim();
  return /^(?:from|under|starting|real data|real|от|از|desde)?$/i.test(rest) ? '' : rest;
}

/**
 * A title cell that only advertises prices, with no amount left to back it (task 153b — "| Precios reales |",
 * "| Реальные цены |", "| قیمت واقعی |", "| 실제 가격 |", "| Real Costs |" on area pages whose prices are gone).
 */
const PRICE_TALK_CELL = new RegExp(
  '^(?:' + [
    String.raw`real(?: project)? (?:prices?|pricing|costs?)`, String.raw`actual (?:prices?|costs?)`,
    String.raw`precios? reales`, String.raw`costos? reales`, String.raw`prix réels`, String.raw`coûts réels`,
    String.raw`реальн\p{L}* (?:цен\p{L}*|стоимост\p{L}*)`, String.raw`giá (?:thật|thực tế)`,
    String.raw`(?:totoong|tunay na) (?:presyo|pagpepresyo)`,
    'قیمت واقعی', 'قیمت‌های واقعی', 'التسعير الحقيقي', 'الأسعار الحقيقية', 'الأسعار الفعلية',
    'ਅਸਲ ਕੀਮਤ(?:ਾਂ)?', 'वास्तविक (?:कीमत(?:ें)?|मूल्य)', '실제 가격', '実質価格', '実際の価格',
    '实际价格', '實際價格', '真实价格', '真實價格', '真实报价', '真實報價',
  ].join('|') + ')$',
  'iu',
);
const dropPriceTalkCells = (t: string) =>
  (t.includes('|') ? t.split('|').map((c) => c.trim()).filter((c) => c && !PRICE_TALK_CELL.test(c)).join(' | ') : t);

export function stripPriceTitle(title: string): string {
  if (!title) return title;
  if (!hasPriceCopy(title)) {
    if (!title.includes('|') || !title.split('|').some((c) => PRICE_TALK_CELL.test(c.trim()))) return title;
    return dropPriceTalkCells(title);
  }
  let out = dropPriceTalkCells(title);
  if (out.includes('|')) {
    // A cell that is only an amount goes; a cell with words keeps them: "浴室リフォーム | Richmond $12,000～$45,000 | Reno Stars"
    // → "浴室リフォーム | Richmond | Reno Stars" — the city must stay in the title (task 153).
    out = out.split('|').map((s) => s.trim()).map((s) => (hasPriceCopy(s) ? cutTitleAmounts(s) : s))
      .filter((s) => s && /\p{L}{2}/u.test(s) && !hasPriceCopy(s)).join(' | ');
  }
  if (hasPriceCopy(out)) {
    out = out.replace(
      new RegExp(String.raw`\s*(?:[:：|—–-]|\bfrom\b|\bunder\b|\bstarting (?:at|from)\b)?\s*${AMT}\s*`, 'gi'),
      ' ',
    );
  }
  return tidyProse(out.replace(/\s+([:：|—–-])\s*$/, '').replace(/\s{2,}/g, ' '));
}

// ---------------------------------------------------------------------------
// Markdown (DB long-form copy) and simple HTML
// ---------------------------------------------------------------------------
const LIST_ITEM = /^(\s*(?:[-*+]|\d+[.)])\s+)(.*)$/;
const HEADING = /^(\s*#{1,6}\s+)(.*)$/;

/** A line reduced to a bare label ("Budget refresh:", "**Mid-range**:") carries nothing. */
const isBareLabel = (s: string) => /^[\s*_`>#-]*[^.!?。！？]{0,60}[:：][\s*_`]*$/.test(s) || /^[\s*_`.,，;；:：·—–-]*$/.test(s);

/**
 * A table row with an amount is dropped — unless it states a duration (task 145):
 * then only its price cells are emptied ("| Suite | $65K–$95K | 8–10 weeks |" → "| Suite |  | 8–10 weeks |").
 */
function stripTableRow(line: string): string | null {
  if (!hasDuration(line)) return null;
  return line.split('|').map((cell) => (hasPriceCopy(cell) && !hasDuration(cell) ? ' ' : hasPriceCopy(cell) ? ` ${stripPriceProse(cell.trim())} ` : cell)).join('|');
}

function stripLine(line: string): string | null {
  if (!hasPriceCopy(line)) return line;
  if (/^\s*\|/.test(line)) return stripTableRow(line);         // table row with an amount
  const h = HEADING.exec(line);
  if (h) {
    const t = stripPriceTitle(h[2]);
    return t ? h[1] + t : null;
  }
  const li = LIST_ITEM.exec(line);
  if (li) {
    const body = stripPriceProse(li[2]);
    return body && !isBareLabel(body) ? li[1] + body : null;
  }
  const body = stripPriceProse(line);
  return body && !isBareLabel(body) ? body : null;
}

/** Drop markdown tables left with only a header and separator row. */
function dropEmptyTables(lines: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const isHeader = /^\s*\|.*\|\s*$/.test(lines[i]) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? '');
    if (isHeader && !/^\s*\|/.test(lines[i + 2] ?? '')) { i += 1; continue; }
    out.push(lines[i]);
  }
  return out;
}

const isListOrRow = (l: string) => LIST_ITEM.test(l) || /^\s*\|/.test(l);
const isLeadIn = (l: string) => /[:：]\s*(?:\*\*|__)?\s*$/.test(l) && !HEADING.test(l) && !LIST_ITEM.test(l);

/**
 * Lines left orphaned by a removal: a lead-in ("Real pricing from our projects:")
 * whose list / table was dropped entirely, and a heading whose whole section
 * was emptied. Only lines next to a REMOVAL are touched — pre-existing copy
 * keeps its shape.
 */
function dropOrphans(rows: Array<{ orig: string; kept: string | null }>): string[] {
  const kept = rows.map((r) => r.kept);
  const nextNonBlank = (i: number) => { for (let j = i + 1; j < rows.length; j++) if (rows[j].orig.trim()) return j; return -1; };
  // 1. lead-ins whose following block was removed and nothing list-like survives after them
  for (let i = 0; i < rows.length; i++) {
    const k = kept[i];
    if (k === null || !isLeadIn(k)) continue;
    const j = nextNonBlank(i);
    if (j < 0 || kept[j] !== null) continue;              // the next block was not removed
    let m = j; while (m < rows.length && (!rows[m].orig.trim() || kept[m] === null)) m++;
    if (m >= rows.length || !isListOrRow(kept[m] ?? '')) kept[i] = null;
  }
  // 2. headings whose section lost lines and now has no kept content
  for (let i = 0; i < rows.length; i++) {
    const h = HEADING.exec(kept[i] ?? '');
    if (!h) continue;
    const level = (h[1].match(/#/g) ?? []).length;
    let lost = false, content = false;
    for (let j = i + 1; j < rows.length; j++) {
      const hj = HEADING.exec(rows[j].orig);
      if (hj && (hj[1].match(/#/g) ?? []).length <= level) break;
      if (!rows[j].orig.trim()) continue;
      if (kept[j] === null) lost = true; else content = true;
    }
    if (lost && !content) kept[i] = null;
  }
  return kept.filter((l): l is string => l !== null);
}

/** Remove price copy from markdown (or plain multi-paragraph text). */
/**
 * List items under a lead-in that names a subsidy ("**Available BC Hydro /
 * provincial rebates:**", "**可申请 BC Hydro / 省级退税：**") are rebate amounts
 * ("低收入家庭补充：额外 $3,000", "合计可达 $11,000") and stay as written.
 */
function subsidyListRows(lines: string[]): boolean[] {
  let underSubsidyLeadIn = false;
  return lines.map((line) => {
    if (!line.trim()) return false;
    // the item itself must carry rebate wording too: a "(before rebates):" lead-in
    // over installation costs does not make those costs rebates.
    if (LIST_ITEM.test(line)) return underSubsidyLeadIn && marksSubsidy(line);
    underSubsidyLeadIn = /[:：][\s*_]*$/.test(line) && isSubsidyText(line);
    return false;
  });
}

export function stripPriceMarkdown(md: string): string {
  if (!md || !hasPriceCopy(md)) return md;
  const inSubsidyList = subsidyListRows(md.split('\n'));
  const rows = md.split('\n').map((orig, i) => ({ orig, kept: inSubsidyList[i] ? orig : stripLine(orig) }));
  return dropEmptyTables(dropOrphans(rows)).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const BLOCK_EL = /<(p|li|td|th|dd|dt|h[1-6]|figcaption)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;

/** Remove price copy from simple HTML: per block element; emptied elements are removed. */
export function stripPriceHtml(html: string): string {
  if (!html || !hasPriceCopy(html)) return html;
  return html.replace(BLOCK_EL, (whole, tag: string, attrs = '', inner: string) => {
    if (!hasPriceCopy(inner)) return whole;
    const next = /^h[1-6]$/i.test(tag) ? stripPriceTitle(inner) : stripPriceProse(inner);
    return next && !isBareLabel(next.replace(/<[^>]+>/g, '')) ? `<${tag}${attrs}>${next}</${tag}>` : '';
  });
}

/** Pick the right mode for a free-form string. */
export function stripPriceCopy(text: string): string {
  if (!text || !hasPriceCopy(text)) return text;
  // DB long-form copy is often MIXED: markdown lines with some inline HTML
  // blocks. The HTML pass handles block elements; the line pass then handles
  // every remaining markdown line (it never sees a price the HTML pass removed).
  const afterHtml = /<(p|li|td|h[1-6]|div|ul|ol)[\s>]/i.test(text) ? stripPriceHtml(text) : text;
  if (!hasPriceCopy(afterHtml)) return afterHtml;
  if (afterHtml.includes('\n')) return stripPriceMarkdown(afterHtml);
  if (/<[a-z][^>]*>/i.test(afterHtml)) return stripPriceProse(afterHtml);
  if (/\s\|\s/.test(afterHtml) && afterHtml.length < 160) return stripPriceTitle(afterHtml);
  return stripPriceProse(afterHtml);
}

/** Exact-price-only strings (e.g. budget_range "$25,000 - $30,000") become undefined. */
export function stripPriceValue(value: string | null | undefined): string | undefined {
  if (value == null) return undefined;
  const next = stripPriceCopy(value);
  return next && next.trim() ? next : undefined;
}

/**
 * Deep-strip every string inside a DB row / Localized<string> / array.
 * Keys whose value IS a price (budget_range, totalBudget, …) are emptied;
 * titles / names are treated as titles. Objects without price copy are
 * returned unchanged (same reference).
 */
const VALUE_KEYS = /^(budget_range|budgetRange|totalBudget|total_budget|price|priceRange)$/;
const TITLE_KEYS = /^(title|name|meta_title|metaTitle|heading|label)$/;

export function stripPriceDeep<T>(value: T, key = ''): T {
  if (typeof value === 'string') {
    if (VALUE_KEYS.test(key)) return (hasPriceCopy(value) ? undefined : value) as T;
    if (TITLE_KEYS.test(key)) return stripPriceTitle(value) as T;
    return stripPriceCopy(value) as T;
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((v) => { const n = stripPriceDeep(v, key); if (n !== v) changed = true; return n; });
    // A list item that was nothing but a price goes — an emptied highlight renders as a blank bullet (task 153).
    return (changed ? next.filter((n, i) => !(typeof value[i] === 'string' && value[i] && n === '')) : value) as T;
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    let changed = false;
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // A Localized<string> keeps its parent key's mode (title vs body).
      const mode = /^(en|zh|zh-Hant|ja|ko|es|pa|tl|fa|vi|ru|ar|hi|fr)$/.test(k) || /^[a-z]+(Ja|Ko|Es|Pa|Tl|Fa|Vi|Ru|Ar|Hi|Fr|ZhHant|Zh)$/.test(k) ? key : k;
      const nv = stripPriceDeep(v, mode);
      if (nv !== v) changed = true;
      next[k] = nv;
    }
    return (changed ? next : value) as T;
  }
  return value;
}

/**
 * Strip each candidate SEPARATELY and return the first one that is not empty.
 * A meta title/description built as `strip(a || b || c)` comes out '' when `a`
 * was nothing but a price — the fallbacks never get a chance (task 136).
 */
/**
 * Meta descriptions (task 153): the first candidate that never carried a price wins as written — a stored meta whose
 * lead sentence was a price list must not ship as its leftover tail ("Lynn Valley, Deep Cove. 3-yr warranty. …") or
 * with its "see real project prices" line. Only when every candidate carries a price is one stripped.
 */
export function firstIntactText(
  candidates: ReadonlyArray<string | null | undefined>,
  fallback: string,
): string {
  const at = candidates.findIndex((c) => c && c.trim() && !hasPriceCopy(c));
  if (at < 0) return firstPriceFree(stripPriceProse, candidates, fallback);
  return withInsuranceOf(candidates[at] as string, candidates.slice(0, at));
}

/**
 * The insurance claim of a priced source that was passed over ("… $5M insured. Free quote.") rides
 * along on the price-free text that replaced it — insurance is ALWAYS KEEP (task 153c).
 */
function withInsuranceOf(chosen: string, skipped: ReadonlyArray<string | null | undefined>): string {
  if (hasInsuranceAmount(chosen)) return chosen;
  const source = skipped.find((c) => hasInsuranceAmount(c));
  if (!source) return chosen;
  const sentences = stripPriceProse(source).match(/[^.!?。！？]*[.!?。！？]+\s*|[^.!?。！？]+$/g) ?? [];
  const claim = sentences.filter((x) => hasInsuranceAmount(x) && !hasPriceCopy(x)).map((x) => x.trim());
  if (!claim.length) return chosen;
  const body = chosen.trim();
  const cjk = /[。！？]$/.test(body);
  return body + (cjk ? '' : ' ') + claim.join(cjk ? '' : ' ');
}

export function firstPriceFree(
  strip: (s: string) => string,
  candidates: ReadonlyArray<string | null | undefined>,
  fallback: string,
): string {
  for (const c of candidates) {
    if (!c) continue;
    const out = strip(c);
    if (out && out.trim()) return out;
  }
  return fallback;
}

/**
 * Price-strip a next-intl message subtree on the SERVER, before it is
 * serialized into a client provider's RSC payload (DI-15). Leaves use the
 * same rules as stripPriceDeep, but a message never becomes undefined (a
 * missing key would throw in the client): an emptied message is ''.
 * `skip` subtrees are company facts, not prices (nearMe `trust.*` holds the
 * bare "$5M" liability stat).
 */
export function stripPriceMessages<T>(value: T, skip: ReadonlySet<string> = new Set(), key = ''): T {
  if (typeof value === 'string') return (stripPriceDeep(value, key) ?? '') as T;
  if (Array.isArray(value)) return value.map((v) => stripPriceMessages(v, skip, key)) as T;
  if (value && typeof value === 'object') {
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      next[k] = skip.has(k) ? v : stripPriceMessages(v, skip, k);
    }
    return next as T;
  }
  return value;
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------
/** Questions that ask what something COSTS, in the site's 14 languages. */
// "budget" (and its translations) is NOT a cost word: "Can you work within my
// budget?" asks about scope, not price (task 136).
/** Space-delimited scripts: whole words only, so "fee" never matches "feel". */
const COST_WORDS = [
  'costs?', 'costing', 'costly', 'prices?', 'priced', 'pricing', 'how much', 'expensive',
  'cheap(?:er|est|ly)?', 'afford(?:able|ability)?', 'fees?',
  'costos?', 'costes?', 'precios?', 'cuánto', 'cuanto', 'gastos',
  'coûts?', 'couts?', 'prix', 'combien',
  'chi phí', 'giá', 'bao nhiêu',
  'стоимост\\p{L}*', 'цен(?:а|ы|у|е|ой)', 'сколько',
  'magkano', 'presyo', 'halaga',
];
/** Scripts without word spaces (CJK) or with attached prefixes (Arabic, Persian, Indic): substring. */
const COST_STEMS = [
  '费用', '價格', '价格', '多少钱', '多少錢', '費用', '花费', '花費',
  '価格', 'いくら', '비용', '가격', '얼마',
  'تكلفة', 'سعر', 'كم ', 'هزینه', 'قیمت', 'چقدر',
  'लागत', 'कीमत', 'कितना', 'कितनी', 'ਲਾਗਤ', 'ਕੀਮਤ', 'ਕਿੰਨਾ', 'ਕਿੰਨੀ',
];
const COST_QUESTION = new RegExp(
  `(?<![\\p{L}\\p{M}])(?:${COST_WORDS.join('|')})(?![\\p{L}\\p{M}])|${COST_STEMS.join('|')}`,
  'iu',
);

export function isCostQuestion(question: string): boolean {
  return COST_QUESTION.test(question ?? '');
}

/**
 * Strip price copy from localized FAQ items. A cost question whose answer
 * quoted amounts is dropped whole (stripping would leave it unanswered) —
 * UNLESS its answer also quotes the insurance amount: Ryan requires the $5M
 * CGL kept in every locale, so that answer is stripped of prices and kept.
 * Any other answer is stripped and dropped only if nothing meaningful is left.
 */
export function filterPriceFaqs<T extends { question: string; answer: string }>(faqs: readonly T[]): T[] {
  const out: T[] = [];
  for (const f of faqs) {
    if (!hasPriceCopy(f.answer) && !hasPriceCopy(f.question)) { out.push(f); continue; }
    // A question about rebates / grants / HAFI keeps its whole answer (Ryan: subsidy amounts stay).
    if (isSubsidyText(f.question)) { out.push(f); continue; }
    // A cost FAQ is dropped whole — unless its answer also quotes the insurance amount or states a
    // duration (task 145): then it keeps a price-free answer ("… (8–10 weeks)").
    if (hasPriceCopy(f.answer) && isCostQuestion(f.question) && !hasInsuranceAmount(f.answer) && !hasDuration(f.answer)) continue;
    const answer = stripPriceCopy(f.answer);
    const question = stripPriceTitle(f.question);
    if (!answer || answer.replace(/<[^>]+>/g, '').trim().length < 20 || !question) continue;
    out.push({ ...f, question, answer });
  }
  return out;
}
