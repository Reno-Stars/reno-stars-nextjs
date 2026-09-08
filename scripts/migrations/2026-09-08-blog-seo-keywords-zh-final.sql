-- 2026-09-08-blog-seo-keywords-zh-final.sql
-- Status: NOT APPLIED — needs human to run
-- Target: blog_posts rows published with missing zh SEO metadata
-- Guard: idempotent WHERE — only affects rows matching the condition
UPDATE blog_posts
SET
  -- Post 1: how-to-renovate-house-vancouver-first-timer-guide
  -- title_zh already populated; derive meta from it
  meta_title_zh       = '溫哥華房屋裝修完整步驟指南：首次裝修必讀的流程與清單',
  meta_description_zh = '本文涵蓋溫哥華首次裝修的完整步驟：許可證檢查、承包商選擇、預算規劃、施工流程與驗收。避開常見錯誤。',
  seo_keywords_zh     = '溫哥華裝修,房屋裝修步驟,首次裝修指南,溫哥華裝修許可證,房屋翻新預算,溫哥華承包商'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND is_published = true
  AND (meta_title_zh IS NULL OR meta_title_zh = '');

UPDATE blog_posts
SET
  -- Post 2: vancouver-property-type-renovation-2026
  -- title_zh already populated; derive meta from it
  meta_title_zh       = '溫哥華獨立屋、公寓、聯排別墅裝修有何不同（2026）',
  meta_description_zh = '獨立屋、公寓、聯排別墅裝修各有什麼限制？許可證、物业規定、施工費用差異一次看懂。',
  seo_keywords_zh     = '溫哥華獨立屋裝修,溫哥華公寓裝修,溫哥華聯排別墅裝修,房屋類型裝修對比,溫哥華裝修許可證'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND is_published = true
  AND (meta_title_zh IS NULL OR meta_title_zh = '');

UPDATE blog_posts
SET seo_keywords_zh = '溫哥華裝修,房屋裝修步驟,首次裝修指南,溫哥華房屋翻新'
WHERE id = '54a62b5e-2971-4b53-83ad-4945d5d82f79'
  AND is_published = true
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

UPDATE blog_posts
SET seo_keywords_zh = '溫哥華裝修,房屋裝修步驟,首次裝修指南,溫哥華房屋翻新'
WHERE id = '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
  AND is_published = true
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

UPDATE blog_posts
SET seo_keywords_zh = '溫哥華聯排別墅裝修,共管物業裝修規定,溫哥華strata規定,聯排別墅裝修許可'
WHERE id = 'ae52f455-64eb-40fb-8f4a-7488902c53c3'
  AND is_published = true
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

UPDATE blog_posts
SET seo_keywords_zh = '溫哥華聯排別墅裝修,共管物業裝修規定,溫哥華strata規定,聯排別墅裝修許可'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND is_published = true
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
