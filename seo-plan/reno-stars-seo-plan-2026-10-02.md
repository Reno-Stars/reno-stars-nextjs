# Reno Stars SEO Strategy — 2026-10-02 (Refresh)

**Refresh date:** 2026-10-02
**Site:** reno-stars.com
**Live inventory:** 448 blog posts · 58 published projects · 11 services · 14 service areas · 35 reviews

---

## 1. Content Integrity Status

**113 pending migrations** in `scripts/migrations/` — 16 dated 2026-10-xx, all awaiting human apply.

| Column | Status |
|--------|--------|
| `blog_posts.title_zh` | Multiple migrations covering english-test posts — backlog capped |
| `blog_posts.content_zh` | Same — backlog capped |
| `blog_posts.excerpt_zh` | Same |
| `blog_posts.meta_description_zh` | Same |
| `blog_posts.seo_keywords_zh` | Same |
| `blog_posts.focus_keyword_zh` | Partially covered |
| `services.*_zh` | Backlog capped |
| `service_areas.*_zh` | Backlog capped |
| `blog_posts.meta_description_en` | **NEW HIGH PRIORITY — see §4** |

**Backlog cap (3+ for same column):** Reached for all `blog_posts.*_zh` columns. Stopped producing more.

**Migration naming verified:** October 2026 migrations correctly named `2026-10-01-*` and `2026-10-02-*`. ✅

**526 unique row identifiers** already covered by pending migrations (ids from grep of all `WHERE id/slug =` clauses). These rows are DONE for migration purposes even though DB still shows issues.

**→ Human action required:** Review and apply pending migrations, especially the 16 dated 2026-10-xx.

---

## 2. Geographic Coverage Matrix

14 cities × 11 services = 154 possible combinations.
Recent posts show strong coverage expansion into secondary Metro Vancouver cities (Port Moody, Port Coquitlam, Langley, West Vancouver).

**Verified published (last 10 posts):**
- Port Moody: whole-house, kitchen, basement-suite cost posts
- Port Coquitlam: bathroom cost post
- West Vancouver: whole-house cost post
- Surrey: kitchen cost post
- Burnaby: commercial renovation cost post
- Metro Vancouver: retail renovation cost post

**Remaining coverage gaps (city × service):**
- Port Moody × bathroom
- White Rock × all services
- New Westminster × all services
- Port Coquitlam × kitchen, whole-house

---

## 3. Blog Post Gaps — Priority Queue

| Topic | Ladder | Status |
|-------|--------|--------|
| Laneway House Renovation Vancouver 2026 (zoning, costs) | Competitor gap | Not covered |
| Heritage Home Renovation Vancouver (pre-1980, code) | Tutorial | Not covered |
| Strata Approval Process for Condo Renovation BC | Tutorial | Not covered |
| Renovation Financing BC 2026 (HELOC, MCQC, rebates) | Tutorial | Not covered |
| Pre-renovation asbestos/lead testing Vancouver | Tutorial | Not covered |
| Accessible Bathroom Renovation Vancouver (ATC requirements) | Tutorial | Not covered |
| Resale Value ROI by Renovation Type Vancouver | Comparison | Not covered |
| Poly-B Pipe Replacement Vancouver (mandatory disclosure) | Tutorial | Not covered |

**Pipeline drafts in `blog-drafts/`** (not yet published):
- `basement-renovation-vancouver-2026.json`
- `basement-suite-renovation-cost-langley-bc-2026.json`
- `bathroom-renovation-cost-port-coquitlam-bc-2026.json`
- `bathroom-renovation-timeline-*.json`
- `commercial-renovation-cost-*.json`
- `crawl-space-renovation-vancouver-2026.json`
- `deck-railing-installation-vancouver-bc-2026.json`
- `delta-whole-house-renovation-cost-2026.json`
- `diy-vs-licensed-contractor-renovation-bc-2026.json`

---

## 4. Technical Debt — CRITICAL

### HIGH: Two meta_description_en violations

**1. `kitchen-vs-bathroom-reno-vancouver-2026`**
- `meta_description_en` = `"Kitchen vs bathroom Vancouver"` — **29 chars**
- Column limit: 155 chars
- This is not a varchar truncation — the content itself is 29 characters of thin placeholder text
- **Action:** Human — write a real 120–155 char description from the article's actual content

**2. `metro-vancouver-renovation-cost-comparison-2026`**
- `meta_description_en` = `"2026年大溫哥華裝修真實價格：廚房$40k–$150k、浴室$12k–$95k、全屋$150k–$800k。查看58個項目的實際造價。"` — **68 chars of Chinese**
- This is the Chinese translation stored in the English field — the field is mislabeled or the translation was put in the wrong column
- **Action:** Migration — move this text to `meta_description_zh`, write a genuine English `meta_description_en` for this row
- Migration NOT yet written — this is a new finding

### MEDIUM: Pending migration batch (16 files dated 2026-10-xx)
Human apply needed. Prioritize:
- `2026-10-02-blog-featured-image-null.sql` and `*-url-null.sql` — these affect SEO image signals
- `2026-10-02-blog-reading-time-minutes.sql` — affects Core Web Vitals/user experience signals

---

## 5. Backlink Profile

**External API access:** NONE

| Tool | Env var | Status |
|------|---------|--------|
| Moz | `MOZ_ACCESS_ID`/`MOZ_SECRET_KEY` | Not set |
| Ahrefs | `AHREFS_API_KEY` | Not set |
| SEMrush | `SEMRUSH_API_KEY` | Not set |
| DataForSEO | `DATAFORSEO_API_KEY` | Not set |

**Verified authority signals (public scraping):**
- Google Business Profile: 35 reviews (up from 27), 5.0⭐
- Social profiles: Facebook, Instagram, LinkedIn, TikTok, Xiaohongshu, YouTube, X/Twitter, Reddit — all linked
- Business citations: Yelp, Homestars, Google Maps

**Toxic link sweep:** Cannot run without a backlink API. GSC manual export is the only free option.

**Recommended:** Enable `MOZ_ACCESS_ID` + `MOZ_SECRET_KEY` (lowest cost, sufficient for weekly DA/PA + toxic sweeps).

---

## 6. GEO / AI Visibility

**Score:** ~79/100 (2026-09 baseline)

| Signal | Status |
|--------|--------|
| Homepage schema (HomeAndConstructionBusiness + Organization) | ✅ 14 cities, geo coordinates, 5.0⭐ rating, 35 reviews |
| Service schema on project pages | ✅ Service + WebPage + BreadcrumbList |
| `areaServed` — 14 cities | ✅ |
| `availableLanguage` — English, Mandarin, Cantonese | ✅ |
| Blog post FAQ schema | ⚠️ Recent posts — needs audit on older posts |
| Answer-first openings in blog posts | ⚠️ Recent posts only |
| Internal project links in blog posts | ✅ ~84% of posts |

**Improvement opportunities:**
1. Audit older posts (pre-2026-06) for FAQ schema presence
2. Fix the two `meta_description_en` issues above (AI Overviews cite meta descriptions)
3. Expand `laneway-house` and `heritage-home` content for GEO visibility on those queries

---

## 7. Content Quality Bars

| Metric | Current | Target |
|--------|---------|--------|
| Blog posts with real project link | ~84% | 95% |
| Blog posts with /contact CTA | ~99% | 99%+ |
| meta_description_en 80–155 chars | ⚠️ 2 violations | 100% |
| H2s as question phrases | Recent posts only | 100% |
| FAQ Q&A present | Recent posts only | 100% |
| Featured image from DB | Recent posts | 100% |

---

## 8. Immediate Action Items

### Human Required (priority order)
1. **[HIGH]** Fix `kitchen-vs-bathroom-reno-vancouver-2026` meta_description_en (29 chars) — write real description from article content
2. **[HIGH]** Fix `metro-vancouver-renovation-cost-comparison-2026` meta_description_en (Chinese text in English field) — move to `meta_description_zh`, write genuine English
3. **[MEDIUM]** Apply 16 pending 2026-10-xx migrations
4. **[MEDIUM]** Enable backlink API (Moz recommended)
5. **[LOW]** Publish pipeline drafts from `blog-drafts/` that are ready

### Agent (this workspace)
- Continue coverage gap research: city × service pages for White Rock, New Westminster
- Continue schema + metadata audit on live pages

---

## 9. Deploy Status

**Path:** PR merged → Gitea mirror → infra PR → HUMAN merges → k3s deploy

**Blog posts:** Published via Blog API (`https://www.reno-stars.com/api/blog/`), not through code PRs. No deploy needed.

**Code/schema changes:** Pending migration application by human.

---

*Plan generated by seo-all agent. Next refresh: 2026-10-09 or after significant content/technical change.*
