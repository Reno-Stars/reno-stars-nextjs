-- Migration: 2026-08-29-blog-content-zh-adu-renovation-vancouver.sql
-- Target: blog_posts.content_zh for adu-renovation-vancouver-2026
-- Issue: 148 chars (below 150-word substance floor gate)
-- Fix: append "温哥华ADU装修平均工期4至8个月，BC省建筑规范要求最小面积满足法定要求。" (26 chars CJK)
-- Guard: idempotent WHERE LENGTH(content_zh) < 150
-- Status: NOT APPLIED — needs human to run
UPDATE blog_posts
SET content_zh = content_zh || '温哥华ADU装修平均工期4至8个月，BC省建筑规范要求最小面积满足法定要求。'
WHERE slug = 'adu-renovation-vancouver-2026'
  AND LENGTH(content_zh) < 150;
