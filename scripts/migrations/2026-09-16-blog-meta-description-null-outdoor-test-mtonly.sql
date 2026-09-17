-- Migration: NOT APPLIED — requires human to run
-- 2026-09-16-blog-meta-description-null-outdoor-test-mtonly.sql
-- Post: outdoor-test-mtonly (247e6fde-08dc-4285-b5c7-bbe236069047)
-- Issue: meta_description_en IS NULL and meta_description_zh IS NULL (confirmed via DB)
--        This post has title_zh and full content_zh already; only SEO descriptions are missing.
-- Idempotent guard: only touches rows where these columns remain NULL.

UPDATE blog_posts
SET
  meta_description_en =
    CASE WHEN meta_description_en IS NULL
      THEN 'Planning a deck, patio or outdoor living space in Vancouver? This guide covers 2026 deck costs, permit requirements and the full renovation process in Metro Vancouver.'
      ELSE meta_description_en
    END,
  meta_description_zh =
    CASE WHEN meta_description_zh IS NULL
      THEN '想在温哥华建造甲板或露台？本指南涵盖2026年大温哥华甲板费用、许可要求及完整装修流程。'
      ELSE meta_description_zh
    END
WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047'
  AND (
    meta_description_en IS NULL
    OR meta_description_zh IS NULL
  );
