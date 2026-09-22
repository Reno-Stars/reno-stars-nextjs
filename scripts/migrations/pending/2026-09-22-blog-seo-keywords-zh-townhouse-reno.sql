-- Migration: blog-seo-keywords-zh-townhouse-reno
-- Date: 2026-09-22
-- Target: blog_posts.seo_keywords_zh IS NULL
-- Row: townhouse-reno-vancouver-2026 (id: e50092a6-59f9-45a1-8ad3-4db06f6048ba)
-- Status: PUBLISHED row — data quality gap for zh locale
-- NOT APPLIED — requires human to run
-- Idempotent WHERE guard applied.

UPDATE blog_posts
SET
  seo_keywords_zh = '大温联排别墅翻新, 联排别墅装修费用, strata规定温哥华, 共管物业装修许可, 温哥华联排别墅翻新, 装修工期温哥华'
WHERE
  id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND seo_keywords_zh IS NULL;
