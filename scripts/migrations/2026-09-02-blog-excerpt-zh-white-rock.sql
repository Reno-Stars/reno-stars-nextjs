-- Migration: populate NULL excerpt_zh for pre-sale-renovation-white-rock-bc-2026
-- Topic: White Rock pre-sale renovation ROI guide
-- NOT APPLIED — needs human to run
-- Idempotent: only updates if excerpt_zh is NULL
UPDATE blog_posts
SET excerpt_zh = '在售前进行翻新工程可以让White Rock的海滨房屋在市场上脱颖而出。了解Reno Stars如何在2026年为BC省White Rock的业主提供高回报率的翻新服务。'
WHERE slug = 'pre-sale-renovation-white-rock-bc-2026'
  AND excerpt_zh IS NULL;
