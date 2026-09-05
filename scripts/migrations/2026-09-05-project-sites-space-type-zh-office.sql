-- Migration: project_sites.space_type_zh for Vancouver WFH Glass Partition Office Conversion
-- ID: 6d5050fa-48ec-43c4-8187-ecd814dbb947
-- Title: Vancouver WFH Glass Partition Office Conversion
-- space_type_zh is NULL; inferred from title as "办公室" (home office)
-- NOT APPLIED — needs human to run before deploying this migration
UPDATE project_sites
SET space_type_zh = '办公室'
WHERE id = '6d5050fa-48ec-43c4-8187-ecd814dbb947'
  AND (space_type_zh IS NULL OR space_type_zh = '');
