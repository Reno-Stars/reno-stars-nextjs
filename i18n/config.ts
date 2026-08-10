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
 * Everything the site knows about one locale, in one row.
 *
 * Before 2026-08-10 these fields were six separate `Record<Locale, X>` maps in
 * five files — endonym and og code here, DB suffix in lib/admin/locale-keys,
 * Google Translate code in lib/admin/gtx-translate, fallback chain in
 * lib/utils, share platforms in lib/share/matrix, brand name in
 * lib/company-config. Adding a locale meant finding all six, and nothing
 * failed loudly if you missed one.
 *
 * Now: one row. Every one of those exports still exists under its old name and
 * is derived from this table, so no consumer had to change.
 */
export interface LocaleMeta {
  /** Endonym, as shown in the language switcher. */
  name: string;
  /** og:locale — BCP 47 with region. */
  ogLocale: string;
  /** Writing direction. Drives <html dir> and logical CSS properties. */
  dir: 'ltr' | 'rtl';
  /**
   * Leaf pages (project/site detail, video detail, service×city) may be
   * indexed. When false the page gets `robots: noindex, follow`, is dropped
   * from that route's hreflang set, and is omitted from the sitemap.
   *
   * Why a gate exists: on 2026-07-07 GSC reported ~750 project-leaf and ~1,800
   * service×city URLs as "Crawled - currently not indexed". Google had already
   * judged the minor-locale variants low-value, so they were noindexed to stop
   * burning crawl budget re-fetching them.
   *
   * Turning one on is a CONTENT decision, not a config one. All 14 were opened
   * 2026-08-07 after every locale cleared the measured gate in
   * `agent-skills/marketing-all/scripts/locale_readiness.py` (hub repo):
   * project cover >=.90, blog body >=.85, link health >=.90, zero known
   * mistranslations, English meta <=.10. Re-run it before flipping another one
   * or after any bulk translation — it is cheap, and it is the only thing
   * standing between this flag and indexing machine-translation damage.
   *
   * Blog posts are gated separately and more strictly, on having a NATIVE body
   * (app/[locale]/blog/[slug]/page.tsx + the nativeLocales filter in
   * app/sitemap.ts). That gate stays: an untranslated post renders the English
   * body under a foreign-language URL, which is genuine duplicate content.
   */
  indexableLeaf: boolean;
  /**
   * Prerendered at build time. All false since 2026-06-08: the whole site is
   * force-dynamic SSR (see app/[locale]/layout.tsx), so nothing is prerendered
   * and every `generateStaticParams` returns []. Flip one to true to
   * reintroduce build-time prerendering for a high-traffic locale.
   */
  prerender: boolean;
}

/**
 * The table. Keyed by `Locale`, so a 15th locale added to `locales` above will
 * NOT compile until every field here is answered for it. That failure is the
 * feature.
 */
export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en:        { name: 'English',   ogLocale: 'en_US', dir: 'ltr', indexableLeaf: true, prerender: false },
  zh:        { name: '简体中文',   ogLocale: 'zh_CN', dir: 'ltr', indexableLeaf: true, prerender: false },
  'zh-Hant': { name: '繁體中文',   ogLocale: 'zh_TW', dir: 'ltr', indexableLeaf: true, prerender: false },
  ja:        { name: '日本語',     ogLocale: 'ja_JP', dir: 'ltr', indexableLeaf: true, prerender: false },
  ko:        { name: '한국어',     ogLocale: 'ko_KR', dir: 'ltr', indexableLeaf: true, prerender: false },
  es:        { name: 'Español',   ogLocale: 'es_ES', dir: 'ltr', indexableLeaf: true, prerender: false },
  pa:        { name: 'ਪੰਜਾਬੀ',     ogLocale: 'pa_IN', dir: 'ltr', indexableLeaf: true, prerender: false },
  tl:        { name: 'Tagalog',   ogLocale: 'tl_PH', dir: 'ltr', indexableLeaf: true, prerender: false },
  fa:        { name: 'فارسی',     ogLocale: 'fa_IR', dir: 'rtl', indexableLeaf: true, prerender: false },
  vi:        { name: 'Tiếng Việt', ogLocale: 'vi_VN', dir: 'ltr', indexableLeaf: true, prerender: false },
  ru:        { name: 'Русский',   ogLocale: 'ru_RU', dir: 'ltr', indexableLeaf: true, prerender: false },
  ar:        { name: 'العربية',   ogLocale: 'ar_AE', dir: 'rtl', indexableLeaf: true, prerender: false },
  hi:        { name: 'हिन्दी',      ogLocale: 'hi_IN', dir: 'ltr', indexableLeaf: true, prerender: false },
  fr:        { name: 'Français',  ogLocale: 'fr_CA', dir: 'ltr', indexableLeaf: true, prerender: false },
};

/** Build a `Record<Locale, T>` by reading one field off every row. */
export function mapMeta<T>(pick: (meta: LocaleMeta) => T): Record<Locale, T> {
  return Object.fromEntries(
    locales.map((loc) => [loc, pick(LOCALE_META[loc])]),
  ) as Record<Locale, T>;
}

/** Locales where `pick` holds, in `locales` order. */
function localesWhere(pick: (meta: LocaleMeta) => boolean): readonly Locale[] {
  return locales.filter((loc) => pick(LOCALE_META[loc]));
}

/** Endonyms for the language switcher. Derived from LOCALE_META. */
export const localeNames: Record<Locale, string> = mapMeta((m) => m.name);

/** OpenGraph locale codes (BCP 47 with region). Derived from LOCALE_META. */
export const ogLocaleMap: Record<Locale, string> = mapMeta((m) => m.ogLocale);

/** Locales that render right-to-left. Used in <html dir="rtl"> and CSS layout. */
export const rtlLocales: readonly Locale[] = localesWhere((m) => m.dir === 'rtl');

export function isRtl(locale: Locale): boolean {
  return LOCALE_META[locale].dir === 'rtl';
}

/** Locales whose LEAF pages are indexable. See LocaleMeta.indexableLeaf. */
export const INDEXABLE_LEAF_LOCALES: readonly Locale[] = localesWhere((m) => m.indexableLeaf);

/** True when this locale's leaf pages may be indexed. */
export function isIndexableLeafLocale(locale: string): boolean {
  return (INDEXABLE_LEAF_LOCALES as readonly string[]).includes(locale);
}

/** Locales prerendered at build time. See LocaleMeta.prerender. */
export const PRERENDERED_LOCALES: readonly Locale[] = localesWhere((m) => m.prerender);

export const localePrefix = 'always' as const;

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
