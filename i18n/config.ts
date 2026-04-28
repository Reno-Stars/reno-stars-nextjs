import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'zh', 'ja', 'ko', 'es', 'pa', 'tl', 'fa', 'vi'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localePrefix = 'always' as const;

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  pa: 'ਪੰਜਾਬੀ',
  tl: 'Tagalog',
  fa: 'فارسی',
  vi: 'Tiếng Việt',
};

/** OpenGraph locale codes (BCP 47 with region). Used for og:locale meta. */
export const ogLocaleMap: Record<Locale, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  ja: 'ja_JP',
  ko: 'ko_KR',
  es: 'es_ES',
  pa: 'pa_IN',
  tl: 'tl_PH',
  fa: 'fa_IR',
  vi: 'vi_VN',
};

/** Locales that render right-to-left. Used in <html dir="rtl"> and CSS layout. */
export const rtlLocales: ReadonlyArray<Locale> = ['fa'];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
});
