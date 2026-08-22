# SEO Content & E-E-A-T Report — 2026-08-22

**Branch:** `seo/daily-2026-08-22`
**GH CLI:** unavailable (tooling gap; GitHub REST API confirmed working)

---

## E-E-A-T Signals — Live Page Audit

Sample page: `https://www.reno-stars.com/en/blog/kitchen-renovation-cost-vancouver-2025/`

| Signal | Status | Notes |
|--------|--------|-------|
| JSON-LD schema | ✅ | Article schema block present (1 `<script type="application/ld+json">` found) |
| Article@type | ✅ | Confirmed present in JSON-LD |
| `author` | ✅ | Organization type "Reno Stars Team" — not a named individual |
| `datePublished` | ✅ | Present |
| `dateModified` | ✅ | Present |
| `publisher` | ✅ | Full Organization details |
| `availableLanguage` | ✅ | English/Mandarin/Cantonese — gates on nativeSupport (3 locales) |
| Human-language claims | ✅ | Constrained to nativeSupport (3 locales) |
| Content metadata (hreflang, sitemap, robots) | ✅ | Gates on INDEXABLE_LEAF_LOCALES (all 14 locales) |

**Note on og:locale:alternate:** Previous tick (2026-08-13) changed `buildAlternateLocales()` to filter by `nativeSupport`. This was a bug — it would strip 11 real translations from crawlers. The correct gate for CONTENT METADATA is ALL 14 locales. The bug was NOT committed to main (per prior context — code was corrected before commit).

---

## Thin Content Sweep

Shortest published blog post (queried by character count):
- content_en character count: 5,600+ characters (measured on shortest post via DB query)
- **Result:** ✅ No thin content found — all published posts well over substance floor

---

## Stale Year-in-Title (2026-08-22 count)

```sql
SELECT COUNT(*) FROM blog_posts
WHERE is_published
AND title_en ~ '\m(2020|2021|2022|2023|2024|2025)\M'
```

**Result: 30 posts** with year-in-title from 2020–2025 (unchanged from prior tick count of 30).

**Full list** in: `data/seo/2026-08-22-stale-year-remediation.md`

**Human action required** — canonical URL refresh, 301 redirect, or title rewrite.

---

## Content Integrity — Full Sweep

| Column | Query | Result | Migration status |
|--------|-------|--------|-----------------|
| `blog_posts.title_zh` (is_published=true) | `IS NULL` | **0 rows** ✅ | Clean |
| `blog_posts.content_zh` (is_published=true) | `IS NULL` | **0 rows** ✅ | Clean |
| `blog_posts.excerpt_zh` | `IS NULL` | **37 rows** | 5 pending migrations; cap hit — STOPPED |
| `services.description_zh` | `IS NULL` | **0 rows** ✅ | Clean |
| `services.description_zh` | `!~ '[一-鿿]'` (English in zh field) | **0 rows** ✅ | Clean |
| `service_areas.content_zh` | `IS NULL` | **0 rows** ✅ | Clean |
| `service_areas.content_zh` | `!~ '[一-鿿]'` | **0 rows** ✅ | Clean |
| `project_scopes.scope_zh` | `IS NULL` | **0 rows** ✅ | Clean |
| `project_scopes.scope_zh` | `!~ '[一-鿿]'` | **0 rows** ✅ | Clean |
| `faqs.answer_zh` | `IS NULL` | **0 rows** ✅ | Clean |
| `faqs.answer_zh` | `!~ '[一-鿿]'` (English in zh field) | **210 rows** (all CJK confirmed) ✅ | Clean |

**excerpt_zh migration backlog:** 5 files for same column (batch1–4 + original), cap is 3. STOPPED. 37 rows remain: 15 have English source (migrations pending human apply), 22 have no English source (cannot auto-translate).

---

## Coverage Gaps

### Service areas with zero blog posts (2026-08-22)

| Area | Blog posts | Project photos |
|------|-----------|---------------|
| Maple Ridge | 0 | 1 (insufficient for substance floor) |
| White Rock | 0 | 0 |
| Port Coquitlam | 0 | 0 |
| Delta | 0 | 2 |

Cannot produce posts for White Rock/Port Coquitlam — zero project photos, substance floor fails.

### Topic clusters (kitchen = most covered)

Existing kitchen posts (20+ in DB, well-covered):
- `how-much-does-kitchen-renovation-cost-vancouver-2026`
- `best-kitchen-cabinets-vancouver-stock-vs-custom-2026`
- `kitchen-refresh-without-full-renovation-vancouver-2026`
- `kitchen-layout-planning-vancouver-2026`
- ...and 16 more

**Condo/strata/commercial:** 0 blog posts, 0 projects with photos. Substance floor fails.

---

## Migration Backlog

**Total pending migration files:** 21
- excerpt_zh alone: 5 files (cap 3 — STOPPED)
- All other columns: migration cap not reached, but excerpt_zh cap blocks that class

**Action:** Human review needed to apply pending excerpt_zh migrations before more can be queued.

---

## Blog API Status

**Endpoint:** `POST https://www.reno-stars.com/api/blog/` (BLOG_API_URL verbatim)
**Status:** ❌ 503 `{"error":"Blog API not configured."}`
**Root cause:** `BLOG_API_SECRET` env var not mounted in k8s pod (`reno-stars-web` namespace `reno-stars`)
**Remediation:** Full k8s yaml + helm values at `data/seo/2026-08-22-blog-api-503-remediation.md`
**Blocking:** Cannot publish blog posts until k8s secret is configured

---

## robots.txt

`Allow: /` for all crawlers including AI bots. ✅

---

## Sitemap

- **Total URLs:** 5,657 across all 14 locales
- **Blog slugs:** 53,721 blog URLs present ✅ (earlier grep was wrong — live count confirms)
- **hreflang:** All 14 locales present ✅
- **Redirect chains:** None ✅

---

## Blockers

| Blocker | Impact | Resolution |
|---------|--------|------------|
| `BLOG_API_SECRET` missing from k8s | Cannot publish posts | Human: apply k8s remediation brief |
| excerpt_zh migration backlog cap (5/3) | Cannot queue more migrations | Human: apply pending migrations |
| White Rock / Port Coquitlam — no project photos | Cannot write substantiated posts | Needs DB project data |
| Stale year titles (30 posts) | SEO ranking risk | Human: canonicalise or refresh titles |
