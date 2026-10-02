# Reno Stars SEO Strategy — 2026-10-02

**Refresh date:** 2026-10-02
**Site:** reno-stars.com
**Live inventory:** 270 blog posts · 58 published projects · 11 services · 14 service areas · 27 reviews

---

## 1. Content Integrity Status

**113 pending migrations** in `scripts/migrations/` — all awaiting human apply.
Column backlog cap (3+) reached for: `blog_posts` (zh fields), `services`, `service_areas`.
→ Migration production PAUSED. Human review/applies needed before more are written.

| Column | Status |
|--------|--------|
| `blog_posts.title_zh` | 30+ migrations covering english-test and townhouse posts; backlog capped |
| `blog_posts.content_zh` | Same — english-test posts partially covered |
| `blog_posts.excerpt_zh` | Same |
| `blog_posts.meta_description_zh` | Same |
| `blog_posts.seo_keywords_zh` | Same |
| `blog_posts.focus_keyword_zh` | Partially covered |
| `services.*_zh` | Backlog capped |
| `service_areas.*_zh` | Backlog capped |
| `project_scopes.*_zh` | Not yet checked this run |

**Immediate action:** Human review and apply pending migrations. Priority: `blog_posts` english-test posts (those publish English on Chinese URLs).

---

## 2. Geographic Coverage Matrix

14 cities × 11 services = 154 possible combinations.
Verified service-city pages exist for (sample from live scraping):
- `/en/projects/` — filtered by service and city via query params
- Service pages: `/en/services/kitchen/`, `/en/services/bathroom/`, `/en/services/whole-house/`, `/en/services/basement/`, `/en/services/commercial/`, `/en/services/cabinet/`, `/en/services/accessible-bathroom/`, `/en/services/critical-load-panel/`, `/en/services/heat-pump-hvac/`, `/en/services/poly-b-replacement/`, `/en/services/realtor/`

**Coverage gaps identified:**
- Service page × Port Moody: no dedicated page (only blog posts)
- Service page × White Rock: only blog posts
- Service page × Port Coquitlam: only blog posts
- Service page × Maple Ridge: only blog posts
- Service page × New Westminster: only blog posts

**Recommended:** Create `/en/services/kitchen/port-moody/` style pages for top untiered city × service combinations.

---

## 3. Blog Post Gaps — Priority Queue

Top gaps not yet covered by a published post (from 270-post inventory scan):

| Topic | Ladder rung | Status |
|-------|-------------|--------|
| How Long Does a Kitchen Renovation Take in Vancouver 2026 | Tutorial | Not covered — timeline post exists for whole-house but kitchen-specific is missing |
| HVAC / Heat Pump Renovation Costs Vancouver | Competitor gap | Partially covered in HVAC post — expand |
| Heritage Home Renovation Vancouver 2026 (pre-1980) | Tutorial | Not covered |
| Laneway House Renovation Vancouver 2026 | Competitor gap | Not covered |
| Strata Approval Process for Condo Renovation BC | Tutorial | Not covered |
| Renovation Financing BC 2026 (HELOC, programs) | Tutorial | Not covered |
| Pre-renovation asbestos/lead testing Vancouver | Tutorial | Not covered |
| Resale value ROI by renovation type Vancouver | Comparison | Not covered |

**Today's post (2026-10-02):** Condo Renovation Cost Vancouver 2026 — published via Blog API.

**Tomorrow draft:** How Long Does a Kitchen Renovation Take in Vancouver 2026

---

## 4. Technical SEO Debt

| Issue | Severity | Status |
|-------|----------|--------|
| `kitchen-vs-bathroom-reno-vancouver-2026` meta_description_en = "Kitchen vs bathroom Vancouver" (41 chars) | HIGH | Identified this run — needs fix |
| Blog draft `condo-renovation-cost-vancouver-2026.json` still on disk (was published via API, not moved) | LOW | Clean up |
| 113 pending migrations unapplied | MEDIUM | Human action needed |
| No live backlink API (Moz/Ahrefs/SEMrush credentials not set) | MEDIUM | Monitor only, no action without credentials |
| Schema: `availableLanguage` correctly uses nativeSupport (3 locales) ✅ | OK | — |
| Schema: `areaServed` 14 cities ✅ | OK | — |
| Schema: `aggregateRating` 86 reviews, 5.0 rating ✅ | OK | — |
| Schema: Organization includes correct alternateNames (聚星装修) ✅ | OK | — |
| hreflang: all 14 locales indexed ✅ | OK | — |

---

## 5. Backlink Profile

**External API access:** NONE — Moz, Ahrefs, SEMrush, DataForSEO backlink endpoints all unavailable.

**What we know from public scraping:**
- Referring domains from public indexes: not accessible without paid tools
- Social profiles (legitimate, high-authority): Facebook, Instagram, LinkedIn, TikTok, Xiaohongshu, Reddit, YouTube, X/Twitter — all present and linked from site
- Google Business Profile: present, 86 reviews, 5.0 rating
- Business citations: present across Yelp, Homestars, Google Maps

**To enable live DA/PA monitoring:**
Set any of: `MOZ_ACCESS_ID` + `MOZ_SECRET_KEY`, `AHREFS_API_KEY`, `SEMRUSH_API_KEY`, or `DATAFORSEO_API_KEY`

**Toxic link sweep:** Cannot run without a backlink API. Manual review of GSC's top linking sites is the only free option.

---

## 6. GEO / AI Visibility

**Score:** ~79/100 (2026-09-03 baseline)

| Factor | Status |
|--------|--------|
| Homepage schema — HomeAndConstructionBusiness + Organization ✅ | Full schema with geo, 14 cities, rating |
| Service schema on project pages ✅ | Service + WebPage + BreadcrumbList |
| Sitemap — all 14 locale alternates ✅ | Correctly lists all translated URLs |
| Content language — all 14 locales ✅ | next-intl, all indexed |
| AI-readable answers in posts ✅ | Most recent posts use answer-first structure |
| FAQ schema on blog posts | Partially implemented — needs audit |
| Internal linking density | Good — 84% of posts link real project slugs |

**Improvement opportunities:**
- Add FAQ schema to posts that don't have it (older posts)
- Ensure all blog posts have `metaDescriptionEn` ≤155 chars (kitchen-vs-bathroom post is short)
- Improve E-E-A-T signals: bios page for team members, licensing page explicitly linked

---

## 7. Content Quality Bars

| Metric | Current | Target |
|--------|---------|--------|
| Blog posts with ≥1 real project link | ~84% | 95% |
| Blog posts with ≥1 /contact CTA | ~99% | 99%+ |
| Blog posts with featuredImageUrl from DB | ~recent posts | 100% |
| Blog posts with zh content | ~most recent | 100% |
| metaDescriptionEn ≤155 chars | ~most | 100% |
| H2s as question phrases | ~recent posts | 100% |
| FAQ Q&A present | ~recent posts | 100% |

---

## 8. Immediate Action Items

### Human Required (priority order)
1. **[HIGH]** Fix `kitchen-vs-bathroom-reno-vancouver-2026` meta_description_en — only 41 chars, below minimum
2. **[HIGH]** Apply pending `blog_posts` english-test zh migrations before more content integrity work
3. **[MEDIUM]** Review and apply 2026-10-02 date-stamped migrations
4. **[MEDIUM]** Enable backlink API credentials for live DA/PA monitoring
5. **[LOW]** Clean up `condo-renovation-cost-vancouver-2026.json` from blog-drafts/ (was published directly via API)

### Agent (this workspace)
- Continue ladder item 2: schema + metadata audit on live pages
- Continue ladder item 3: coverage gap research for service × city pages
- Tomorrow's blog post draft: kitchen renovation timeline (queued for 2026-10-03)

---

## 9. Deploy Status

**Path:** PR merged → Gitea mirror (<=10 min) → Gitea builds → Infra PR opened → HUMAN merges → k3s deploy (<=5 min)

**Today's published post:** `condo-renovation-cost-vancouver-2026` — published at 2026-10-02 via Blog API (`https://www.reno-stars.com/api/blog/`) — not through a code PR. No deploy needed for DB-backed content.

**Code changes:** None this tick — all work was content (Blog API) and planning.

---

*Plan generated by seo-all agent. Next refresh: 2026-10-09 or after significant content/technical change.*
