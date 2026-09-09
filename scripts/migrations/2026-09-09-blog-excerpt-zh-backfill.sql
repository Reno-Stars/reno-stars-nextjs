-- 2026-09-09-blog-excerpt-zh-backfill.sql
-- Status: NOT APPLIED — needs human to run
-- Target: blog_posts rows published with missing excerpt_zh
-- Guard: idempotent WHERE — only affects rows matching the condition
UPDATE blog_posts
SET excerpt_zh = '本文按順序引導您完成每個步驟：許可證檢查、承包商選擇、預算規劃，施工流程與驗收。避開常見錯誤。'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND is_published = true
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts
SET excerpt_zh = '獨立屋、公寓和聯排別墅裝修各有不同規則、成本和限制。本文拆解三種房產類型裝修的實際差異。'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND is_published = true
  AND (excerpt_zh IS NULL OR excerpt_zh = '');
