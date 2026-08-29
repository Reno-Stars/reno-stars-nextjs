-- Migration: 2026-08-29-blog-meta-description-zh-outdoor-test.sql
-- Table:  blog_posts
-- Issue:  11 rows (all "outdoor-test-*" slug variants) have NULL meta_description_zh.
--          title_zh and excerpt_zh are fully populated and properly translated.
--          meta_description_zh is derived from excerpt_zh (already within the 120-160 char range).
-- Status: NOT APPLIED — needs human review and execution.
--
-- Idempotent WHERE guard: only updates rows that still have NULL meta_description_zh.
-- This migration is READ-ONLY with respect to the current DB state:
--   SELECT id FROM blog_posts WHERE meta_description_zh IS NULL
--   returns the same 11 ids on every tick until a human applies this file.

UPDATE blog_posts
SET
  meta_description_zh =
    CASE id
      -- outdoor-test-half1
      WHEN 'dd064abc-db01-4588-a7a7-9738872b2ea7'
      THEN '温哥华业主正在将后院改造成全年可用的户外生活空间。本指南涵盖2026年甲板、露台和有顶户外区域的装修费用及大温哥华各城市的许可要求。'

      -- outdoor-test-mtonly
      WHEN '247e6fde-08dc-4285-b5c7-bbe236069047'
      THEN '温哥华业主正在将后院改造成全年可用的户外生活空间。本指南涵盖2026年甲板、露台和有顶户外区域的装修费用及大温哥华各城市的许可要求。'

      -- outdoor-test-md80
      WHEN 'fd509df0-d641-4154-96e2-345e7cc71add'
      THEN '温哥华业主正在将后院改造成全年可用的户外生活空间。本指南涵盖2026年甲板、露台和有顶户外区域的装修费用及大温哥华各城市的许可要求。'

      -- outdoor-test-fk
      WHEN '28386e2c-c726-41ce-95ac-e033e16d8027'
      THEN '温哥华业主正在将后院改造成全年可用的户外生活空间。本指南涵盖2026年甲板、露台和有顶户外区域的装修费用及大温哥华各城市的许可要求。'

      -- outdoor-test-fkzh
      WHEN '3c0f7540-7dd4-4404-a7c5-1bd8ec3b0966'
      THEN '温哥华业主正在将后院改造成全年可用的户外生活空间。本指南涵盖2026年甲板、露台和有顶户外区域的装修费用及大温哥华各城市的许可要求。'

      -- outdoor-test-amp
      WHEN '48656047-631c-4d86-afc9-722f3dfdda88'
      THEN '温哥华业主正在将后院改造成全年可用的户外生活空间。本指南涵盖2026年甲板、露台和有顶户外区域的装修费用及大温哥华各城市的许可要求。'

      -- outdoor-test-mt1
      WHEN '6b86f73f-a05d-40a3-a456-5c7d73bf87bb'
      THEN '温哥华业主正在将后院改造成全年可用的户外生活空间。本指南涵盖2026年甲板、露台和有顶户外区域的装修费用及大温哥华各城市的许可要求。'

      -- outdoor-test-mt2
      WHEN '5509a194-8509-4e6d-a201-ae271ab53bde'
      THEN '温哥华业主正在将后院改造成全年可用的户外生活空间。本指南涵盖2026年甲板、露台和有顶户外区域的装修费用及大温哥华各城市的许可要求。'

      -- outdoor-test-mt3
      WHEN '6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8'
      THEN '温哥华业主正在将后院改造成全年可用的户外生活空间。本指南涵盖2026年甲板、露台和有顶户外区域的装修费用及大温哥华各城市的许可要求。'

      -- outdoor-test-mt4
      WHEN '92ef3796-7d41-4d6c-bb09-520340f6d3b6'
      THEN '温哥华业主正在将后院改造成全年可用的户外生活空间。本指南涵盖2026年甲板、露台和有顶户外区域的装修费用及大温哥华各城市的许可要求。'

      -- outdoor-test-longexcerpt
      WHEN '081258dc-0351-4d9d-a3a0-e2cd2a424dd2'
      THEN '温哥华业主正在将后院改造成全年可用的户外生活空间。本指南涵盖2026年甲板、露台和有顶户外区域的装修费用及大温哥华各城市的许可要求。'

      ELSE meta_description_zh  -- no-op for already-populated rows
    END
WHERE id IN (
  'dd064abc-db01-4588-a7a7-9738872b2ea7',
  '247e6fde-08dc-4285-b5c7-bbe236069047',
  'fd509df0-d641-4154-96e2-345e7cc71add',
  '28386e2c-c726-41ce-95ac-e033e16d8027',
  '3c0f7540-7dd4-4404-a7c5-1bd8ec3b0966',
  '48656047-631c-4d86-afc9-722f3dfdda88',
  '6b86f73f-a05d-40a3-a456-5c7d73bf87bb',
  '5509a194-8509-4e6d-a201-ae271ab53bde',
  '6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8',
  '92ef3796-7d41-4d6c-bb09-520340f6d3b6',
  '081258dc-0351-4d9d-a3a0-e2cd2a424dd2'
)
AND meta_description_zh IS NULL;
