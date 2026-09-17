-- Migration: partners.name_zh — correct Chinese names for 4 remaining brand-name partners
-- NOT APPLIED — requires human to run against the live database
-- Corrects the 2026-08-30 migration which incorrectly set name_zh = name_en
-- Idempotent: uses brand-name translations, not English copies

UPDATE partners
SET name_zh = CASE name_en
  WHEN 'Minex Media'        THEN '米内克斯媒体'
  WHEN 'Ames Tile and Stone' THEN '艾姆斯瓷砖石材'
  WHEN 'Benjamin Moore'      THEN '本杰明摩尔'
  WHEN 'Caesarstone'         THEN '凯撒石'
END
WHERE name_en IN ('Minex Media', 'Ames Tile and Stone', 'Benjamin Moore', 'Caesarstone')
AND (
  name_zh IS NULL
  OR name_zh = ''
  OR name_zh = name_en  -- catches rows set by the 2026-08-30 migration
);
