-- NOT APPLIED. Needs human to run.
-- Truncate meta_description_en to 155 chars for 2 service_areas that exceed the varchar 155 limit.
-- Idempotent: only updates rows that still exceed 155.

UPDATE service_areas
SET meta_description_en = LEFT(meta_description_en, 155)
WHERE LENGTH(meta_description_en) > 155
  AND id IN (
    SELECT id FROM service_areas
    WHERE LENGTH(meta_description_en) > 155
      AND (
        (name_en = 'Richmond' AND LENGTH(meta_description_en) = 163)
     OR (name_en = 'West Vancouver' AND LENGTH(meta_description_en) = 157)
      )
  );
