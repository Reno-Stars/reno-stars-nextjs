-- Migration: 2026-09-04-blog-posts-seo-keywords-en-null.sql
-- Target: 4 blog_posts rows with seo_keywords_en NULL
--   42d3bcb6  test-minimal-vancouver
--   ea66766b  vancouver-reno-kitchen-bathroom-2026-final
--   55dbdb54  metro-vancouver-renovation-cost-index-november-2023
--   71c9b551  vancouver-reno-kitchen-or-bathroom-2026-test2
-- Note: outdoor-test-* rows also have seo_keywords_en NULL but are covered
--   separately (9 rows, pending outdoor-focus-keyword migration).
-- Status: NOT APPLIED — needs human to run against production DB
-- Author: SEO Agent 2026-09-04

BEGIN;

UPDATE blog_posts
SET seo_keywords_en = 'vancouver renovation cost, kitchen renovation vancouver, bathroom renovation vancouver, metro vancouver renovation prices, 2026 renovation costs'
WHERE id IN ('42d3bcb6-a997-4259-b44d-cbcbbc214b57', 'ea66766b-c230-4cb4-9fd8-8fb86e7bdb2f', '55dbdb54-e9d7-405f-84f9-5e4a95d7a7bd', '71c9b551-2fd2-4bba-968e-3a7c9b0200f6')
  AND seo_keywords_en IS NULL;

COMMIT;
