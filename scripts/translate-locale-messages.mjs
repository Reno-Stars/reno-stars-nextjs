#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Bulk-translate all messages/en/*.json + messages/en/guides/*.json into
 * a target locale via Google Translate gtx free endpoint.
 *
 * Usage:
 *   node scripts/translate-locale-messages.mjs ru ar hi fr
 *   node scripts/translate-locale-messages.mjs --dry-run ja      # report only
 *   node scripts/translate-locale-messages.mjs --all             # every non-en locale
 *
 * Idempotent at KEY level, not file level. Re-running only translates keys the
 * target is missing; keys it already has are never re-translated or clobbered,
 * so hand-corrected strings survive.
 *
 * 2026-07-15: this used to skip any file that already existed. Because EN gains
 * keys over time and the per-locale files had all been created once, those new
 * keys were NEVER backfilled — 1,577 keys had silently drifted across 11
 * locales, all served to readers as EN via getMessageFallback (i18n/request.ts).
 * File-level skipping cannot see key-level drift, so the check moved down a
 * level. tests/unit/i18n/message-parity.test.ts now fails if drift returns.
 *
 * Marker-protects {placeholders} so they survive translation.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const SRC = 'en';
const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const ALL = argv.includes('--all');
// Keep in sync with i18n/config.ts. gtx accepts 'zh-Hant'/'zh' directly and
// returns Traditional/Simplified respectively — verified, no mapping needed.
const ALL_LOCALES = ['zh', 'zh-Hant', 'ja', 'ko', 'es', 'pa', 'tl', 'fa', 'vi', 'ru', 'ar', 'hi', 'fr'];
const TARGETS = ALL ? ALL_LOCALES : argv.filter((a) => !a.startsWith('--'));
if (TARGETS.length === 0) {
  console.error('Usage: node translate-locale-messages.mjs [--dry-run] [--all] <locale> ...');
  process.exit(1);
}

const ROOT = path.resolve('messages');
const SRC_DIR = path.join(ROOT, SRC);

const GTX = 'https://translate.googleapis.com/translate_a/single';

async function gtx(text, target) {
  if (!text || !text.trim()) return text;
  const params = new URLSearchParams({ client: 'gtx', sl: 'en', tl: target, dt: 't', q: text });
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(`${GTX}?${params}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      return data[0].map(seg => seg[0]).filter(Boolean).join('');
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise(res => setTimeout(res, 1000 * (attempt + 1)));
    }
  }
}

/**
 * Replace every BALANCED {...} group with an opaque marker so gtx cannot touch it.
 *
 * Must be brace-depth aware. The original used /\{[^}]+\}/, which stops at the
 * FIRST '}' — so a nested ICU message like
 *     {count, plural, one {project} other {projects}}
 * protected only "{count, plural, one {project}" and left the rest exposed. gtx
 * then translated the ICU keywords themselves:
 *     {计数，复数，一个 {project} 其他 {projects}}   -> MALFORMED_ARGUMENT -> 500.
 * That is the bug behind PR #128 ("repair 126 machine-translated ICU
 * placeholders (prod 500s)") and the 23 stragglers found on 2026-07-15.
 *
 * Consequence worth knowing: a whole plural/select expression is now protected
 * as ONE unit, so its arms stay English rather than being corrupted. Valid and
 * correct, but untranslated — icuNeedingHuman() below reports those keys.
 */
function protect(text) {
  const map = new Map();
  let counter = 0;
  let out = '';
  let i = 0;

  while (i < text.length) {
    if (text[i] === '{') {
      let depth = 0;
      let j = i;
      for (; j < text.length; j++) {
        if (text[j] === '{') depth++;
        else if (text[j] === '}' && --depth === 0) break;
      }
      if (depth === 0 && j < text.length) {
        const tok = `XQXAA${counter}QY`;
        map.set(tok, text.slice(i, j + 1));
        counter++;
        out += tok;
        i = j + 1;
        continue;
      }
      // Unbalanced '{' — leave it alone rather than swallow the rest of the string.
    }
    out += text[i];
    i++;
  }
  return { out, map };
}

/** ICU plural/select survives protect() verbatim, i.e. still in English. Collected
 *  and reported at the end so a human can translate the arms deliberately. */
const needsHuman = [];
const hasIcuArms = (s) => typeof s === 'string' && /\{[^{}]*,\s*(plural|select|selectordinal)\s*,/.test(s);

function restore(text, map) {
  let out = text;
  for (const [tok, original] of map) {
    out = out.split(tok).join(original);
  }
  return out;
}

async function translateString(s, target) {
  if (!s || typeof s !== 'string') return s;
  // Skip empty / pure-whitespace / pure-numeric / locale-code-looking strings
  if (!s.trim()) return s;
  if (/^[\d.,$\-–\s]+$/.test(s)) return s;
  const { out, map } = protect(s);
  // Split very long content into sentence chunks to avoid 5KB limit
  if (out.length > 4500) {
    const parts = out.split(/(?<=[.!?。])\s+/);
    const translated = [];
    for (const p of parts) {
      translated.push(await gtx(p, target));
      await new Promise(r => setTimeout(r, 200));
    }
    return restore(translated.join(' '), map);
  }
  const translated = await gtx(out, target);
  return restore(translated, map);
}

async function translateValue(v, target) {
  if (typeof v === 'string') {
    const result = await translateString(v, target);
    await new Promise(r => setTimeout(r, 150));
    return result;
  }
  if (Array.isArray(v)) {
    const out = [];
    for (const item of v) out.push(await translateValue(item, target));
    return out;
  }
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      out[k] = await translateValue(val, target);
    }
    return out;
  }
  return v;
}

/** Leaf key paths. Arrays count as leaves — translateValue walks them itself. */
function leafPaths(node, prefix = '') {
  const out = [];
  for (const [k, v] of Object.entries(node ?? {})) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...leafPaths(v, p));
    else out.push(p);
  }
  return out;
}

const getAt = (obj, p) =>
  p.split('.').reduce((n, k) => (n && typeof n === 'object' ? n[k] : undefined), obj);

function setAt(obj, p, value) {
  const parts = p.split('.');
  const last = parts.pop();
  let node = obj;
  for (const k of parts) {
    if (!node[k] || typeof node[k] !== 'object') node[k] = {};
    node = node[k];
  }
  node[last] = value;
}

/** Rebuild `tr` following `en`'s key order so backfilled keys don't land in a
 *  jumbled order and produce noisy diffs. Keys only in `tr` are preserved. */
function orderLike(en, tr) {
  if (!en || typeof en !== 'object' || Array.isArray(en)) return tr;
  if (!tr || typeof tr !== 'object' || Array.isArray(tr)) return tr;
  const out = {};
  for (const k of Object.keys(en)) if (k in tr) out[k] = orderLike(en[k], tr[k]);
  for (const k of Object.keys(tr)) if (!(k in out)) out[k] = tr[k];
  return out;
}

async function translateFile(srcPath, targetPath, target) {
  const rel = path.relative(ROOT, targetPath);
  const src = JSON.parse(await fs.readFile(srcPath, 'utf8'));

  let existing = null;
  try { existing = JSON.parse(await fs.readFile(targetPath, 'utf8')); }
  catch { /* absent or unreadable — translate the whole file below */ }

  if (!existing) {
    if (DRY_RUN) { console.log(`    ${rel}: NEW (${leafPaths(src).length} keys)`); return leafPaths(src).length; }
    const translated = await translateValue(src, target);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, JSON.stringify(translated, null, 2) + '\n');
    console.log(`    wrote ${rel} (new)`);
    return leafPaths(src).length;
  }

  // File exists: fill ONLY the keys it lacks. Existing values are never
  // re-translated — hand corrections must survive a re-run.
  const missing = leafPaths(src).filter((p) => getAt(existing, p) === undefined);
  if (missing.length === 0) return 0;
  if (DRY_RUN) { console.log(`    ${rel}: ${missing.length} missing`); return missing.length; }

  for (const p of missing) {
    const value = getAt(src, p);
    if (hasIcuArms(value)) needsHuman.push(`${target} ${rel} ${p}`);
    setAt(existing, p, await translateValue(value, target));
  }
  await fs.writeFile(targetPath, JSON.stringify(orderLike(src, existing), null, 2) + '\n');
  console.log(`    filled ${rel} (+${missing.length})`);
  return missing.length;
}

async function listFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await listFiles(full));
    else if (e.isFile() && e.name.endsWith('.json')) out.push(full);
  }
  return out;
}

let grandTotal = 0;
for (const target of TARGETS) {
  console.log(`\n=== ${target} ===`);
  const files = await listFiles(SRC_DIR);
  let localeTotal = 0;
  for (const src of files) {
    const rel = path.relative(SRC_DIR, src);
    const dst = path.join(ROOT, target, rel);
    localeTotal += (await translateFile(src, dst, target)) ?? 0;
  }
  console.log(`    ${target}: ${localeTotal} key(s) ${DRY_RUN ? 'would be filled' : 'filled'}`);
  grandTotal += localeTotal;
}

console.log(`\n${DRY_RUN ? 'DRY RUN — ' : ''}${grandTotal} key(s) total across ${TARGETS.length} locale(s).`);

if (needsHuman.length) {
  console.log(
    `\n⚠  ${needsHuman.length} key(s) contain ICU plural/select arms. They were copied through\n` +
    `   VERBATIM (still English) rather than machine-translated — translating plural arms\n` +
    `   needs per-language plural rules that gtx does not apply, and getting it wrong\n` +
    `   produces the malformed-ICU 500s of PR #128. Translate these by hand:\n` +
    needsHuman.map((k) => `     ${k}`).join('\n'),
  );
}
if (!DRY_RUN && grandTotal > 0) {
  console.log('\nNow run: npx vitest run tests/unit/i18n/   (parity + ICU validity)');
}
