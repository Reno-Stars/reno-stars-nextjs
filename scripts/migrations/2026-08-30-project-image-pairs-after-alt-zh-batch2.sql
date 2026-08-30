-- 2026-08-30-project-image-pairs-after-alt-zh-batch2.sql
-- Migrate remaining English-only after_alt_text_zh entries in project_image_pairs
-- NOT APPLIED — needs human to run
-- Idempotent: WHERE Chinese-character check before UPDATE

-- ID 3fd23985 (also covered for before_alt_text_zh in batch 1)
UPDATE project_image_pairs
SET after_alt_text_zh = '大理石浴缸上方配精致金色边框墙镜，配百叶窗'
WHERE id = '3fd23985-91a5-47bd-bf52-b08fd93791d9'
  AND after_alt_text_zh IS NULL
  AND after_alt_text_zh !~ '[一-鿿]';

-- ID aa1a98a5 (also covered for before_alt_text_zh in batch 1)
UPDATE project_image_pairs
SET after_alt_text_zh = '无框玻璃步入式淋浴间，配香槟金色雨淋花洒和编篮纹大理石马赛克地砖'
WHERE id = 'aa1a98a5-46c5-4351-817a-ca82e370dd0c'
  AND after_alt_text_zh IS NULL
  AND after_alt_text_zh !~ '[一-鿿]';

-- ID 16c45fa7 (also covered for before_alt_text_zh in batch 2)
UPDATE project_image_pairs
SET after_alt_text_zh = "双洗手池法式风格浴室柜，配拱形天花板和香槟金色水龙头"
WHERE id = '16c45fa7-8bb7-4ea2-99f5-bbe1b1e24092'
  AND after_alt_text_zh IS NULL
  AND after_alt_text_zh !~ '[一-鿿]';
