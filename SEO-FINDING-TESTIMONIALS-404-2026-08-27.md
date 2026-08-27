# SEO FINDING: Testimonials Page 404 — No Route Exists

**Date:** 2026-08-27
**Severity:** Low (trust-signal asset missing)
**Status:** NOT FIXABLE by this agent — no route exists in codebase

## Finding

`https://www.reno-stars.com/en/testimonials/` returns HTTP 404.

The `testimonials` DB table has 3 rows (id, text_en, text_zh, source — no author_en/author_zh):
- 1 featured/verified row + 2 others
- No corresponding Next.js route at `app/[locale]/testimonials/`
- Not in sitemap.xml, not indexed
- This is a removed/deprecated feature — testimonials exist in DB but no page serves them

## What I Verified Was Already Correct (2026-08-27 tick)

- Service pages (kitchen, bathroom, basement, heat-pump-hvac, accessible-bathroom, commercial):
  ALL have FAQPage + Question + Answer + HowTo structured data. Earlier "FAQ schema gap"
  finding was incorrect — service pages are fully structured.
- Guides section: BlogPosting + FAQPage + HowTo + HowToStep + ImageObject + SpeakableSpecification + AggregateRating present on bathroom renovation cost guide.
- Careers page: JobPosting + AggregateRating + Organization + ContactPoint present.
- Guides listing: ItemList + FAQPage present.
- Blog API: still returning 503 "Blog API not configured." — heat-pump and poly-b post drafts committed and waiting on branch.

## Resolution Requires

A developer creating `app/[locale]/testimonials/page.tsx` that queries the `testimonials` table and renders the 3 testimonial rows with proper schema (perhaps `Review` schema with AggregateRating for the listing, or `Person` + `Review` for each entry).

## Status

NOT APPLIED — this is a code change, not a database migration.
