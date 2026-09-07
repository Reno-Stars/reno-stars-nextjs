-- Migration: populate seo_keywords_en for 2 published posts that have all other SEO
-- fields covered but are still missing seo_keywords_en.
--
-- NOT APPLIED — run manually after review:
--   pnpm db:query -f scripts/migrations/2026-09-07-blog-seo-keywords-en-remaining.sql
--
-- Coverage check: none of these slugs appear in any existing migration.
--
-- Post 1: townhouse-reno-vancouver-2026
--   title_en: "Townhouse Renovation in Metro Vancouver Strata Rules and Permits 2026"
--   focus_keyword_en: "townhouse renovation strata rules Vancouver"
--
-- Post 2: metro-vancouver-renovation-cost-index-november-2023
--   title_en: "Metro Vancouver Renovation Cost Index — November 2023"
--   focus_keyword_en: "vancouver renovation cost november 2023"
--   seo_keywords_zh: "大温哥华,装修成本,指数,2023年11月,装修费用,成本报告"

-- NOTE: metro-vancouver-renovation-cost-index-november-2023 is already covered
--       by 2026-09-07-blog-content-integrity.sql (lines 27-33).
--       This file only handles truly remaining rows.

-- ── Post 1 ──────────────────────────────────────────────────────────────────
UPDATE blog_posts SET
  seo_keywords_en = 'townhouse renovation vancouver,metro vancouver townhouse renovation,strata renovation rules vancouver,townhouse renovation permits bc,vancouver strata renovation cost,townhouse renovation 2026,vancouver renovation strata rules'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
