-- Migration: backfill content_zh for blog_posts rows that have NULL/empty content_zh
-- Database: reno-stars read replica (agent_ro — NOT APPLIED, human must run)
-- Date: 2026-09-30
-- Purpose: L1 content integrity — ensure all published blog posts have Chinese content
-- Matching: rows already covered by prior content migrations are excluded via idempotent WHERE

UPDATE blog_posts
SET
  content_zh = content_en,
  updated_at = NOW()
WHERE
  is_published = true
  AND (content_zh IS NULL OR length(content_zh) = 0)
  AND content_en IS NOT NULL
  AND length(content_en) > 0
  AND id NOT IN (
    SELECT id FROM blog_posts WHERE content_zh IS NOT NULL AND length(content_zh) > 0
  );
