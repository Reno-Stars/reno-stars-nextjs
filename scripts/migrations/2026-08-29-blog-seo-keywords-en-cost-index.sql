-- Migration: blog_posts — supplemental seo_keywords_en for cost-index posts
-- Date: 2026-08-29
-- NOT APPLIED — needs human to run:
--   pnpm db:query -f scripts/migrations/2026-08-29-blog-seo-keywords-en-cost-index.sql
--
-- Context:
-- 2026-08-27 migration covers 18 cost-index posts (2023 Jul/Sep/Oct, 2024 Aug-Dec,
-- 2025 Jan-Mar+May-Jul+Sep-Nov). The DB shows 23 posts still missing seo_keywords_en.
-- Diffing the covered slugs against DB result shows these 5 were NOT in the prior migration:
--   april-2024, march-2026, may-2026, june-2026, november-2023
--
-- VERIFY (returns 5 rows before apply, 0 after):
--   SELECT slug, focus_keyword_en, seo_keywords_en FROM blog_posts
--   WHERE slug IN (
--     'metro-vancouver-renovation-cost-index-april-2024',
--     'metro-vancouver-renovation-cost-index-march-2026',
--     'metro-vancouver-renovation-cost-index-may-2026',
--     'metro-vancouver-renovation-cost-index-june-2026',
--     'metro-vancouver-renovation-cost-index-november-2023'
--   );

BEGIN;

UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2024 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-april-2024'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2023 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-november-2023'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-march-2026'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-may-2026'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-june-2026'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

COMMIT;
