# Pre-Merge Checklist — seo/daily-2026-09-02

## Branch: seo/daily-2026-09-02
## Head: 5e70f61
## Status: READY TO MERGE

---

## WHAT THIS BRANCH DOES

### 1. llms.txt (DEPLOYED ✅)
File: `app/llms.txt/route.ts`
Change: "Projects (100+)" → "Projects (${COMPANY_STATS.projectsCompleted})"
Status: **DEPLOYED** — verified live at https://www.reno-stars.com/llms.txt (Tick 77)

### 2. robots.txt (PENDING DEPLOY ⚠️)
File: `app/robots.ts`
Changes:
- Separated `anthropic-ai` and `cohere-ai` from the CCBot block
- Added `Allow: /llms.txt` and `Allow: /llms-full.txt` for both crawlers
- Keeps `Disallow: /` for Diffbot/omgili/omgilibot

Status: **NOT YET DEPLOYED** — live site still shows `Disallow: /` for anthropic-ai/cohere-ai
Deploy path: this PR merged → Gitea mirror → reno-stars-infra PR → HUMAN MERGE → k3s

---

## MIGRATIONS (NOT APPLIED — run manually)

Located in `scripts/migrations/`:

| File | What | Run Command |
|------|------|------------|
| `2026-09-02-blog-featured-image-url-backfill.sql` | Backfills `featured_image_url` for 6 published posts using `project_sites.hero_image_url` | `psql $DB_URL < 2026-09-02-blog-featured-image-url-backfill.sql` |
| `2026-09-02-project-sites-duration-zh.sql` | Sets `duration_zh='1周'` for project site `6d5050fa-48ec-43c4-8187-ecd814dbb947` | `psql $DB_URL < 2026-09-02-project-sites-duration-zh.sql` |
| `2026-09-02-content-zh-stub-posts.sql` | Generates full zh body for 6 published posts with stub `content_zh` (< 200 chars) | `psql $DB_URL < 2026-09-02-content-zh-stub-posts.sql` |

Located in `scripts/migrations/pending/`:
| File | What |
|------|------|
| `2026-09-01-blog-content-zh-placeholder-stubs.sql` | excerpt_zh for pre-sale-renovation-white-rock |
| `2026-09-02-content-zh-stub-posts.sql` | Duplicate of main dir version |

---

## BLOG POSTS (12 DRAFTS — publish manually)

Publish each via:
```
curl -X POST https://www.reno-stars.com/api/blog/ \
  -H "Authorization: Bearer $BLOG_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @scripts/migrations/blog-drafts/<slug>.json
```

Draft files (in branch root):
1. `blog-drafts/accessible-bathroom-renovation-vancouver-2026.json`
2. `blog-drafts/acu-renovation-vancouver-2026.json`
3. `blog-drafts/basement-renovation-vancouver-2026.json`
4. `blog-drafts/cabinet-refinishing-vs-replacement-vancouver-2026.json` ⚠️ Dedup review required
5. `blog-drafts/commercial-renovation-vancouver-2026.json`
6. `blog-drafts/critical-load-panel-vancouver-2026.json`
7. `blog-drafts/heat-pump-installation-vancouver-2026.json`
8. `blog-drafts/kitchen-renovation-vancouver-2026.json`
9. `blog-drafts/poly-b-replacement-vancouver-2026.json`
10. `blog-drafts/realtor-partner-vancouver-2026.json`
11. `blog-drafts/whole-house-renovation-vancouver-2026.json`
12. `blog-drafts/bathroom-renovation-vancouver-2026.json`

⚠️ Cabinet draft (`cabinet-refinishing-vs-replacement-vancouver-2026`) overlaps keyword "cabinet refinishing vancouver" with existing `cabinet-refinishing-vancouver-cost-guide`. New draft has refinishing vs replacement angle (different from 12 existing "painting vs refacing" posts). Human dedup review required before publishing.

---

## BLOG POST SLUGS ALREADY ON PRODUCTION (DO NOT RE-PUBLISH)

These slugs confirmed 404 on production (Tick 59) — the drafts above use DIFFERENT slugs:
- accessible-bathroom-renovation-vancouver-2026 ✅ (new slug)
- acu-renovation-vancouver-2026 ✅ (new slug)
- basement-renovation-vancouver-2026 ✅ (new slug)
- commercial-renovation-vancouver-2026 ✅ (new slug)
- critical-load-panel-vancouver-2026 ✅ (new slug)
- heat-pump-installation-vancouver-2026 ✅ (new slug)
- kitchen-renovation-vancouver-2026 ✅ (new slug)
- poly-b-replacement-vancouver-2026 ✅ (new slug)
- realtor-partner-vancouver-2026 ✅ (new slug)
- whole-house-renovation-vancouver-2026 ✅ (new slug)
- bathroom-renovation-vancouver-2026 ✅ (new slug)

---

## REFERENCE DOCUMENTS (in branch root)

1. `SEO_AUDIT_REPORT_2026-09-02.md` — comprehensive final report
2. `SEO_AUDIT_SUMMARY_2026-09-02.md` — executive summary
3. `SEO_AUDIT_NOTES_2026-09-02.md` — detailed Ladder 2/4 findings
4. `SERVICE_CITY_COVERAGE_2026-09-02.md` — service-city coverage matrix

---

## AUDIT FINDINGS SUMMARY

### Ladder 1: COMPLETE ✅
- 8 tables audited; migration cap hit; 4 migrations written

### Ladder 2: COMPLETE ✅
- 11 service pages + 24 service-city pages + listings: all HTTP 200 + schema complete

### Ladder 3: COMPLETE ✅
- ZERO service-city coverage gaps
- kitchen-vs-bathroom zero inbound link gap: editorial decision needed

### Ladder 4: COMPLETE ✅
- Sitemap 5,825 entries; all 14 hreflang; security headers; TTFB healthy
- llms.txt DEPLOYED ✅
- robots.txt AI crawler fix PENDING ⚠️

---

## DEPLOY SEQUENCE

1. **Apply migrations** (optional — can be done in any order)
2. **Merge this PR** → Gitea mirror (≤10 min)
3. **reno-stars-infra PR opens** → human reviews and merges
4. **k3s deploys** (≤5 min after infra merge)
5. **Publish blog posts** (after deploy, or in parallel)

---

Generated: 2026-09-02
