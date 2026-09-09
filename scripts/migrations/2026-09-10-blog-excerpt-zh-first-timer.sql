-- 2026-09-10-blog-excerpt-zh-first-timer.sql
-- Status: NOT APPLIED — needs human to run
-- Target: how-to-renovate-house-vancouver-first-timer-guide (id: 27dd8051)
-- Gap: excerpt_zh IS NULL — all other SEO fields already covered by pending migrations
-- Source: excerpt_en translation (genuine English excerpt from DB query)
-- NOT covered by any existing migration (confirmed this tick by grep)

UPDATE blog_posts
SET excerpt_zh = '大多数温哥华首次装修业主会低估时间线、跳过许可检查，并在收到第一份合同就签署。本指南涵盖每个步骤。'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND excerpt_zh IS NULL;
