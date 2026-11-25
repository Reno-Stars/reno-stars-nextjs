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

/** Insurance wording in all 14 site languages. An amount near one is NOT a price. */
const INSURANCE = new RegExp(
  [
    'CGL', 'liabilit', 'insur', 'coverage',            // en
    '保险', '保險', '保険', '보험', '責任險', '责任险', '保额', '保額', '投保', '보장',   // zh / zh-Hant / ja / ko
    'seguro', 'asegura', 'cobertura',                   // es
    'assur', 'responsabilit', 'couverture',             // fr (assuré / assurés / assurance)
    'bảo hiểm', 'страх', 'تأمين', 'مؤمن', 'بیمه',        // vi / ru / ar / fa
    'बीमा', 'सीजीएल', 'कवरेज', 'ਬੀਮਾ', 'ਬੀਮਿ', 'ਕਵਰੇਜ',   // hi / pa
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
  if (MILLION_WORD.test(text.slice(end, end + 14))) return true;
  const wan = /([0-9][0-9,.]*)\s?(?:万|萬|만)/.exec(match);
  return !!wan && parseFloat(wan[1].replace(/,/g, '')) >= 100;
}

interface Hit { start: number; end: number }

/** A single million-level amount with an insurance word nearby. A range is always a price. */
function isInsuranceAmount(text: string, start: number, end: number, match: string): boolean {
  if ((match.match(NUMBER) ?? []).length > 1) return false;
  if (!isMillionLevel(text, end, match)) return false;
  return INSURANCE.test(text.slice(Math.max(0, start - MILLION_WINDOW), end + MILLION_WINDOW));
}

/** Price amounts in `text`, insurance amounts excluded. */
function priceHits(text: string): Hit[] {
  const re = new RegExp(PRICE_SOURCE, 'g');
  const out: Hit[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const end = m.index + m[0].length;
    if (!isInsuranceAmount(text, m.index, end, m[0])) out.push({ start: m.index, end });
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
  [new RegExp(String.raw`(^|[.!?。！？:：]\s*|\s[—–-]\s|·\s*)${AMT}\s*(?:[,，;；·](?![0-9])|\s[—–-])\s*`, 'g'), '$1'],
  // Trailing / middle amount after a separator: "…, $20K–$55K", " — $1.5K+", " · $4K".
  [new RegExp(String.raw`\s*(?:[,，;；·]|\s[—–-])\s*(?:from|starting (?:at|from)|about|around|roughly|typically|under|over|up to)?\s*${AMT}(?=\s*(?:[,，;；.。!?！？)](?![0-9])|$))`, 'gim'), ''],
];

const SENTENCE_SPLIT = /(?<=[.!?。！？।۔؟])\s+|(?<=[。！？])/;

function tidyProse(s: string): string {
  return s
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;:!?，。；：！？)）])/g, '$1')
    .replace(/([,，;；:：])\s*([.。!?！？])/g, '$2')
    .replace(/([.。])\s*\1+/g, '$1')
    .replace(/[(（]\s*[)）]/g, '')
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
  let out = text;
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
  if (hasPriceCopy(out)) {
    out = out.split(SENTENCE_SPLIT).map(dropPriceSentence).filter(Boolean).join(' ');
  }
  return tidyProse(out);
}

/** Clause separators inside one sentence ("约3万至5万加元，我们持有500万加元责任险"). */
const CLAUSE_SPLIT = /(?<=[,，;；])\s*/;

/**
 * A sentence that still names a price is dropped — unless it also quotes the
 * insurance amount (ALWAYS KEEP): then only its price clauses are dropped.
 */
function dropPriceSentence(sentence: string): string {
  if (!hasPriceCopy(sentence)) return sentence;
  if (!hasInsuranceAmount(sentence)) return '';
  return sentence.split(CLAUSE_SPLIT).filter((c) => !hasPriceCopy(c)).join(' ');
}

// ---------------------------------------------------------------------------
// Titles / headings / labels
// ---------------------------------------------------------------------------
/**
 * "Kitchen Renovation Surrey | $20K–$55K | Reno Stars" → "Kitchen Renovation Surrey | Reno Stars";
 * "Budget Kitchen Renovation: $16,000–$27,000" → "Budget Kitchen Renovation".
 */
export function stripPriceTitle(title: string): string {
  if (!title || !hasPriceCopy(title)) return title;
  let out = title;
  if (out.includes('|')) {
    out = out.split('|').map((s) => s.trim()).filter((s) => s && !hasPriceCopy(s)).join(' | ');
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

function stripLine(line: string): string | null {
  if (!hasPriceCopy(line)) return line;
  if (/^\s*\|/.test(line)) return null;                         // table row with an amount
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
export function stripPriceMarkdown(md: string): string {
  if (!md || !hasPriceCopy(md)) return md;
  const rows = md.split('\n').map((orig) => ({ orig, kept: stripLine(orig) }));
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
    return (changed ? next : value) as T;
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
export function firstPriceFree(
  strip: (s: string) => string,
  ...candidates: ReadonlyArray<string | null | undefined>
): string {
  for (const c of candidates) {
    if (!c) continue;
    const out = strip(c);
    if (out && out.trim()) return out;
  }
  return '';
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
    if (hasPriceCopy(f.answer) && isCostQuestion(f.question) && !hasInsuranceAmount(f.answer)) continue;
    const answer = stripPriceCopy(f.answer);
    const question = stripPriceTitle(f.question);
    if (!answer || answer.replace(/<[^>]+>/g, '').trim().length < 20 || !question) continue;
    out.push({ ...f, question, answer });
  }
  return out;
}
