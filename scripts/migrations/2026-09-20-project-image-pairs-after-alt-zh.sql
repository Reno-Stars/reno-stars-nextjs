-- Migration: NOT APPLIED — needs human to run
-- Fix English text in project_image_pairs.after_alt_text_zh (7 rows where zh == en)
-- These 7 after-photos have Chinese alt text copied verbatim from English,
-- which provides zero localization value for Chinese-speaking visitors.
UPDATE project_image_pairs
SET    after_alt_text_zh = CASE id
  -- 3fd23985: Ornate gold-framed wall mirror over marble bathtub with plantation shutters
  WHEN '3fd23985-91a5-47bd-bf52-b08fd93791d9'
  THEN '带雕花金框墙壁镜，大理石浴缸上方，百叶窗装饰'

  -- 48240e67: Walk-in shower with champagne gold fixtures and built-in marble bench
  WHEN '48240e67-d904-426e-8846-2be0a5fbdd3f'
  THEN '步入式淋浴间，香槟金五金配件，内置大理石台阶'

  -- e7a449ad: Marble shower wall with backlit champagne gold trimmed niche
  WHEN 'e7a449ad-659f-49e3-9050-0183c0c9fdeb'
  THEN '大理石淋浴墙，背光香槟金修饰壁龛'

  -- aa1a98a5: Frameless glass walk-in shower with champagne gold rain head and basketweave marble mosaic floor
  WHEN 'aa1a98a5-46c5-4351-817a-ca82e370dd0c'
  THEN '无框玻璃步入式淋浴间，香槟金花洒头，篮纹大理石马赛克地板'

  -- 1402cbba: Champagne gold arched dressing mirror with vintage brass wall sconces
  WHEN '1402cbba-2415-4435-b6ab-26aaba02830a'
  THEN '香槟金色拱形穿衣镜，复古黄铜壁灯'

  -- 16c45fa7: Double-sink French-style vanity with arched ceiling and champagne gold faucets
  WHEN '16c45fa7-8bb7-4ea2-99f5-bbe1b1e24092'
  THEN '法式双槽浴室柜，拱形天花板，香槟金龙头'

  -- 9e6b9b49: Brass sconces flanking arched mirror over double vanity in West Vancouver luxury bath
  WHEN '9e6b9b49-0ac3-4bbe-baa6-bea86452be29'
  THEN '西温豪华浴室，双台盆上方拱形镜两侧黄铜壁灯'
END
WHERE id IN (
  '3fd23985-91a5-47bd-bf52-b08fd93791d9',
  '48240e67-d904-426e-8846-2be0a5fbdd3f',
  'e7a449ad-659f-49e3-9050-0183c0c9fdeb',
  'aa1a98a5-46c5-4351-817a-ca82e370dd0c',
  '1402cbba-2415-4435-b6ab-26aaba02830a',
  '16c45fa7-8bb7-4ea2-99f5-bbe1b1e24092',
  '9e6b9b49-0ac3-4bbe-baa6-bea86452be29'
)
AND after_alt_text_zh = after_alt_text_en;
