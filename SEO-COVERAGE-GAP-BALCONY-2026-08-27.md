# SEO Coverage Gap — Balcony Renovation
**Date:** 2026-08-27
**Author:** seo tick
**Status:** FOUND — gap identified, post NOT written (Blog API 503 blocked)

## Gap
No blog post exists covering balcony renovation for Metro Vancouver condo/townhouse owners.
- Query: `SELECT slug, title_en FROM blog_posts WHERE is_published AND (title_en ILIKE '%balcony%')` → 0 results
- Query: `SELECT slug, title_en FROM blog_posts WHERE is_published AND (title_en ILIKE '%patio%')` → 1 result (outdoor living, broader topic)

## Why This Gap Matters
- 14 service areas, majority are strata buildings (condos/townhouses) where balcony is common property
- Balcony renovation requires strata approval under BC Strata Property Act — a known pain point for owners
- Vancouver receives ~1,500mm rain/year — waterproofing is the critical technical issue
- BC Building Code 2024 Section 9.1 governs balcony guards, drainage, and fire separation
- Competitors likely cover this; Reno Stars does not

## Topic
**Balcony Renovation Vancouver 2026: Strata Approvals, Waterproofing and What Condo Owners Pay**

Ladder rung: 3 (Tutorial)
DEDUP: CLEAR (0 existing posts)
Substance sources:
- BC Strata Property Act — Form B, 3/4 vote requirement for alterations to common property
- BC Building Code 2024 Section 9.1 — guards (min 920mm height), balcony drainage, fire separation
- Metro Vancouver climate: ~1,500mm annual rainfall, coastal exposure
- Reno Stars project data: no balcony projects in DB (gap confirmed), general renovation cost data from published posts
- Real projects for inline images: coquitlam-kitchen-renovation-quartz-island (before/after from project_image_pairs)

## Gate Status
- [x] DEDUP: no existing post
- [x] CANNIBALISATION: no existing page ranks for "balcony renovation Vancouver"
- [x] SUBSTANCE FLOOR: BC strata law + BC Building Code + Vancouver climate data
- [ ] IMAGE: need coquitlam-kitchen-renovation-quartz-island before/after pair URL (confirmed available in DB)
- [ ] CTA: /en/contact/ + 1-3 real project links
- [ ] FAQ: 5 self-contained Q&As
- [ ] PUBLISH: BLOCKED — Blog API 503

## Blocker
Blog API `POST https://www.reno-stars.com/api/blog/` returns `{"error":"Blog API not configured."}` — $BLOG_API_SECRET not mounted.
Two other drafts already committed and waiting: heat-pump (261063c), poly-b (7e70e5c).
