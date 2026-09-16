-- Migration: partners.name_zh — correct Chinese names for 5 remaining brand-name partners
-- NOT APPLIED — requires human to run against the live database
-- Complementary to 2026-09-16-partners-name-zh-remaining.sql (covers Minex/Ames/Benjamin/Caesarstone)
-- Idempotent: uses brand-name transliterations

UPDATE partners
SET name_zh = CASE name_en
  WHEN 'Ensuite'    THEN '恩苏伊特'
  WHEN 'Splashes'   THEN '斯普拉奇斯'
  WHEN 'Vico Stone' THEN '维科石业'
  WHEN 'Fontile'    THEN '丰泰尔'
  WHEN 'Prosol'     THEN '普罗索尔'
END
WHERE name_en IN ('Ensuite', 'Splashes', 'Vico Stone', 'Fontile', 'Prosol')
AND (
  name_zh IS NULL
  OR name_zh = ''
  OR name_zh = name_en
);
