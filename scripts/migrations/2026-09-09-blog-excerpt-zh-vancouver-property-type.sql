-- 2026-09-09-blog-excerpt-zh-vancouver-property-type.sql
-- Status: NOT APPLIED — needs human to run
-- Target: vancouver-property-type-renovation-2026 (id: 625cdf1c)
-- Gap: excerpt_zh IS NULL — has title_zh, content_zh, excerpt_en, but no Chinese excerpt
-- Guard: idempotent WHERE — only affects rows where excerpt_zh IS NULL
--
-- Already covered by other migrations on this branch:
--   2026-09-09-blog-seo-keywords-en.sql:     focus_keyword_en + seo_keywords_en
--   2026-09-09-blog-meta-en.sql:             meta_title_en + meta_description_en
--   2026-09-09-blog-featured-image-url.sql:  featured_image_url
--   2026-09-09-blog-excerpt-en-remaining.sql: excerpt_en
--   2026-09-10-blog-focus-seo-keywords-zh.sql: focus_keyword_zh + seo_keywords_zh

UPDATE blog_posts
SET excerpt_zh = '深入对比温哥华独立屋、公寓、联排别墅及新建住宅的装修成本、流程与注意事项，助您按预算做出最佳选择。'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND is_published = true
  AND excerpt_zh IS NULL;
