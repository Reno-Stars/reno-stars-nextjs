import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { locales, LOCALE_META } from '@/i18n/config';

// The brand is a proper noun. LOCALE_META.brandName is the source of truth for
// it, and it is set for exactly two locales — zh (聚星装修) and zh-Hant
// (聚星裝修), both owner-confirmed. Every other locale renders "Reno Stars".
//
// Machine translation does not know that. The gtx pass rendered the brand into
// FRENCH as "Étoiles de Réno" — literally "Stars of Reno" — across 13 keys in
// messages/fr/metadata.json, including the projectDetail and serviceLocation
// title templates. That shipped, and on 2026-08-26 /fr/projects/, /fr/design/
// and /fr/services/ were serving it as their live <title>.
//
// This guards the TRANSLATION failure specifically. Transliterations that some
// locales carry (hi रेनो स्टार्स, ja リノスターズ, ru Рино Старс) are a
// different thing — they spell the same name in another script rather than
// replacing it — and are a branding decision, not a bug, so they are not
// asserted here.

/**
 * Transliterations MT produced — the name respelled in another script.
 * Normalised to "Reno Stars" on 2026-08-26: the brand read three different
 * ways in Japanese (リノスター / リノスターズ / リノ スターズ), two in Russian
 * (Рено Старс / Рино Старс) and two in Korean, so it was not one brand at all.
 * LOCALE_META.brandName grants a localized brand to zh and zh-Hant only.
 *
 * The renovation NOUN shares a stem with these in several scripts
 * (リノベーション, 리노베이션, रेनोवेशन) and must never be caught by them —
 * every entry here is the full brand, never a stem.
 */
const TRANSLITERATED_BRAND = [
  'リノ スターズ', 'リノスターズ', 'リノ スター', 'リノスター',
  'रेनो स्टार्स', 'रेनो स्टार',
  'Рено Старс', 'Рино Старс',
  'رينو ستارز', 'رينو ستار',
  'رنو استارز',
  '리노 스타즈', '리노스타즈', '레노 스타스',
  'ਰੇਨੋ ਸਟਾਰਸ',
];

/** Meaning-translations of "Reno Stars" that MT has produced or would produce. */
const TRANSLATED_BRAND = [
  'Étoiles de Réno',
  'Etoiles de Réno',
  'Étoiles Réno',
  'Estrellas de Reno',
  'Estrelas de Reno',
  'Stelle di Reno',
  'Reno Sterne',
];

function jsonFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return jsonFiles(full);
    return full.endsWith('.json') ? [full] : [];
  });
}

describe('brand name is never machine-translated', () => {
  it('LOCALE_META still says only zh/zh-Hant carry a localized brand', () => {
    // If this changes, the rule below needs revisiting rather than silently
    // continuing to assert a policy that no longer holds.
    const localized = locales.filter((l) => LOCALE_META[l].brandName);
    expect([...localized].sort()).toEqual(['zh', 'zh-Hant']);
  });

  it.each(locales)('%s carries no translated or transliterated brand', (locale) => {
    const hits: string[] = [];
    for (const file of jsonFiles(path.join('messages', locale))) {
      const text = readFileSync(file, 'utf8');
      for (const bad of [...TRANSLATED_BRAND, ...TRANSLITERATED_BRAND]) {
        if (text.includes(bad)) hits.push(`${path.relative('messages', file)}: ${bad}`);
      }
    }
    expect(
      hits,
      `the brand is a proper noun — render it "Reno Stars", or the owner-confirmed ` +
        `LOCALE_META.brandName for zh/zh-Hant. Found: ${hits.join(', ')}`,
    ).toEqual([]);
  });
});
