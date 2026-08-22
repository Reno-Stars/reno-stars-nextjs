# Stale Year-in-Title Remediation — 2026-08-22 Audit

## Finding
30 published blog posts have a year in their title that is stale (2020–2025).
These are almost entirely the monthly "Metro Vancouver Renovation Cost Index" series.

Query used:
  SELECT id, slug, title_en FROM blog_posts
  WHERE is_published AND title_en ~ '202[0-5]'
  ORDER BY updated_at DESC

## Full List (30 posts)

| # | ID | Slug | Title |
|---|----|------|-------|
| 1 | 82ce763c | metro-vancouver-renovation-cost-index-december-2025 | Metro Vancouver Renovation Cost Index — December 2025 |
| 2 | d0b0728a | metro-vancouver-renovation-cost-index-november-2025 | Metro Vancouver Renovation Cost Index — November 2025 |
| 3 | 7d78d44d | metro-vancouver-renovation-cost-index-october-2025 | Metro Vancouver Renovation Cost Index — October 2025 |
| 4 | 0becfac4 | metro-vancouver-renovation-cost-index-september-2025 | Metro Vancouver Renovation Cost Index — September 2025 |
| 5 | cf22246b | metro-vancouver-renovation-cost-index-august-2025 | Metro Vancouver Renovation Cost Index — August 2025 |
| 6 | 1ec55196 | metro-vancouver-renovation-cost-index-july-2025 | Metro Vancouver Renovation Cost Index — July 2025 |
| 7 | a88c611f | metro-vancouver-renovation-cost-index-june-2025 | Metro Vancouver Renovation Cost Index — June 2025 |
| 8 | 3a4df7d9 | metro-vancouver-renovation-cost-index-may-2025 | Metro Vancouver Renovation Cost Index — May 2025 |
| 9 | 86f75188 | metro-vancouver-renovation-cost-index-april-2025 | Metro Vancouver Renovation Cost Index — April 2025 |
|10 | 35a4dc47 | metro-vancouver-renovation-cost-index-march-2025 | Metro Vancouver Renovation Cost Index — March 2025 |
|11 | 7c099be6 | metro-vancouver-renovation-cost-index-february-2025 | Metro Vancouver Renovation Cost Index — February 2025 |
|12 | 385552dc | metro-vancouver-renovation-cost-index-january-2025 | Metro Vancouver Renovation Cost Index — January 2025 |
|13 | ??? | metro-vancouver-renovation-cost-index-december-2024 | Metro Vancouver Renovation Cost Index — December 2024 |
|14 | ??? | metro-vancouver-renovation-cost-index-november-2024 | Metro Vancouver Renovation Cost Index — November 2024 |
|... | (remaining 2024 series) | | |

## Recommended Actions

### Option A: Canonicalise to Current (fastest)
For each stale post: add a canonical tag pointing to the LATEST cost index post
(e.g. `/en/blog/metro-vancouver-renovation-cost-index-december-2025/`).
No content change. One canonical update per post.
Cost: Low effort. Benefit: Eliminates keyword cannibalisation + stale signal.

### Option B: Redirect to Current (cleaner)
For all 2024–November 2025 posts: redirect (301) to the December 2025 post.
December 2025 becomes the permanent "living document" cost index.
Benefit: Cleanest URL structure, no duplicate content risk.

### Option C: Refresh Titles (labour-intensive)
Edit each post's title_en to remove the year, e.g.:
  BEFORE: "Metro Vancouver Renovation Cost Index — December 2025"
  AFTER:  "Metro Vancouver Renovation Cost Index — Metro Vancouver"
Also update h1, meta title, meta description.
Benefit: Each post ranks for its own query term without year constraint.
Risk: Requires 30 individual edits; 6-month wait before Google re-indexes.

## Blocker
The DB credential is `agent_ro` (read-only). None of the above can be applied
by the SEO agent. A human with write access must execute the chosen option.

## Status
- Found: 2026-08-22 by SEO agent (read-only DB query)
- DB unchanged: agent_ro cannot write
- Migration file: not applicable (not a DB-column-null issue)
- Remediation: requires human action
