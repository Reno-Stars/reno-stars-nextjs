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
 * The supported languages, named and joined in the reader's own language.
 * e.g. for a Punjabi reader: "ਅੰਗਰੇਜ਼ੀ, ਚੀਨੀ (ਸਰਲ) ਅਤੇ ਚੀਨੀ (ਰਵਾਇਤੀ)".
 *
 * Not "Mandarin and Cantonese": CLDR has no distinct name for `cmn`, so it
 * renders as plain "Chinese" in all 14 locales and pairs awkwardly with
 * "Cantonese". The audience for this list does not speak Chinese, so the
 * spoken-variety distinction is detail they cannot act on anyway.
 */
export function nativeSupportLanguageList(readerLocale: Locale): string {
  const supported = supportedLocales();
  try {
    const names = new Intl.DisplayNames([readerLocale], {
      type: 'language',
      languageDisplay: 'dialect',
    });
    const list = new Intl.ListFormat(readerLocale, {
      style: 'long',
      type: 'conjunction',
    });
    return list.format(
      supported.map((loc) => names.of(displayTag(loc)) ?? LOCALE_META[loc].name),
    );
  } catch {
    // An unusual runtime ICU build must not 500 the contact page.
    return supported.map((loc) => LOCALE_META[loc].name).join(', ');
  }
}

/** The reader's own language, named in their own language: 'pa' → 'ਪੰਜਾਬੀ'. */
export function localeSelfName(readerLocale: Locale): string {
  try {
    const names = new Intl.DisplayNames([readerLocale], { type: 'language' });
    return names.of(readerLocale) ?? LOCALE_META[readerLocale].name;
  } catch {
    return LOCALE_META[readerLocale].name;
  }
}
