-- Migration: blog_posts — add excerpt_zh for White Rock pre-sale post
-- Date: 2026-08-29
-- Status: NOT APPLIED — needs human to run
-- Target: blog_posts row with slug = 'pre-sale-renovation-white-rock-bc-2026'
-- Reason: excerpt_zh IS NULL (1 row found this tick); excerpt_en exists and is genuine English prose
-- Translation: genuine zh-Hant, not English text

UPDATE blog_posts
SET excerpt_zh = '白沙羅Presale裝修回報指南：針對Semiahmoo及Ocean Park賣家的頂級工程項目。廚房、浴室及海岸路緣升級工程，在白沙羅海濱市場的銷售中回報率高達150至300%。'
WHERE slug = 'pre-sale-renovation-white-rock-bc-2026'
  AND excerpt_zh IS NULL;
