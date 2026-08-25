-- Migration: 2026-08-25-project-image-pairs-alt-text-zh.sql
-- Target: project_image_pairs — English text in before_alt_text_zh, after_alt_text_zh, caption_zh
-- Found via: CJK regex !~ '[一-鿿]' on project west-vancouver-luxury-bathroom-champagne-gold (561278cf)
-- Rows: 2 before_alt_text_zh, 7 after_alt_text_zh, 5 caption_zh — all belong to same published project
-- NOT APPLIED — needs human review

BEGIN;

-- before_alt_text_zh: 2 rows with English text (need Chinese translation)
UPDATE project_image_pairs
SET before_alt_text_zh =
  CASE id
    WHEN '3fd23985-91a5-47bd-bf52-b08fd93791d9'
      THEN '原始浸泡式浴缸，配有花纹壁纸和过时装饰——翻新前'
    WHEN 'aa1a98a5-46c5-4351-817a-ca82e370dd0c'
      THEN '90年代原始淋浴间，配有花纹壁纸和金色门框——翻新前'
  END
WHERE id IN ('3fd23985-91a5-47bd-bf52-b08fd93791d9', 'aa1a98a5-46c5-4351-817a-ca82e370dd0c')
  AND before_alt_text_zh IS NOT NULL
  AND before_alt_text_zh !~ '[一-鿿]';

-- after_alt_text_zh: 7 rows with English text (need Chinese translation)
UPDATE project_image_pairs
SET after_alt_text_zh =
  CASE id
    WHEN '3fd23985-91a5-47bd-bf52-b08fd93791d9'
      THEN '大理石浴缸上方配华丽金色边框墙镜，配有百叶窗'
    WHEN 'aa1a98a5-46c5-4351-817a-ca82e370dd0c'
      THEN '无框玻璃步入式淋浴间，配香槟金色顶喷和篮纹大理石马赛克地板'
    WHEN '48240e67-d904-426e-8846-2be0a5fbdd3f'
      THEN '步入式淋浴间，配香槟金色五金件和嵌入式大理石坐凳'
    WHEN 'e7a449ad-659f-49e3-9050-0183c0c9fdeb'
      THEN '大理石淋浴墙，背光香槟金色修边壁龛'
    WHEN '16c45fa7-8bb7-4ea2-99f5-bbe1b1e24092'
      THEN '法式双台盆梳妆柜，配拱形天花板和香槟金色龙头'
    WHEN '9e6b9b49-0ac3-4bbe-baa6-bea86452be29'
      THEN '黄铜壁灯配拱形镜子，温哥华西高端浴室双台盆'
    WHEN '1402cbba-2415-4435-b6ab-26aaba02830a'
      THEN '香槟金色拱形穿衣镜配复古黄铜壁灯'
  END
WHERE id IN (
  '3fd23985-91a5-47bd-bf52-b08fd93791d9',
  'aa1a98a5-46c5-4351-817a-ca82e370dd0c',
  '48240e67-d904-426e-8846-2be0a5fbdd3f',
  'e7a449ad-659f-49e3-9050-0183c0c9fdeb',
  '16c45fa7-8bb7-4ea2-99f5-bbe1b1e24092',
  '9e6b9b49-0ac3-4bbe-baa6-bea86452be29',
  '1402cbba-2415-4435-b6ab-26aaba02830a'
)
  AND after_alt_text_zh IS NOT NULL
  AND after_alt_text_zh !~ '[一-鿿]';

-- caption_zh: 5 rows with English text (need Chinese translation, subset of after_alt_text_zh rows)
UPDATE project_image_pairs
SET caption_zh =
  CASE id
    WHEN '48240e67-d904-426e-8846-2be0a5fbdd3f'
      THEN '步入式淋浴间，配香槟金色五金件和嵌入式大理石坐凳'
    WHEN 'e7a449ad-659f-49e3-9050-0183c0c9fdeb'
      THEN '大理石淋浴墙，背光香槟金色修边壁龛'
    WHEN '16c45fa7-8bb7-4ea2-99f5-bbe1b1e24092'
      THEN '法式双台盆梳妆柜，配拱形天花板和香槟金色龙头'
    WHEN '9e6b9b49-0ac3-4bbe-baa6-bea86452be29'
      THEN '黄铜壁灯配拱形镜子，温哥华西高端浴室双台盆'
    WHEN '1402cbba-2415-4435-b6ab-26aaba02830a'
      THEN '香槟金色拱形穿衣镜配复古黄铜壁灯'
  END
WHERE id IN (
  '48240e67-d904-426e-8846-2be0a5fbdd3f',
  'e7a449ad-659f-49e3-9050-0183c0c9fdeb',
  '16c45fa7-8bb7-4ea2-99f5-bbe1b1e24092',
  '9e6b9b49-0ac3-4bbe-baa6-bea86452be29',
  '1402cbba-2415-4435-b6ab-26aaba02830a'
)
  AND caption_zh IS NOT NULL
  AND caption_zh !~ '[一-鿿]';

COMMIT;
