# SEO Audit Notes — 2026-10-03 (Updated)

## LADDER 2 — Schema (Partially Resolved)

### Finding 1: `ratingCount: 86` in Organization JSON-LD — NOT A BUG ✅
- **Original concern**: `ratingCount: 86` in `LocalBusinessSchema.tsx` appeared to be hardcoded; DB has only 35 internal reviews
- **Actual source**: `googleReviewCount` prop, populated from `lib/google-reviews.ts` → `getGoogleReviews()` → Google Places API (`relevant.userRatingsTotal`)
- **Verdict**: `86` is live Google Business Profile rating count — accurate, dynamic, NOT a bug
- **Action**: None needed

### Finding 2: `reviewCount: 0` on WebPage JSON-LD — No evidence of this pattern
- Searched `components/structured-data/ProjectSchema.tsx` and all schema files
- `ProjectSchema` WebPage node does NOT contain `reviewCount` — only individual `Review` objects under `mainEntity.Service`
- Organization schema (`LocalBusinessSchema`) sets `reviewCount: googleReviewCount` (live GBP count, same as `ratingCount`)
- **Verdict**: Original finding was a misread of the data; no `reviewCount: 0` issue found in schema
- **Action**: None needed

---

## LADDER 4 — Technical SEO

### Finding 3: `lib/sitemap/sections.ts` service-city section uses 3 locales instead of all 14

**File**: `lib/sitemap/sections.ts`, line 74
```typescript
const SERVICE_CITY_LOCALES = INDEXABLE_SERVICE_CITY_LOCALES;  // = ['en', 'zh', 'zh-Hant'] (3 locales)
```

**Context**:
- `INDEXABLE_SERVICE_CITY_LOCALES` = `['en', 'zh', 'zh-Hant']` (defined in `i18n/config.ts`)
- Service-city pages (`/services/[service-slug]/[city]/`) emit `noindex` for the 11 minor locales
- The sitemap section for service-city URLs uses the same 3-locale list

**Hard constraint conflict**:
> "CONTENT/TRANSLATION METADATA (hreflang, og:locale:alternate, sitemap entries, canonical alternates, robots/indexability) → gate on INDEXABLE_LEAF_LOCALES, which is ALL 14."

The sitemap uses `INDEXABLE_SERVICE_CITY_LOCALES` (3) instead of `INDEXABLE_LEAF_LOCALES` (14) for service-city URLs.

**Why this may be intentional**:
- Service-city pages do NOT exist in the 11 minor locales (no translations)
- Submitting 14 locale variants of a URL that only has 3 locale versions would advertise non-existent content to crawlers
- Comment in `sections.ts` lines 107-109: "the default of all 14 would advertise eleven URLs this section deliberately does not submit"

**Risk**: If a service-city page somehow becomes accessible in a minor locale (e.g., via URL manipulation), the sitemap would not submit it, creating a discoverability gap.

**Recommended action**: Audit whether service-city pages have any locale variants beyond `en/zh/zh-Hant`. If they genuinely do not, the sitemap restriction is correct and the hard constraint's "all 14" requirement is misapplied to this section. If some content exists in other locales, it should be added to the sitemap.

---

## Status Summary
| Ladder | Finding | Status |
|--------|---------|--------|
| Ladder 2 | `ratingCount: 86` (GBP live, not hardcoded) | ✅ Resolved — not a bug |
| Ladder 2 | `reviewCount: 0` on WebPage | ✅ Resolved — misread; no such issue |
| Ladder 4 | `SERVICE_CITY_LOCALES = 3` in sitemap | ⚠️ Needs review — may be intentional |
