-- 2026-08-30-project-image-pairs-before-alt-zh-batch2.sql
-- Migrate remaining English-only before_alt_text_zh entries in project_image_pairs
-- NOT APPLIED — needs human to run
-- Idempotent: WHERE guard on Chinese-character check ensures safe re-run

UPDATE project_image_pairs
SET before_alt_text_zh = CASE id
  WHEN '3fd23985-91a5-47bd-bf52-b08fd93791d9'
    THEN '原始浸泡式浴缸，配花纹墙纸和过时装饰 — 翻新前'
  WHEN 'aa1a98a5-46c5-4351-817a-ca82e370dd0c'
    THEN '1990年代原始淋浴间，配花纹墙纸和金色门框 — 翻新前'
END
WHERE id IN ('3fd23985-91a5-47bd-bf52-b08fd93791d9', 'aa1a98a5-46c5-4351-817a-ca82e370dd0c')
  AND before_alt_text_zh IS NOT NULL
  AND before_alt_text_zh != ''
  AND before_alt_text_zh !~ '[一-鿿]';
