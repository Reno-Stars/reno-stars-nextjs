/**
 * Residual company-claim self-check for the company-facts report (task 170 M-B).
 *
 * After the rules run, every value of the scanned tables — new values AND values no
 * statement touches, every language — is searched for company claims the rules
 * should have caught: "since 2005/2017/2018/2019", "20+ years" in any language,
 * 700+, company 100+. Documented NON-company uses are excluded by pattern id and
 * counted. The target is 0 residuals outside the skip list; residuals in skipped
 * rows (Test-A-rendered / tied) are listed separately.
 */
import { B, re, finditer, cpWindow } from './pyre';

const YRS = '(?:2005|2017|2018|2019|۲۰۱۹|۲۰۱۸|۲۰۱۷|۲۰۰۵)';

/** Company-claim detectors (deliberately broader than the rules). */
export const DETECTORS: ReadonlyArray<{ id: string; rx: RegExp }> = [
  { id: 'since:en', rx: re(`${B}since ${YRS}${B}`, 'i') },
  { id: 'since:es', rx: re(`desde ${YRS}`, 'i') },
  { id: 'since:fr', rx: re(`depuis ${YRS}`, 'i') },
  { id: 'since:ru', rx: re(`${B}с ${YRS}`, 'i') },
  { id: 'since:ar', rx: re(`منذ (?:عام )?${YRS}`) },
  { id: 'since:fa', rx: re(`از سال ${YRS}`) },
  { id: 'since:hi', rx: re(`${YRS} से`) },
  { id: 'since:pa', rx: re(`${YRS} ਤੋਂ`) },
  { id: 'since:tl', rx: re(`mula (?:noong )?${YRS}`, 'i') },
  { id: 'since:vi', rx: re(`từ năm ${YRS}`, 'i') },
  { id: 'since:zh', rx: re(`自 ?${YRS} ?年|${YRS} ?年(?:起|以来|以來)`) },
  { id: 'since:ja', rx: re(`${YRS} ?年(?:から|以来|より)`) },
  { id: 'since:ko', rx: re(`${YRS}년부터`) },
  { id: 'years20:en', rx: re('20\\+ years|(?:over|more than) 20 years', 'i') },
  { id: 'years20:zh-ja', rx: re('20 ?(?:\\+|多) ?年|超[过過] ?20 ?年|20 ?年以上') },
  { id: 'years20:ko', rx: re('20년 이상|20\\+ ?년') },
  { id: 'years20:es', rx: re('más de 20 años|20\\+ años', 'i') },
  { id: 'years20:fr', rx: re('plus de 20 ans|20\\+ ans', 'i') },
  { id: 'years20:ru', rx: re('более 20 лет|20\\+ лет', 'i') },
  { id: 'years20:ar', rx: re('أكثر من 20 عام|\\+20 عام|20\\+ عام') },
  { id: 'years20:fa', rx: re('بیش از (?:۲۰|20) سال|(?:۲۰|20)\\+ سال') },
  { id: 'years20:hi', rx: re('20\\+ (?:वर्ष|साल)') },
  { id: 'years20:pa', rx: re('20\\+ ਸਾਲ') },
  { id: 'years20:tl', rx: re('20\\+ (?:na )?taon', 'i') },
  { id: 'years20:vi', rx: re('(?:hơn|trên) 20 năm|20\\+ năm', 'i') },
  // not a price or part of a larger number ($700+, $64,700+)
  { id: 'count:700', rx: re(`(?<![\\d,.$])(?:700 ?\\+|700 ?多|(?:more than|over) 700${B})|۷۰۰`, 'i') },
  {
    id: 'count:100',
    rx: re('(?:100 ?\\+|100 ?多|(?:more than|over|plus de|más de|более|أكثر من|hơn) 100|بیش از (?:۱۰۰|100)|100개 이상|100件以上|100 से अधिक)(?=[^.\\n]{0,25}(?:project|proyecto|projet|проект|مشروع|پروژه|परियोजन|ਪ੍ਰੋਜੈਕਟ|proyekto|dự án|项目|項目|プロジェクト|프로젝트|renovat|翻新|改造|装修|裝修))', 'i'),
  },
];

/**
 * Documented NON-company uses. Each is checked against a window of ±90 characters
 * around the hit (plus, where given, the row id). Keep these narrow: an exclusion
 * that is too broad hides exactly the misses this check exists to find.
 */
type Exclusion = { id: string; why: string; rowId?: string; detectors: RegExp; rx: RegExp };
const ANY = re('[\\s\\S]');
const YEARS20 = re('^years20:');
export const EXCLUSIONS: readonly Exclusion[] = [
  // --- not about the company: lifespans / ages of things (task 168 + 170 review, every locale of the post) ---
  { id: 'lifespan:cabinet-order', rowId: '2c6568be', detectors: YEARS20, rx: ANY, why: 'design order "Cabinets (fixed for 20+ years)" — how long a finish stays, not company age' },
  { id: 'lifespan:tile', rowId: '91161717', detectors: YEARS20, rx: ANY, why: 'tile durability table / "natural stone: 20+ years if sealed"' },
  { id: 'lifespan:hood-box', rowId: '91c8a60d', detectors: YEARS20, rx: ANY, why: 'custom hood boxes "last 20+ years"' },
  { id: 'age:kitchen', rowId: 'f700f3d9', detectors: YEARS20, rx: ANY, why: '"a kitchen that has been used for 20+ years"' },
  { id: 'age:vanity-tub', rowId: 'b9f542b6', detectors: YEARS20, rx: ANY, why: '"the vanity and tub are more than 20 years old"' },
  { id: 'age:gas-furnace', rowId: '90fc0ada', detectors: YEARS20, rx: ANY, why: '"replace a 20+ year gas furnace" (heat-pump service copy)' },
  { id: 'age:poly-b-pipe', rowId: '7d997023', detectors: YEARS20, rx: ANY, why: 'Poly-B pipe: "after 20+ years the chlorine…"' },
  { id: 'age:building', rowId: 'eb4bc78e', detectors: YEARS20, rx: re('楼龄|樓齡'), why: 'apartment buildings "20年以上楼龄" (building age)' },
  { id: 'appliance:cfm', detectors: re('^count:700$'), rx: re('CFM|кубических футов|立方英尺'), why: 'gas ranges "700+ CFM"' },
  { id: 'heritage-homes', rowId: '3020b3b8', detectors: re('^count:100$'), rx: re('遗产|遺產|heritage', 'i'), why: '"100+ heritage-designated homes" in Queen\'s Park' },
  { id: 'paint-trend', rowId: '876f3fa9', detectors: re('^since:'), rx: ANY, why: 'paint colours "have shown sustained popularity since 2019"' },
  { id: 'condo-towers', rowId: 'c24c8d8a', detectors: re('^since:'), rx: ANY, why: '"new condo towers have transformed this area since 2018"' },
  // --- company sub-counts: left unchanged on purpose, Captain is asking Ryan ---
  { id: 'subcount:strata-condo-bathrooms', rowId: '842db1b6', detectors: re('^count:100$'), rx: ANY, why: '"100+ strata renovations" / "100+ condo bathrooms" — do not change (Captain 170, asking Ryan)' },
  { id: 'subcount:kitchens-700', rowId: 'fbfe62bc', detectors: re('^count:700$'), rx: re('kitchen', 'i'), why: '"completed over 700 kitchen renovations" — a sub-count like 842db1b6; left for Ryan (flagged in 170 result)' },
];

export type ScannedValue = { table: string; id: string; field: string; value: string; state: 'new' | 'untouched' | 'skipped' };
export type Residual = { table: string; id: string; field: string; state: ScannedValue['state']; detector: string; match: string; context: string };

export function scanResiduals(values: ScannedValue[]) {
  const residuals: Residual[] = [];
  const excluded: Record<string, number> = {};
  const excludedHits: Array<{ exclusion: string; table: string; id: string; field: string; match: string }> = [];
  for (const v of values) {
    for (const d of DETECTORS) {
      for (const m of finditer(d.rx, v.value)) {
        const context = cpWindow(v.value, m, 90, 90).replace(/\s+/g, ' ');
        const ex = EXCLUSIONS.find((e) => (!e.rowId || v.id.startsWith(e.rowId)) && e.detectors.test(d.id) && e.rx.test(context));
        if (ex) {
          excluded[ex.id] = (excluded[ex.id] ?? 0) + 1;
          excludedHits.push({ exclusion: ex.id, table: v.table, id: v.id, field: v.field, match: m[0] });
          continue;
        }
        residuals.push({ table: v.table, id: v.id, field: v.field, state: v.state, detector: d.id, match: m[0], context });
      }
    }
  }
  const outside = residuals.filter((r) => r.state !== 'skipped');
  const inSkip = residuals.filter((r) => r.state === 'skipped');
  return {
    residualsOutsideSkipList: outside.length,
    residualsInSkipList: inSkip.length,
    excludedByPattern: Object.fromEntries(Object.entries(excluded).sort()),
    exclusions: EXCLUSIONS.map((e) => ({ id: e.id, why: e.why, rowId: e.rowId ?? null })),
    residuals: outside,
    skipListResiduals: inSkip,
    excludedHits,
  };
}
