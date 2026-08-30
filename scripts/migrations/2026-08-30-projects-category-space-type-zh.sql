-- Migration: projects category_zh + space_type_zh — 7+8 English-only rows
-- NOT APPLIED — needs human to run
-- Date: 2026-08-30
-- Audit: projects.category_zh IS NULL OR category_zh ~ '^[ ]*$' → 7 rows
-- Audit: projects.space_type_zh IS NULL OR space_type_zh ~ '^[ ]*$' → 8 rows
BEGIN;

-- category_zh: derived from title_en service type
UPDATE projects
SET category_zh = CASE
  WHEN title_en ILIKE '%bathroom%' THEN '卫浴装修'
  WHEN title_en ILIKE '%kitchen%' THEN '厨房装修'
  WHEN title_en ILIKE '%flooring%' OR title_en ILIKE '%floor%' THEN '地板安装'
  WHEN title_en ILIKE '%whole home%' OR title_en ILIKE '%whole house%' THEN '全屋装修'
  ELSE '装修'
END
WHERE id = '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb'
  AND (category_zh IS NULL OR category_zh ~ '^[ ]*$');

UPDATE projects
SET category_zh = '地板安装'
WHERE id = '3ef5531b-cfb9-454d-9cd2-90887b3775f0'
  AND (category_zh IS NULL OR category_zh ~ '^[ ]*$');

UPDATE projects
SET category_zh = '全屋装修'
WHERE id = '331f03b3-624e-4ddf-9b38-c8768d3d1932'
  AND (category_zh IS NULL OR category_zh ~ '^[ ]*$');

UPDATE projects
SET category_zh = '全屋装修'
WHERE id = '9cbc6ccf-bc07-4c2f-a867-c57ab4218728'
  AND (category_zh IS NULL OR category_zh ~ '^[ ]*$');

UPDATE projects
SET category_zh = '厨房装修'
WHERE id = '838f1ee4-beaa-42e7-bca5-73c810422d76'
  AND (category_zh IS NULL OR category_zh ~ '^[ ]*$');

UPDATE projects
SET category_zh = '全屋装修'
WHERE id = 'c8a66604-00ed-4307-8b28-b95257eaa249'
  AND (category_zh IS NULL OR category_zh ~ '^[ ]*$');

UPDATE projects
SET category_zh = '全屋装修'
WHERE id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f'
  AND (category_zh IS NULL OR category_zh ~ '^[ ]*$');

-- space_type_zh: derived from title_en property type hint
UPDATE projects
SET space_type_zh = '独立屋'
WHERE id = '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb'
  AND (space_type_zh IS NULL OR space_type_zh ~ '^[ ]*$');

UPDATE projects
SET space_type_zh = '公寓'
WHERE id = '3ef5531b-cfb9-454d-9cd2-90887b3775f0'
  AND (space_type_zh IS NULL OR space_type_zh ~ '^[ ]*$');

UPDATE projects
SET space_type_zh = '独立屋'
WHERE id = '561278cf-e1cd-453c-8ec7-302075e6cc54'
  AND (space_type_zh IS NULL OR space_type_zh ~ '^[ ]*$');

UPDATE projects
SET space_type_zh = '独立屋'
WHERE id = '331f03b3-624e-4ddf-9b38-c8768d3d1932'
  AND (space_type_zh IS NULL OR space_type_zh ~ '^[ ]*$');

UPDATE projects
SET space_type_zh = '独立屋'
WHERE id = '9cbc6ccf-bc07-4c2f-a867-c57ab4218728'
  AND (space_type_zh IS NULL OR space_type_zh ~ '^[ ]*$');

UPDATE projects
SET space_type_zh = '公寓'
WHERE id = '838f1ee4-beaa-42e7-bca5-73c810422d76'
  AND (space_type_zh IS NULL OR space_type_zh ~ '^[ ]*$');

UPDATE projects
SET space_type_zh = '独立屋'
WHERE id = 'c8a66604-00ed-4307-8b28-b95257eaa249'
  AND (space_type_zh IS NULL OR space_type_zh ~ '^[ ]*$');

UPDATE projects
SET space_type_zh = '独立屋'
WHERE id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f'
  AND (space_type_zh IS NULL OR space_type_zh ~ '^[ ]*$');

COMMIT;
