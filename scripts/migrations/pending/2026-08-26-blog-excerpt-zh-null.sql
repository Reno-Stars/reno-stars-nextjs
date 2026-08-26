-- Migration: 2026-08-26-blog-excerpt-zh-null
-- Target: blog_posts excerpt_zh IS NULL
-- Rows found: 1 (id: 34e43ef8-6fde-4ef9-ac66-3f46f99b9df6, slug: pre-sale-renovation-white-rock-bc-2026)
-- Status: NOT APPLIED — needs human to run
-- NOTE: Credential agent_ro is SELECT-only; this file is a reviewed migration
--       for human apply only. Do NOT run via DB_QUERY_API_TOKEN.

UPDATE blog_posts
SET excerpt_zh = '白石预售装修投资回报指南 (2026)：针对 Semiahmoo 和 Ocean Park 卖家的精选项目。厨房、浴室和海岸线外观升级，回报率达售价的 150–300%。'
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND excerpt_zh IS NULL;
