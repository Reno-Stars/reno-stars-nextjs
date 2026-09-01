# Hreflang & Locale URL Audit — reno-stars.com
**Date:** 2026-09-02
**Method:** Code audit (live site blocked by WAF 403; sitemap + source code verified)

---

## Summary

| Check | Status | Notes |
|-------|--------|-------|
| `og:locale:alternate` — all 14 locales | ✅ | `buildAlternateLocales()` maps all `locales` via `ogLocaleMap`, no `nativeSupport` filter |
| `hreflang` on service pages | ✅ | Uses `INDEXABLE_LEAF_LOCALES` (all 14) — correct for fully-translated content |
| `hreflang` on blog posts | ✅ | Uses per-post `nativeLocales` filter — only locales with actual translated content |
| Hreflang × sitemap consistency | ✅ | Blog sitemap and blog page both filter to `nativeLocales`; service sitemap uses all 14 |
| BCP-47 hreflang key = URL path | ✅ | `zh-Hant` used consistently in hreflang key, `<html lang>`, and sitemap |
| `x-default` → `/en` | ✅ | |
| Canonical self-referential | ✅ | |
| Hard constraint (no `nativeSupport` on og:locale) | ✅ | `buildAlternateLocales` iterates `locales` array, not `nativeSupport` |

---

## Code Evidence

### `buildAlternateLocales()` — og:locale:alternate
```ts
// lib/utils.ts:250
export function buildAlternateLocales(currentLocale: Locale): string[] {
  return locales.filter((l) => l !== currentLocale).map((l) => ogLocaleMap[l]);
}
```
Iterates **`locales`** (all 14), maps each via **`ogLocaleMap`** (BCP-47 e.g. `zh_CN`, `zh_TW`, `ja_JP`…). No `nativeSupport` filter. Correct.

### `buildAlternates()` — hreflang for service pages
```ts
// lib/utils.ts:614
export function buildAlternates(path, locale, restrictLocales?: readonly string[]) {
  const includeLocales = restrictLocales ?? locales;
  // ...
  for (const loc of includeLocales) {
    languages[loc] = `${baseUrl}/${loc}${path}`;
  }
  languages['x-default'] = `${baseUrl}/en${path}`;
```
Service page calls with `INDEXABLE_LEAF_LOCALES` (all 14): `buildAlternates(\`/services/${serviceSlug}/\`, locale, INDEXABLE_LEAF_LOCALES)` ✅

### `buildAlternates()` — hreflang for blog posts
Blog post page calls with per-post `nativeLocales`:
```ts
// app/[locale]/blog/[slug]/page.tsx:165
alternates: buildAlternates(`/blog/${slug}/`, locale, nativeLocales),
```
`sitemap.ts` uses identical `nativeLocales` filter → sitemap and page hreflang are consistent ✅

### BCP-47 consistency (no zh-Hant → zh-TW mismatch)
```ts
// lib/utils.ts:627–634
// Emit the hreflang key exactly as the locale slug. `zh-Hant` is a valid
// BCP-47 script subtag that Google fully supports, and keeping it identical
// to the URL path (/zh-Hant/), the page's <html lang="zh-Hant">, and the
// sitemap's xhtml:link alternates is what avoids Semrush "hreflang language
// mismatch" errors.
```
Comment explicitly documents the prior bug (zh-Hant remapped to zh-TW in head only) and confirms it was fixed. ✅

---

## Locales Verified

| Locale | Code | `ogLocale` | Hreflang key | Indexable | nativeSupport |
|--------|------|------------|--------------|-----------|---------------|
| English | en | en_US | en | ✅ | ✅ |
| Chinese Simplified | zh | zh_CN | zh | ✅ | ✅ |
| Chinese Traditional | zh-Hant | zh_TW | zh-Hant | ✅ | ✅ |
| Japanese | ja | ja_JP | ja | ✅ | ❌ |
| Korean | ko | ko_KR | ko | ✅ | ❌ |
| Spanish | es | es_ES | es | ✅ | ❌ |
| Punjabi | pa | pa_IN | pa | ✅ | ❌ |
| Tagalog | tl | tl_PH | tl | ✅ | ❌ |
| Persian | fa | fa_IR | fa | ✅ | ❌ |
| Vietnamese | vi | vi_VN | vi | ✅ | ❌ |
| Russian | ru | ru_RU | ru | ✅ | ❌ |
| Arabic | ar | ar_AE | ar | ✅ | ❌ |
| Hindi | hi | hi_IN | hi | ✅ | ❌ |
| French | fr | fr_CA | fr | ✅ | ❌ |

All 14 are in `INDEXABLE_LEAF_LOCALES`. All 14 appear in `og:locale:alternate`. `nativeSupport` (staffing) does not gate hreflang.

---

## Sitemap Consistency

| Page type | Sitemap filter | Page `buildAlternates` filter | Consistent? |
|-----------|--------------|-------------------------------|-------------|
| Services (`/services/[slug]/`) | `locales` (all 14) | `INDEXABLE_LEAF_LOCALES` (all 14) | ✅ |
| Service cities (`/services/[slug]/[city]/`) | `SERVICE_CITY_LOCALES` | `SERVICE_CITY_LOCALES` | ✅ |
| Blog posts | `nativeLocales` (per-post) | `nativeLocales` (per-post) | ✅ |
| Projects | `INDEXABLE_LEAF_LOCALES` (all 14) | `INDEXABLE_LEAF_LOCALES` (all 14) | ✅ |
| Areas | `locales` (all 14) | `locales` (all 14) | ✅ |

---

## Verified via Code

- `lib/utils.ts` — `buildAlternateLocales()` + `buildAlternates()` ✅
- `i18n/config.ts` — `locales`, `ogLocaleMap`, `INDEXABLE_LEAF_LOCALES` ✅
- `app/[locale]/services/[service-slug]/page.tsx` — uses `INDEXABLE_LEAF_LOCALES` ✅
- `app/[locale]/blog/[slug]/page.tsx` — uses per-post `nativeLocales` ✅
- `app/sitemap.ts` — identical filter pattern for each page type ✅

---

## Not Verified (WAF block)

Live HTML `<head>` inspection was blocked. Sitemap and source code are the canonical reference and are internally consistent. Once the site is reachable, verify:

1. `<link rel="alternate" hreflang="zh-Hant" href=".../zh-Hant/...">` — not remapped to `zh-TW`
2. `<meta property="og:locale:alternate" content="zh_CN">` — all 13 alternates present
3. Blog post `/ja/blog/...` only has hreflang entries for locales in that post's `nativeLocales`

---

## Verdict

**Zero regressions found.** The 2026-08-13 `nativeSupport` narrowing bug in `buildAlternateLocales` was not repeated — `buildAlternateLocales` uses `locales` (all 14) directly. The sitemap-per-page-type filter pattern is internally consistent between `app/sitemap.ts` and each page's `buildAlternates` call.
