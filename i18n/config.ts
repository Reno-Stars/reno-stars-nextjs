import { defineRouting } from 'next-intl/routing';

// Type-only: erased at compile time, so i18n/config gains no runtime
// dependency on lib/share. Verified cycle-free — lib/share/types.ts imports
// nothing but react types.
import type { PlatformId } from '@/lib/share/types';

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
   * Why this is one shared flag: the same en/zh pair was hardcoded in four
   * places (three page metadata helpers, plus PROJECT_LEAF_LOCALES in
   * app/sitemap.ts) and they have to agree — hreflang must not point at a
   * non-indexable URL, and the sitemap must not submit one. Flipping it here
   * lifts it everywhere at once.
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
   * force-dynamic SSR (see app/[locale]/layout.tsx). There are currently zero
   * `generateStaticParams` definitions in `app/` and zero consumers of
   * `PRERENDERED_LOCALES` — the field and its derived export are retained,
   * unused, as the documented switch for reintroducing build-time
   * prerendering for a high-traffic locale, should the owner decide to.
   */
  prerender: boolean;
  /**
   * camelCase suffix for this locale's per-locale field key:
   * ('title', 'zh-Hant') → `titleZhHant`.
   */
  dbSuffix: string;
  /**
   * Has dedicated `*_en` / `*_zh` DB columns. The other 12 locales live in the
   * `localizations` jsonb under `${fieldName}${dbSuffix}` keys.
   */
  dbColumn: boolean;
  /**
   * Google Translate (gtx endpoint) language code. Google wants 'zh-CN' for
   * Simplified and 'zh-TW' for Traditional; every other locale passes through.
   */
  gtxLang: string;
  /**
   * Fallback chain tried before falling back to en, for missing translations.
   * Omitted means straight to en. zh-Hant prefers Simplified because
   * script-conversion is closer to the reader than English is.
   */
  fallback?: readonly Locale[];
  /**
   * Share platforms this audience sees, in render order — the array index IS
   * the order. `lib/share/platforms.ts` deliberately carries no `locales` or
   * `priority` field; two sources of truth for ordering is how a matrix rots.
   *
   * Each row is a bet on how that audience actually shares, not a translation
   * of the English row. A LinkedIn button is dead weight to a zh reader who
   * wants WeChat, and that asymmetry is the entire point of a 14-locale site
   * having a locale-aware share bar. Platforms a row omits are unreachable for
   * that locale — a deliberate cut, not an oversight.
   */
  shareTargets: readonly PlatformId[];
  /**
   * Owner-confirmed localized trade name. Omitted means this locale renders
   * the English brand. The brand is NEVER machine-translated — zh/zh-Hant were
   * confirmed by Hongming 2026-07-09, re-confirmed 2026-08-05.
   */
  brandName?: string;
  /**
   * A Reno Stars team member communicates natively in this locale.
   *
   * A STAFFING fact, not a translation-quality one — every locale is fully
   * translated and, since 2026-08-07, every locale is indexed. A translated
   * page is not a person who can answer the phone, and customers have been
   * arriving through the minor locales expecting service in that language.
   *
   * `false` puts a plain notice on the contact page naming the languages the
   * team does cover. Hiring is under way: flip the field when someone joins and
   * the notice, the language list inside it, and the tests all follow.
   */
  nativeSupport: boolean;
  /**
   * Schema.org `availableLanguage` name for this locale, used in the
   * contactPoint of LocalBusinessSchema and ContactPageSchema.
   *
   * Only locales with `nativeSupport: true` are emitted — availableLanguage
   * means "customer service can answer in this language", which is the same
   * STAFFING fact `nativeSupport` records, not the set of languages the site
   * is translated into. Declaring a language here that nobody speaks tells
   * Google the business offers service it cannot deliver.
   *
   * Named per Schema.org convention (spoken language, not script): zh is
   * 'Mandarin Chinese' and zh-Hant is 'Cantonese', which is how the team
   * actually splits.
   */
  schemaLanguage: string;
}

/**
 * The table. Keyed by `Locale`, so a 15th locale added to `locales` above will
 * NOT compile until every field here is answered for it. That failure is the
 * feature.
 */
export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: {
    name: 'English', ogLocale: 'en_US', dir: 'ltr', indexableLeaf: true, prerender: false,
    dbSuffix: 'En', dbColumn: true, gtxLang: 'en',
    shareTargets: ['facebook', 'x', 'linkedin', 'pinterest', 'whatsapp', 'reddit',
                   'threads', 'bluesky', 'messenger', 'tumblr', 'sms'],
    nativeSupport: true, schemaLanguage: 'English',
  },
  // Mainland: WeChat/Weibo/QQ are the whole game. X and Facebook are here for
  // overseas Mandarin readers, who are a real slice of this site's zh traffic.
  zh: {
    name: '简体中文', ogLocale: 'zh_CN', dir: 'ltr', indexableLeaf: true, prerender: false,
    dbSuffix: 'Zh', dbColumn: true, gtxLang: 'zh-CN',
    shareTargets: ['wechat', 'weibo', 'qzone', 'x', 'facebook', 'line'],
    brandName: '聚星装修',
    nativeSupport: true, schemaLanguage: 'Mandarin Chinese',
  },
  // HK/TW: LINE is dominant, Weibo much less so than mainland.
  'zh-Hant': {
    name: '繁體中文', ogLocale: 'zh_TW', dir: 'ltr', indexableLeaf: true, prerender: false,
    dbSuffix: 'ZhHant', dbColumn: false, gtxLang: 'zh-TW', fallback: ['zh'],
    shareTargets: ['wechat', 'line', 'facebook', 'x', 'weibo', 'threads', 'telegram'],
    brandName: '聚星裝修',
    nativeSupport: true, schemaLanguage: 'Cantonese',
  },
  ja: {
    name: '日本語', ogLocale: 'ja_JP', dir: 'ltr', indexableLeaf: true, prerender: false,
    dbSuffix: 'Ja', dbColumn: false, gtxLang: 'ja',
    shareTargets: ['line', 'x', 'facebook', 'threads', 'pinterest', 'tumblr'],
    nativeSupport: false, schemaLanguage: 'Japanese',
  },
  // No KakaoTalk: it needs the Kakao JS SDK + a registered app key. Korean
  // readers reach it through the native sheet meanwhile. Tracked as a follow-up.
  ko: {
    name: '한국어', ogLocale: 'ko_KR', dir: 'ltr', indexableLeaf: true, prerender: false,
    dbSuffix: 'Ko', dbColumn: false, gtxLang: 'ko',
    shareTargets: ['x', 'facebook', 'line', 'threads', 'pinterest'],
    nativeSupport: false, schemaLanguage: 'Korean',
  },
  es: {
    name: 'Español', ogLocale: 'es_ES', dir: 'ltr', indexableLeaf: true, prerender: false,
    dbSuffix: 'Es', dbColumn: false, gtxLang: 'es',
    shareTargets: ['whatsapp', 'facebook', 'x', 'messenger', 'telegram', 'pinterest',
                   'threads', 'sms'],
    nativeSupport: false, schemaLanguage: 'Spanish',
  },
  pa: {
    name: 'ਪੰਜਾਬੀ', ogLocale: 'pa_IN', dir: 'ltr', indexableLeaf: true, prerender: false,
    dbSuffix: 'Pa', dbColumn: false, gtxLang: 'pa',
    shareTargets: ['whatsapp', 'facebook', 'telegram', 'x', 'messenger', 'pinterest', 'sms'],
    nativeSupport: false, schemaLanguage: 'Punjabi',
  },
  // Philippines skews hard to Facebook/Messenger; Viber is still widely used.
  tl: {
    name: 'Tagalog', ogLocale: 'tl_PH', dir: 'ltr', indexableLeaf: true, prerender: false,
    dbSuffix: 'Tl', dbColumn: false, gtxLang: 'tl',
    shareTargets: ['facebook', 'messenger', 'whatsapp', 'x', 'viber', 'telegram',
                   'pinterest', 'sms'],
    nativeSupport: false, schemaLanguage: 'Tagalog',
  },
  fa: {
    name: 'فارسی', ogLocale: 'fa_IR', dir: 'rtl', indexableLeaf: true, prerender: false,
    dbSuffix: 'Fa', dbColumn: false, gtxLang: 'fa',
    shareTargets: ['whatsapp', 'telegram', 'facebook', 'x', 'viber', 'pinterest', 'sms'],
    nativeSupport: false, schemaLanguage: 'Persian',
  },
  vi: {
    name: 'Tiếng Việt', ogLocale: 'vi_VN', dir: 'ltr', indexableLeaf: true, prerender: false,
    dbSuffix: 'Vi', dbColumn: false, gtxLang: 'vi',
    shareTargets: ['facebook', 'zalo', 'messenger', 'telegram', 'x', 'viber', 'pinterest'],
    nativeSupport: false, schemaLanguage: 'Vietnamese',
  },
  ru: {
    name: 'Русский', ogLocale: 'ru_RU', dir: 'ltr', indexableLeaf: true, prerender: false,
    dbSuffix: 'Ru', dbColumn: false, gtxLang: 'ru',
    shareTargets: ['telegram', 'vk', 'whatsapp', 'viber', 'x', 'facebook'],
    nativeSupport: false, schemaLanguage: 'Russian',
  },
  ar: {
    name: 'العربية', ogLocale: 'ar_AE', dir: 'rtl', indexableLeaf: true, prerender: false,
    dbSuffix: 'Ar', dbColumn: false, gtxLang: 'ar',
    shareTargets: ['whatsapp', 'telegram', 'facebook', 'x', 'viber', 'pinterest', 'sms'],
    nativeSupport: false, schemaLanguage: 'Arabic',
  },
  hi: {
    name: 'हिन्दी', ogLocale: 'hi_IN', dir: 'ltr', indexableLeaf: true, prerender: false,
    dbSuffix: 'Hi', dbColumn: false, gtxLang: 'hi',
    shareTargets: ['whatsapp', 'facebook', 'telegram', 'x', 'messenger', 'pinterest', 'sms'],
    nativeSupport: false, schemaLanguage: 'Hindi',
  },
  fr: {
    name: 'Français', ogLocale: 'fr_CA', dir: 'ltr', indexableLeaf: true, prerender: false,
    dbSuffix: 'Fr', dbColumn: false, gtxLang: 'fr',
    shareTargets: ['facebook', 'x', 'linkedin', 'whatsapp', 'pinterest', 'telegram',
                   'threads', 'messenger', 'sms'],
    nativeSupport: false, schemaLanguage: 'French',
  },
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
  return LOCALE_META[locale]?.dir === 'rtl';
}

/** True when a team member communicates natively in this locale. */
export function hasNativeSupport(locale: Locale): boolean {
  return LOCALE_META[locale]?.nativeSupport ?? false;
}

/**
 * Schema.org availableLanguage values — the languages customer service can
 * actually answer in. Derived, so it can never drift from the notice shown on
 * the contact page.
 */
export const SCHEMA_AVAILABLE_LANGUAGES: readonly string[] =
  locales.filter(hasNativeSupport).map((loc) => LOCALE_META[loc].schemaLanguage);

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
