# SEO Authority Gap Audit — reno-stars.com
**Date:** 2026-10-01
**Scope:** Full site authority, coverage, content integrity, and technical SEO assessment

---

## 1. Content Inventory

| Asset | Count | Status |
|---|---|---|
| Published blog posts | 432 | ✅ |
| Published projects | 60 | ✅ |
| FAQs | 210 | ✅ |
| Service areas | 14 | ✅ |
| Services | 11 | ✅ |

**Content integrity (all non-en locales):**
- `blog_posts WHERE content_zh IS NULL` → **0 rows** ✅
- `blog_posts WHERE excerpt_zh IS NULL` → **0 rows** ✅
- `blog_posts WHERE meta_description_en IS NULL OR = ''` → **0 rows** ✅
- `blog_posts WHERE focus_keyword_en IS NULL OR = ''` → **0 rows** ✅

**Known issue (from prior session):**
- `service_areas.meta_description_en > 155 chars` → 2 rows: `richmond` (163 chars), `west-vancouver` (157 chars) — migration `2026-09-30-service-areas-meta-description-en-trim.sql` is committed and pending human apply.

---

## 2. Topical Authority Assessment

Reno Stars has deep, real-content coverage across the renovation decision funnel:

### Covered (2–5+ posts each)
| Topic cluster | Posts | Examples |
|---|---|---|
| Whole-house renovation | 5 | "Whole House Renovation Vancouver BC 2026", "Condo vs Whole House" |
| Bathroom renovation | 15+ | City-specific cost guides, waterproofing, walk-in showers |
| Kitchen renovation | 10+ | Per-city cost guides, Japandi, pantry |
| Renovation cost / pricing | 15+ | "Metro Vancouver Renovation Costs 2026", per-city guides |
| Building permits / BC code | 5 | "Vancouver Building Permits 2026", attic renovation + BC code |
| HVAC / heat pumps | 4 | "Heat Pump vs Gas Furnace Vancouver 2026", HVAC comparison |
| Renovation timeline | 5 | "How Long Does a Renovation Take Metro Vancouver 2026" |
| Financing / HELOC | 2 | "Renovation Financing Vancouver: HELOC & BC Programs 2026" |
| Aging in place | 2 | "Aging in Place Renovation Vancouver 2026" |
| Commercial renovation | 5 | "Commercial Renovation Costs Vancouver 2026" |
| Insurance / warranty | 3 | "Renovation Warranty Vancouver BC 2026", insurance guide |

### Authority Gaps (0–1 posts — high opportunity)

| Gap | Ladder rung | Notes |
|---|---|---|
| **Renovation budget planning** (without overrun focus) | Tutorial | Zero posts on general budget-setting, contingency planning, cost categories. All cost posts are city-specific or topic-specific. A general "how to budget for a renovation in Vancouver" guide is clear. |
| **Window / door replacement** | Tutorial | 0 posts. High-frequency homeowner query, code-adjacent (energy audits), strong local intent. |
| **Garage / carport renovation** | Tutorial | 0 posts. Detached/secondary structure topic with permit complexity (BC building code for detached structures). |
| **Stairs / railing / structural** | Tutorial | 0 posts. Safety-coded topic, often co-occurs with aging-in-place. |
| **Renovation contractor checklist** (how to choose) | Tutorial | 2 posts exist but both are narrow. A broad "questions to ask a contractor" guide is still valuable if framed differently. |

---

## 3. Highest-Priority Action Items

### P0 — Must Fix (blocking quality)
1. **Apply `service_areas.meta_description_en` migration** (2 rows: richmond, west-vancouver) — committed to `seo/daily-2026-09-30-v2`, pending human run. Both exceed the 155-char varchar limit.

### P1 — High-Authority Impact
2. **"Renovation Budget Planning Vancouver 2026" blog post** — topic is clear (0 existing posts). Featured image sourced, project links available, CTA and FAQ spec ready. API returned `{"error":"Blog API not configured"}` on last attempt; publish pending server-side credential fix.
3. **Window replacement guide** — 0 posts covering a high-frequency homeowner query. Dedup check needed before writing.
4. **Garage renovation guide** — 0 posts, BC building code angle, strong local intent in Metro Vancouver.

### P2 — Ongoing
5. **GBP Q&A populate** — identified in prior `/seo-maps` tick: Q&A unpopulated on GBP, free local-ranking signal.
6. **Schema audit** — verify LocalBusiness JSON-LD ratingCount matches DB review count (DB: 35 reviews; schema may show 86 from `google_reviews_cache`).

---

## 4. Competitive Position

**Strengths:**
- 432 published posts with genuine Chinese-language translations across all content
- Strong cost-guide cluster (per-city, per-topic) capturing bottom-of-funnel traffic
- 60 real project case studies with photography
- 210 FAQs providing structured data opportunity
- nativeSupport for en/zh/zhHant (3 locales) enabling genuine bilingual targeting

**Gaps vs. competitors:**
- No dedicated "renovation budget" pillar page — competitors likely outrank for broad budget-research queries
- Commercial renovation covered but could be deeper (tenant improvement guides, strata considerations)
- No dedicated "Vancouver renovation laws/zoning" content (only permit-cost content)

---

## 5. Technical SEO Signals

| Check | Result |
|---|---|
| Hreflang | All 14 locales indexed — og:locale:alternate correctly broad (not filtered to nativeSupport) ✅ |
| Sitemap | Should contain all 432 published posts + 60 projects + service areas |
| JSON-LD schema | LocalBusiness + review aggregate expected; ratingCount should match live DB (35, not 86) |
| Meta description coverage | 100% of published posts have meta_description_en ✅ |
| Focus keyword coverage | 100% of published posts have focus_keyword_en ✅ |
| Content translation | 100% of published posts have content_zh + excerpt_zh ✅ |

---

## 6. Recommended Priority Order

1. Apply the 2-row `service_areas` meta migration (5 min, high impact — prevents render errors)
2. Fix blog API credential, then publish renovation budget guide (P0 content gap)
3. Write window replacement guide (P1 authority gap)
4. Write garage renovation guide (P1 authority gap)
5. Populate GBP Q&A (P1 local ranking)
6. Audit schema ratingCount vs. DB review count (P2 technical)

---

*Audit generated: 2026-10-01 | DB: live read-only replica | Inventory from DB query*
