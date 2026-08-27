-- Migration: NOT APPLIED — needs human to run.
-- Target: blog_posts.excerpt_zh for id 34e43ef8-6fde-4ef9-ac66-3f46f99b9df6 (pre-sale-renovation-white-rock-bc-2026)
-- Problem: excerpt_zh IS NULL — excerpt_en exists and is in English.
-- This row was previously covered for seo_keywords_zh (2026-08-16-blog-seo-keywords-zh-batch3.sql)
-- but excerpt_zh is a separate column and still NULL.
UPDATE blog_posts
SET excerpt_zh = '2026年白石预售翻新ROI指南：Semiahmoo和Ocean Park卖家的首选项目。厨房、浴室和海滨路缘吸引力升级，在白石海滨市场的销售中可获得150–300%的成本回报。'
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND (excerpt_zh IS NULL OR char_length(excerpt_zh) = 0);
