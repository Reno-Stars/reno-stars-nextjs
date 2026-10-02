# Reno Stars SEO Strategy — Refreshed 2026-10-02

## Current Inventory (DB snapshot)
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

**Status: Largely resolved. Maintenance mode.**

All zh-localized fields in blog_posts, services, service_areas, project_scopes, projects, and FAQs confirmed clean of English bleed (query: `WHERE col_zh !~ '[一-鿿]'` = 0 rows for all checked tables as of 2026-10-02).

**Remaining risk — service_areas.meta_description_en:**
- `richmond`: 163 chars (limit 155) — migration written, NOT applied
- `west-vancouver`: 157 chars (limit 155) — migration written, NOT applied

**Action:** Human must apply `scripts/migrations/pending/2026-10-02-service-areas-meta-description-en-overlimit.sql`

---

## 2. Geographic Coverage (OFFENSIVE — highest ROI)

| City | Commercial Post | Whole-House | Kitchen | Bathroom |
|------|----------------|-------------|---------|----------|
| Vancouver | ✅ | ✅ | ✅ | ✅ |
| Richmond | ✅ | ✅ | ✅ | ✅ |
| Burnaby | ❌ **DRAFT** | ❌ | ❌ | ❌ |
| North Vancouver | ❌ | ❌ | ❌ | ❌ |
| West Vancouver | ❌ | ❌ | ❌ | ❌ |
| Coquitlam | ❌ | ❌ | ❌ | ❌ |
| Delta | ❌ | ❌ | ❌ | ❌ |
| Surrey | ❌ | ❌ | ❌ | ❌ |
| White Rock | ❌ | ❌ | ❌ | ❌ |
| New Westminster | ❌ | ❌ | ❌ | ❌ |
| Port Moody | ❌ | ❌ | ❌ | ❌ |
| Port Coquitlam | ❌ | ❌ | ❌ | ❌ |
| Langley | ❌ | ❌ | ❌ | ❌ |
| Tsawwassen | ❌ | ❌ | ❌ | ❌ |

**Priority queue:**
1. **Burnaby commercial renovation** — draft on `seo/daily-2026-10-02`, pending publish
2. **Burnaby whole-house renovation** — ladder rung 3, no existing page
3. **North Vancouver kitchen** — ladder rung 3
4. **Surrey bathroom** — ladder rung 3

---

## 3. Topic Gaps

**Uncovered service topics (no blog post at all):**
- ADU / secondary suite
- Heat pump / HVAC upgrade
- Accessible bathroom / aging in place
- Cabinet refacing / countertop
- Flooring replacement
- Painting / interior cosmetic

**Recommended first reads:**
- ADU: high search intent, multi-city opportunity, BC building codes apply
- Heat pump: government rebates available (2026), competitive topic
- Accessible bathroom: aging Metro Vancouver population, low competition

---

## 4. Technical SEO

**Identified issues:**
- `test-*` slug posts may still exist in DB — recommend purge
- Some blog posts may have readingTimeMinutes = 0 or null (thin content risk)
- Schema: `BlogPosting` and `BreadcrumbList` JSON-LD recommended for all blog posts
- `<h1>` duplicates detected on several pages — audit needed

**CWV / Core Web Vitals:**
- INP (Interaction to Next Paint) is the key metric for Reno Stars' page types
- No CrUX data accessible in current runtime — recommend connecting GSC API

---

## 5. Backlink Profile

**Status:** No external backlink API available in runtime (Moz, Ahrefs, SEMrush, DataForSEO all unconfigured).

**Estimated:** DA ~15–20, PA ~25–30 based on site characteristics.

**Actionable without API:**
- Submit to 1–2 free directories per month (see `references/free-backlink-sources.md`)
- Pursue guest-post opportunities on Vancouver/home renovation vertical blogs
- Monitor toxic links quarterly

**To enable live monitoring:** set `MOZ_ACCESS_ID`/`MOZ_SECRET_KEY`, `AHREFS_API_KEY`, or `SEMRUSH_API_KEY` in runtime env.

---

## 6. GEO / AI Search Visibility

**Current status:** No AI Overview visibility data accessible in runtime.

**Recommendations:**
- Add FAQ schema to all blog posts (Google AI Overview prefers FAQ-page content)
- Ensure each blog post has 3–5 FAQ Q&As with self-contained 40–60 word answers
- Structured data (JSON-LD) increases chances of AI citation
- AI crawlers do NOT execute JavaScript — all content must be in raw HTML

---

## 7. Content Quality Bars

| Metric | Minimum | Current Status |
|--------|---------|----------------|
| Blog post word count | 150+ words | Confirmed (min 3034 chars among published posts) |
| Featured image | Required | Drafts must include DB-sourced hero_image_url |
| CTA | Required | Must link `/en/contact/` with Reno Stars |
| Project links | 1–3 per post | Must use real DB slugs |
| Chinese trade name | 聚星装修 (Traditional) | CI enforced |
| Locales | en + zh required | Genuine translation, not English dressed as locale |

---

## 8. Immediate Action Items

| Priority | Owner | Action |
|----------|-------|--------|
| 🔴 NOW | HUMAN | Apply `scripts/migrations/pending/2026-10-02-service-areas-meta-description-en-overlimit.sql` |
| 🔴 NOW | HUMAN | Publish Burnaby commercial post from `seo/daily-2026-10-02` |
| 🟡 NEXT | AGENT | Draft Burnaby whole-house renovation post |
| 🟡 NEXT | AGENT | Audit blog_posts for readingTimeMinutes = 0 or null |
| 🟢 LATER | AGENT | Add FAQ schema to top 5 traffic blog posts |

---
*Plan compiled 2026-10-02 UTC. Inventory from live DB queries.*
