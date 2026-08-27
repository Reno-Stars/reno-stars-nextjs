import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { locales, defaultLocale } from '@/i18n/config';

// Some values inside the message catalogs are NOT prose — they are lookup keys
// that code feeds back into `t()`. Translating them breaks the lookup silently.
//
// This happened: messages/<locale>/siteVisit.json carries a `severity` field
// per checklist item, and SiteVisitChecklist does
//
//     severityLabel={item.severity ? t(`ui.${item.severity}`) : undefined}
//
// The machine-translation pass rendered the VALUES into each language —
// "blocker" -> 阻挡者, "high" -> 高的 — so the lookup became
// `siteVisit.ui.阻挡者`, missed, and every non-English visitor to
// /site-visit-checklist/ saw the raw key path printed mid-sentence. 13 locales,
// 88 values, live and unnoticed.
//
// message-parity.test.ts cannot catch this: it compares KEY paths, and the keys
// were all present. The damage was in the values.
//
// So: these field names must be byte-identical to EN in every locale.

/** Field names whose VALUES are code identifiers, never prose. */
const ENUM_FIELDS = ['severity'] as const;

/** Catalogs that carry them. */
const FILES = ['siteVisit'] as const;

type Json = Record<string, unknown>;

/** Every (dotted path, value) pair whose final segment is an enum field. */
function enumEntries(node: unknown, path: string[] = []): [string, unknown][] {
  if (Array.isArray(node)) {
    return node.flatMap((v, i) => enumEntries(v, [...path, String(i)]));
  }
  if (node && typeof node === 'object') {
    return Object.entries(node as Json).flatMap(([k, v]) =>
      (ENUM_FIELDS as readonly string[]).includes(k)
        ? [[[...path, k].join('.'), v] as [string, unknown]]
        : enumEntries(v, [...path, k]),
    );
  }
  return [];
}

const read = (locale: string, file: string): Json =>
  JSON.parse(readFileSync(`messages/${locale}/${file}.json`, 'utf8'));

describe('enum values are never translated', () => {
  it.each(FILES)('%s.json — EN actually contains enum fields to guard', (file) => {
    // Without this, a rename of `severity` would make every check below pass
    // by finding nothing, which is the failure mode this test exists to stop.
    const entries = enumEntries(read(defaultLocale, file));
    expect(entries.length).toBeGreaterThan(0);
    for (const [, value] of entries) {
      expect(typeof value).toBe('string');
      expect(value as string).toMatch(/^[a-z][A-Za-z0-9_]*$/);
    }
  });

  const OTHERS = locales.filter((l) => l !== defaultLocale);

  it.each(OTHERS.flatMap((l) => FILES.map((f) => [l, f] as const)))(
    '%s/%s.json keeps EN enum values verbatim',
    (locale, file) => {
      const en = new Map(enumEntries(read(defaultLocale, file)));
      const mine = new Map(enumEntries(read(locale, file)));

      const translated = [...en.entries()]
        .filter(([p, v]) => mine.has(p) && mine.get(p) !== v)
        .map(([p, v]) => `${p}: expected ${JSON.stringify(v)}, found ${JSON.stringify(mine.get(p))}`);

      expect(
        translated,
        `${locale}/${file}.json has translated values that are code lookup keys. ` +
          `Restore the EN spelling — the UI builds t(\`ui.\${severity}\`) from them, ` +
          `so a translated value renders a raw key path to the visitor.`,
      ).toEqual([]);
    },
  );
});
