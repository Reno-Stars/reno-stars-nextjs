# Reno Stars SEO Strategy — Refreshed 2026-10-03

## Current Inventory (DB snapshot 2026-10-03)
| Asset | Count |
|-------|-------|
| blog_posts (published) | 270 |
| FAQs | 210 |
| project_scopes | 321 |
| projects | 58 |
| service_areas | 14 |
| services | 11 |
| project_reviews | 27 |

---

## 1. Content Integrity (DEFENSIVE — ongoing)

**Status: CLEAN. Maintenance monitoring.**

All zh-localized fields confirmed clean via spot-check:
- blog_posts.content_zh: 20 published rows — all Chinese ✓
- services.description_zh: 11 rows — all Chinese ✓
- service_areas.description_zh: 14 rows — all Chinese ✓
- project_scopes.scope_zh: sample — all Chinese ✓

**Pending migration:** `scripts/migrations/pending/2026-10-02-service-areas-meta-description-en-overlimit.sql` (NOT APPLIED)
- richmond meta_description_en: 163 → 155 chars
- west-vancouver meta_description_en: 157 → 155 chars
- **Action:** Human apply. Idempotent WHERE guard.

---

## 2. Geographic Coverage (OFFENSIVE — highest ROI)

**Status: Mostly built. Remaining gaps by city × service.**

Remaining uncovered city × service gaps:
- Commercial renovation in Pitt Meadows, Port Moody, Port Coquitlam, Maple Ridge
- ADU/laneway in secondary markets (general Vancouver ADU post exists)

**Action:** Write city-specific commercial renovation cost posts for above cities.

---

## 3. Blog Publication (2026-10-03 tick)

**Published:** `commercial-renovation-cost-burnaby-2026`
- Topic: Commercial renovation cost Burnaby BC 2026
- Ladder: coverage gap (city × service — Burnaby × commercial)
- Blog API: POST https://www.reno-stars.com/api/blog/ -> {slug: commercial-renovation-cost-burnaby-2026, created: true, isPublished: true}
- Featured image: real DB hero_image_url (toystore Metrotown Burnaby)
- 3 inline images, /en/contact CTA, FAQ section
- Pending: reno-stars-infra PR for deployment

---

## 4. Technical SEO (DEFENSIVE)

Next technical tick should cover:
- Core Web Vitals / INP on key pages
- Sitemap vs indexable URL set
- hreflang on all 14 locale variants
- JSON-LD schema (LocalBusiness, FAQPage, Article)

---

## 5. Backlinks (DEFENSIVE)

Not audited this tick. Last full sweep: 2026-09. Next: /seo-backlinks on next defensive tick.

---

## 6. GEO / AI Overview Visibility (OFFENSIVE)

Not audited this tick. Last GEO audit: 2026-09. Recommend /seo-geo monthly.

---

## Next Actions (Priority Order)

1. Human: apply `scripts/migrations/pending/2026-10-02-service-areas-meta-description-en-overlimit.sql`
2. Human: merge `seo/daily-2026-10-02` -> infra PR -> deploy
3. Next tick: city-specific commercial post (Pitt Meadows or Port Moody)
4. Next tick: /seo-backlinks full profile sweep
