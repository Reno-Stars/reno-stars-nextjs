#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Bulk-translate all messages/en/*.json + messages/en/guides/*.json into
 * a target locale via Google Translate gtx free endpoint.
 *
 * Usage:
 *   node scripts/translate-locale-messages.mjs ru ar hi fr
 *
 * Skips files that already exist for the target locale (idempotent).
 * Marker-protects {placeholders} so they survive translation.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const SRC = 'en';
const TARGETS = process.argv.slice(2);
if (TARGETS.length === 0) {
  console.error('Usage: node translate-locale-messages.mjs <locale> [<locale> ...]');
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

// {area} → MARKER_AREA so gtx doesn't translate the placeholder
function protect(text) {
  const map = new Map();
  let counter = 0;
  const out = text.replace(/\{[^}]+\}/g, (m) => {
    const tok = `XQXAA${counter}QY`;
    map.set(tok, m);
    counter++;
    return tok;
  });
  return { out, map };
}

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

async function translateFile(srcPath, targetPath, target) {
  try { await fs.access(targetPath); console.log(`    skip ${path.relative(ROOT, targetPath)} (exists)`); return; }
  catch { /* not exists, proceed */ }
  const raw = await fs.readFile(srcPath, 'utf8');
  const data = JSON.parse(raw);
  const translated = await translateValue(data, target);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, JSON.stringify(translated, null, 2) + '\n');
  console.log(`    wrote ${path.relative(ROOT, targetPath)}`);
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

for (const target of TARGETS) {
  console.log(`\n=== ${target} ===`);
  const files = await listFiles(SRC_DIR);
  for (const src of files) {
    const rel = path.relative(SRC_DIR, src);
    const dst = path.join(ROOT, target, rel);
    await translateFile(src, dst, target);
  }
}

console.log('\nDone.');
