import { locales, type Locale } from '@/i18n/config';

/**
 * Map a locale code to the camelCase suffix used as the per-locale field key.
 *
 * en/zh use no suffix here because they live in dedicated `*_en` / `*_zh`
 * DB columns and the corresponding form fields are `titleEn` / `titleZh`.
 * The other 12 locales live in the `localizations` jsonb under
 * `${fieldName}${Suffix}` keys (e.g. `titleJa`, `descriptionZhHant`).
 */
const LOCALE_TO_SUFFIX: Record<Locale, string> = {
  en: 'En',
  zh: 'Zh',
  'zh-Hant': 'ZhHant',
  ja: 'Ja',
  ko: 'Ko',
  es: 'Es',
  pa: 'Pa',
  tl: 'Tl',
  fa: 'Fa',
  vi: 'Vi',
  ru: 'Ru',
  ar: 'Ar',
  hi: 'Hi',
  fr: 'Fr',
};

/** All 14 locale codes, EN first. */
export const ADMIN_LOCALES = locales;

/** True for locales that map to a dedicated `*_en` / `*_zh` DB column. */
export function isNativeLocale(loc: Locale): boolean {
  return loc === 'en' || loc === 'zh';
}

/** Form field key for `${fieldName}` × `${locale}`, e.g. ('title','ja') → 'titleJa'. */
export function fieldKey(fieldName: string, locale: Locale): string {
  return `${fieldName}${LOCALE_TO_SUFFIX[locale]}`;
}

/**
 * Pick the localizations jsonb keys (i.e. all locales except en/zh) for
 * a list of field names. Used by the form provider to know which keys
 * to serialise into the `localizations` hidden input on submit.
 */
export function localizationKeys(fieldNames: string[]): string[] {
  const out: string[] = [];
  for (const name of fieldNames) {
    for (const loc of locales) {
      if (isNativeLocale(loc)) continue;
      out.push(fieldKey(name, loc));
    }
  }
  return out;
}

export const localeSuffix = (loc: Locale): string => LOCALE_TO_SUFFIX[loc];
