import { locales, LOCALE_META, hasNativeSupport, type Locale } from '@/i18n/config';

/**
 * Language names rendered in the READER's language, from CLDR via Intl —
 * never hand-translated. A Punjabi visitor sees Punjabi names; an Arabic
 * visitor gets Arabic names joined with و.
 *
 * Both functions derive their content from LOCALE_META.nativeSupport, so
 * hiring someone and flipping one boolean updates the sentence in all 14
 * locales with no translation work.
 */

/**
 * CLDR needs a script subtag to say "Simplified" — bare 'zh' renders as plain
 * "Chinese", which is indistinguishable from 'zh-Hant' in the same sentence.
 */
const DISPLAY_TAG: Partial<Record<Locale, string>> = { zh: 'zh-Hans' };

const displayTag = (loc: Locale): string => DISPLAY_TAG[loc] ?? loc;

/** Locales a team member speaks, in `locales` order. */
function supportedLocales(): Locale[] {
  return locales.filter(hasNativeSupport);
}

/**
 * Separators `Intl.ListFormat` can use to join list items, across the
 * locales this list is rendered in: ASCII comma, Arabic comma, ideographic
 * (full-width) comma. If a single generated name contains one of these, it
 * is indistinguishable from a boundary between two list items.
 */
const LIST_SEPARATORS = /[,،、]/;

/** Renders `supported` as language names in the reader's language via CLDR. */
function displayNamesFor(
  readerLocale: Locale,
  supported: Locale[],
  languageDisplay: 'dialect' | 'standard',
): string[] {
  const names = new Intl.DisplayNames([readerLocale], { type: 'language', languageDisplay });
  return supported.map((loc) => names.of(displayTag(loc)) ?? LOCALE_META[loc]?.name ?? loc);
}

/**
 * The supported languages' names in the reader's language, resolving CLDR's
 * `languageDisplay` mode per locale.
 *
 * 'dialect' is the default because it reads better almost everywhere.
 * Russian is the case that motivated the fallback: in 'dialect' mode CLDR
 * names zh-Hans/zh-Hant as "китайский, упрощенное письмо" / "китайский,
 * традиционное письмо" — each name CONTAINS a comma. Once Intl.ListFormat
 * joins those with commas too, the reader sees what looks like five list
 * items instead of three. 'standard' mode avoids this (CLDR uses parentheses
 * there), but reads worse elsewhere, so we only fall back for the locale(s)
 * that actually trip it — a name containing the separator is indistinguishable
 * from another list item once joined.
 *
 * If 'standard' is still ambiguous (or identical to 'dialect', as it is for ko,
 * pa and vi), we drop to the endonyms from LOCALE_META rather than ship a list
 * whose item count is wrong.
 *
 * Exported (rather than kept private) so tests can assert the separator-free
 * invariant directly on the array, instead of trying to parse list items back
 * out of the joined, locale-formatted sentence.
 */
export function resolveNativeSupportNames(readerLocale: Locale): string[] {
  const supported = supportedLocales();
  const ambiguous = (list: string[]) => list.some((name) => LIST_SEPARATORS.test(name));

  let names = displayNamesFor(readerLocale, supported, 'dialect');
  if (ambiguous(names)) {
    names = displayNamesFor(readerLocale, supported, 'standard');
  }
  // 'standard' is not guaranteed to fix it: for ko, pa and vi CLDR already
  // returns the identical string in both modes, and a future ICU could embed a
  // separator in 'standard' too. An unchecked swap would ship a list where three
  // languages read as five. Endonyms are hand-authored and separator-free, so
  // they are the safe last resort — a worse-reading name beats a false count.
  if (ambiguous(names)) {
    names = supported.map((loc) => LOCALE_META[loc]?.name ?? loc);
  }
  return names;
}

/**
 * The supported languages, named and joined in the reader's own language.
 * e.g. for a Punjabi reader: "ਅੰਗਰੇਜ਼ੀ, ਚੀਨੀ (ਸਰਲ) ਅਤੇ ਚੀਨੀ (ਰਵਾਇਤੀ)".
 *
 * Not "Mandarin and Cantonese": CLDR has no distinct name for `cmn`, so it
 * renders as plain "Chinese" in all 14 locales and pairs awkwardly with
 * "Cantonese". The audience for this list does not speak Chinese, so the
 * spoken-variety distinction is detail they cannot act on anyway.
 */
export function nativeSupportLanguageList(readerLocale: Locale): string {
  try {
    const names = resolveNativeSupportNames(readerLocale);
    const list = new Intl.ListFormat(readerLocale, {
      style: 'long',
      type: 'conjunction',
    });
    return list.format(names);
  } catch {
    // An unusual runtime ICU build must not 500 the contact page.
    return supportedLocales().map((loc) => LOCALE_META[loc]?.name ?? loc).join(', ');
  }
}

/** The reader's own language, named in their own language: 'pa' → 'ਪੰਜਾਬੀ'. */
export function localeSelfName(readerLocale: Locale): string {
  try {
    const names = new Intl.DisplayNames([readerLocale], { type: 'language' });
    return names.of(readerLocale) ?? LOCALE_META[readerLocale]?.name ?? readerLocale;
  } catch {
    return LOCALE_META[readerLocale]?.name ?? readerLocale;
  }
}
