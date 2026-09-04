-- Migration: 2026-09-04-blog-posts-meta-description-zh-247e6fde.sql
-- Target: blog_posts.id = '247e6fde-08dc-4285-b5c7-bbe236069047' (slug: outdoor-test-mtonly)
-- Gap: meta_description_zh IS NULL; focus_keyword_zh covered separately
--   by 2026-09-04-blog-posts-focus-keyword-null.sql
-- Content: Vancouver outdoor renovation (decks, patios, backyard)
-- Title: 温哥华户外空间装修完整指南 -- 露台、甲板、后院改造与许可申请 (2026)
-- Status: NOT APPLIED — needs human to run against production DB
-- Author: SEO Agent 2026-09-04

BEGIN;

UPDATE blog_posts
SET
  meta_description_zh = '温哥华户外空间装修完整指南：甲板、露台、后院改造费用、材料、许可申请与装修流程。2026年大温哥华地区实际案例。'
WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047'
  AND meta_description_zh IS NULL;

COMMIT;
