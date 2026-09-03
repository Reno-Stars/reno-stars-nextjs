-- Migration: blog_posts — populate excerpt_zh for pre-sale-renovation-white-rock
-- Date: 2026-08-28
-- Status: NOT APPLIED — needs human to run
-- Target id: 34e43ef8-6fde-4ef9-ac66-3f46f99b9df6
-- Source: DB query this run (2026-08-28)
-- Dedup: N/A — content integrity fix, not a new post

UPDATE blog_posts
SET excerpt_zh = '白石镇售前翻新投资回报指南 2026：面向 Semiahmoo 和 Ocean Park 卖家的最佳项目。厨房、浴室和海岸线外观升级，在白石镇海滩市场销售时回报率为成本的 150–300%。'
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
AND (excerpt_zh IS NULL OR excerpt_zh = '');
