-- Migration: populate blog_posts.seo_keywords_zh for 3 published posts
-- published 2026-09-05 that were not covered by the 2026-09-03 batch.
-- NOT APPLIED — needs human to review and run against the live database.
-- Each statement is guarded on the column it writes; re-running is safe.

-- 1. vancouver-property-type-renovation-2026
--    title_zh: 温哥华独立屋、公寓、联排别墅装修有何不同（2026）
UPDATE blog_posts SET seo_keywords_zh = '温哥华独立屋装修,温哥华公寓翻新,温哥华联排别墅装修,温哥华房屋类型装修对比,温哥华装修费用,2026温哥华装修,大温装修'
 WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
   AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- 2. townhouse-reno-vancouver-2026
--    title_zh: 大温联排别墅翻新共管物业规定2026
--    focus_keyword_zh: 联排别墅翻新
UPDATE blog_posts SET seo_keywords_zh = '大温联排别墅翻新,共管物业装修规定,温哥华联排别墅翻新,物业装修规定,大温装修,2026装修,联排别墅翻新'
 WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
   AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- 3. how-to-renovate-house-vancouver-first-timer-guide
--    title_zh: 温哥华房屋装修完整步骤指南：首次装修必读的流程与清单
UPDATE blog_posts SET seo_keywords_zh = '温哥华房屋装修,温哥华装修步骤,温哥华装修清单,温哥华装修流程,温哥华装修费用,首次装修指南,大温装修'
 WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
   AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
