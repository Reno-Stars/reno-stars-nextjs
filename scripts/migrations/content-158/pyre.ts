/**
 * Small helpers that make JS regex / string handling behave like the Python
 * re + str code the task-158 migrations were first generated with, so the
 * TypeScript generators reproduce the same statements:
 *  - Python's `\b` is Unicode-aware; JS's is ASCII-only → `B` below;
 *  - Python indexes strings by code point; JS by UTF-16 unit → `cp*` helpers;
 *  - `re.sub` with a callback → `sub()`.
 */

const W = '[\\p{L}\\p{N}_]';
/** Python 3 `\b` (Unicode word boundary) for use inside a `u`-flag RegExp source. */
export const B = `(?:(?<=${W})(?!${W})|(?<!${W})(?=${W}))`;

/** Python `re.compile(pattern)` with Unicode semantics; pass `i` for re.I. */
export function re(source: string, flags = ''): RegExp {
  return new RegExp(source, `u${flags}`);
}

function globalOf(rx: RegExp): RegExp {
  return new RegExp(rx.source, rx.flags.includes('g') ? rx.flags : `${rx.flags}g`);
}

/** Python `rx.finditer(s)`. */
export function finditer(rx: RegExp, s: string): RegExpExecArray[] {
  const g = globalOf(rx);
  const out: RegExpExecArray[] = [];
  let m: RegExpExecArray | null;
  while ((m = g.exec(s)) !== null) {
    out.push(m);
    if (m[0].length === 0) g.lastIndex++;
  }
  return out;
}

/** Python `rx.sub(fn, s)`; `m.index` is the UTF-16 offset in `s`. */
export function sub(rx: RegExp, s: string, fn: (m: RegExpExecArray) => string): string {
  let out = '';
  let last = 0;
  for (const m of finditer(rx, s)) {
    out += s.slice(last, m.index) + fn(m);
    last = m.index + m[0].length;
  }
  return out + s.slice(last);
}

/** Python `rx.sub(repl, s)` where repl may use `\1`-style group references. */
export function subStr(rx: RegExp, s: string, repl: string): string {
  return sub(rx, s, (m) => repl.replace(/\\(\d)/g, (_, d: string) => m[Number(d)] ?? ''));
}

/** Python `len(s)`. */
export function cpLen(s: string): number {
  return Array.from(s).length;
}

/** Python `s[a:b]` (code points; negative start clamps to 0 like max(0, …)). */
export function cpSlice(s: string, a: number, b?: number): string {
  return Array.from(s).slice(Math.max(0, a), b).join('');
}

/** Code-point index of a UTF-16 offset. */
export function cpIndex(s: string, utf16: number): number {
  return cpLen(s.slice(0, utf16));
}

/** Python `s[max(0, m.start() - before):m.end() + after]` for a JS match `m` on `s`. */
export function cpWindow(s: string, m: RegExpExecArray, before: number, after: number): string {
  const start = cpIndex(s, m.index);
  const end = start + cpLen(m[0]);
  return cpSlice(s, start - before, end + after);
}

/** Python `s[m.end():m.end() + n]`. */
export function cpAfter(s: string, m: RegExpExecArray, n: number): string {
  const end = cpIndex(s, m.index) + cpLen(m[0]);
  return cpSlice(s, end, end + n);
}

/** Python `s[max(0, m.start() - n):m.start()]`. */
export function cpBefore(s: string, m: RegExpExecArray, n: number): string {
  const start = cpIndex(s, m.index);
  return cpSlice(s, start - n, start);
}

/** Python `str.strip()` (whitespace set close enough for page text). */
function isPySpace(ch: string): boolean {
  const c = ch.charCodeAt(0);
  return /\s/u.test(ch) || (c >= 0x1c && c <= 0x1f) || c === 0x85;
}
export function pyStrip(s: string): string {
  let a = 0;
  let b = s.length;
  while (a < b && isPySpace(s[a])) a++;
  while (b > a && isPySpace(s[b - 1])) b--;
  return s.slice(a, b);
}
