-- Fix English-bleed in project_image_pairs zh alt text
-- 2 rows where both before_alt_text_zh and after_alt_text_zh contain English-only text
-- NOT APPLIED — needs human to run
UPDATE project_image_pairs
SET
  before_alt_text_zh = CASE id
    WHEN '3fd23985-91a5-47bd-bf52-b08fd93791d9' THEN '复古浴缸配花纹壁纸和过时装饰 — 翻新前'
    WHEN 'aa1a98a5-46c5-4351-817a-ca82e370dd0c' THEN '1990年代淋浴间配花纹壁纸和金色门框 — 翻新前'
  END,
  after_alt_text_zh = CASE id
    WHEN '3fd23985-91a5-47bd-bf52-b08fd93791d9' THEN '大理石浴缸上方配华丽金框墙镜和百叶窗'
    WHEN 'aa1a98a5-46c5-4351-817a-ca82e370dd0c' THEN '无框玻璃步入式淋浴间，配香槟金雨淋头和篮纹大理石马赛克地板'
  END
WHERE id IN ('3fd23985-91a5-47bd-bf52-b08fd93791d9', 'aa1a98a5-46c5-4351-817a-ca82e370dd0c')
  AND before_alt_text_zh IS NOT NULL
  AND before_alt_text_zh !~ '[一-鿿]';
