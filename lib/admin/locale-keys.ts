import { locales, LOCALE_META, mapMeta, type Locale } from '@/i18n/config';

/**
 * Map a locale code to the camelCase suffix used as the per-locale field key.
 *
 * en/zh use 'En'/'Zh' but live in dedicated `*_en` / `*_zh` DB columns with
 * form fields `titleEn` / `titleZh`. The other 12 locales live in the
 * `localizations` jsonb under `${fieldName}${Suffix}` keys (e.g. `titleJa`,
 * `descriptionZhHant`).
 *
 * SSOT is LOCALE_META.dbSuffix in i18n/config.ts — edit suffixes there.
 */
export const LOCALE_TO_SUFFIX: Record<Locale, string> = mapMeta((m) => m.dbSuffix);

/** All 14 locale codes, EN first. */
export const ADMIN_LOCALES = locales;

/**
 * True for locales that map to a dedicated `*_en` / `*_zh` DB column, as
 * opposed to living in the `localizations` jsonb.
 *
 * Named `hasDedicatedColumn`, not `isNativeLocale`: `LOCALE_META.nativeSupport`
 * means something completely different (a team member speaks the language), and
 * two senses of "native" one import apart is how a wrong call site gets written.
 */
export function hasDedicatedColumn(loc: Locale): boolean {
  return LOCALE_META[loc].dbColumn;
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
      if (hasDedicatedColumn(loc)) continue;
      out.push(fieldKey(name, loc));
    }
  }
  return out;
}

export const localeSuffix = (loc: Locale): string => LOCALE_TO_SUFFIX[loc];
