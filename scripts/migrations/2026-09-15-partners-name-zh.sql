-- Migration: 2026-09-15-partners-name-zh.sql
-- Task: Ladder 1 — Content integrity, partners.name_zh English-only
-- NOT APPLIED — needs human to run and verify
-- 9 partners where name_zh is the English name, not Chinese
UPDATE partners
SET name_zh = CASE id
  WHEN 'd71887ab-dd3b-4340-a3a4-2eac89199d94' THEN '明思传媒'
  WHEN '3fdb7394-71b1-4be5-a8e0-dc7953a0eef4' THEN '艾姆斯瓷砖石材'
  WHEN '090ef7d9-b8d6-43cb-80af-55fd9a4a8535' THEN '本杰明摩尔'
  WHEN 'b80d6d65-9f42-47a9-b22c-b613415d67a1' THEN '凯撒石'
  WHEN '5d729077-cb7a-4b65-891a-935b15c4863f' THEN '恩苏恩'
  WHEN 'ac973ad5-c06b-4b9a-9425-cf7d2d834f05' THEN '斯普拉奇斯'
  WHEN '88810906-ae88-411f-8884-4d5892c00255' THEN '维可石'
  WHEN '19ea35cb-d63b-4f23-a450-a6629b07f622' THEN '方泰尔'
  WHEN '1141395b-424c-4458-a92c-8c916bb4c80f' THEN '普罗索尔'
  ELSE name_zh
END
WHERE id IN (
  'd71887ab-dd3b-4340-a3a4-2eac89199d94',
  '3fdb7394-71b1-4be5-a8e0-dc7953a0eef4',
  '090ef7d9-b8d6-43cb-80af-55fd9a4a8535',
  'b80d6d65-9f42-47a9-b22c-b613415d67a1',
  '5d729077-cb7a-4b65-891a-935b15c4863f',
  'ac973ad5-c06b-4b9a-9425-cf7d2d834f05',
  '88810906-ae88-411f-8884-4d5892c00255',
  '19ea35cb-d63b-4f23-a450-a6629b07f622',
  '1141395b-424c-4458-a92c-8c916bb4c80f'
)
AND name_zh IS NOT NULL
AND name_zh !~ '[一-鿿]';
