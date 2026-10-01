/**
 * Migration: Fix short/wrong meta_description_en for 4 published blog posts.
 * Run: pnpm db:query -f scripts/migrations/2026-10-01-blog-meta-description-en-fix.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Context: DB audit 2026-10-01 found meta_description_en under 100 chars on 4 posts.
 * Limits: meta_description_en varchar 155.
 *
 * 1. kitchen-vs-bathroom-reno-vancouver-2026 (c88b22eb) — 29/155 chars.
 *    Title: "Kitchen vs. Bathroom Renovation in Vancouver: Which Should You Do First?"
 *    Current: "Kitchen vs bathroom Vancouver" (no context, no value proposition)
 *    Fix: describe the actual comparison decision framework
 *
 * 2. outdoor-living-space-renovation-vancouver-2026 (c7eabaf3) — 92/155 chars.
 *    Title: "Outdoor Living Space Renovation in Vancouver — Decks, Patios & Permits for 2026"
 *    Current: "Deck and patio costs in Vancouver. Permit requirements and the renovation process explained."
 *    Fix: add 2026 pricing range from the article body
 *
 * 3. commercial-renovation-richmond-metro-vancouver-cost-guide-2026 (5ae8cd50) — 95/155.
 *    Title: "Commercial Renovation Cost in Richmond & Metro Vancouver 2026: Real Projects & P"
 *    Current: "Commercial renovation cost in Richmond and Metro Vancouver 2026: real project data and BC Code."
 *    Fix: tighten to exactly 155 with concrete range
 *
 * 4. metro-vancouver-renovation-cost-comparison-2026 (6e21e8a2) — 68/155 chars.
 *    Title: "Metro Vancouver Renovation Costs 2026: Real Prices Across Kitchen, Bathroom, Who..."
 *    Current: Chinese text (zh) — this field must be English for the en page
 *    Fix: English rewrite derived from the article body and focus keyword
 */

BEGIN;

-- 1. kitchen-vs-bathroom-reno-vancouver-2026 — meta_description_en
UPDATE blog_posts
SET    meta_description_en = ''Kitchen vs bathroom renovation in Vancouver: which project costs more, adds more value, and makes sense to do first? Real data from 100+ Metro Vancouver projects.''"
WHERE  id = 'c88b22eb-13c7-45f6-9597-4a6852742c54'
  AND  LENGTH(meta_description_en) < 100;

-- 2. outdoor-living-space-renovation-vancouver-2026 — meta_description_en
UPDATE blog_posts
SET    meta_description_en = ''Deck and patio renovation in Vancouver 2026: costs $8,000–$65,000 depending on size and materials. Permit requirements, BC Building Code rules and contractor pricing explained.''"
WHERE  id = 'c7eabaf3-4afb-4cfa-980a-f416d450d0d3'
  AND  LENGTH(meta_description_en) < 100;

-- 3. commercial-renovation-richmond-metro-vancouver-cost-guide-2026 — meta_description_en
UPDATE blog_posts
SET    meta_description_en = ''Commercial renovation cost in Richmond & Metro Vancouver 2026: retail $45–$280/sqft, office $55–$210/sqft. Real project data, BC Building Code and permit requirements.''"
WHERE  id = '5ae8cd50-2b2d-4848-b3b7-20b2306da51c'
  AND  LENGTH(meta_description_en) < 100;

-- 4. metro-vancouver-renovation-cost-comparison-2026 — meta_description_en (was Chinese)
UPDATE blog_posts
SET    meta_description_en = ''Metro Vancouver renovation costs 2026: kitchen $40K–$150K, bathroom $12K–$95K, whole house $150K–$800K. Real prices from 100+ completed projects across the Lower Mainland.''"
WHERE  id = '6e21e8a2-e6d1-4ecd-abfe-0a70c8060086'
  AND  LENGTH(meta_description_en) < 100;

COMMIT;
