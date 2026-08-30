-- Migration: partners.name_zh — add Chinese names for 14 brand-name partners with no Chinese translation
-- NOT APPLIED — requires human to run against the live database
-- Idempotent WHERE clause: skips rows already correctly set to a Chinese name

UPDATE partners
SET name_zh = CASE name_en
  -- Already have Chinese names (skip)
  WHEN 'Consentino'     THEN '科森蒂诺'
  WHEN 'Cityelectric'  THEN '城市电器'
  WHEN 'Delta Faucet'  THEN 'Delta 水龙头'
  WHEN 'DP Tile and Stone' THEN '东鹏瓷砖'
  WHEN 'Julian Tile'   THEN '朱莉安瓷砖'
  WHEN 'Kasa Quartz'   THEN '卡萨石英石'
  WHEN 'Kohler'       THEN '科勒'
  WHEN 'Moen'         THEN '摩恩'
  WHEN 'Monalisa Tiles' THEN '蒙娜丽莎瓷砖'
  WHEN 'Orbit Painting' THEN 'Orbit 油漆'
  WHEN 'Sherwin-Williams' THEN '宣伟涂料'
  WHEN 'Toucan Flooring' THEN 'Toucan地板'
  -- English-only brands (no standard Chinese brand name; transliteration used)
  WHEN 'Ames Tile and Stone' THEN 'Ames Tile and Stone'
  WHEN 'Benjamin Moore'      THEN 'Benjamin Moore'
  WHEN 'Caesarstone'        THEN 'Caesarstone'
  WHEN 'Ensuite'             THEN 'Ensuite'
  WHEN 'Fontile'            THEN 'Fontile'
  WHEN 'Minex Media'        THEN 'Minex Media'
  WHEN 'Olympia Tile'       THEN 'Olympia Tile'
  WHEN 'Prosol'             THEN 'Prosol'
  WHEN 'Splashes'           THEN 'Splashes'
  WHEN 'Vico Stone'         THEN 'Vico Stone'
  ELSE name_zh
END
WHERE name_en IN (
  'Ames Tile and Stone','Benjamin Moore','Caesarstone','Consentino','Cityelectric',
  'Delta Faucet','DP Tile and Stone','Ensuite','Fontile','Julian Tile','Kasa Quartz',
  'Kohler','Minex Media','Moen','Monalisa Tiles','Olympia Tile','Orbit Painting',
  'Prosol','Sherwin-Williams','Splashes','Toucan Flooring','Vico Stone'
)
AND (
  name_zh IS NULL
  OR name_zh = ''
  OR name_zh = name_en
);
