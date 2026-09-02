-- Migration: project_sites space_type_zh + space_type_en
-- 6 rows: 5 whole-house renovations (space_type_en also null), 1 WFH office conversion
-- Previously all rows with space_type_zh null had their English counterpart also null,
-- so this migration populates BOTH fields for the 5 whole-house rows.
-- Idempotent: WHERE guard uses both id and the NULL check so it is safe to re-run.

UPDATE project_sites
SET
  space_type_en = CASE
    WHEN id = '6d5050fa-48ec-43c4-8187-ecd814dbb947' THEN 'Home Office'
    ELSE 'Whole House'
  END,
  space_type_zh = CASE
    WHEN id = '6d5050fa-48ec-43c4-8187-ecd814dbb947' THEN '家庭辦公室'
    ELSE '全屋'
  END
WHERE id IN (
  'e399244f-cd07-46ee-96b6-0de18d7f692a',  -- Coquitlam Whole House Renovation
  '251a78d6-53dc-4fce-abba-163192389c67',  -- Richmond Whole House Renovation (3)
  '7fa25131-3f23-4622-9069-3a55658a3247',  -- Richmond Whole House Renovation (2)
  '06f0051b-be50-4c8a-a5a6-2ddd53722e5a',  -- Richmond Whole House Renovation
  '0eb5a3ea-ca5c-47ee-8d41-835b922ae7d8',  -- Surrey Whole House Renovation
  '6d5050fa-48ec-43c4-8187-ecd814dbb947'   -- Vancouver WFH Glass Partition Office
)
AND (
  space_type_zh IS NULL
  OR space_type_en IS NULL
);
