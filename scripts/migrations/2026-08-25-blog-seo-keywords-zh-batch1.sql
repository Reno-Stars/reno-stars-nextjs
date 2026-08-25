-- Migration: blog_posts.seo_keywords_zh batch for published posts (2026-08-25)
-- NOT APPLIED — needs human to run after review
-- Covers published posts with NULL seo_keywords_zh (title_zh is present; content translation exists)
-- 9 rows

BEGIN;

-- 1. renovate-vs-move-vancouver-2026
UPDATE blog_posts
SET seo_keywords_zh = '温哥华装修还是搬家 2026 房市对比 装修成本 卖房成本 房屋增值'
WHERE id = '1837b084-cb01-4c31-a511-a54204f43ad5'
  AND seo_keywords_zh IS NULL;

-- 2. kitchen-refresh-without-full-renovation-vancouver-2026
UPDATE blog_posts
SET seo_keywords_zh = '温哥华厨房翻新省钱 不大动土木 厨房翻新方案 橱柜更新 台面更换'
WHERE id = '0551ee30-6d01-46d2-854f-c13ffdeb6985'
  AND seo_keywords_zh IS NULL;

-- 3. kitchen-layout-planning-vancouver-2026
UPDATE blog_posts
SET seo_keywords_zh = '温哥华厨房布局规划 走廊型厨房 L型厨房 U型厨房 中岛厨房 布局设计'
WHERE id = '79dc1aa5-4fb6-4524-b78a-3eea035a7cd1'
  AND seo_keywords_zh IS NULL;

-- 4. bathroom-renovation-cost-richmond-bc-2026
UPDATE blog_posts
SET seo_keywords_zh = '列治文浴室装修费用 2026 浴室翻新成本 浴室预算 浴室造价 浴室改造'
WHERE id = 'dfb2f7ef-af63-46b2-97bb-8e6b7aa15d4f'
  AND seo_keywords_zh IS NULL;

-- 5. bathroom-renovation-planning-guide-vancouver
UPDATE blog_posts
SET seo_keywords_zh = '温哥华浴室装修规划 浴室翻新指南 浴室设计 浴室布局 防水工程 浴室预算'
WHERE id = 'f771b876-3164-471a-9ede-b20864cc039b'
  AND seo_keywords_zh IS NULL;

-- 6. quartz-vs-granite-countertops-vancouver-2026
UPDATE blog_posts
SET seo_keywords_zh = '温哥华石英石台面 花岗岩台面 石材台面对比 厨房台面材料 石英石 vs 花岗岩'
WHERE id = 'f622fd93-13b9-409e-865d-fa96b671a0ae'
  AND seo_keywords_zh IS NULL;

-- 7. kitchen-vs-bathroom-reno-vancouver-2026
UPDATE blog_posts
SET seo_keywords_zh = '温哥华装修先厨房还是卫生间 装修优先级 厨房翻新 浴室翻新 预算分配'
WHERE id = 'c88b22eb-13c7-45f6-9597-4a6852742c54'
  AND seo_keywords_zh IS NULL;

-- 8. richmond-home-renovation-guide-2026
UPDATE blog_posts
SET seo_keywords_zh = '列治文装修翻新 2026 列治文装修费用 列治文装修许可证 列治文装修公司 列治文装修指南'
WHERE id = '89bce1b4-e13a-4c59-904f-8bd927e64718'
  AND seo_keywords_zh IS NULL;

-- 9. renovation-insurance-guide-bc
UPDATE blog_posts
SET seo_keywords_zh = 'BC省装修保险 装修保险保障 装修意外 工程保险 业主保险 装修索赔'
WHERE id = '7e9ebc6a-c64a-4d33-8c0f-e3f3cddc31a6'
  AND seo_keywords_zh IS NULL;

COMMIT;
