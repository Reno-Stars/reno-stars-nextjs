-- 2026-09-18: blog_posts — backfill seo_keywords_zh for townhouse-reno-vancouver-2026
-- NOT APPLIED — needs human to run after PR merge
--
-- Context: DB audit 2026-09-18 found this published post has rich Chinese content
-- (title_zh, content_zh, excerpt_zh, meta_title_zh all populated) but seo_keywords_zh
-- is NULL while seo_keywords_en is also NULL — a content integrity gap on a live page.
-- focus_keyword_zh: "联排别墅翻新"
-- Keywords derived from title_zh + scope: strata rules, permits, BC, Vancouver, costs.
--
-- NOT covering unpublished test posts (test-full-2026-09-05, townhouse-renovation-strata-rules-
-- vancouver-2026) — those need content work before SEO fields can be responsibly filled.

BEGIN;

UPDATE blog_posts
SET seo_keywords_zh = '大温联排别墅翻新,共管物业翻新规定,BC省联排别墅翻新,温哥华联排别墅翻新费用,联排别墅翻新许可,共管物业批准流程,大温哥华联排别墅装修'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND seo_keywords_zh IS NULL; -- idempotent guard

COMMIT;
