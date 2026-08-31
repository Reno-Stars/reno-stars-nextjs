-- Migration: 2026-08-31-project-sites-duration-space-type-zh-remaining.sql
-- Table: project_sites
-- Columns: duration_zh, space_type_zh
-- Rows: 6 published project_sites with remaining NULL zh values
-- Source: live DB query 2026-08-31
-- Cross-referenced against prior migration 2026-08-25-project-sites-duration-space-type-zh.sql
-- which was written but NOT YET APPLIED by humans
--
-- NOT APPLIED — needs human to run after review

-- =============================================================================
-- All UPDATE statements are idempotent: each guarded by (col IS NULL OR col = '')
-- so re-running after application has zero effect.
-- =============================================================================

-- space_type_zh = '独立屋' (whole house = independent house)
-- Duration inferenced from project type and similar Richmond/Coquitlam/Surrey projects:

-- Surrey Whole House Renovation: 6-8 weeks
UPDATE project_sites SET space_type_zh = '独立屋'
  WHERE id = '0eb5a3ea-ca5c-47ee-8d41-835b922ae7d8'
    AND (space_type_zh IS NULL OR space_type_zh = '');

-- Coquitlam Whole House Renovation: 6-8 weeks
UPDATE project_sites SET space_type_zh = '独立屋'
  WHERE id = 'e399244f-cd07-46ee-96b6-0de18d7f692a'
    AND (space_type_zh IS NULL OR space_type_zh = '');

-- Richmond Whole House Renovation: 7-9 weeks
UPDATE project_sites SET space_type_zh = '独立屋'
  WHERE id = '7fa25131-3f23-4622-9069-3a55658a3247'
    AND (space_type_zh IS NULL OR space_type_zh = '');

-- Richmond Whole House Renovation (second site): 7-9 weeks
UPDATE project_sites SET space_type_zh = '独立屋'
  WHERE id = '06f0051b-be50-4c8a-a5a6-2ddd53722e5a'
    AND (space_type_zh IS NULL OR space_type_zh = '');

-- Richmond 3-bath full reno: 8-10 weeks (matches richmond 3-bath pattern)
UPDATE project_sites SET duration_zh = '8-10周'
  WHERE id = '0e6748db-5c75-4c6b-91e3-179b84ebe030'
    AND (duration_zh IS NULL OR duration_zh = '');

-- Vancouver WFH Glass Partition Office Conversion: shorter scope, 4-6 weeks
UPDATE project_sites SET duration_zh = '4-6周'
  WHERE id = '6d5050fa-48ec-43c4-8187-ecd814dbb947'
    AND (duration_zh IS NULL OR duration_zh = '');
