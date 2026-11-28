/**
 * Replacement rules for the task-158 company-facts migration (Ryan, 2026-11-26):
 * founded May 2021, 900+ completed projects, builder-licence number removed; a company
 * "20+ years" claim is kept as the team's INDUSTRY experience (Ryan 2026-11-27, task 172).
 * Pure functions — no DB access.
 *
 *  1. RULES        experience-years claims → the industry-experience form of that locale;
 *  2. COUNT        company project totals 700+/100+ → 900+ (sub-counts are left and listed);
 *  3. FOUND        "since/founded 2020" → May 2021;
 *  4. LICNUM       a licence number in body copy is removed;
 *  5. SINCE_EN / ABOUT_EN / SINCE_LOC (task 164/168): company "since 2005/2017/2018/2019"
 *     and the "About Reno Stars — 20+ years," line, every locale.
 */
import { B, re, finditer, sub, subStr, cpWindow, cpAfter, cpBefore } from './pyre';

export type FactsChange = { rule: string; old: string; new: string; context?: string };
export type SubcountLeft = { match: string; context: string };

type Rule = { id: string; rx: RegExp; rep: string };
const rule = (id: string, p: string, rep: string): Rule => ({ id, rx: re(p), rep });

/**
 * Task 172 (Ryan 2026-11-27 「20年+的经验，没问题，这是行业经验」): a company "20+ years" claim is KEPT
 * as the team's INDUSTRY experience — one form per locale, never "in business N years" — instead of
 * being replaced. Founded May 2021 and 900+ projects stay where they are. Each pattern excludes the
 * text it produces (negative lookahead), so a re-run on migrated text is a no-op.
 * Comparison-table cell (blog c771922c, "Experience" row): "20+ years industry experience · est. May 2021".
 */
export const IND: Record<string, string> = {
  en: '20+ years of industry experience', zh: '20 多年行业经验', zhHant: '20 多年業界經驗', ja: '20年以上の業界経験',
  ko: '20년 이상의 업계 경험', es: 'más de 20 años de experiencia en el sector', fr: "plus de 20 ans d'expérience dans le secteur",
  ru: 'более 20 лет опыта в отрасли', ar: 'أكثر من 20 عامًا من الخبرة في القطاع', fa: 'بیش از ۲۰ سال تجربه در صنعت',
  hi: '20+ वर्षों का उद्योग अनुभव', pa: '20+ ਸਾਲਾਂ ਦਾ ਉਦਯੋਗ ਤਜਰਬਾ', tl: '20+ taong karanasan sa industriya',
  vi: 'hơn 20 năm kinh nghiệm trong ngành',
};
const TD: Record<string, string> = {
  en: '<td>20+ years industry experience · est. May 2021</td>', zh: '<td>20 多年行业经验 · 2021 年 5 月成立</td>',
  zhHant: '<td>20 多年業界經驗 · 2021 年 5 月成立</td>', ja: '<td>20年以上の業界経験 · 2021年5月創業</td>',
  ko: '<td>20년 이상의 업계 경험 · 2021년 5월 설립</td>', es: '<td>Más de 20 años de experiencia en el sector · desde mayo de 2021</td>',
  fr: "<td>Plus de 20 ans d'expérience dans le secteur · depuis mai 2021</td>", ru: '<td>Более 20 лет опыта в отрасли · с мая 2021 года</td>',
  ar: '<td>أكثر من 20 عامًا من الخبرة في القطاع · منذ مايو 2021</td>', fa: '<td>بیش از ۲۰ سال تجربه در صنعت · از مه ۲۰۲۱</td>',
  hi: '<td>20+ वर्षों का उद्योग अनुभव · मई 2021 से</td>', pa: '<td>20+ ਸਾਲਾਂ ਦਾ ਉਦਯੋਗ ਤਜਰਬਾ · ਮਈ 2021 ਤੋਂ</td>',
  tl: '<td>20+ taong karanasan sa industriya · mula Mayo 2021</td>', vi: '<td>Hơn 20 năm kinh nghiệm trong ngành · từ tháng 5 năm 2021</td>',
};

export const RULES: readonly Rule[] = [
  rule('years:en:experience', '(?:[Oo]ver |[Mm]ore than )?20\\+? years of (?:renovation |combined |hands-on )*experience', IND.en),
  rule('years:en:over-20-in-mv', 'over 20 years in Metro Vancouver', `${IND.en} in Metro Vancouver`),
  rule('years:en:renovating-across-mv', '20\\+ years renovating across Metro Vancouver', `${IND.en} across Metro Vancouver`),
  rule('years:en:decade', 'over a decade of (?:hands-on )?experience', IND.en),
  rule('years:en:td', '<td>20\\+ years</td>', TD.en),
  rule('years:zh:mv', '在大温哥华超过 ?20 ?年装修经验', `在大温哥华拥有 ${IND.zh}`),
  rule('years:zhHant:mv', '在大溫哥華超過 ?20 ?年裝修經驗', `在大溫哥華擁有 ${IND.zhHant}`),
  // 行业/業界 is the industry form already: never matched; 拥有/具有 before the figure stays in the text
  rule('years:zh:experience', '(?:超过\\s?)?20 ?(?:\\+|多)? ?年(?:以上)?(?:的)?(?:装修|翻新|综合)?经验', IND.zh),
  rule('years:zhHant:experience', '(?:超過\\s?)?20 ?(?:\\+|多)? ?年(?:以上)?(?:的)?(?:裝修|翻新|綜合)?經驗', IND.zhHant),
  rule('years:zh:td', '<td>20 多年</td>', TD.zh),
  rule('years:zh:decade', '十多年(?:的)?(?:实践|实战)?经验', IND.zh),
  rule('years:zhHant:decade', '十多年(?:的)?(?:實務|實戰)?經驗', IND.zhHant),
  rule('years:ja:experience', '20 ?年以上の(?:改修|リノベーション)?経験', IND.ja),
  rule('years:ja:td', '<td>20 年以上</td>', TD.ja),
  rule('years:ko:experience', '20년 이상의 (?:개조 |리노베이션 )?경험', IND.ko),
  rule('years:ko:td', '<td>20년 이상</td>', TD.ko),
  rule('years:es:experience', 'más de 20 años de experiencia(?: en (?:renovación|remodelación))?(?! en el sector)', IND.es),
  rule('years:es:td', '<td>[Mm]ás de 20 años</td>', TD.es),
  rule('years:fr:experience', "plus de 20 ans d'expérience(?: dans la rénovation| en rénovation)?(?! dans le secteur)", IND.fr),
  rule('years:fr:td', '<td>[Pp]lus de 20 ans</td>', TD.fr),
  rule('years:ru:experience', 'более 20 лет опыта(?: в (?:сфере )?ремонт[а-я]*)?(?! в отрасли)', IND.ru),
  rule('years:ru:td', '<td>[Бб]олее 20 лет</td>', TD.ru),
  rule('years:ar:experience', 'أكثر من 20 عامًا من الخبرة(?: في (?:مجال )?التجديد)?(?! في القطاع)', IND.ar),
  rule('years:ar:td', '<td>أكثر من 20 عامًا</td>', TD.ar),
  rule('years:fa:experience', 'بیش از (?:۲۰|20) سال تجربه(?: در (?:زمینه )?بازسازی)?(?! در صنعت)', IND.fa),
  rule('years:fa:td', '<td>بیش از (?:۲۰|20) سال</td>', TD.fa),
  rule('years:hi:experience', '20\\+ (?:वर्षों|वर्ष|साल) का (?:नवीनीकरण |नवीकरण )?अनुभव', IND.hi),
  rule('years:hi:td', '<td>20\\+ (?:वर्ष|साल)</td>', TD.hi),
  rule('years:pa:experience', '20\\+ ਸਾਲਾਂ ਦਾ (?:ਰੈਨੋਵੇਸ਼ਨ |ਮੁਰੰਮਤ )?ਤਜ਼?ਰਬਾ', IND.pa),
  rule('years:pa:td', '<td>20\\+ ਸਾਲ</td>', TD.pa),
  rule('years:tl:experience', '20\\+ (?:na )?(?:taon|taong) (?:ng )?(?:karanasan|renovation experience)(?! sa industriya)', IND.tl),
  rule('years:tl:td', '<td>20\\+ taon</td>', TD.tl),
  rule('years:vi:experience', '(?:[Hh]ơn |[Tt]rên )?20 năm kinh nghiệm(?: cải tạo)?(?! trong ngành)', IND.vi),
  rule('years:vi:td', '<td>(?:[Hh]ơn )?20 năm</td>', TD.vi),
];

/**
 * Locale-scoped rules (task 170 M-B): applied only to the column / localizations key of
 * that language, so a phrase that is a company claim in one language cannot fire in another.
 * The About line "[About Reno Stars](/xx/about/) — 20+ years, $5M insured…" in translated
 * form → the industry-experience form of that language, $5M kept; zh-Hant comparison-table cell.
 */
/**
 * The About line "[About Reno Stars](/xx/about/) — 20+ years, $5M insured, …" keeps its claim as INDUSTRY
 * experience (task 172). It sits near the 1000-char cut of a truncated FAQ JSON-LD answer on some posts
 * (task 165 B: /en/blog/diy-vs-contractor-renovation-vancouver-2026/ keeps only 21 chars after "$5M"), so
 * it carries the short industry form and NOT "900+ projects" — a longer line pushes "$5M" out of the summary.
 */
export const ABOUT: Record<string, string> = {
  en: '20+ yrs industry experience', zh: IND.zh, zhHant: IND.zhHant, ko: IND.ko, es: IND.es, fr: IND.fr,
  vi: IND.vi, tl: IND.tl, hi: IND.hi, pa: IND.pa,
};
const ABOUT_LINK = '(\\]\\(/[a-z-]+/about/\\)(?: [—–-]|:) )';
const about = (id: string, phrase: string, rep: string, sep = ','): Rule =>
  ({ id, rx: re(`${ABOUT_LINK}${phrase}${sep}`), rep: `$1${rep}${sep}` });
/** A locale rule whose replacement keeps the case of the first letter it replaces ("Más"/"más"). */
const local = (id: string, p: string, rep: string): Rule => ({ id, rx: re(p), rep });
export const LOCAL_RULES: Record<string, readonly Rule[]> = {
  Es: [
    about('about:es', '[Mm]ás de 20 años', ABOUT.es),
    local('years:es:experience-cap', 'Más de 20 años de experiencia(?! en el sector)', 'Más de 20 años de experiencia en el sector'),
    local('count:es:project-data', '([Mm]ás de) 100 (datos de proyectos)', '$1 900 $2'),
  ],
  Fr: [
    about('about:fr', '(?:20\\+|[Pp]lus de 20) ans', ABOUT.fr),
    local('years:fr:experience-cap', "Plus de 20 ans d'expérience(?! dans le secteur)", "Plus de 20 ans d'expérience dans le secteur"),
    local('years:fr:td-plus', '<td>20\\+ ans</td>', TD.fr),
    local('count:fr:project-data', '([Pp]lus de) 100 (données de projet)', '$1 900 $2'),
  ],
  Ru: [
    local('years:ru:experience-plus', '20\\+ лет опыта(?! в отрасли)', 'Более 20 лет опыта в отрасли'),
    local('years:ru:td-plus', '<td>20\\+ лет</td>', TD.ru),
  ],
  Fa: [
    local('years:fa:experience-plus', '(?:۲۰|20)\\+ سال تجربه(?! در صنعت)', IND.fa),
    local('years:fa:td-plus', '<td>(?:۲۰|20)\\+ سال</td>', TD.fa),
  ],
  Vi: [
    about('about:vi', '[Hh]ơn 20 năm', ABOUT.vi),
    local('count:vi:projects', '([Hh]ơn) 100 ((?:dữ liệu )?dự án)', '$1 900 $2'),
  ],
  Ko: [about('about:ko', '20년 이상', ABOUT.ko)],
  Tl: [about('about:tl', '20\\+ taon', ABOUT.tl)],
  Hi: [about('about:hi', '20\\+ (?:वर्ष|साल)', ABOUT.hi)],
  Pa: [
    about('about:pa', '20\\+ ਸਾਲ', ABOUT.pa),
    local('years:pa:experience-anubhav', '20\\+ ਸਾਲਾਂ ਦਾ (?:ਨਵੀਨੀਕਰਨ )?ਅਨੁਭਵ', IND.pa),
  ],
  Zh: [about('about:zh', '20 ?多年', ABOUT.zh, '，')],
  ZhHant: [
    about('about:zhHant', '20 ?多年', ABOUT.zhHant, '，'),
    local('years:zhHant:td', '<td>20 ?年以上</td>', TD.zhHant),
  ],
};

/** Keep the case of the replaced text's first letter (an About line may read "— Más …" or ": más …"). */
function matchCase(replaced: string, out: string): string {
  const a = replaced.charAt(0);
  const b = out.charAt(0);
  if (a === a.toUpperCase() && a !== a.toLowerCase()) return b.toUpperCase() + out.slice(1);
  return out;
}

function applyLocalRules(suffix: string, v: string, changes: FactsChange[]): string {
  let s = v;
  for (const r of LOCAL_RULES[suffix] ?? []) {
    s = sub(r.rx, s, (m) => {
      const prefix = r.rep.startsWith('$1') && r.id.startsWith('about:') ? m[1] ?? '' : '';
      const body = r.rep.replace(/\$(\d)/g, (_, d: string) => m[Number(d)] ?? '');
      const out = prefix ? prefix + matchCase(m[0].slice(prefix.length), body.slice(prefix.length)) : body;
      changes.push({ rule: r.id, old: m[0], new: out });
      return out;
    });
  }
  return s;
}

const COUNT = re(`(?:700|100)\\s?\\+|(?:700|100)\\s?多|۷۰۰|۱۰۰\\+|(?:more than|over|plus de|más de|более|أكثر من|بیش از|hơn)\\s(?:700|100|۷۰۰|۱۰۰)${B}|(?:700|100)\\s?(?:以上|개 이상|件以上|से अधिक)`);
const COUNT_CTX = re('project|renovation|proyecto|projet|rénovation|remodela|проект|ремонт|реконстр|مشروع|تجديد|پروژه|بازسازی|परियोजन|नवीकरण|ਪ੍ਰੋਜੈਕਟ|ਰੈਨੋਵੇਸ਼ਨ|proyekto|dự án|cải tạo|项目|項目|工程|翻新|改造|装修|裝修|プロジェクト|改修|リノベ|프로젝트|개조|Projects|Renovations|kitchen renovations|strata renovations|apartment bathrooms|公寓浴室', 'i');
const SUBCOUNT = re('bathroom|浴室|욕실|phòng tắm|baño|salle de bain|ванн|حمام|बाथरूम|ਬਾਥਰੂਮ|banyo|kitchen renovations|厨房|廚房|strata|地层|地層|strate|지층|tầng lớp|分契|condo|公寓浴室', 'i');
/** '$', years and sq ft only disqualify AFTER the number (task 168). */
const COUNT_NOT = re('review|avis|reseña|отзыв|مراجع|نظر|समीक्षा|ਸਮੀਖਿਆ|đánh giá|评论|評論|レビュー|리뷰|heritage|遗产|遺產|patrimon|sq ?ft|平方|\\$|加元|years|年|line item', 'i');
const COUNT_NOT_BEFORE = re('review|avis|reseña|отзыв|مراجع|نظر|समीक्षा|ਸਮੀਖਿਆ|đánh giá|评论|評論|レビュー|리뷰|heritage|遗产|遺產|patrimon|line item', 'i');
const COUNT_IS_PROJECTS = re('项目|項目|專案|проект|مشروع|پروژه|परियोजन|ਪ੍ਰੋਜੈਕਟ|projects?|proyectos|projets|proyekto|dự án|プロジェクト|프로젝트|renovation projects|residential projects', 'i');
const FOUND = re('(since |founded in |desde |depuis |с |منذ |از سال |mula |từ năm |自 ?)(2020|۲۰۲۰)');
const LICNUM = re(' ?[(（][^()（）\\n]{0,24}52603[)）]|(?:License|牌照)\\s?#\\s?52603');
const MAY: Record<string, string> = {
  'since ': 'since May 2021', 'founded in ': 'founded in May 2021', 'desde ': 'desde mayo de 2021',
  'depuis ': 'depuis mai 2021', 'с ': 'с мая 2021', 'منذ ': 'منذ مايو 2021', 'از سال ': 'از مه ۲۰۲۱',
  'mula ': 'mula Mayo 2021', 'từ năm ': 'từ tháng 5 năm 2021',
};

function applyRules(v: string, changes: FactsChange[]): string {
  let s = v;
  for (const r of RULES) {
    // keep the case of the first letter ("Hơn 20 năm …" / "Over 20 years …" at a sentence start)
    for (const m of finditer(r.rx, s)) changes.push({ rule: r.id, old: m[0], new: matchCase(m[0], r.rep) });
    s = sub(r.rx, s, (m) => matchCase(m[0], r.rep));
  }
  return s;
}

function applyCount(s: string, changes: FactsChange[], subcounts: SubcountLeft[]): string {
  const ctx = (m: RegExpExecArray) => cpWindow(s, m, 45, 35).replaceAll('\n', ' ');
  return sub(COUNT, s, (m) => {
    if (!COUNT_CTX.test(cpWindow(s, m, 30, 40)) || COUNT_NOT.test(cpWindow(s, m, 0, 14)) || COUNT_NOT_BEFORE.test(cpBefore(s, m, 12))) return m[0];
    if (!COUNT_IS_PROJECTS.test(cpAfter(s, m, 24)) && SUBCOUNT.test(cpAfter(s, m, 30))) {
      subcounts.push({ match: m[0], context: ctx(m) });
      return m[0];
    }
    const r = m[0].replaceAll('700', '900').replaceAll('100', '900').replaceAll('۷۰۰', '۹۰۰').replaceAll('۱۰۰', '۹۰۰');
    changes.push({ rule: 'count:company-total', old: m[0], new: r, context: ctx(m) });
    return r;
  });
}

function may(g1: string): string {
  if (g1.startsWith('自')) return `${g1}2021年5月`;
  const lower = g1.toLowerCase();
  if (lower in MAY) {
    const key = g1.charCodeAt(0) < 0x80 ? lower : g1;
    return (MAY[key] ?? `${g1}2021`).replace('since', g1.trim());
  }
  return MAY[g1] ?? `${g1}2021`;
}

function applyFound(s: string, changes: FactsChange[]): string {
  for (const m of finditer(FOUND, s)) changes.push({ rule: 'founded:2020', old: m[0], new: may(m[1]) });
  const out = sub(FOUND, s, (m) => may(m[1]));
  return sub(re('自 ?2021年5月 ?年'), out, () => '自2021年5月');
}

/** Rules 1–4 on one value. `subcounts` collects company-looking counts that are left alone. */
export function rewrite(v: string, subcounts: SubcountLeft[]): { value: string; changes: FactsChange[] } {
  const changes: FactsChange[] = [];
  let s = applyRules(v, changes);
  s = applyCount(s, changes, subcounts);
  s = applyFound(s, changes);
  for (const m of finditer(LICNUM, s)) changes.push({ rule: 'licnum', old: m[0], new: '' });
  s = sub(LICNUM, s, () => '');
  return { value: s, changes };
}

export const SINCE_EN = re(`((?:serving|served|been [a-z ]{3,40}?|operating|in business|renovating|building)${B}[^.\\n<]{0,70}?)since (2005|2017|2018|2019)${B}`);
export const ABOUT_EN = re('(About Reno Stars(?:\\]\\([^)\\s]*\\)|</a>|\\*\\*)? ?[—–-] )20\\+ years,');
const YRS = '(?:2005|2017|2018|2019|۲۰۱۹|۲۰۱۸|۲۰۱۷|۲۰۰۵)';
export const SINCE_LOC: Record<string, ReadonlyArray<readonly [string, string]>> = {
  Es: [[`desde ${YRS}`, 'desde mayo de 2021']], Fr: [[`depuis ${YRS}`, 'depuis mai 2021']],
  Ru: [[`с ${YRS} года`, 'с мая 2021 года']],
  Ar: [[`منذ (?:عام )?${YRS}`, 'منذ مايو 2021']], Fa: [[`از سال ${YRS}`, 'از مه ۲۰۲۱']],
  Hi: [[`${YRS} से`, 'मई 2021 से']], Pa: [[`${YRS} ਤੋਂ`, 'ਮਈ 2021 ਤੋਂ']],
  Tl: [[`mula (?:noong )?${YRS}`, 'mula Mayo 2021']], Vi: [[`(?:kể )?từ năm ${YRS}`, 'từ tháng 5 năm 2021']],
  Zh: [[`自 ?${YRS} ?年`, '自 2021 年 5 月'], [`${YRS} ?年(起|以来)`, '2021 年 5 月\\1']],
  ZhHant: [[`自 ?${YRS} ?年`, '自 2021 年 5 月'], [`${YRS} ?年(起|以來)`, '2021 年 5 月\\1']],
  Ja: [[`${YRS} ?年(から|以来|より)`, '2021年5月\\1']], Ko: [[`${YRS}년부터`, '2021년 5월부터']],
};

/** English company "since 20xx" + About line — runs on every value (task 168 M1: localized bodies embed them). */
export function sinceEn(v: string): { value: string; changes: FactsChange[] } {
  const changes: FactsChange[] = [];
  let s = sub(SINCE_EN, v, (m) => {
    const r = `${m[1]}since May 2021`;
    changes.push({ rule: 'since:en', old: m[0], new: r });
    return r;
  });
  s = sub(ABOUT_EN, s, (m) => {
    const r = `${m[1]}${ABOUT.en},`;
    changes.push({ rule: 'about:en', old: m[0], new: r });
    return r;
  });
  return { value: s, changes };
}

/** Localized "since 20xx" — only on rows whose en text makes the company claim. */
export function sinceLoc(suffix: string, v: string): { value: string; changes: FactsChange[] } {
  const changes: FactsChange[] = [];
  let s = v;
  for (const [p, rep] of SINCE_LOC[suffix] ?? []) {
    const rx = re(p);
    for (const m of finditer(rx, s)) changes.push({ rule: `since:${suffix}`, old: m[0], new: subStr(rx, m[0], rep) });
    s = subStr(rx, s, rep);
  }
  return { value: s, changes };
}

export function suffixOf(key: string): string {
  return /(ZhHant|Es|Fr|Ru|Ar|Fa|Hi|Pa|Tl|Vi|Ja|Ko)$/.exec(key)?.[1] ?? '';
}

export function rowMakesSinceClaim(row: Record<string, unknown>, cols: readonly string[]): boolean {
  return cols.some((c) => {
    const v = row[c];
    return c.endsWith('_en') && typeof v === 'string' && (SINCE_EN.test(v) || ABOUT_EN.test(v));
  });
}

/** One plain column of a row: rules 1–4, then the since/About rules (zh follows en's company claim). */
export function rewriteColumn(col: string, v: string, companySince: boolean, subcounts: SubcountLeft[]) {
  const r = rewrite(v, subcounts);
  let { value } = r;
  const changes = [...r.changes];
  const add = (x: { value: string; changes: FactsChange[] }) => { value = x.value; changes.push(...x.changes); };
  if (col.endsWith('_zh')) value = applyLocalRules('Zh', value, changes);
  if (col.endsWith('_en')) add(sinceEn(value));
  else if (col.endsWith('_zh') && companySince) add(sinceLoc('Zh', value));
  if (!col.endsWith('_en')) add(sinceEn(value));
  return { value, changes };
}

/** One localizations key of a row. */
export function rewriteLocalization(key: string, v: string, companySince: boolean, subcounts: SubcountLeft[]) {
  const r = rewrite(v, subcounts);
  let { value } = r;
  const changes = [...r.changes];
  const suffix = suffixOf(key);
  value = applyLocalRules(suffix, value, changes);
  if (companySince && suffix) {
    const x = sinceLoc(suffix, value);
    value = x.value; changes.push(...x.changes);
  }
  const e = sinceEn(value);
  return { value: e.value, changes: [...changes, ...e.changes] };
}
