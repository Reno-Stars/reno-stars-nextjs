-- Migration: populate blog_posts.seo_keywords_zh for 3 test-slug published posts
-- published 2026-09-05 that are not covered by the 2026-09-07 blog-seo-keywords-zh-new-posts.sql batch.
-- These rows have no title_zh but are live published posts needing SEO metadata.
-- NOT APPLIED — needs human to review and run against the live database.
-- Each statement is guarded on the column it writes; re-running is safe.

-- 1. townhouse-renovation-strata-rules-vancouver-2026 (test slug, live row)
--    title_en: Test Post Full Validation
UPDATE blog_posts SET seo_keywords_zh = '温哥华联排别墅翻新,共管物业装修规定,温哥华装修,大温装修,2026装修,联排别墅翻新'
 WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
   AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- 2. test-full-2026-09-05 (test slug, live row)
--    title_en: Test Post Full Validation
UPDATE blog_posts SET seo_keywords_zh = '温哥华装修,装修费用,大温装修,厨房装修,浴室翻新'
 WHERE id = '54a62b5e-2971-4b53-83ad-4945d5d82f79'
   AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- 3. test-rich-formatting-2026 (test slug, live row)
--    title_en: Test Rich Formatting 2026
UPDATE blog_posts SET seo_keywords_zh = '温哥华装修,装修费用,大温装修,厨房装修,浴室翻新'
 WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
   AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
