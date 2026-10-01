-- Migration: populate NULL seo_keywords for townhouse-reno-vancouver-2026
-- NOT APPLIED — needs human to run
-- Rationale: post has focus_keyword_zh and title_zh but both seo_keywords columns are NULL.
-- Generated from: title_zh="大温联排别墅翻新共管物业规定2026", focus_keyword_zh="联排别墅翻新"
UPDATE blog_posts
SET
    seo_keywords_zh = '联排别墅翻新,大温联排别墅装修,温哥华联排别墅改造,共管物业装修,strata装修,联排别墅改造',
    seo_keywords_en = 'townhouse renovation,townhouse renovation Vancouver,strata renovation Vancouver,townhouse renovation permit,townhouse renovation cost Metro Vancouver'
WHERE slug = 'townhouse-reno-vancouver-2026'
AND is_published
AND (seo_keywords_zh IS NULL OR seo_keywords_en IS NULL);
