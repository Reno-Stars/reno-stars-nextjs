# Blog draft seed: heritage-home-renovation-vancouver-2026

**Status: `is_published=FALSE` in DB. Awaiting editorial review.**

Inserted to `blog_posts` table at 2026-06-01T17:31Z on
`seo/daily-2026-06-02` daily branch. 2nd competitor-gap draft of the
session (sibling to `adu-renovation-vancouver-2026` seeded at 17:02Z
in commit b953a0b).

## DB row
- `id`: 2311bd71-d249-4143-8d7f-6dfb439c413c
- `slug`: heritage-home-renovation-vancouver-2026
- `is_published`: false (editorial review required before going live)
- `reading_time_minutes`: 9
- `author`: Reno Stars Team

## Why this draft

`heritage` was the 2nd 0-post topic gap from the 17:00Z audit:
- adu: 0 posts (1st draft shipped, b953a0b)
- heritage: 0 posts (THIS DRAFT)
- split-level: 0 posts (queued)
- rancher: 0 posts (queued)
- infill: 0 posts (queued)

Vancouver heritage homes (Shaughnessy, Mt Pleasant, Kitsilano,
Strathcona, Kerrisdale, parts of Dunbar) are a real renovation
sub-market with distinct cost premiums (20-40% over standard) and
permit-review timelines (4-7 months for designated alterations).
Search queries like "heritage alteration permit vancouver", "vancouver
character home renovation", "kitsilano heritage renovation" have
steady volume but few in-depth domain-expert resources online.

## Content scope

8000 chars EN body (`content_en`) covering:
1. Heritage Home vs Character House — three classifications (Designated, Register, pre-1940 Character)
2. 2026 Heritage Renovation Cost Breakdown (kitchen $45K-$95K, bathroom $25K-$65K, whole-house $250K-$600K+)
3. Heritage Permit Process (5-step flow including Vancouver Heritage Commission review for designated properties)
4. Common Heritage Renovation Work (period kitchen modernization, window restoration, porch reconstruction, seismic retrofit)
5. FAQ (4 questions: window replacement, permit timelines, conservation-area review, tax credits/grants)
6. Final CTA paragraph

Body contains 1 inline JSON-LD `<script type="application/ld+json">` Article
schema block (preserved byte-identical by `translate_with_jsonld_preserved()`
in the existing backfill script).

## Editorial review checklist

Before flipping `is_published = true`:

- [ ] Verify cost ranges against actual Reno Stars completed heritage projects
  (none specifically named in the draft — could pull project_id link if any
  exist in the projects table tagged as heritage/character)
- [ ] Confirm SSMUH + Heritage Bylaw interaction (the ADU draft covers SSMUH;
  this draft mentions character-home retention incentive — content team should
  ensure consistency between the two posts)
- [ ] Confirm BC Heritage Conservation Foundation grant amounts ($5K-$25K is
  approximate; pull current 2026 figures)
- [ ] Verify Vancouver Heritage Density Bonus references — this is a real but
  underutilized lever; might warrant its own dedicated post
- [ ] Add `featured_image_url` (NULL currently)
- [ ] Re-run `scripts/backfill-zh-thin-descriptions.py --blog-posts-content
  --force heritage-home-renovation-vancouver-2026` to upgrade content_zh from
  the editorial stub to a full MT pass (preserves the JSON-LD block)

## Internal links in the draft body

- `/en/areas/vancouver/`
- `/en/areas/north-vancouver/`
- `/en/areas/west-vancouver/`
- `/en/guides/whole-house-renovation-cost-vancouver/`

Heritage-specific neighborhood names referenced (Shaughnessy, Mount Pleasant,
Strathcona, Kitsilano, Kerrisdale, Dunbar) — these are sub-area mentions not
linked to dedicated routes (no /en/areas/kitsilano/ route exists).

## Sibling drafts shipped in this session

- 17:02Z commit b953a0b — adu-renovation-vancouver-2026
- 17:30Z commit (THIS) — heritage-home-renovation-vancouver-2026

## Remaining competitor-gap candidates

- `vancouver-infill-development-cost-2026` (Bill 44 lot-splitting + new infill development)
- `split-level-home-renovation-burnaby-coquitlam-2026` (1960s-1980s split-level modernization)
- `mid-century-rancher-renovation-vancouver-2026` (1950s-1970s rancher restoration)
