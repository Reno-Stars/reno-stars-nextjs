import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { locales, defaultLocale } from '@/i18n/config';
import { guideSections } from '@/i18n/guideSections';

// The `guides` namespace is split into messages/<locale>/guides/<section>.json
// and merged at request time by i18n/request.ts, which iterates the
// `guideSections` registry — NOT the directory. A file that exists on disk but
// is absent from the registry is therefore never loaded, and any page calling
// useTranslations('guides.<section>') throws MISSING_MESSAGE and returns 500.
//
// Why this test exists (2026-08-05): two guide pages shipped with their message
// files (kitchenCabinet, permit) in all 14 locales but no registry entry, and
// /en/guides/vancouver-renovation-permits/ 500'd in production in every locale.
// The existing i18n suites could not catch it: message-parity and message-icu
// both iterate `guideSections`, so an unregistered file is invisible to them —
// they were green while the page was down. The guard has to compare the registry
// against the directory, in both directions.
const GUIDES_DIR = (locale: string) => join(process.cwd(), 'messages', locale, 'guides');

function sectionFilesOnDisk(locale: string): string[] {
  const dir = GUIDES_DIR(locale);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
}

describe('guide section registry ↔ message files', () => {
  it('every EN guide message file is registered in guideSections', () => {
    const onDisk = sectionFilesOnDisk(defaultLocale);
    const registered = [...guideSections];
    const orphaned = onDisk.filter((s) => !registered.includes(s as (typeof guideSections)[number]));
    expect(
      orphaned,
      `messages/${defaultLocale}/guides/{${orphaned.join(',')}}.json exist but are not in ` +
        `i18n/guideSections.ts — the loader will never merge them and any page using ` +
        `useTranslations('guides.<section>') will 500 with MISSING_MESSAGE.`,
    ).toEqual([]);
  });

  it('every registered section has an EN message file', () => {
    const onDisk = sectionFilesOnDisk(defaultLocale);
    const missing = guideSections.filter((s) => !onDisk.includes(s));
    expect(
      missing,
      `guideSections lists {${missing.join(',')}} but messages/${defaultLocale}/guides/ has no ` +
        `such file — the dynamic import in i18n/request.ts will reject at runtime.`,
    ).toEqual([]);
  });

  // A section registered but missing in one locale takes that locale down, not
  // just that string — the import rejects before any message is merged.
  it.each(locales.filter((l) => l !== defaultLocale))(
    '%s has a file for every registered section',
    (locale) => {
      const onDisk = sectionFilesOnDisk(locale);
      const missing = guideSections.filter((s) => !onDisk.includes(s));
      expect(
        missing,
        `messages/${locale}/guides/ is missing {${missing.join(',')}}.json. Run: ` +
          `node scripts/translate-locale-messages.mjs ${locale}`,
      ).toEqual([]);
    },
  );
});
