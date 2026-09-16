-- 2026-09-16: blog_posts SEO keywords for townhouse-reno-vancouver-2026
-- Published post with English meta but seo_keywords_en and seo_keywords_zh both NULL.
-- NOT APPLIED — needs human to run before publish
--
-- Post: townhouse-reno-vancouver-2026 (id: e50092a6-59f9-45a1-8ad3-4db06f6048ba)
--   title_zh:          大温联排别墅翻新共管物业规定2026
--   focus_keyword_zh:  联排别墅翻新
--   focus_keyword_en:  townhouse renovation strata rules Vancouver
--   seo_keywords_en:    NULL
--   seo_keywords_zh:   NULL

UPDATE blog_posts
SET seo_keywords_zh = '大温联排别墅翻新,联排别墅共管物业,温哥华联排装修,共管物业规定,大温装修2026'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND seo_keywords_zh IS NULL
;

UPDATE blog_posts
SET seo_keywords_en = 'townhouse renovation Vancouver,strata rules Vancouver,townhouse renovation permits BC,Metro Vancouver townhouse renovation,townhouse renovation costs,townhouse renovation contractor,townhouse renovation BC,townhouse strata vote,townhouse renovation common property'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND seo_keywords_en IS NULL
;
