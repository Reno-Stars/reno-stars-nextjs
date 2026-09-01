-- Migration: project_sites excerpt_en
-- Target: 2 project_sites rows with NULL excerpt_en
-- NOT APPLIED — needs human review and execution
UPDATE project_sites
SET excerpt_en = CASE id
    WHEN '64f0f111-4920-434f-ab7e-0c2c411e6633'
      THEN 'Standalone renovation projects completed by Reno Stars across Metro Vancouver — kitchen, bathroom, and whole-home transformations showcasing quality craftsmanship and attention to detail.'
    WHEN '6d5050fa-48ec-43c4-8187-ecd814dbb947'
      THEN 'A spare room transformed into a dedicated work-from-home office in Vancouver using a full-height black-frame glass partition, preserving natural light while delivering acoustic separation and a professional workspace.'
  END
WHERE id IN ('64f0f111-4920-434f-ab7e-0c2c411e6633', '6d5050fa-48ec-43c4-8187-ecd814dbb947')
  AND excerpt_en IS NULL;
