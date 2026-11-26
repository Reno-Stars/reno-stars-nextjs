/**
 * Task 151: what is left on either side of a price that was cut out of a sentence that
 * keeps its duration. Cutting "$20,000–$25,000" alone leaves "비용은 2~3주에입니다",
 * "takes 3–5 weeks and costs.", "総の" — the words that only carried the amount have to go
 * with it, and a verb that only made sense with the amount is turned into one that reads
 * with the duration.
 */

/** Words that only introduce the amount that follows ("and costs", "for", "约", "totaling"). */
export const PRICE_LEAD = /(?:\s*(?:[,，、،]\s*)?(?:(?<![A-Za-zÀ-ɏ])(?:and|or|et|y)\s+)?(?<![A-Za-zÀ-ɏ])(?:costs?|costing|priced at|totall?ing|totalisant|a total of|total of|por un total de|на общую сумму|tổng cộng|بإجمالي|به مجموع|総額|for|at|about|around|roughly|approximately|from|starting at|to|à|coûte|cuesta|约|約|大约|大約|费用|費用|价格|價格|و?(?:يكلف|تكلف)(?:\s+ما)?(?:\s+بين)?|يتراوح\s+بين|ما\s+بين|بين|بتكلفة|حوالي|و?تبلغ\s+تكلفة\s+\S+))?\s*$/i;

const SHORT_DUR = /[0-9]\s*(?:weeks?|days?|months?|周|週|天|个月|個月)/i;
const KO_DUR = String.raw`[0-9]+(?:\s?[~～\-–]\s?[0-9]+)?\s?(?:주|개월|일)`;

/** "걸리" → "걸립" (adds the final ㅂ to a syllable that has none); null when it already has one. */
function addFinalB(syllable: string): string | null {
  const c = syllable.charCodeAt(0);
  if (c < 0xac00 || c > 0xd7a3 || (c - 0xac00) % 28 !== 0) return null;
  return String.fromCharCode(c + 17);
}

type Join = (left: string, right: string) => [string, string] | null;

/**
 * Each rule sees the text before the cut (`left`) and after it (`right`) and returns the
 * repaired pair, or null when it does not apply. First match wins.
 */
const JOINS: Join[] = [
  // ko "S 비용은 2~3주에 $X입니다" → "S 기간은 2~3주입니다"
  (l, r) => {
    const m = new RegExp(String.raw`비용(?:은|이)\s*(${KO_DUR})에\s*$`).exec(l);
    return m && /^\s*(?:입니다|이다)/.test(r) ? [l.slice(0, m.index) + `기간은 ${m[1]}`, r.trimStart()] : null;
  },
  // ko "3~5주가 걸리며 비용은 $X입니다" → "3~5주가 걸립니다"
  (l, r) => {
    const m = /(\S)(으)?며\s+(?:총\s*)?비용(?:은|이)\s*$/.exec(l);
    const t = /^\s*(?:입니다|이다)/.exec(r);
    if (!m || !t) return null;
    const verb = m[2] ? m[1] + '습니다' : (addFinalB(m[1]) ?? null);
    if (!verb) return null;
    return [l.slice(0, m.index) + (m[2] ? verb : verb + '니다'), r.slice(t[0].length)];
  },
  // ko "총 $X의 [프로젝트]" → "[프로젝트]"
  (l, r) => (/(?:^|\s)총\s*$/.test(l) && /^의(?=\s)/.test(r) ? [l.replace(/\s*총\s*$/, ''), r.slice(1)] : null),
  // ja "2 ～ 3 週間で 20,000 ～ 25,000 ドルかかります" → "2 ～ 3 週間かかります"
  (l, r) => (/(?:週間|か月|ヶ月|日)で\s*$/.test(l) && /^\s*かか/.test(r) ? [l.replace(/で\s*$/, ''), r.trimStart()] : null),
  // ja "3 ～ 5 週間かかり、費用は 26,000 ～ 32,000 ドルです" → "3 ～ 5 週間かかります"
  (l, r) => {
    const m = /(\S)、\s*費用は\s*$/.exec(l);
    const t = /^\s*(?:です|となります)/.exec(r);
    return m && t && /[りきしちにびみいえけせてねべめれ]/.test(m[1]) ? [l.slice(0, m.index) + m[1] + 'ます', r.slice(t[0].length)] : null;
  },
  // zh "在 2-3 周内花费 20,000-25,000 加元" → "在 2-3 周内完成"
  (l, r) => {
    const m = /([周週])([内內])(?:花[费費]|耗[资資])\s*$/.exec(l);
    return m ? [l.slice(0, m.index) + `${m[1]}${m[2]}完成`, r] : null;
  },
  // ja "6 ～ 8 週間で総額 40,000 ドルかけて完了" → "6 ～ 8 週間で完了"
  (l, r) => (/総額\s*$/.test(l) && /^\s*(?:を)?かけて/.test(r) ? [l.replace(/総額\s*$/, ''), r.replace(/^\s*(?:を)?かけて/, '')] : null),
  // hi "6-8 सप्ताह में कुल $X का [परियोजना]" → "6-8 सप्ताह में [परियोजना]"
  (l, r) => (/(?:^|\s)कुल\s*$/.test(l) && /^\s*का\s/.test(r) ? [l.replace(/\s*कुल\s*$/, ' '), r.replace(/^\s*का\s/, '')] : null),
  // pa "$X ਦੀ ਕੁੱਲ ਮਿਲਾ ਕੇ ਇੱਕ [ਪ੍ਰੋਜੈਕਟ]" → "ਇੱਕ [ਪ੍ਰੋਜੈਕਟ]"
  (l, r) => (/^\s*ਦੀ\s+ਕੁੱਲ\s+ਮਿਲਾ\s+ਕੇ\s/.test(r) ? [l, r.replace(/^\s*ਦੀ\s+ਕੁੱਲ\s+ਮਿਲਾ\s+ਕੇ/, '')] : null),
  // "Pricing: $X from luxury …" (pa/hi word order): the range word after a label goes with the amount
  (l, r) => (/[:：]\s*$/.test(l) && /^\s*(?:ਤੋਂ|से)\s/.test(r) ? [l, r.replace(/^\s*(?:ਤੋਂ|से)/, '')] : null),
  // "typically costs $X (8–10 weeks)" → "typically takes 8–10 weeks"; zh "为 $X（2–3 周）" → "需要 2–3 周"
  (l, r) => {
    const m = /(?<![A-Za-z])(costs|cost|runs|run)\s*$/i.exec(l);
    const t = /^\s*\(([^()]*)\)/.exec(r);
    if (!m || !t || !SHORT_DUR.test(t[1])) return null;
    return [l.slice(0, m.index) + (/s$/i.test(m[1]) ? 'takes' : 'take'), ` ${t[1].trim()}${r.slice(t[0].length)}`];
  },
  (l, r) => {
    const m = /(?:约为|約為|为|為|约|約)\s*$/.exec(l);
    const t = /^\s*（([^（）]*)）/.exec(r);
    return m && t && SHORT_DUR.test(t[1]) ? [l.slice(0, m.index) + '需要 ', t[1].trim() + r.slice(t[0].length)] : null;
  },
  // ko "(…5~6주)부터 사용자 정의 레이아웃의 경우 $35,000+까지" → "(…5~6주)": the "from … to $Y" half goes
  (l, r) => {
    const m = /[)）]\s*부터[^()（）]*$/.exec(l);
    const t = /^\s*(?:이상\s*)?까지/.exec(r);
    return m && t ? [l.slice(0, m.index + 1), r.slice(t[0].length).replace(/^입니다/, '')] : null;
  },
  // es / fr / ru / vi "costs $X in 2–3 weeks" → "is completed in 2–3 weeks"
  (l, r) => (/(?<![A-Za-zÀ-ɏ])cuestan?\s+(?:entre\s+)?$/i.test(l) && /^\s*en\s/.test(r) ? [l.replace(/cuestan?\s+(?:entre\s+)?$/i, 'se completa'), r] : null),
  (l, r) => (/(?<![A-Za-zÀ-ɏ])coûte(?:nt)?\s+(?:entre\s+)?$/i.test(l) && /^\s*en\s/.test(r) ? [l.replace(/coûte(?:nt)?\s+(?:entre\s+)?$/i, 'se réalise'), r] : null),
  (l, r) => (/(?:^|\s)стоит\s*$/i.test(l) && /^\s*за\s/.test(r) ? [l.replace(/стоит\s*$/i, 'выполняется'), r] : null),
  (l, r) => (/(?:^|\s)dao động\s*$/i.test(l) && /^\s*trong\s/.test(r) ? [l.replace(/dao động\s*$/i, 'hoàn thành'), r] : null),
  // "and costs $X." at the end of a sentence: the whole coordinated cost predicate goes
  (l, r) => {
    const m = /\s+(?:y\s+cuestan?(?:\s+entre)?|et\s+coûte(?:nt)?(?:\s+entre)?|и\s+стоит|at\s+nagkakahalaga\s+ng|và\s+có\s+giá)\s*$/i.exec(l);
    return m && /^\s*(?:[.!?]|$)/.test(r) ? [l.slice(0, m.index), r.trimStart()] : null;
  },
  // tl "ay nagtatakbo ng $X sa loob ng 2–3 linggo" → "ay nagtatakbo sa loob ng 2–3 linggo"
  (l, r) => (/\s+ng\s*$/.test(l) && /^\s*sa\s+loob\s+ng\s/.test(r) ? [l.replace(/\s+ng\s*$/, ''), r] : null),
  // hi / pa "और इसकी लागत $X होती है" → (gone); "2-3 सप्ताह में $X तक चलता है" → "2-3 सप्ताह में चलता है"
  (l, r) => {
    const m = /\s*(?:और|ਅਤੇ)\s+(?:इसकी\s+|ਇਸਦੀ\s+)?(?:लागत|ਕੀਮਤ)\s*$/.exec(l);
    const t = /^\s*(?:होती|होता|ਹੁੰਦੀ|ਹੁੰਦਾ)\s+(?:है|ਹੈ)/.exec(r);
    return m && t ? [l.slice(0, m.index), r.slice(t[0].length)] : null;
  },
  (l, r) => (/(?:में|ਵਿੱਚ)\s*$/.test(l) && /^\s*(?:तक|ਤੱਕ)\s/.test(r) ? [l, r.replace(/^\s*(?:तक|ਤੱਕ)/, '')] : null),
  // fa "و ۲۶,۰۰۰ تا ۳۲,۰۰۰ دلار هزینه دارد" → (gone); "X دلار در ۲ تا ۳ هفته هزینه دارد" → "در ۲ تا ۳ هفته انجام می‌شود"
  (l, r) => {
    const t = /^\s*هزینه\s+دارد/.exec(r);
    const m = /\s+و\s*$/.exec(l);
    return m && t ? [l.slice(0, m.index), r.slice(t[0].length)] : null;
  },
  (l, r) => {
    const t = /^(\s*در\s+[0-9۰-۹]+(?:\s*(?:تا|-|–)\s*[0-9۰-۹]+)?\s*(?:هفته|ماه|روز))\s+هزینه\s+دارد/.exec(r);
    return t ? [l, `${t[1]} انجام می‌شود${r.slice(t[0].length)}`] : null;
  },
];

/** Repair the two sides of one cut. */
export function joinAroundCut(left: string, right: string): string {
  for (const rule of JOINS) {
    const hit = rule(left, right);
    if (hit) return tidyJoin(hit[0], hit[1]);
  }
  const l = left.replace(PRICE_LEAD, '');
  let r = right;
  // ko genitive / ja-zh enumeration comma that only attached the amount: "**라벨:** $X、2～3 週間"
  if (/[:：](?:\*\*|__)?\s*$/.test(l)) r = r.replace(/^\s*[、,，]\s*/, ' ');
  if (/^의\s/.test(r)) r = r.slice(1);
  return tidyJoin(l, r);
}

function tidyJoin(l: string, r: string): string {
  if (/\s$/.test(l) && /^\s/.test(r)) r = r.trimStart();
  return l + r;
}

// ---------------------------------------------------------------------------
// A price range whose only duration is a note on one of its amounts
// ---------------------------------------------------------------------------
const PAREN = /[(（]([^()（）]*)[)）]/g;
const LINK = /\[[^\]]+\]\([^)]*\)[A-Za-z]*/g;
const RANGE_LEAD = /\s*(?:from|desde|de|à partir de|从|從|价格从|價格從|từ|mula|يتراوح من|من|از|от)\s*$/i;

/**
 * "Pricing: [bathroom renovation](…)s from $18,000–$21,000 (3-4 weeks, custom glass) to $35,000+
 * for full suites." states its duration only as a note on an amount. Cutting the amounts leaves
 * "from (3-4 weeks …) to for full suites" in every language, so the sentence is rebuilt as
 * "[bathroom renovation](…)s: 3-4 weeks, custom glass." Returns null when the sentence is not
 * of that shape (a duration outside the notes, or a note that does not follow an amount).
 */
export function salvageRangeNotes(
  sentence: string,
  hits: ReadonlyArray<{ start: number; end: number }>,
  hasDuration: (s: string) => boolean,
): string | null {
  if (!hits.length) return null;
  const parens = [...sentence.matchAll(PAREN)].map((m) => ({ s: m.index ?? 0, e: (m.index ?? 0) + m[0].length, inner: m[1] }));
  const notes = parens.filter((p) => hasDuration(p.inner) && !hits.some((h) => h.start >= p.s && h.end <= p.e));
  if (!notes.length) return null;
  let outside = sentence;
  for (const p of [...parens].reverse()) outside = outside.slice(0, p.s) + outside.slice(p.e);
  if (hasDuration(outside)) return null;
  const follows = (p: { s: number }) => hits.some((h) => h.end <= p.s && /^[\s~～]*(?:不等)?[\s~～]*$/.test(sentence.slice(h.end, p.s)));
  if (!notes.every(follows)) return null;
  // a range ("from $X (…) to $Y") or a linked service name: one plain "costs $X (8–10 weeks)" is a JOINS case
  const before0 = sentence.slice(0, Math.min(...hits.map((h) => h.start)));
  if (hits.length < 2 && !LINK.test(before0)) return null;
  LINK.lastIndex = 0;

  const first = Math.min(...hits.map((h) => h.start));
  const before = sentence.slice(0, first);
  const links = [...before.matchAll(LINK)];
  let head = links.length
    ? links[links.length - 1][0]
    : before.replace(/^[^[*]*[:：]\s*(?=\S)/, '').replace(RANGE_LEAD, '');
  head = head.trim();

  const last = notes[notes.length - 1];
  const end = /[.!?。！？।۔؟]\s*$/.exec(sentence)?.[0].trim() ?? '';
  const tail = sentence.slice(last.e).replace(/[.!?。！？।۔؟]\s*$/, '');
  const keepTail = /^\s*[—–]\s/.test(tail) && !hits.some((h) => h.start >= last.e) ? tail : '';
  const cjk = /[぀-ヿ㐀-鿿]/.test(notes.map((n) => n.inner).join(''));
  const body = notes.map((n) => n.inner.trim()).join(cjk ? '；' : '; ');
  return (head ? head + (cjk ? '：' : ': ') + body : body) + keepTail + end;
}
