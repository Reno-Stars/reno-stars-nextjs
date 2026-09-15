-- 2026-09-15: populate seo_keywords_zh for ADU cost guide post missing them
-- NOT applied — requires human to run before deploy confirmation
-- Note: townhouse-reno-vancouver-2026 is covered by 2026-09-15-blog-seo-keywords-zh-townhouse-reno.sql
UPDATE blog_posts
SET
  seo_keywords_zh =
    '温哥华ADU费用,ADU建造成本温哥华,后巷屋费用温哥华,ADU许可温哥华,温哥华ADU多少钱,ADU装修预算,附属住宅费用温哥华,后巷屋建筑成本,ADU贷款温哥华,温哥华ADU申请,后巷屋装修费用,ADU成本细分,温哥华ADU报价,独立住宅加建,温哥华装修费用'
WHERE id = '5d0c7200-3e8f-474a-9d80-d5fcf90a6f8b'
AND seo_keywords_zh IS NULL
AND is_published = true;
