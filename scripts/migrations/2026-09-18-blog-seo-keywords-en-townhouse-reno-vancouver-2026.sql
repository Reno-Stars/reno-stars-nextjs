-- 2026-09-18: blog_posts — backfill seo_keywords_en for townhouse-reno-vancouver-2026
-- NOT APPLIED — needs human to run after PR merge
--
-- Context: DB audit 2026-09-18 found this published post has rich English content
-- (title_en, content_en, excerpt_en all populated) but seo_keywords_en is NULL.
-- A content integrity gap on a live page — both zh and en SEO keyword fields are empty.
--
-- The companion migration 2026-09-18-blog-seo-keywords-zh-townhouse-reno-vancouver-2026.sql
-- covers seo_keywords_zh. This file covers seo_keywords_en.
--
-- NOT covering unpublished test posts — those need content review before SEO fields.

BEGIN;

UPDATE blog_posts
SET seo_keywords_en = 'vancouver townhouse renovation,townhouse renovation costs vancouver,strata renovation rules bc,townhouse renovation permit vancouver,metro vancouver townhouse renovation,townhouse renovation bc,reno vancouver townhouse,townhouse renovation contractor vancouver'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND seo_keywords_en IS NULL; -- idempotent guard

COMMIT;
