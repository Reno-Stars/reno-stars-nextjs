-- Migration: partners.name_zh — set Chinese names for brand-name partners with no Chinese translation
-- NOT APPLIED — requires human to run against the live database
-- Idempotent: UPDATE ... WHERE name_zh IS NULL OR name_zh = '...' (no WHERE id needed; all covered rows have NULL/English name_zh)

UPDATE partners
SET name_zh = name_en
WHERE (name_zh IS NULL OR name_zh = '' OR name_zh = name_en)
AND name_en IN (
  'Ensuite',
  'Splashes',
  'Vico Stone',
  'Fontile',
  'Prosol'
);
