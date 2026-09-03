-- Migration: NOT APPLIED — needs human to run
-- 2026-08-28 blog_posts.excerpt_zh for pre-sale-renovation-white-rock-bc-2026
-- Source: 254 published posts audited; 1 missing excerpt_zh
-- idempotent WHERE guard ensures no double-write

BEGIN;

UPDATE blog_posts
SET excerpt_zh = '白石预售房屋装修回报指南 2026：面向 Semiahmoo 和 Ocean Park 卖家的首选工程。厨房、浴室及海岸路缘美化升级，在白石海滩市场的销售中可带来 150%–300% 的投资回报。'
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

COMMIT;
