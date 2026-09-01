-- Migration: project_image_pairs before/after alt text zh for West Vancouver luxury bath
-- Project: 561278cf-e1cd-453c-8ec7-302075e6cc54 (West Vancouver Luxury Bathroom Champagne Gold)
-- Issue: before_alt_text_zh and after_alt_text_zh contain English prose instead of Chinese
-- Rows covered (from prior batches): 16c45fa7, 9e6b9b49
-- NOT APPLIED — needs human to run

BEGIN;

-- Row: 3fd23985 — before: "Original soaker tub with damask wallpaper and dated finishes"
UPDATE project_image_pairs
SET before_alt_text_zh = '改造前：日式浴缸搭配压花壁纸和过时装饰 — 装修前'
WHERE id = '3fd23985-91a5-47bd-bf52-b08fd93791d9'
  AND before_alt_text_zh !~ '[一-鿿]';

-- Row: 3fd23985 — after: "Ornate gold-framed wall mirror over marble bathtub"
UPDATE project_image_pairs
SET after_alt_text_zh = '翻新后：石材浴缸上方配金色装饰镜'
WHERE id = '3fd23985-91a5-47bd-bf52-b08fd93791d9'
  AND after_alt_text_zh !~ '[一-鿿]';

-- Row: aa1a98a5 — before: "Original 1990s shower with floral wallpaper and gold-framed door"
UPDATE project_image_pairs
SET before_alt_text_zh = '改造前：1990年代淋浴间配压花壁纸和金色门框 — 装修前'
WHERE id = 'aa1a98a5-46c5-4351-817a-ca82e370dd0c'
  AND before_alt_text_zh !~ '[一-鿿]';

-- Row: aa1a98a5 — after: "Frameless glass walk-in shower with champagne gold rain head"
UPDATE project_image_pairs
SET after_alt_text_zh = '无框玻璃步入式淋浴间配香槟金顶喷头和编纹大理石马赛克地砖'
WHERE id = 'aa1a98a5-46c5-4351-817a-ca82e370dd0c'
  AND after_alt_text_zh !~ '[一-鿿]';

-- Row: 48240e67 — before: "West Vancouver Luxury Bathroom Champagne Gold - 装修前 3"
UPDATE project_image_pairs
SET before_alt_text_zh = '温哥华奢华浴室香槟金装修 — 改造前 3'
WHERE id = '48240e67-d904-426e-8846-2be0a5fbdd3f'
  AND before_alt_text_zh !~ '[一-鿿]';

-- Row: 48240e67 — after: "Walk-in shower with champagne gold fixtures and built-in marble bench"
UPDATE project_image_pairs
SET after_alt_text_zh = '步入式淋浴间配香槟金五金和嵌入式大理石座椅'
WHERE id = '48240e67-d904-426e-8846-2be0a5fbdd3f'
  AND after_alt_text_zh !~ '[一-鿿]';

-- Row: e7a449ad — before: "West Vancouver Luxury Bathroom Champagne Gold - 装修前 4"
UPDATE project_image_pairs
SET before_alt_text_zh = '温哥华奢华浴室香槟金装修 — 改造前 4'
WHERE id = 'e7a449ad-659f-49e3-9050-0183c0c9fdeb'
  AND before_alt_text_zh !~ '[一-鿿]';

-- Row: e7a449ad — after: "Marble shower wall with backlit champagne gold trimmed niche"
UPDATE project_image_pairs
SET after_alt_text_zh = '大理石淋浴墙配背光香槟金修饰壁龛'
WHERE id = 'e7a449ad-659f-49e3-9050-0183c0c9fdeb'
  AND after_alt_text_zh !~ '[一-鿿]';

-- Row: 16c45fa7 — after only (before already covered by batch2)
UPDATE project_image_pairs
SET after_alt_text_zh = '法式双洗手台浴室柜配拱形天花板和香槟金龙头'
WHERE id = '16c45fa7-8bb7-4ea2-99f5-bbe1b1e24092'
  AND after_alt_text_zh !~ '[一-鿿]';

-- Row: 9e6b9b49 — after only (before already covered by batch2)
UPDATE project_image_pairs
SET after_alt_text_zh = '金色壁灯配拱形镜子双洗手台 — 温哥华奢华浴室'
WHERE id = '9e6b9b49-0ac3-4bbe-baa6-bea86452be29'
  AND after_alt_text_zh !~ '[一-鿿]';

-- Row: 1402cbba — before: "West Vancouver Luxury Bathroom Champagne Gold - 装修前 7"
UPDATE project_image_pairs
SET before_alt_text_zh = '温哥华奢华浴室香槟金装修 — 改造前 7'
WHERE id = '1402cbba-2415-4435-b6ab-26aaba02830a'
  AND before_alt_text_zh !~ '[一-鿿]';

-- Row: 1402cbba — after: "Champagne gold arched dressing mirror with vintage brass wall sconces"
UPDATE project_image_pairs
SET after_alt_text_zh = '香槟金拱形穿衣镜配复古黄铜壁灯'
WHERE id = '1402cbba-2415-4435-b6ab-26aaba02830a'
  AND after_alt_text_zh !~ '[一-鿿]';

COMMIT;

-- Verification (run after apply):
-- SELECT id, before_alt_text_zh, after_alt_text_zh FROM project_image_pairs
-- WHERE project_id = '561278cf-e1cd-453c-8ec7-302075e6cc54'
-- ORDER BY before_alt_text_zh NULLS FIRST, after_alt_text_zh NULLS FIRST;
-- Expected: all before/after_alt_text_zh fields contain Chinese characters
