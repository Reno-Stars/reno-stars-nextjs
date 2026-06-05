import { defineRouting } from 'next-intl/routing';

// 'zh' is Simplified Chinese (mainland / overseas Mandarin readers).
// 'zh-Hant' is Traditional Chinese (HK / TW readers — different script,
// some vocabulary differences). Two distinct user groups.
//
// 2026-05-01 expansion: ru/ar/hi/fr added for Metro Vancouver demographics —
// Russian (West Van, Burnaby, North Van), Arabic (Burnaby, Coquitlam),
// Hindi (Surrey, Delta — distinct from Punjabi, different script), and
// French (federal-employee bilingual market + Quebec transplants).
//
// ALL_LOCALES is the full CATALOG — it defines the `Locale` type and the
// per-locale data maps (localeNames/ogLocaleMap/rtlLocales below). Content for
// every locale here still lives in the DB + `messages/`. It is the union of
// what the site CAN serve, not what it currently DOES.
export const ALL_LOCALES = ['en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pa', 'tl', 'fa', 'vi', 'ru', 'ar', 'hi', 'fr'] as const;
export type Locale = (typeof ALL_LOCALES)[number];

// ACTIVE locales — the ONLY ones the site builds, routes, sitemaps, hreflangs,
// and shows in the language switcher. Everything that loops `locales` (routing
// in proxy.ts, sitemap.ts, hreflang in lib/utils.ts, on-demand revalidation,
// the public LocaleSwitcher) follows this list automatically.
//
// 2026-06-05: temporarily reduced to English + Chinese (Simplified +
// Traditional) to collapse the ISR cache surface (~13k non-EN pages → the
// dominant ISR-Write cost). The other 11 locales' content is UNTOUCHED in the
// DB/messages — re-enable any of them by moving its code back into this array.
// Inactive-locale URLs 307-redirect to the English equivalent (see proxy.ts),
// so already-indexed long-tail URLs keep their equity for re-enabling.
export const locales: readonly Locale[] = ['en', 'zh', 'zh-Hant'];

// Locales present in the catalog but NOT currently served. Used by proxy.ts to
// 307-redirect their URLs to /en/... instead of 404-ing.
export const INACTIVE_LOCALES: readonly Locale[] = ALL_LOCALES.filter((l) => !locales.includes(l));

export const defaultLocale: Locale = 'en';

/**
 * Locales that get prerendered at build time. Other locales work via
 * on-demand ISR (default `dynamicParams: true`) — the first request to
 * /ja/, /ko/, etc. generates and caches the page for the revalidate
 * window. Cuts Vercel ISR write count by ~3-4× across the static-route
 * surface (was 14× per route for marginal traffic locales).
 *
 * en + zh + zh-Hant chosen because:
 * - en: primary search market (BC + Metro Vancouver)
 * - zh + zh-Hant: 70%+ of bilingual traffic per GA4
 * - everything else: <2% combined session share, served on-demand
 */
export const PRERENDERED_LOCALES = ['en', 'zh', 'zh-Hant'] as const satisfies readonly Locale[];

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
