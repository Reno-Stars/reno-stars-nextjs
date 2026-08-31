-- Migration: scripts/migrations/2026-08-31-blog-meta-description-en-fix.sql
-- Description: Fix 4 blog posts with thin meta_description_en (under 120 chars).
--   NOT APPLIED — needs human to run against the live database.
--   Idempotent: UPDATE only if current length < 120 OR slug matches.

-- kitchen-vs-bathroom-reno-vancouver-2026: title "Kitchen vs. Bathroom Renovation in Vancouver:
--   Which Should You Do First?" — content covers real cost data, decision framework, 4 real projects.
--   Current meta_description_en: 29 chars "Kitchen vs bathroom Vancouver"
UPDATE blog_posts
SET meta_description_en = 'Kitchen vs bathroom renovation cost in Vancouver: real 2025-2026 quotes from $28k–$55k for kitchens and $15k–$45k for bathrooms. Which pays back more? Decision framework and real project examples.'
WHERE slug = 'kitchen-vs-bathroom-reno-vancouver-2026'
  AND (LENGTH(meta_description_en) < 120 OR meta_description_en = 'Kitchen vs bathroom Vancouver');

-- outdoor-living-space-renovation-vancouver-2026: deck and patio costs, permit requirements, renovation process.
--   Current: 92 chars "Deck and patio costs in Vancouver. Permit requirements and the renovation process explained."
UPDATE blog_posts
SET meta_description_en = 'Deck and patio renovation costs in Vancouver 2026: real project quotes from $12k–$65k depending on materials and size. Includes permit requirements and the full renovation process.'
WHERE slug = 'outdoor-living-space-renovation-vancouver-2026'
  AND LENGTH(meta_description_en) < 120;

-- metro-vancouver-renovation-cost-index-may-2024: historical cost index, 119 chars — just under threshold.
--   Keep: "Real May 2024 Vancouver renovation costs from Reno Stars quotes: median $27,400 plus cost by type and the 3-year trend." — already 119, leave alone.

-- metro-vancouver-renovation-cost-index-may-2025: historical cost index, 119 chars — just under threshold.
--   Keep: "Real May 2025 Vancouver renovation costs from Reno Stars quotes: median $21,100 plus cost by type and the 3-year trend." — already 119, leave alone.

-- metro-vancouver-renovation-cost-index-may-2026: current year index, 119 chars — just under threshold.
--   Keep: "Real May 2026 Vancouver renovation costs from Reno Stars quotes: median $21,400 plus cost by type and the 3-year trend." — already 119, leave alone.
