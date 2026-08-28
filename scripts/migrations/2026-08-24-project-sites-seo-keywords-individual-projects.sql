-- Migration: project_sites seo_keywords_zh — Individual Projects
-- Scope: 1 row with non-null seo_keywords_en but missing seo_keywords_zh
-- NOT APPLIED — needs human run

UPDATE project_sites
SET seo_keywords_zh = '装修案例,项目展示,温哥华装修案例,列治文项目,本拿比翻新'
WHERE id = '64f0f111-4920-434f-ab7e-0c2c411e6633'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
