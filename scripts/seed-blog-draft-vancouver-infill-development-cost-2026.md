# Blog draft seed: vancouver-infill-development-cost-2026

**Status: `is_published=FALSE` in DB. Awaiting editorial review.**

3rd competitor-gap draft of this session.

## DB row
- `id`: 17e69f50-74b9-469e-8b87-11d3a4ed74ef
- `slug`: vancouver-infill-development-cost-2026
- `is_published`: false
- `reading_time_minutes`: 10
- `author`: Reno Stars Team

## Topic choice

`infill` was the 3rd of 5 0-post topic gaps from the 17:00Z audit
(after adu + heritage). Vancouver infill development is a real
sub-market with high search intent (people researching subdivision
+ duplex/fourplex builds) and almost no in-depth domain-expert
content covering both the SSMUH bylaw AND the actual cost ranges.

Differs from the ADU draft (b953a0b) — that one covered ADUs as
ADDITIONS on existing lots (laneway / basement suite / garden suite
on existing SFH). This one covers NEW CONSTRUCTION via lot-splitting
+ multiplex/duplex/triplex new-build.

## Content scope

7810 chars EN body (`content_en`) covering:
1. What is Infill Development in Vancouver?
2. 2026 Infill Build Cost Breakdown (4 sub-types: single new infill, duplex, multiplex without split, lot-split + 2 homes) — $550K to $1.5M ranges
3. SSMUH + Lot-Splitting Permit Process (6 steps: zoning verification, land surveyor + subdivision, pre-app meeting, building permit, construction, final occupancy)
4. ROI Math: When Does Infill Pay Off? (worked example: East Van corner-lot duplex)
5. Common Pitfalls (tree retention, servicing capacity, geotechnical, SSMUH parking concessions)
6. FAQ (4 questions: 50x100 lot split eligibility, timeline, financing, subdivision handling)
7. Final CTA

Body contains 1 inline JSON-LD Article schema block.

## Editorial review checklist

- [ ] Verify the corner-lot ROI math (East Van $2.5M lot + $650K build → $2.3-2.5M new-construction value): pull current East Van new-construction comps
- [ ] Confirm Vancouver Tree Bylaw protected-tree threshold (30 cm DBH)
- [ ] Verify "8 completed infill projects" — pull actual project count tagged as infill/duplex/multiplex from projects table
- [ ] Confirm Reno Stars actually partners with 3 BC construction lenders (financing claim)
- [ ] Add `featured_image_url` (NULL currently)
- [ ] Re-run backfill script with --force on this slug to upgrade content_zh from stub

## Internal links

- `/en/areas/vancouver/`
- `/en/areas/burnaby/`
- `/en/areas/surrey/`
- `/en/areas/coquitlam/`
- `/en/blog/adu-renovation-vancouver-2026/` (sibling competitor-gap draft b953a0b)
- `/en/guides/whole-house-renovation-cost-vancouver/`

## Sibling drafts shipped this session

- 17:02Z b953a0b — adu-renovation-vancouver-2026
- 17:30Z 0785c59 — heritage-home-renovation-vancouver-2026
- 18:00Z THIS — vancouver-infill-development-cost-2026

## Remaining queued competitor-gap candidates

- `split-level-home-renovation-burnaby-coquitlam-2026`
- `mid-century-rancher-renovation-vancouver-2026`
