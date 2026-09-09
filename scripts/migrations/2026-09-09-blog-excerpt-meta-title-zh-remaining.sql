-- 2026-09-09-blog-excerpt-meta-title-zh-remaining.sql
-- Status: NOT APPLIED — needs human to run
-- Target: 2 published posts with title_zh and content_zh but missing excerpt_zh and meta_title_zh
-- Guard: idempotent WHERE — only affects rows matching the condition
--
-- Post 1: how-to-renovate-house-vancouver-first-timer-guide
--   title_zh already populated; derive excerpt_zh from content_zh
UPDATE blog_posts SET
  excerpt_zh = '如果您从未装修过房屋，从"我想要一个新厨房"到"承包商把钥匙交给我"的过程可能会让人感觉像在没有地图的情况下航行。大多数温哥华的首次装修业主会低估时间线、跳过许可检查。',
  meta_title_zh = '溫哥華房屋裝修完整步驟指南：首次裝修必讀的流程與清單'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND is_published = true
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

-- Post 2: vancouver-property-type-renovation-2026
--   title_zh already populated; derive excerpt_zh from content_zh
UPDATE blog_posts SET
  excerpt_zh = '大溫哥華的業主在2026年進行裝修時，面臨的第一個問題是：你擁有什麼類型的房產？獨立屋、共管公寓和聯排別墅各有不同的規則、成本和限制。',
  meta_title_zh = '溫哥華獨立屋、公寓、聯排別墅裝修有何不同（2026）'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND is_published = true
  AND (excerpt_zh IS NULL OR excerpt_zh = '');
