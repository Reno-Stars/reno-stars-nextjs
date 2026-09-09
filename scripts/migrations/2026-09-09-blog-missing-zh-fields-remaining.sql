-- 2026-09-09-blog-missing-zh-fields-remaining.sql
-- Status: NOT APPLIED — needs human to run
-- Target: 2 published posts with content_zh but missing excerpt_zh, meta_title_zh, and meta_description_zh
-- Guard: idempotent WHERE — only affects rows matching the condition
--
-- Post 1: how-to-renovate-house-vancouver-first-timer-guide
--   content_zh: "如果您从未装修过房屋，从"我想要一个新厨房"到"承包商把钥匙交给我"的过程..."
--   title_zh: "溫哥華房屋裝修完整步驟指南：首次裝修必讀的流程與清單"
UPDATE blog_posts SET
  excerpt_zh         = '如果您从未装修过房屋，从"我想要一个新厨房"到"承包商把钥匙交给我"的过程可能会让人感觉像在没有地图的情况下航行。大多数温哥华的首次装修业主会低估时间线、跳过许可检查。',
  meta_title_zh      = '溫哥華房屋裝修完整步驟指南：首次裝修必讀的流程與清單',
  meta_description_zh = '溫哥華首次裝修業主常犯的錯誤：低估時間線、跳過許可檢查。本指南涵蓋2026年真實成本、BC省許可規則，以及Reno Stars的确切流程。'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND is_published = true
  AND excerpt_zh IS NULL;

-- Post 2: vancouver-property-type-renovation-2026
--   content_zh: "大温哥华的业主在2026年进行装修时，面临的第一个问题是：你拥有什么类型的房产？..."
--   title_zh: "溫哥華獨立屋、公寓、聯排別墅裝修有何不同（2026）"
UPDATE blog_posts SET
  excerpt_zh         = '大溫哥華的業主在2026年進行裝修時，面臨的第一個問題是：你擁有什麼類型的房產？獨立屋、共管公寓和聯排別墅各有不同的規則、成本和限制。',
  meta_title_zh      = '溫哥華獨立屋、公寓、聯排別墅裝修有何不同（2026）',
  meta_description_zh = '獨立屋、公寓、聯排別墅裝修各有什麼限制？許可證、物業規定、施工費用差異一次看懂。'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND is_published = true
  AND excerpt_zh IS NULL;
