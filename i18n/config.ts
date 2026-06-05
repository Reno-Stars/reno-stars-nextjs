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

/**
 * Locales that keep ISR caching. EVERY OTHER locale renders DYNAMICALLY (SSR per
 * request, no ISR cache write) — see `app/[locale]/layout.tsx`.
 *
 * Why: the ~13k non-EN ISR pages are too large to stay warm in cache, so the
 * long-tail locales were constantly evicted and re-generated on crawl → the
 * dominant ISR-Write cost (continuous baseline + full re-gen on every deploy).
 * Per GSC (28d), these 4 locales own ~86.5% of organic clicks; the other 10
 * (ja/es/pa/tl/fa/vi/ru/ar/hi/fr) together get ~13% — fr alone got 2,393
 * impressions for 1 click. Those go dynamic: crawlers still get full SSR HTML
 * (SEO-neutral) but generate ZERO ISR writes. NOTE: dynamic ≠ build-time work —
 * dynamic pages render at request time, so this does NOT affect build time
 * (these locales already lazy-generated, never prerendered).
 */
export const CACHED_LOCALES = ['en', 'zh', 'zh-Hant', 'ko'] as const satisfies readonly Locale[];

/** True if a locale keeps ISR caching; false → render dynamically (no ISR write). */
export function isCachedLocale(locale: string): boolean {
  return (CACHED_LOCALES as readonly string[]).includes(locale);
}

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
