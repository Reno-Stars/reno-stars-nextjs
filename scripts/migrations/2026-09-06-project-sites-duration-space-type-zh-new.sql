-- Migrate project_sites locale fields not covered by prior migrations.
-- NOT APPLIED — needs human run against live DB.
-- Covers: 64f0f111 (duration_zh + space_type_zh), 251a78d6 (space_type_zh)

UPDATE project_sites
SET
  duration_zh = '1-2个月',
  space_type_zh = '全屋翻新'
WHERE id = '64f0f111-4920-434f-ab7e-0c2c411e6633'
  AND (duration_zh IS NULL OR duration_zh = '');

UPDATE project_sites
SET
  space_type_zh = '办公室装修'
WHERE id = '251a78d6-9e1e-42e3-9e0e-77d7e66a4b90'
  AND (space_type_zh IS NULL OR space_type_zh = '');
