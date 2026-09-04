-- Migration: 2026-09-04
-- Table: blog_posts
-- Issue: outdoor-test-mtonly missing meta_description_zh (and meta_description_en which is also NULL)
-- Status: NOT APPLIED — needs human to run
-- idempotent WHERE guard: only updates if the field is still NULL

UPDATE blog_posts
SET
  meta_description_zh = '温哥华业主正在将后院改造成全年可用的户外生活空间。本指南涵盖2026年甲板、露台和有顶户外区域的装修费用及大温哥华各城市的许可要求。'
WHERE
  slug = 'outdoor-test-mtonly'
  AND meta_description_zh IS NULL;
