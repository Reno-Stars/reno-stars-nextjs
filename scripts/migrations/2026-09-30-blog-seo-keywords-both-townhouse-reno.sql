-- Migration: 2026-09-30-blog-seo-keywords-both-townhouse-reno.sql
-- Table: blog_posts
-- Target:  townhouse-reno-vancouver-2026 (id: e50092a6-59f9-45a1-8ad3-4db06f6048ba)
-- Gap:     is_published = true AND seo_keywords_en IS NULL AND seo_keywords_zh IS NULL
-- Fix:     derive seo_keywords from focus_keyword and page content
-- Status:  NOT APPLIED — needs human to run it before it takes effect
--
-- seo_keywords_zh derived from: focus_keyword_zh=联排别墅翻新, title_zh=大温联排别墅翻新共管物业规定2026
-- seo_keywords_en derived from: focus_keyword_en=townhouse renovation strata rules Vancouver

UPDATE blog_posts
SET
  seo_keywords_en = 'townhouse renovation,strata rules Vancouver,Metro Vancouver townhouse,BC strata renovation,townhouse permit Vancouver,strata approval BC,townhouse renovation cost Vancouver',
  seo_keywords_zh = '联排别墅翻新,大温联排别墅翻新,BC省共管物业,温哥华联排别墅,物业批准申请,联排别墅装修规定,大温哥华翻新'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND is_published = true
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '')
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
