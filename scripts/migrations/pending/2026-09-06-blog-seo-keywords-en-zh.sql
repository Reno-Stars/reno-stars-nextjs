-- Migration: blog_posts — fill missing seo_keywords for published non-test posts
-- Date: 2026-09-06
-- Status: NOT APPLIED — needs human to run
-- Gap: 4 published non-test posts missing seo_keywords_en AND seo_keywords_zh
--   (test posts excluded — is_published filter removes them from this migration)
-- Dedup: seo_keywords_zh already covered for 55dbdb54 by existing migration 2026-09-06-blog-seo-keywords-zh-remaining.sql
--   but en is not, so this migration includes that post for en only
-- Idempotent: WHERE slug = ... AND field IS NULL guards prevent double-write
-- Note: focus_keyword_zh IS NULL for 27dd8051 and 625cdf1c; seo_keywords_zh uses focus_keyword_zh
--   as primary seed and title-derived fallback where focus_keyword_zh is absent.

-- ============================================================
-- Post: how-to-renovate-house-vancouver-first-timer-guide
-- focus_keyword_zh IS NULL — seo_keywords_zh derived from title_zh
-- ============================================================
UPDATE blog_posts
SET seo_keywords_en = 'vancouver house renovation guide, first renovation vancouver, vancouver home renovation steps, vancouver renovation checklist, bc renovation permit'
WHERE slug = 'how-to-renovate-house-vancouver-first-timer-guide'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_zh = '温哥华房屋装修指南,首次装修温哥华,温哥华装修步骤,装修清单,BC省装修许可'
WHERE slug = 'how-to-renovate-house-vancouver-first-timer-guide'
  AND seo_keywords_zh IS NULL;

-- ============================================================
-- Post: vancouver-property-type-renovation-2026
-- focus_keyword_zh IS NULL — seo_keywords_zh derived from title_zh
-- ============================================================
UPDATE blog_posts
SET seo_keywords_en = 'house vs condo renovation vancouver, vancouver property type renovation, house condo townhouse renovation cost, vancouver renovation property type guide'
WHERE slug = 'vancouver-property-type-renovation-2026'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_zh = '温哥华独立屋公寓联排别墅装修,房产类型装修对比,温哥华装修费用对比,独立屋公寓装修有何不同'
WHERE slug = 'vancouver-property-type-renovation-2026'
  AND seo_keywords_zh IS NULL;

-- ============================================================
-- Post: townhouse-reno-vancouver-2026
-- focus_keyword_zh already set: 联排别墅翻新
-- ============================================================
UPDATE blog_posts
SET seo_keywords_zh = '温哥华联排别墅装修,大温联排别墅翻新,共管物业装修规则,温哥华联排别墅装修许可,strata renovation vancouver'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND seo_keywords_zh IS NULL;

-- ============================================================
-- Post: metro-vancouver-renovation-cost-index-november-2023
-- seo_keywords_zh already exists from 2026-09-06-blog-seo-keywords-zh-remaining.sql
-- Only add seo_keywords_en here
-- ============================================================
UPDATE blog_posts
SET seo_keywords_en = 'vancouver renovation cost 2023, metro vancouver renovation cost index, vancouver renovation cost per square foot, reno cost vancouver november 2023, vancouver renovation budget'
WHERE slug = 'metro-vancouver-renovation-cost-index-november-2023'
  AND seo_keywords_en IS NULL;
