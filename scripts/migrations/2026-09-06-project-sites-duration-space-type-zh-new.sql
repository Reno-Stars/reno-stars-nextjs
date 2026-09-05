-- Migrate project_sites locale fields not covered by prior migrations.
-- Richmond Whole House Renovation / 列治文全屋装修
-- space_type_zh: "全屋翻新" — correct value for whole-house scope
-- ID corrected from wrong 251a78d6-9e1e-42e3-9e0e-77d7e66a4b90 (does not exist in DB)
--   to correct 251a78d6-53dc-4fce-abba-163192389c67 (confirmed via DB query 2026-09-05)
-- NOT APPLIED — needs human run against live DB.

UPDATE project_sites
SET
  duration_zh = '1-2个月',
  space_type_zh = '全屋翻新'
WHERE id = '64f0f111-4920-434f-ab7e-0c2c411e6633'
  AND (duration_zh IS NULL OR duration_zh = '');

UPDATE project_sites
SET
  space_type_zh = '全屋翻新'
WHERE id = '251a78d6-53dc-4fce-abba-163192389c67'
  AND (space_type_zh IS NULL OR space_type_zh = '');
