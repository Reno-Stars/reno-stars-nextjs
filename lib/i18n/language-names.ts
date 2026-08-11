import { locales, LOCALE_META, hasNativeSupport, type Locale } from '@/i18n/config';

/**
 * Language names rendered in the READER's language, from CLDR via Intl —
 * never hand-translated. A Punjabi visitor sees Punjabi names; an Arabic
 * visitor gets Arabic names joined with و.
 *
 * Both functions derive their content from LOCALE_META.nativeSupport, so
 * hiring someone and flipping one boolean updates the sentence in all 14
 * locales with no translation work. DISPLAY_TAG / DISPLAY_TAG_OVERRIDE below
 * only change which BCP 47 tag is looked up per supported locale — the SET of
 * supported locales itself always comes from nativeSupport, never from these
 * maps.
 */

/**
 * CLDR needs a script subtag to say "Simplified" — bare 'zh' renders as plain
 * "Chinese", which is indistinguishable from 'zh-Hant' in the same sentence.
 */
const DISPLAY_TAG: Partial<Record<Locale, string>> = { zh: 'zh-Hans' };

/**
 * Per-READER-locale overrides of DISPLAY_TAG, for the rare reader locale
 * where CLDR's script-variant naming (zh-Hans/zh-Hant) is broken in BOTH
 * `languageDisplay` modes and a different tag is the only fix. Keyed by
 * reader locale, not by the supported locale being named — every reader
 * locale not listed here still gets the DISPLAY_TAG defaults above.
 *
 * ru: zh-Hans/zh-Hant fail for Russian readers in both modes:
 *   - 'dialect' mode embeds a comma IN the name ("китайский, упрощенное
 *     письмо"), which Intl.ListFormat then joins with more commas — three
 *     languages read as five. (This is the bug that motivated the
 *     dialect→standard fallback below in the first place.)
 *   - 'standard' mode drops the comma but produces "китайский (упрощенная) и
 *     китайский (традиционная)" — упрощенная/традиционная are FEMININE
 *     adjective endings (agreeing with an implied, absent feminine
 *     «письменность») sitting against the MASCULINE noun «китайский». A
 *     Russian reader sees a grammatical agreement error.
 * Spoken-language tags sidestep both failure modes: cmn → "китайский" (plain
 * noun, no comma) and yue → "кантонский" (a distinct noun, not an adjective
 * agreeing with anything). This is a ru-only override, not a global switch to
 * cmn/yue, because CLDR renders cmn as plain "Chinese" in most locales, which
 * pairs awkwardly with "Cantonese" in English — see nativeSupportLanguageList
 * below. Do NOT simplify this override back to zh-Hans/zh-Hant for ru: that
 * silently reintroduces one of the two failure modes above.
 */
const DISPLAY_TAG_OVERRIDE: Partial<Record<Locale, Partial<Record<Locale, string>>>> = {
  ru: { zh: 'cmn', 'zh-Hant': 'yue' },
};

const displayTag = (readerLocale: Locale, loc: Locale): string =>
  DISPLAY_TAG_OVERRIDE[readerLocale]?.[loc] ?? DISPLAY_TAG[loc] ?? loc;

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
  return supported.map(
    (loc) => names.of(displayTag(readerLocale, loc)) ?? LOCALE_META[loc]?.name ?? loc,
  );
}

/**
 * The supported languages' names in the reader's language, resolving CLDR's
 * `languageDisplay` mode per locale.
 *
 * 'dialect' is the default because it reads better almost everywhere.
 * Russian's zh-Hans/zh-Hant names are what motivated this fallback existing at
 * all: in 'dialect' mode CLDR named them "китайский, упрощенное письмо" /
 * "китайский, традиционное письмо" — each name CONTAINS a comma. Once
 * Intl.ListFormat joins those with commas too, the reader sees what looks
 * like five list items instead of three. 'standard' mode avoided the comma
 * (CLDR uses parentheses there) but reads worse elsewhere, so this only fell
 * back for the locale(s) that actually tripped it. Russian itself no longer
 * reaches this fallback: DISPLAY_TAG_OVERRIDE above swaps its display tags to
 * cmn/yue, whose 'dialect' names have neither problem. The dialect→standard→
 * endonym machinery below stays general-purpose for whichever locale trips it
 * next — a name containing the separator is indistinguishable from another
 * list item once joined, regardless of which locale produced it.
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
 * renders as plain "Chinese" in most locales and pairs awkwardly with
 * "Cantonese". The audience for this list does not speak Chinese, so the
 * spoken-variety distinction is detail they cannot act on anyway. `ru` is the
 * one deliberate exception — see DISPLAY_TAG_OVERRIDE above for why cmn/yue
 * is the correct choice there specifically, not a precedent for using it
 * elsewhere.
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
