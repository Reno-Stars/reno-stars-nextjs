import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { parse, TYPE, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';
import { locales, defaultLocale } from '@/i18n/config';
import { namespaces } from '@/i18n/namespaces';
import { guideSections } from '@/i18n/guideSections';

// Every message must COMPILE as ICU, and must take the same arguments as its EN
// source. Both halves matter and neither is cosmetic.
//
// Why (2026-07-15): the bulk translator sends strings to Google Translate, which
// happily translates ICU *keywords*, not just prose:
//     EN  {count, plural, one {project} other {projects}}
//     zh  {计数，复数，一个 {project} 其他 {projects}}     <- MALFORMED_ARGUMENT
// i18n/request.ts rethrows every non-MISSING_MESSAGE intl error, so a malformed
// message is a 500, not a fallback. PR #128 ("repair 126 machine-translated ICU
// placeholders (prod 500s)") already fixed one wave of this; 23 survived and
// were found by this test's first run.
//
// Translation also silently rewrites ARGUMENTS, which compiles fine and is
// therefore worse — it ships wrong content:
//     areas.trustStripReviews  ja/ko: {rating} became {count}
//         -> rendered the review count as the star rating ("77★").
//     metadata.serviceLocation.title  ko: "{service} in {area}" -> "{area}의 {area}"
//         -> every Korean service-location title lost its service name.
// Hence the argument-set assertion, not just a parse check.

/** Argument names an ICU message consumes, including nested plural/select arms. */
function argsOf(elements: MessageFormatElement[], into = new Set<string>()): Set<string> {
  for (const el of elements) {
    if (
      el.type === TYPE.argument ||
      el.type === TYPE.number ||
      el.type === TYPE.date ||
      el.type === TYPE.time
    ) {
      into.add(el.value);
    } else if (el.type === TYPE.select || el.type === TYPE.plural) {
      into.add(el.value);
      for (const option of Object.values(el.options)) argsOf(option.value, into);
    } else if (el.type === TYPE.tag) {
      argsOf(el.children, into);
    }
  }
  return into;
}

const read = (locale: string, rel: string): unknown => {
  const file = `messages/${locale}/${rel}.json`;
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
};

function stringLeaves(node: unknown, prefix = '', into: Array<[string, string]> = []): Array<[string, string]> {
  if (typeof node === 'string') { into.push([prefix, node]); return into; }
  if (!node || typeof node !== 'object') return into;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    stringLeaves(v, prefix ? `${prefix}.${k}` : k, into);
  }
  return into;
}

const RELS = [...namespaces, ...guideSections.map((g) => `guides/${g}`)];

describe('ICU validity — every message compiles', () => {
  it.each(locales)('%s has no malformed ICU', (locale) => {
    const broken: string[] = [];
    for (const rel of RELS) {
      const messages = read(locale, rel);
      if (!messages) continue;
      for (const [key, value] of stringLeaves(messages)) {
        try {
          parse(value);
        } catch (e) {
          broken.push(`${rel}: ${key} — ${(e as Error).message.split('\n')[0]}`);
        }
      }
    }
    expect(broken, `${locale} has ${broken.length} malformed message(s):\n  ${broken.join('\n  ')}`).toEqual([]);
  });
});

describe('ICU arguments match EN', () => {
  it.each(locales.filter((l) => l !== defaultLocale))('%s takes the same arguments as en', (locale) => {
    const mismatches: string[] = [];

    for (const rel of RELS) {
      const en = read(defaultLocale, rel);
      const translated = read(locale, rel);
      if (!en || !translated) continue;

      const theirs = new Map(stringLeaves(translated));
      for (const [key, enValue] of stringLeaves(en)) {
        const value = theirs.get(key);
        if (value === undefined) continue; // parity is message-parity.test.ts's job

        let expected: Set<string>;
        let actual: Set<string>;
        try {
          expected = argsOf(parse(enValue));
          actual = argsOf(parse(value));
        } catch {
          continue; // malformed — the compile test above owns that failure
        }

        const missing = [...expected].filter((a) => !actual.has(a));
        const extra = [...actual].filter((a) => !expected.has(a));
        if (missing.length || extra.length) {
          mismatches.push(
            `${rel}: ${key} — expected {${[...expected].join(',')}} got {${[...actual].join(',')}}`,
          );
        }
      }
    }

    expect(mismatches, `${locale} has ${mismatches.length} argument mismatch(es):\n  ${mismatches.join('\n  ')}`).toEqual([]);
  });
});
