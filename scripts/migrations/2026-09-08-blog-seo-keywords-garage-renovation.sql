-- Migration: 2026-09-08-blog-seo-keywords-garage-renovation.sql
-- Topic: blog_posts SEO keywords for garage-renovation-vancouver-2026
-- Status: NOT APPLIED — needs human to run after blog post is published
-- This is NOT an INSERT; it updates the blog_post row after publishing.
-- Run only AFTER pnpm blog:publish has inserted the row.

BEGIN;

-- Idempotent: only update if the row exists and fields are still empty
UPDATE blog_posts
SET
  seo_keywords_en = 'garage renovation Vancouver, Vancouver garage conversion, garage renovation cost Vancouver 2026, EV charger garage Vancouver, garage to ADU Vancouver',
  seo_keywords_zh = '温哥华车库装修, 车库改造ADU温哥华, 电动车充电器补贴BC, 大温车库装修成本'
WHERE slug = 'garage-renovation-vancouver-2026'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '')
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

COMMIT;
