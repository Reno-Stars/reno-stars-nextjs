-- 2026-09-09-blog-seo-keywords-zh-real-posts.sql
-- Status: NOT APPLIED — needs human to run
-- Target: 2 published posts with real content_zh but missing seo_keywords_zh
-- These posts cannot be re-published via the API (required field) without this fix
-- Guard: idempotent WHERE — only affects rows matching the condition
--
-- Post 1: how-to-renovate-house-vancouver-first-timer-guide
--   title_zh: "溫哥華房屋裝修完整步驟指南：首次裝修必讀的流程與清單"
--   content_zh: about first-time renovators, permit rules, BC-specific costs
UPDATE blog_posts SET
  seo_keywords_zh = '溫哥華房屋裝修步驟,首次裝修溫哥華,BC省裝修許可證,溫哥華裝修承包商,房屋裝修預算溫哥華,獨立屋裝修流程,溫哥華裝修時間線'
WHERE slug = 'how-to-renovate-house-vancouver-first-timer-guide'
  AND is_published = true
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Post 2: vancouver-property-type-renovation-2026
--   title_zh: "溫哥華獨立屋、公寓、聯排別墅裝修有何不同（2026）"
--   content_zh: about property-type differences, strata rules, permits, costs
UPDATE blog_posts SET
  seo_keywords_zh = '溫哥華獨立屋裝修,溫哥華公寓裝修,溫哥華聯排別墅裝修,溫哥華共管公寓裝修,BC省物業規定裝修,溫哥華裝修許可證類型,獨立屋與公寓裝修差異'
WHERE slug = 'vancouver-property-type-renovation-2026'
  AND is_published = true
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
