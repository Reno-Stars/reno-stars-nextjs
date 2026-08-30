-- 2026-08-30-project-image-pairs-after-alt-zh-batch2.sql
-- Migrate remaining English-only after_alt_text_zh entries in project_image_pairs
-- NOT APPLIED — needs human to run
-- Idempotent: WHERE ...AND after_alt_text_zh !~ '[一-鿿]' guard prevents double-update
UPDATE project_image_pairs
SET after_alt_text_zh = CASE id
  WHEN '48240e67-d904-426e-8846-2be0a5fbdd3f'
    THEN '带香槟金色五金件的步入式淋浴间，配嵌入式大理石坐凳'
  WHEN 'e7a449ad-659f-49e3-9050-0183c0c9fdeb'
    THEN '带背光香槟金色修饰壁龛的大理石淋浴墙'
  WHEN '9e6b9b49-0ac3-4bbe-baa6-bea86452be29'
    THEN '温哥华西温豪华浴室中，铜质壁灯环绕拱形镜双台盆'
  WHEN '1402cbba-2415-4435-b6ab-26aaba02830a'
    THEN '香槟金色拱形穿衣镜配复古黄铜壁灯'
END
WHERE id IN (
  '48240e67-d904-426e-8846-2be0a5fbdd3f',
  'e7a449ad-659f-49e3-9050-0183c0c9fdeb',
  '9e6b9b49-0ac3-4bbe-baa6-bea86452be29',
  '1402cbba-2415-4435-b6ab-26aaba02830a'
)
AND after_alt_text_zh IS NOT NULL
AND after_alt_text_zh !~ '[一-鿿]';
