import { defineRouting } from 'next-intl/routing';

// 'zh' is Simplified Chinese (mainland / overseas Mandarin readers).
// 'zh-Hant' is Traditional Chinese (HK / TW readers — different script,
// some vocabulary differences). Two distinct user groups.
//
// 2026-05-01 expansion: ru/ar/hi/fr added for Metro Vancouver demographics —
// Russian (West Van, Burnaby, North Van), Arabic (Burnaby, Coquitlam),
// Hindi (Surrey, Delta — distinct from Punjabi, different script), and
// French (federal-employee bilingual market + Quebec transplants).
export const locales = ['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pa', 'tl', 'fa', 'vi', 'ru', 'ar', 'hi', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localePrefix = 'always' as const;

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '简体中文',
  'zh-Hant': '繁體中文',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  pa: 'ਪੰਜਾਬੀ',
  tl: 'Tagalog',
  fa: 'فارسی',
  vi: 'Tiếng Việt',
  ru: 'Русский',
  ar: 'العربية',
  hi: 'हिन्दी',
  fr: 'Français',
};

/** OpenGraph locale codes (BCP 47 with region). Used for og:locale meta. */
export const ogLocaleMap: Record<Locale, string> = {
  en: 'en_US',
  zh: 'zh_CN',
  'zh-Hant': 'zh_TW',
  ja: 'ja_JP',
  ko: 'ko_KR',
  es: 'es_ES',
  pa: 'pa_IN',
  tl: 'tl_PH',
  fa: 'fa_IR',
  vi: 'vi_VN',
  ru: 'ru_RU',
  ar: 'ar_AE',
  hi: 'hi_IN',
  fr: 'fr_CA',
};

/** Locales that render right-to-left. Used in <html dir="rtl"> and CSS layout. */
export const rtlLocales: ReadonlyArray<Locale> = ['fa', 'ar'];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
});
