# Blog draft seed: adu-renovation-vancouver-2026

**Status: `is_published=FALSE` in DB. Awaiting editorial review.**

Inserted to `blog_posts` table via direct DB write at 2026-06-01T17:02Z
(commit context: seo/daily-2026-06-02 daily branch).

## Slug
`adu-renovation-vancouver-2026`

## DB row
- `id`: 48e499c1-38a7-4d00-bf54-b1cdd4568506
- `is_published`: false (editorial review required before going live)
- `reading_time_minutes`: 8
- `author`: Reno Stars Team

## Why this draft

Competitor-gap audit found ZERO existing posts targeting these high-impression
Vancouver SEO topics:
- `adu` (Accessory Dwelling Unit) — 0 posts
- `heritage` — 0 posts
- `split-level` — 0 posts
- `rancher` — 0 posts
- `infill` — 0 posts

ADU is the highest-impression gap because of Bill 44 / SSMUH bylaw 2024,
which enabled multiplex up to 3-6 units on most Vancouver single-family lots.
Search demand for "vancouver ADU", "SSMUH permit", "laneway house cost", and
"basement legal suite vancouver" has surged since the bylaw took effect.

## Content scope

5885 chars EN body (`content_en`) covering:
1. What is an ADU in Vancouver?
2. 2026 ADU Renovation Cost Breakdown (4 sub-types: basement suite, garden
   suite, laneway house, multiplex conversion). Real cost ranges from 14
   completed Reno Stars Metro Vancouver projects.
3. SSMUH Permit Process (4-step flow with timelines)
4. Heritage Home & Character Considerations
5. FAQ (4 questions: permit-less, cheapest option, payback period, what
   Reno Stars handles)
6. Final CTA paragraph

Body contains 1 inline JSON-LD `<script type="application/ld+json">` Article
schema block (preserved byte-identical for any future MT pass — see
`scripts/backfill-zh-thin-descriptions.py` `translate_with_jsonld_preserved()`).

## Editorial review checklist

Before flipping `is_published = true`:

- [ ] Verify ADU cost ranges against actual Reno Stars completed-project DB
  (currently quoted from script — 14 projects mentioned, validate the count)
- [ ] Review SSMUH permit timelines (4-6 weeks pre-app, 12-20 weeks review)
  against current City of Vancouver Planning queue data
- [ ] Add `featured_image_url` (currently NULL; placeholder image referenced
  in JSON-LD)
- [ ] Add `project_id` linking to one of the 14 ADU projects mentioned
- [ ] Re-run `scripts/backfill-zh-thin-descriptions.py --blog-posts-content
  --force adu-renovation-vancouver-2026` to upgrade content_zh from the
  148-char editorial stub to a full MT pass (will preserve the JSON-LD block)
- [ ] Run `scripts/backfill-zh-thin-descriptions.py --multi-locale-blog-posts-short`
  to populate excerpt + meta_description across the 12 non-en/non-zh locales

## ZH stub

`content_zh` was inserted as a 148-char placeholder (gtx machine translation
of the excerpt) marked with HTML comment indicating editorial translation
pending. Title, excerpt, meta_title, meta_description, focus_keyword, and
seo_keywords ZH fields were machine-translated via the same gtx endpoint and
brand glossary as the day's MT-backfill batches (commits dac63a1 / fcde5f1
et al on this daily branch). Editorial team should refine before publish.

## Internal links in the draft body

The draft already includes inbound links to:
- `/en/areas/vancouver/`
- `/en/areas/burnaby/`
- `/en/areas/richmond/`
- `/en/areas/coquitlam/`
- `/en/areas/surrey/`
- `/en/areas/north-vancouver/`
- `/en/guides/basement-renovation-cost-vancouver/`
- `/en/blog/vancouver-multiplex-laneway-renovation-guide-2026/`

These match the established Reno Stars site-internal anchor-text conventions
(see PR #103 internal-link rollouts dac63a1+ for the pattern).

## Next-day candidates

If competitor-gap blog-draft pilot lands well editorially, queue:
- `heritage-home-renovation-vancouver-2026` (heritage conservation area
  permits, Shaughnessy/Kitsilano/Mt Pleasant character requirements)
- `vancouver-infill-development-cost-2026` (lot splitting, density bylaw)
- `split-level-home-renovation-burnaby-coquitlam-2026` (mid-century split-level
  layout patterns common in Burnaby/Coquitlam)
- `mid-century-rancher-renovation-vancouver-2026` (1950s-1970s rancher
  restoration / modernization)
