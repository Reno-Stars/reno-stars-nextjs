-- 2026-09-09-blog-meta-description-zh-remaining.sql
-- Status: NOT APPLIED — needs human to run
-- Target: 2 published posts with content_zh but missing meta_description_zh
-- Guard: idempotent WHERE — only affects rows matching the condition
--
-- Post 1: how-to-renovate-house-vancouver-first-timer-guide
UPDATE blog_posts SET
  meta_description_zh = '溫哥華首次裝修業主常犯的錯誤：低估時間線、跳過許可檢查。本指南涵蓋2026年真實成本、BC省許可規則，以及Reno Stars的确切流程。'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND is_published = true
  AND (meta_description_zh IS NULL OR meta_description_zh = '');

-- Post 2: vancouver-property-type-renovation-2026
UPDATE blog_posts SET
  meta_description_zh = '獨立屋、公寓、聯排別墅裝修各有什麼限制？許可證、物業規定、施工費用差異一次看懂。'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND is_published = true
  AND (meta_description_zh IS NULL OR meta_description_zh = '');
