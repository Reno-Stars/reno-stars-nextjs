-- Migration: 2026-09-23
-- Table: blog_posts
-- Column: excerpt_zh
-- Issue: row 835af76e-2175-4e38-b7af-b31c51cbc0ba has excerpt_zh containing no CJK characters (content is English-only)
-- Action: backfill with translated excerpt
-- Status: NOT APPLIED — needs human to run
UPDATE blog_posts
SET excerpt_zh = 'Delta浴室翻新费用（2026）：真实项目数据。Tsawwassen、Ladner、北Delta浴室装修报价，含许可证、预算指南。'
WHERE id = '835af76e-2175-4e38-b7af-b31c51cbc0ba'
AND excerpt_zh !~ '[一-\u9FFF]';
