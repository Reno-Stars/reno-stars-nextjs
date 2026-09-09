-- 2026-09-10-blog-focus-seo-keywords-zh.sql
-- Status: NOT APPLIED — needs human to run
-- Target: 2 published posts with genuine Chinese content but missing focus_keyword_zh + seo_keywords_zh
-- Guard: idempotent WHERE — only affects rows where focus_keyword_zh IS NULL

-- Post 1: how-to-renovate-house-vancouver-first-timer-guide
--   title_zh: "温哥华房屋装修完整步骤指南：首次装修必读的流程与清单"
--   content_zh: genuine full article
UPDATE blog_posts
SET focus_keyword_zh = '温哥华房屋装修首次装修步骤指南',
    seo_keywords_zh = '温哥华房屋装修, 首次装修指南, 温哥华装修步骤, BC省装修许可, Reno Stars装修流程, 温哥华装修预算, 房屋翻新指南'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND focus_keyword_zh IS NULL;

-- Post 2: vancouver-property-type-renovation-2026
--   title_zh: "温哥华独立屋、公寓、联排别墅装修有何不同（2026）"
--   content_zh: genuine full article
UPDATE blog_posts
SET focus_keyword_zh = '温哥华房产类型装修独立屋公寓联排别墅',
    seo_keywords_zh = '温哥华独立屋装修, 温哥华公寓翻新, 温哥华联排别墅装修, 物业类型装修对比, 共管物业审批, BC省装修规定, Reno Stars装修'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND focus_keyword_zh IS NULL;
