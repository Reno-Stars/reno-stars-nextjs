import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { locales, defaultLocale } from '@/i18n/config';
import { namespaces } from '@/i18n/namespaces';
import { guideSections } from '@/i18n/guideSections';

// EN is the source of truth for keys; every other locale must carry the same set.
//
// Why this test exists (2026-07-15): 1,577 keys had silently drifted across 11
// locales. Nothing was broken and nothing was logged loudly — i18n/request.ts
// deliberately falls back to the EN string for a missing key (a hard error once
// crashed the all-locale prerender), so the only symptom was ja/ko/es/... readers
// quietly being served English. The backfill script was idempotent at FILE level
// ("skip, exists"), which cannot see key-level drift, so keys added to EN after a
// locale's file was first created were never filled.
//
// A silent gap needs a loud test. If this fails, run:
//     node scripts/translate-locale-messages.mjs --dry-run --all   # see the damage
//     node scripts/translate-locale-messages.mjs --all             # fill it
// It is key-level idempotent: existing translations are never re-translated or
// clobbered, so hand-corrected strings survive a re-run.

/** Leaf key paths. Arrays are leaves — a translated array is filled wholesale. */
function leafPaths(node: unknown, prefix = ''): string[] {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return prefix ? [prefix] : [];
  return Object.entries(node as Record<string, unknown>).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === 'object' && !Array.isArray(v) ? leafPaths(v, path) : [path];
  });
}

const read = (locale: string, rel: string): unknown => {
  const file = `messages/${locale}/${rel}.json`;
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
};

const RELS = [...namespaces, ...guideSections.map((g) => `guides/${g}`)];
const OTHER_LOCALES = locales.filter((l) => l !== defaultLocale);

describe('message parity — every locale carries every EN key', () => {
  it.each(OTHER_LOCALES)('%s has no missing keys', (locale) => {
    const missing: string[] = [];

    for (const rel of RELS) {
      const en = read(defaultLocale, rel);
      if (!en) continue;

      const translated = read(locale, rel);
      if (!translated) {
        missing.push(`${rel}: ENTIRE FILE MISSING`);
        continue;
      }

      const have = new Set(leafPaths(translated));
      for (const key of leafPaths(en)) {
        if (!have.has(key)) missing.push(`${rel}: ${key}`);
      }
    }

    expect(missing, `${locale} is missing ${missing.length} key(s):\n  ${missing.slice(0, 20).join('\n  ')}`).toEqual([]);
  });
});

describe('message parity — structural sanity', () => {
  it('every declared namespace has an EN file', () => {
    const absent = namespaces.filter((ns) => !existsSync(`messages/${defaultLocale}/${ns}.json`));
    expect(absent, `declared in i18n/namespaces.ts but no EN file: ${absent.join(', ')}`).toEqual([]);
  });

  it('every declared guide section has an EN file', () => {
    const absent = guideSections.filter((g) => !existsSync(`messages/${defaultLocale}/guides/${g}.json`));
    expect(absent, `declared in i18n/guideSections.ts but no EN file: ${absent.join(', ')}`).toEqual([]);
  });

  it('no locale ships a namespace file that EN does not have', () => {
    // The reverse drift: a stale file for a namespace EN has since dropped.
    const orphans: string[] = [];
    for (const locale of OTHER_LOCALES) {
      for (const rel of RELS) {
        if (existsSync(`messages/${locale}/${rel}.json`) && !existsSync(`messages/${defaultLocale}/${rel}.json`)) {
          orphans.push(`${locale}/${rel}`);
        }
      }
    }
    expect(orphans).toEqual([]);
  });
});
