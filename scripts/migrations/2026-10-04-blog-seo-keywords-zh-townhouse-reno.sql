-- Migration: NOT APPLIED — requires human to run
-- Target: blog_posts.seo_keywords_zh for townhouse-reno-vancouver-2026
-- Found via: SELECT id, slug FROM blog_posts WHERE is_published = true AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
-- Post: Townhouse Renovation in Metro Vancouver Strata Rules and Permits 2026
-- Title zh: 大温联排别墅翻新共管物业规定2026
-- Focus keyword en: townhouse renovation strata rules Vancouver
-- Focus keyword zh: 联排别墅翻新

UPDATE blog_posts
SET seo_keywords_zh = '联排别墅翻新,共管物业,物业规定,温哥华联排别墅,BC省共管物业,物业批准,建筑许可证,温哥华装修,共管公寓翻新,物业维修'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND is_published = true
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
