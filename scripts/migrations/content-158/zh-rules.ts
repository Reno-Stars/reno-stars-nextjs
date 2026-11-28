/**
 * zh-Hant conversion rules for the task-158 zh-Hant migration. Pure functions —
 * the OpenCC converter is injected (opencc-js cn→tw in the generator, a stub in tests).
 *
 * A SENTENCE (split on 。！？；!?;\n) is converted only when it contains a
 * Simplified-only character (SC_ONLY: OpenCC changes it AND it is not a valid
 * Traditional form, see DUAL). A sentence already in Traditional is left alone,
 * so valid forms (干擾, 系統, 了解, 台) are never re-converted. Inside a converted sentence:
 *  - OpenCC phrase conversion; FULL_DUAL characters keep the original;
 *  - place names keep the original (素里, 默里, 芬里 …);
 *  - glossary 復雜→複雜, 幹牆→乾牆, 台面→檯面;
 *  - a clause carrying WARRANTY wording keeps its original characters (waits for Ryan).
 */
import { re } from './pyre';

export type Opencc = (texts: string[]) => string[];

export const FULL_DUAL = new Set(Array.from('了台爲裏污岩伙占合才千云杯板斗'));
const DUAL_EXTRA = Array.from('干后里只面系制准布托范松冲谷回表卷余征凶咸胡姜郁御舍志朴卜丑克采向周夸几叶尸筑致症弦秋栗党沈涌游折扎冬划划蒙苏历借吁辟幸佣仆价');
/** 价 苏 历 are Simplified-only in practice on this site; 划 stays valid (划算). */
export const DUAL = new Set([...FULL_DUAL, ...DUAL_EXTRA].filter((c) => !'价苏历'.includes(c)));
export const PROTECT_NAMES = ['素里', '默里', '芬里', '公里', '鄰里', '邻里', '萬里'];
/** Task 164 (Captain): only WARRANTY wording keeps its characters; insurance clauses are converted. */
export const PROTECT_CLAUSE = re('保修|保固|质保|質保|保用|保养|保養');
/**
 * Task 172 Part B (Ryan 2026-11-27 「5.6 up to 3 years」): the four rows whose warranty clauses were left as
 * written. Their duration now changes to "up to 3 years" (facts-rules WARRANTY_DURATION), so their zh-Hant
 * text is converted like every other row — PROTECT_CLAUSE no longer applies to them.
 */
export const WARRANTY_ROWS: ReadonlySet<string> = new Set([
  'fbfe62bc-8887-44a0-a6a0-eef892a1e986', // blog 保修条款
  '59dc7aba-5dd9-4fc1-8a67-4167425e8abd', // faq 3 年工艺质保
  'cc1effef-49f0-417b-9751-b95c99636f68', // services 2 年施工质保
  '2657bf9d-b4cb-4fa4-8138-d67f223b98ef', // services 3 年施工质保
]);
const SENT = re('([。！？；!?;\\n])', 'g');
const CLAUSE = re('([，、,|·•：:（）()])', 'g');
export const GLOSSARY: ReadonlyArray<readonly [string, string]> = [['復雜', '複雜'], ['幹牆', '乾牆'], ['台面', '檯面']];

export type Residue = { index: number; original: string; converted: string };

export class ZhConverter {
  /** Simplified-only characters among the texts this converter was primed with. */
  readonly scOnly: Set<string>;

  constructor(private readonly opencc: Opencc, corpus: string) {
    const chars = [...new Set(Array.from(corpus).filter((c) => c >= '㐀' && c <= '鿿'))].sort();
    const conv = opencc(chars);
    this.scOnly = new Set(chars.filter((c, i) => conv[i] !== c && !DUAL.has(c)));
  }

  private hasSc(s: string): boolean {
    return Array.from(s).some((c) => this.scOnly.has(c));
  }

  private convertSentence(s: string, o: string, protect = true): { text: string; left: Residue[] } {
    const sc = Array.from(s);
    const oc = Array.from(o);
    const names = namesMask(sc);
    const out: string[] = [];
    const left: Residue[] = [];
    let pos = 0;
    for (const part of s.split(CLAUSE)) {
      const pc = Array.from(part);
      const prot = protect && PROTECT_CLAUSE.test(part);
      pc.forEach((a, j) => {
        const i = pos + j;
        const b = oc[i];
        if (a === b || FULL_DUAL.has(a) || names[i]) out.push(a);
        else if (prot) {
          out.push(a);
          if (this.scOnly.has(a)) left.push({ index: i, original: a, converted: b });
        } else out.push(b);
      });
      pos += pc.length;
    }
    return { text: applyGlossary(s, out.join('')), left };
  }

  /**
   * Convert many values; returns the converted texts and, per text, the warranty characters left as-is.
   * `protect[i] === false` converts text i's warranty clauses too (WARRANTY_ROWS).
   */
  convertMany(texts: string[], protect: readonly boolean[] = []): { texts: string[]; residues: Residue[][] } {
    const sents = texts.map((t) => t.split(SENT));
    const todo = sents.flat().filter((p) => this.hasSc(p));
    const conv = new Map<string, string>();
    if (todo.length) {
      const res = this.opencc(todo);
      todo.forEach((p, i) => conv.set(p, res[i]));
    }
    const outTexts: string[] = [];
    const residues: Residue[][] = [];
    for (const [ti, ps] of sents.entries()) {
      const out: string[] = [];
      const left: Residue[] = [];
      let base = 0;
      for (const p of ps) {
        const c = conv.get(p);
        if (c !== undefined && Array.from(c).length === Array.from(p).length) {
          const r = this.convertSentence(p, c, protect[ti] !== false);
          out.push(r.text);
          left.push(...r.left.map((x) => ({ ...x, index: base + x.index })));
        } else out.push(p);
        base += Array.from(p).length;
      }
      outTexts.push(out.join(''));
      residues.push(left);
    }
    return { texts: outTexts, residues };
  }

  /** First pass over all texts, then a second pass on any output still carrying a Simplified-only character. */
  convertWithSecondPass(texts: string[], protect: readonly boolean[] = []): { texts: string[]; residues: Residue[][] } {
    const { texts: conv, residues } = this.convertMany(texts, protect);
    conv.forEach((c, i) => {
      if (!this.hasSc(c)) return;
      const again = this.convertMany([c], [protect[i] !== false]);
      conv[i] = again.texts[0];
      residues[i] = again.residues[0];
    });
    return { texts: conv, residues };
  }
}

function namesMask(cps: string[]): boolean[] {
  const mask = cps.map(() => false);
  for (const n of PROTECT_NAMES) {
    const nc = Array.from(n);
    for (let i = 0; i + nc.length <= cps.length; i++) {
      if (nc.every((c, j) => cps[i + j] === c)) for (let j = 0; j < nc.length; j++) mask[i + j] = true;
    }
  }
  return mask;
}

function applyGlossary(original: string, converted: string): string {
  let res = converted;
  for (const [x, y] of GLOSSARY) {
    if (x !== '台面') res = res.replaceAll(x, y);
    else if (original.includes('台面') && !PROTECT_CLAUSE.test(original)) res = res.replaceAll('台面', '檯面');
  }
  return res;
}

/** `<field>_zh` column → its localizations key (`meta_description_zh` → `metaDescriptionZhHant`). */
export function zhHantKey(col: string): string {
  const [first, ...rest] = col.slice(0, -3).split('_');
  return first + rest.map((x) => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join('') + 'ZhHant';
}

