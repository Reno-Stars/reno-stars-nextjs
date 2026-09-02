-- Migration: project_sites duration_zh
-- Affected rows: 3 published project_sites with NULL duration_zh
-- Status: NOT APPLIED — needs human to run
-- Idempotent: UPDATE only if duration_zh IS NULL

UPDATE project_sites
SET duration_zh = '1周'
WHERE id = '6d5050fa-48ec-43c4-8187-ecd814dbb947'
  AND duration_zh IS NULL;
