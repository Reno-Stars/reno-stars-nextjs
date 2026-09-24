/**
 * Renovation-term glossary for machine-translated Chinese copy.
 *
 * gtx (and the LLM passes that followed it) render English trade vocabulary
 * word-by-word. The 2026-09-24 audit found, across the live zh / zh-Hant copy:
 *
 *   "one team, one contract"   → 一支球队           ("a sports team")
 *   BC Building Code           → BC Building 代码    ("source code")
 *   make-up air                → 化妆空气           ("cosmetics air")
 *   cosmetic refresh           → 化妆品更新         ("cosmetics update")
 *   $12,000 (CAD)              → 12,000 美元        (US dollars)
 *   vanity                     → 虚荣心 / 梳妆台     ("vainglory" / "dresser")
 *   rebate                     → 回扣               ("kickback")
 *   trades                     → 贸易               ("international trade")
 *   rough-in                   → 粗加工             ("rough machining")
 *   deck                       → 甲板               ("a ship's deck")
 *   painting                   → 绘画               ("fine-art painting")
 *   cabinet                    → 内阁               ("the Cabinet", government)
 *   countertop                 → 柜台               ("a shop counter")
 *
 * RULES (enforced by tests/unit/scripts/zh-glossary.test.ts):
 *   - Every rule is an EXACT multi-character phrase. No single-character rule:
 *     "画" or "元" as a substring rule would be reckless.
 *   - A term that has legitimate uses on this site is only ever fixed through
 *     a longer phrase. "代码" stays in 颜色代码 (paint colour code) and 区域代码
 *     (locale code); "柜台" stays in 浴室柜台盆, 点单柜台 and 许可证柜台;
 *     "修剪" stays in 修剪整齐的前花园; "化妆品" stays in 抗牙膏及化妆品.
 *   - Rules are ordered, most specific first, and no replacement contains any
 *     rule's source phrase — so applying the glossary twice equals applying it
 *     once (idempotent), which is what lets the SQL run as sequential UPDATEs.
 *
 * Deliberately NOT here (needs a human, see the PR): 化妆室/化妆间 for "powder
 * room" (common in Chinese-Canadian listings), 干墙 for drywall (understood
 * colloquially), and the bare brand name "Reno Stars", which BRAND_PATTERN
 * below handles OPT-IN only (see FixTextOptions.brand).
 */

export type ZhScript = 'zh' | 'zh-Hant';

/** [bad, good] — ordered, most specific first. */
export type GlossaryRule = readonly [bad: string, good: string];

const HANS: readonly GlossaryRule[] = [
  // ── brand: Traditional characters leaking into Simplified copy ──
  ['聚星裝修', '聚星装修'],

  // ── one team ──
  ['一支球队', '一个团队'],

  // ── make-up air (before 化妆品…) ──
  ['化妆空气', '补风'],

  // ── cosmetic (renovation) ≠ cosmetics ──
  ['化妆品翻新', '表面翻新'],
  ['化妆品更新', '表面更新'],
  ['化妆品刷新', '表面焕新'],
  ['化妆品级别', '外观层面'],
  ['化妆品交换', '表面更换'],

  // ── building code ──
  ['BC Building 代码', 'BC省建筑规范'],
  ['Building 代码', '建筑规范'],
  ['能源步骤代码', '能源阶梯规范'],
  ['能源步进代码', '能源阶梯规范'],
  ['能源阶梯代码', '能源阶梯规范'],
  ['步骤代码', '阶梯规范'],
  ['管道代码', '管道规范'],
  ['BC 代码', 'BC 规范'],
  ['BC代码', 'BC规范'],
  ['有代码支持，非吸力', '符合规范的固定安装，非吸盘式'],
  ['一套完整的代码支持', '一套完整、符合规范的'],
  ['完整代码升级', '全面按规范升级'],
  ['完全代码分离', '完全按规范分隔'],
  ['成为代码触发器', '触发规范要求'],
  ['最昂贵的代码工作', '最昂贵的规范相关工程'],
  ['按代码', '按规范'],
  ['代码要求', '规范要求'],
  ['代码审查', '规范审查'],
  ['代码升级', '规范升级'],
  ['最低代码', '最低规范'],
  ['当前代码', '现行规范'],
  ['且代码可接受', '且符合规范'],
  ['关键代码项', '关键规范项'],
  ['许可证和代码', '许可证和规范'],
  ['保险和代码', '保险和规范'],

  // ── currency: every price on the site is CAD ──
  ['每一美元', '每一分钱'],
  ['美元数字', '具体金额'],
  ['美元金额', '金额'],
  ['美元范围', '预算范围'],
  ['美元', '加元'],
  ['美金', '加元'],

  // ── vanity ──
  ['虚荣心', '浴室柜'],
  ['虚荣', '浴室柜'],
  ['浴室梳妆台', '浴室柜'],
  ['滚轮梳妆台', '轮椅可用的浴室柜'],
  ['浴缸、厕所和梳妆台', '浴缸、马桶和浴室柜'],
  ['梳妆台', '浴室柜'],

  // ── rebate ──
  ['回扣', '补贴'],

  // ── trades ──
  ['贸易许可证', '各工种许可证'],
  ['贸易', '工种'],

  // ── rough-in ──
  ['测量粗加工', '测量坑距'], // toilet rough-in distance
  ['粗加工', '预埋'],

  // ── deck ──
  ['甲板', '木平台'],

  // ── painting / trim ──
  ['绘画、修剪、', '油漆、收边、'],
  ['油漆、修剪和精加工', '油漆、收边和收尾'],
  ['绘画', '油漆'],

  // ── cabinet ──
  ['内阁重铺', '橱柜翻新'],
  ['内阁', '橱柜'],

  // ── countertop (柜台 alone is a shop/permit counter — phrase-only) ──
  ['石英柜台', '石英台面'],
  ['柜台面积', '台面面积'],
  ['柜台平方英尺', '台面平方英尺'],
  ['柜台必须取下来', '台面必须取下来'],
  ['浴室柜+柜台', '浴室柜+台面'],
  ['橱柜+柜台', '橱柜+台面'],
  ['水槽/柜台', '水槽/台面'],
  ['降低柜台', '降低台面'],
  ['低矮柜台', '低矮台面'],
  ['较低的柜台', '较低的台面'],
  ['柜台高度', '台面高度'],
  ['柜台边缘', '台面边缘'],
  ['柜台交换', '台面更换'],
  ['柜台更换', '台面更换'],
  ['柜台插座', '台面插座'],
  ['柜台之间', '台面之间'],
  ['柜台下方', '台面下方'],
  ['至柜台', '至台面'],
  ['新柜台', '新台面'],
  ['着陆柜台', '预留台面'],
  ['柜台岛', '中岛台面'],
  ['岛上或柜台上', '中岛或台面上'],
  ['从柜台到', '从台面到'],
  ['移过柜台', '移过台面'],
  ['在柜台中', '在台面中'],

  // ── grab bar / bar pulls ──
  ['入口处设有酒吧', '入口处设有扶手'],
  ['酒吧拉手', '条形拉手'],

  // ── misc gtx calques ──
  // "(English)" on a link label: every /en/ link in Chinese copy is repointed
  // to this locale (applyLocaleLinks), so the label would be false.
  ['（英文）</a>', '</a>'],
  ['厨房整容', '厨房翻新'],
  ['持有执照的商人', '持牌技工'],
  ['更换化妆品柜', '原位更换橱柜'],
  ['橱柜里诺', '橱柜翻新'],
];

const HANT: readonly GlossaryRule[] = [
  ['聚星装修', '聚星裝修'],

  ['一支球隊', '一個團隊'],

  ['化妝空氣', '補風'],

  ['化妝品翻新', '表面翻新'],
  ['化妝品更新', '表面更新'],
  ['化妝品刷新', '表面煥新'],
  ['化妝品裝修', '表面裝修'],

  ['BC Building 代碼', 'BC省建築規範'],
  ['Building 代碼', '建築規範'],
  ['能源步驟代碼', '能源階梯規範'],
  ['管道代碼', '管道規範'],
  ['BC 代碼', 'BC 規範'],
  ['BC代碼', 'BC規範'],
  ['按代碼', '按規範'],
  ['代碼要求', '規範要求'],
  ['代碼驚喜', '規範意外'],
  ['代碼合規性', '規範合規性'],
  ['目前代碼', '現行規範'],

  ['每一美元', '每一分錢'],
  ['美元範圍', '預算範圍'],
  ['美元', '加元'],
  ['美金', '加元'],

  ['虛榮心', '浴室櫃'],
  ['虛榮', '浴室櫃'],
  ['梳妝台', '浴室櫃'],
  ['梳妆台', '浴室櫃'],

  ['回扣', '補貼'],

  ['貿易', '工種'],

  ['測量粗加工', '測量坑距'],
  ['粗加工', '預埋'],

  ['甲板', '木平台'],

  ['繪畫、修剪、', '油漆、收邊、'],
  ['繪畫', '油漆'],
  ['绘画', '油漆'],

  ['內閣', '櫥櫃'],

  ['石櫃檯', '石材檯面'],
  ['櫃檯層級', '檯面等級'],
  ['櫃檯翻新', '檯面翻新'],
  ['層壓板櫃檯', '層壓板檯面'],
  ['安裝櫃檯', '安裝檯面'],
  ['櫃檯高度', '檯面高度'],
  ['島上或櫃檯上', '中島或檯面上'],
  ['從櫃檯到', '從檯面到'],
  ['移過櫃檯', '移過檯面'],
  ['在櫃檯中', '在檯面中'],

  ['酒吧拉手', '條形拉手'],

  ['櫥櫃裡諾', '櫥櫃翻新'],
  ['持有執照的商人', '持牌技工'],
  ['更換化妝品櫃', '原位更換櫥櫃'],
  ['（英文）</a>', '</a>'],
];

export const ZH_GLOSSARY: Readonly<Record<ZhScript, readonly GlossaryRule[]>> = {
  zh: HANS,
  'zh-Hant': HANT,
};

/** Localised brand name per script. */
export const BRAND: Readonly<Record<ZhScript, string>> = { zh: '聚星装修', 'zh-Hant': '聚星裝修' };

/**
 * "Reno Stars" standing inside Chinese prose, e.g. 了解 Reno Stars 如何…,
 * 免費報價Reno Stars。, <h3>Reno Stars 能在…
 *
 * Matches only when Chinese sits on at least one side and the other side is
 * Chinese, CJK punctuation or a tag/markdown boundary. Never matches:
 *   - an already-paired name: 聚星装修 Reno Stars / 聚星裝修（Reno Stars） /
 *     Reno Stars（聚星装修）
 *   - English runs: "Reno Stars Richmond", "from Reno Stars items"
 *   - JSON-LD / attribute values: "name": "Reno Stars"
 *
 * The same source is valid in JavaScript and PostgreSQL ARE (both support
 * lookbehind and \uXXXX), so the migration and the repo fix agree by
 * construction.
 */
const CJK = '\\u4e00-\\u9fff';
const PUNCT = '，。、：；！？“”《》';
export const BRAND_PATTERN =
  `(?<!聚星装修 ?|聚星裝修 ?|[（(])` +
  `(?:(?<=[${CJK}${PUNCT}]) ?Reno Stars ?(?=[${CJK}${PUNCT}<*]|$)` +
  `|(?:^|(?<=[>*"#\\n])) ?Reno Stars ?(?=[${CJK}]))` +
  `(?! ?[（(]?聚星)`;

export interface ApplyResult {
  text: string;
  hits: number;
}

function countOccurrences(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

/** Apply the ordered glossary. Pure. */
export function applyGlossary(text: string, script: ZhScript): ApplyResult {
  let out = text;
  let hits = 0;
  for (const [bad, good] of ZH_GLOSSARY[script]) {
    const n = countOccurrences(out, bad);
    if (n > 0) {
      out = out.split(bad).join(good);
      hits += n;
    }
  }
  return { text: out, hits };
}

/** Replace a bare "Reno Stars" in Chinese prose with the localised brand. Pure. */
export function applyBrand(text: string, script: ZhScript): ApplyResult {
  const re = new RegExp(BRAND_PATTERN, 'g');
  let hits = 0;
  const out = text.replace(re, () => {
    hits += 1;
    return BRAND[script];
  });
  return { text: out, hits };
}

/** Link to the English page from Chinese copy → same page in this locale. */
export function applyLocaleLinks(text: string, script: ZhScript): ApplyResult {
  let out = text;
  let hits = 0;
  for (const prefix of ['](/en/', 'href="/en/']) {
    const n = countOccurrences(out, prefix);
    if (n > 0) {
      out = out.split(prefix).join(prefix.replace('/en/', `/${script}/`));
      hits += n;
    }
  }
  return { text: out, hits };
}

export interface FixTextOptions {
  /**
   * Also replace a bare "Reno Stars" in Chinese prose (applyBrand). OFF by
   * default: the owner rule (2026-07-09, brandDisplay() in lib/company-config.ts)
   * keeps "Reno Stars" searchable next to 聚星装修, so dropping it is an owner
   * decision. The 聚星裝修 → 聚星装修 script correction is a glossary rule and
   * always applies.
   */
  brand?: boolean;
}

/** Everything the repo fix applies to one string: glossary, optional brand, locale links. Pure. */
export function fixText(text: string, script: ZhScript, opts: FixTextOptions = {}): ApplyResult {
  const a = applyGlossary(text, script);
  const b = opts.brand ? applyBrand(a.text, script) : { text: a.text, hits: 0 };
  const c = applyLocaleLinks(b.text, script);
  return { text: c.text, hits: a.hits + b.hits + c.hits };
}

// ─────────────────────────── SQL generation ───────────────────────────

/** Quote a value as a standard-conforming SQL string literal. */
export function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Where a piece of Chinese copy lives. `column` for a plain *_zh column;
 * `jsonKey` for a localizations->>'<field>ZhHant' value.
 */
export type ZhTarget =
  | { table: string; column: string; script: ZhScript }
  | { table: string; jsonKey: string; script: ZhScript };

/** SQL expression reading the target's current text. */
export function targetExpr(t: ZhTarget): string {
  return 'column' in t ? t.column : `(localizations->>${sqlLiteral(t.jsonKey)})`;
}

/** `SET …` clause writing `valueSql` back into the target. */
function setClause(t: ZhTarget, valueSql: string): string {
  if ('column' in t) return `${t.column} = ${valueSql}`;
  return `localizations = jsonb_set(localizations, ARRAY[${sqlLiteral(t.jsonKey)}], to_jsonb(${valueSql}))`;
}

function targetLabel(t: ZhTarget): string {
  return 'column' in t ? `${t.table}.${t.column}` : `${t.table}.localizations->>${t.jsonKey}`;
}

/** One UPDATE replacing one exact phrase in one target. Touches only rows containing it. */
export function buildReplaceUpdate(t: ZhTarget, bad: string, good: string): string {
  const cur = targetExpr(t);
  return (
    `UPDATE ${t.table} SET ${setClause(t, `replace(${cur}, ${sqlLiteral(bad)}, ${sqlLiteral(good)})`)}` +
    ` WHERE strpos(${cur}, ${sqlLiteral(bad)}) > 0;`
  );
}

/** One UPDATE applying the brand pattern to one target. */
export function buildBrandUpdate(t: ZhTarget): string {
  const cur = targetExpr(t);
  const expr = `regexp_replace(${cur}, ${sqlLiteral(BRAND_PATTERN)}, ${sqlLiteral(BRAND[t.script])}, 'g')`;
  return `UPDATE ${t.table} SET ${setClause(t, expr)} WHERE ${cur} ~ ${sqlLiteral(BRAND_PATTERN)};`;
}

export interface GlossaryHit {
  target: ZhTarget;
  bad: string;
  good: string;
}

/** True when replacing into `good` could create an occurrence of `bad` (overlap or containment). */
function canCreate(good: string, bad: string): boolean {
  if (bad.includes(good)) return true;
  for (let n = 1; n < Math.min(good.length, bad.length); n += 1) {
    if (bad.startsWith(good.slice(-n)) || bad.endsWith(good.slice(0, n))) return true;
  }
  return false;
}

/**
 * The hit rules plus every LATER rule a hit rule's replacement could create
 * (内阁→橱柜 creates 橱柜里诺), to a fixpoint. The audit only sees phrases that
 * exist before the migration; without this a chained phrase would survive.
 */
export function withChainedRules(script: ZhScript, hitBads: ReadonlySet<string>): GlossaryRule[] {
  const rules = ZH_GLOSSARY[script];
  const picked = new Set(hitBads);
  let grew = true;
  while (grew) {
    grew = false;
    rules.forEach(([bad], j) => {
      if (picked.has(bad)) return;
      const creator = rules.slice(0, j).some(([b, g]) => picked.has(b) && canCreate(g, bad));
      if (creator) {
        picked.add(bad);
        grew = true;
      }
    });
  }
  return rules.filter(([bad]) => picked.has(bad));
}

/**
 * Statements for the given (target, rule) hits, in glossary order per target,
 * so each target sees the same sequence applyGlossary() would apply.
 */
export function buildGlossaryStatements(hits: readonly GlossaryHit[]): string[] {
  const byTarget = new Map<string, GlossaryHit[]>();
  for (const h of hits) {
    const key = targetLabel(h.target);
    byTarget.set(key, [...(byTarget.get(key) ?? []), h]);
  }
  const out: string[] = [];
  for (const [label, group] of [...byTarget.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const { target } = group[0];
    const rules = withChainedRules(target.script, new Set(group.map((h) => h.bad)));
    out.push(`-- ${label}`);
    for (const [bad, good] of rules) out.push(buildReplaceUpdate(target, bad, good));
  }
  return out;
}
