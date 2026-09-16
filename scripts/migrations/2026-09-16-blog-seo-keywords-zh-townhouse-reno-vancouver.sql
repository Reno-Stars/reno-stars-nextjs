-- 2026-09-16: blog_posts seo_keywords_zh for townhouse-reno-vancouver-2026
-- Published post with zh title/content but seo_keywords_zh never set.
-- NOT APPLIED — needs human to run before publish
--
-- Post: townhouse-reno-vancouver-2026 (id: e50092a6-59f9-45a1-8ad3-4db06f6048ba)
--   title_zh:          大温联排别墅翻新共管物业规定2026
--   focus_keyword_zh:  联排别墅翻新
--   seo_keywords_en:   already NULL

UPDATE blog_posts
SET seo_keywords_zh = '大温联排别墅翻新,联排别墅共管物业,温哥华联排装修,共管物业规定,大温装修2026'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND seo_keywords_zh IS NULL
;
