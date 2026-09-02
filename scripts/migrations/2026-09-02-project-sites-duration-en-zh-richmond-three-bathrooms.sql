-- Migration: 2026-09-02
-- Topic: project_sites duration_en + duration_zh
-- Target: 1 row — id 0e6748db (Richmond whole-house with 3 new bathrooms)
-- Status: NOT APPLIED — needs human to run
-- Why: Both duration_en AND duration_zh null. Derived from comparable Richmond
--   whole-house projects (4-9 weeks); this project has larger scope (asbestos
--   abatement + 3 bathrooms + LVP + smooth ceilings + whole-house paint) so
--   8-12 weeks is appropriate.

UPDATE project_sites
SET
  duration_en = '8-12 weeks',
  duration_zh = '8-12周'
WHERE id = '0e6748db-5c75-4c6b-91e3-179b84ebe030'
  AND (duration_en IS NULL OR duration_zh IS NULL);
