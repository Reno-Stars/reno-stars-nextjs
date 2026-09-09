-- 2026-09-09-blog-seo-keywords-zh-more-published.sql
-- Status: NOT APPLIED — needs human to run
-- Target: 3 published posts with missing seo_keywords_zh
-- These posts cannot be re-published via the API (required field) without this fix
-- Guard: idempotent WHERE — only affects rows matching the condition
--
-- Post 1: townhouse-reno-vancouver-2026 (e50092a6)
--   title_zh: "大温联排别墅翻新共管物业规定2026"
--   content_zh: strata approval, BC building code, Form B, city permits
UPDATE blog_posts SET
  seo_keywords_zh = '大温联排别墅翻新,共管物业规定BC,BC省物业批准,联排别墅建筑许可证,表B共管物业信息证书,大温哥华翻新,共管物业法规'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND is_published = true
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Post 2: townhouse-renovation-strata-rules-vancouver-2026 (ae52f455)
--   This is a test-placeholder post — published=true but title_zh="Test ZH"
--   and content is also a test string. seo_keywords_zh added to satisfy the
--   API publish gate so it can be unpublished or replaced with real content.
UPDATE blog_posts SET
  seo_keywords_zh = '联排别墅翻新,共管物业规定,温哥华翻新,BC省建筑规范'
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND is_published = true
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Post 3: test-full-2026-09-05 (54a62b5e)
--   This is a test-placeholder post — published=true but content is test string.
--   seo_keywords_zh added to satisfy the API publish gate.
UPDATE blog_posts SET
  seo_keywords_zh = '装修,温哥华装修,大温装修公司,装修承包商'
WHERE id = '54a62b5e-2971-4b53-83ad-4945d5d82f79'
  AND is_published = true
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
