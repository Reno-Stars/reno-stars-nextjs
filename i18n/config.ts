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
 * Empty (2026-06-08): the whole site is force-dynamic SSR (see
 * `app/[locale]/layout.tsx`), so nothing is prerendered at build time. Every
 * `generateStaticParams` therefore returns [] and routes render on-demand with
 * ZERO ISR Full-Route-Cache writes. Kept as a typed empty array so the existing
 * `generateStaticParams` call sites compile unchanged; to reintroduce build-time
 * prerendering for specific high-traffic locales later, list them here.
 */
export const PRERENDERED_LOCALES = [] as const satisfies readonly Locale[];

/**
 * Locales whose LEAF pages (project/site detail, video detail, service×city)
 * are indexable. Everything else gets `robots: noindex, follow`, is dropped
 * from those routes' hreflang sets, and is omitted from the sitemap.
 *
 * Why a gate exists at all: on 2026-07-07 GSC reported ~750 project-leaf and
 * ~1,800 service×city URLs as "Crawled - currently not indexed". Google had
 * already judged the minor-locale variants low-value, so they were noindexed
 * to stop burning crawl budget re-fetching them.
 *
 * Why this is now one shared constant: the same en/zh pair was hardcoded in
 * four places (three page metadata helpers, plus PROJECT_LEAF_LOCALES in
 * app/sitemap.ts) and they have to agree — hreflang must not point at a
 * non-indexable URL, and the sitemap must not submit one. Adding a locale
 * here lifts it everywhere at once.
 *
 * Adding a locale is a CONTENT decision, not a config one. All 14 were opened
 * 2026-08-07 after every locale cleared the measured gate in
 * `agent-skills/marketing-all/scripts/locale_readiness.py` (hub repo):
 * project cover >=.90, blog body >=.85, link health >=.90, zero known
 * mistranslations, English meta <=.10. Re-run it before adding another locale
 * or after any bulk translation — it is cheap and it is the only thing standing
 * between this list and indexing machine-translation damage.
 *
 * Blog posts are gated separately and more strictly, on having a NATIVE body
 * (app/[locale]/blog/[slug]/page.tsx + the nativeLocales filter in
 * app/sitemap.ts). That gate stays: an untranslated post renders the English
 * body under a foreign-language URL, which is genuine duplicate content.
 */
export const INDEXABLE_LEAF_LOCALES = [
  'en', 'zh', 'zh-Hant', 'ja', 'ko', 'es', 'pa', 'tl', 'fa', 'vi', 'ru', 'ar', 'hi', 'fr',
] as const satisfies readonly Locale[];

/** True when this locale's leaf pages may be indexed. */
export function isIndexableLeafLocale(locale: string): boolean {
  return (INDEXABLE_LEAF_LOCALES as readonly string[]).includes(locale);
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
  // No NEXT_LOCALE cookie. localePrefix='always' already keeps the locale in
  // every URL, so the cookie is redundant — and a Set-Cookie on the response
  // makes it UNCACHEABLE at the CDN. Dropping it lets Vercel's edge cache the
  // SSR HTML (see proxy.ts `Vercel-CDN-Cache-Control`): fast TTFB + low origin
  // transfer, still zero ISR writes.
  localeCookie: false,
  // No next-intl `Link:` hreflang response header. next-intl emits x-default as
  // the locale-LESS root URL (e.g. `/blog/x`), which 308-redirects to `/en/blog/x`
  // — so the header's x-default DISAGREED with the two channels Google actually
  // reads: the HTML `<link rel="alternate">` (buildAlternates in lib/utils.ts)
  // and the sitemap (app/sitemap.ts), both of which correctly point x-default at
  // `/en/...`. Three hreflang sources, one contradicting the other two, is a
  // conflicting signal. The HTML + sitemap alternates are complete and correct on
  // their own, so we drop the redundant, wrong-x-default header entirely.
  alternateLinks: false,
});
