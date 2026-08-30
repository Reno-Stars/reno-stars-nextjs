-- Migration: blog_posts.excerpt_zh — populate missing Chinese excerpt
-- Date: 2026-08-30
-- Row: pre-sale-renovation-white-rock-bc-2026 (id: 34e43ef8-6fde-4ef9-ac66-3f46f99b9df6)
-- Status: NOT APPLIED — requires human to run against the live database
-- Idempotent: UPDATE ... WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6' AND (excerpt_zh IS NULL OR excerpt_zh = '')

UPDATE blog_posts
SET excerpt_zh = '白石预出售装修投资回报指南2026：为Semiahmoo和Ocean Park卖家精选项目。厨房、卫生间和海岸线外观升级，在白石海滨市场销售时回报率达150%至300%。'
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');
