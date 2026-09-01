-- Migration: blog_posts — excerpt_zh for pre-sale-renovation-white-rock-bc-2026
-- Date: 2026-09-02
-- Status: NOT APPLIED — needs human to run against production DB
-- Row: pre-sale-renovation-white-rock-bc-2026 (id: 34e43ef8-6fde-4ef9-ac66-3f46f99b9df6)
-- excerpt_zh was NULL; excerpt_en is available for translation
-- This row is NOT covered by the 2026-09-01 excerpt_zh backlog cap (132 pending);
--   it was identified independently this run and has no pending migration yet
UPDATE blog_posts
SET excerpt_zh = '白石预售装修投资回报指南 2026：Semiahmoo 和 Ocean Park 卖家的首选工程。厨房、浴室和海岸线外观升级，在白石海滩市场的销售中可带来 150–300% 的成本回报。'
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND excerpt_zh IS NULL;
