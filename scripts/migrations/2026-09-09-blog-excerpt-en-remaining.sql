-- 2026-09-09-blog-excerpt-en-remaining.sql
-- Status: NOT APPLIED — needs human to run
-- Target: 1 published post missing excerpt_en
-- Guard: idempotent WHERE — only affects rows where excerpt_en IS NULL
--
-- Already covered by existing migrations:
--   2026-09-09-blog-meta-en.sql: meta_title_en + meta_description_en for same posts
--   2026-09-09-blog-seo-keywords-en.sql: focus_keyword_en + seo_keywords_en for same posts
--   No existing migration covers excerpt_en

UPDATE blog_posts
SET excerpt_en = 'Explore the true cost of renovating different property types in Vancouver — houses, condos, townhomes, and infill homes — with real 2026 budgets and trade-offs.'
WHERE slug = 'vancouver-property-type-renovation-2026'
  AND is_published = true
  AND excerpt_en IS NULL;
