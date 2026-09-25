-- Ladder 2a: Trim service_areas meta_description_en to ≤155 chars
-- richmond was 163, west-vancouver was 157
UPDATE service_areas
SET meta_description_en = LEFT(meta_description_en, 155)
WHERE slug IN ('richmond', 'west-vancouver')
  AND LENGTH(meta_description_en) > 155;
