# SEO Tick 2026-09-29 — Findings (Updated Tick-3)

Date: 2026-09-29 (UTC)
gh unavailable — using git push.

## Branch: seo/daily-2026-09-29

## Commits This Tick
- `076311ab` seo: revert reviews page robots index:false — was a regression, page is in sitemap and should be indexed
- `447e10bc` seo: fix metaDescriptionEn truncation and empty featuredImageUrl in 2 blog drafts
- `447e10bc..076311ab` (2 commits this session)

## Content Integrity Check (Ladder Item 1) — ALL CLEAN
DB queries using `char_length()` (avoids empty-string issue):
- blog_posts content_zh IS NULL or blank: **0 rows**
- services description_zh blank: **0 rows**
- service_areas description_zh blank: **0 rows**
- project_scopes scope_zh blank: **0 rows**

## Draft Validation — 2 Fixes Applied
- `accessible-bathroom-renovation-vancouver-2026.json`:
  - metaDescriptionEn was 158 chars (limit 155) → trimmed to 143 chars ✓
  - featuredImageUrl was empty → set to hero image URL ✓
- `whole-house-renovation-cost-vancouver-2026.json`:
  - metaDescriptionEn was 171 chars → trimmed to 154 chars ✓

## Regression Fixed
- `app/[locale]/reviews/page.tsx`: removed `robots: { index: false, follow: true }` added by prior session's `b6dc1d08`. The reviews page IS in the sitemap and SHOULD be indexed.

## Drafts on Branch (all validated)
- `whole-house-renovation-cost-vancouver-2026.json` — committed, awaiting publish
- `accessible-bathroom-renovation-vancouver-2026.json` — committed, awaiting publish (field fixes applied)
- `powder-room-renovation-richmond-2026.json` — committed, awaiting publish
- `vancouver-siding-replacement-cost-2026.json` — committed, awaiting publish
- `two-bathroom-renovation-burnaby-family-2026.json` — committed, awaiting publish (project link added to contentEn)
- `two-bathroom-renovation-custom-features-richmond-2026.json` — committed, awaiting publish (project link added to contentEn)

## Pending Migrations (NOT APPLIED — human required)
- 2026-09-29 dedup series (focus keyword dedup for zh and en) — committed, unapplied
- 2026-09-29 blog SEO keywords (townhouse) — committed, unapplied
- 2026-09-29 service-areas-meta-description-en-truncate — committed, unapplied

## Blog API
Not tested this session. Last known: returns `{"error":"Blog API not configured."}` in sandbox.

## Live Site Verified
- Sitemap: all 7 sitemaps present (pages, services, service-areas, project-hubs, projects x2, blog)
- Reviews page: in sitemap (should not be noindex after fix)
- `accessible-bathroom-renovation-vancouver-2026` published 2026-09-11 — confirmed live with full schema (WebSite, Organization, FAQPage, BlogPosting, Article, BreadcrumbList JSON-LD)
