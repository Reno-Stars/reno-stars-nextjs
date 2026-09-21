-- Migration: NOT APPLIED — needs human to run
-- Fixes outdated $14K kitchen floor in service_areas Vancouver meta descriptions.
-- The kitchen service page (correctly) states $25,000 minimum. The area page meta
-- description was showing $14K, which is inaccurate and creates misleading structured data.
-- Idempotent: only updates if the wrong value is still present.
UPDATE service_areas
SET
  meta_description_en = REPLACE(meta_description_en, 'kitchen $14K', 'kitchen $25K'),
  meta_description_zh = REPLACE(meta_description_zh, '厨房$14K', '厨房$25K')
WHERE
  slug = 'vancouver'
  AND meta_description_en LIKE '%kitchen $14K%'
  AND meta_description_zh LIKE '%厨房$14K%';
