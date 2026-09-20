-- Migration: project_scopes — fix scopeTl English placeholder in localizations JSONB
-- Date: 2026-09-20
-- Status: NOT APPLIED — needs human to run
-- Target: 5 rows where scope_en = 'Light Optimization' and scopeTl = 'Light Optimization' (English in Tagalog field)
-- Correct Tagalog: 'Pagsasaayos ng Ilaw' (Light Optimization in Tagalog)
-- These 5 scope_en = 'Light Optimization' rows were identified via:
--   SELECT id FROM project_scopes WHERE scope_en = 'Light Optimization'
-- scope_en = 'Lighting' rows do NOT have this issue — scopeTl = 'Ilaw' (correct Tagalog)

BEGIN;

UPDATE project_scopes
SET localizations = JSONB_SET(localizations, '{scopeTl}', '"Pagsasaayos ng Ilaw"')
WHERE id = 'd3956376-8350-4407-8652-c20f3b7bb968'
  AND localizations->>'scopeTl' = 'Light Optimization';

UPDATE project_scopes
SET localizations = JSONB_SET(localizations, '{scopeTl}', '"Pagsasaayos ng Ilaw"')
WHERE id = 'f41f3eba-e7db-4277-ac99-41f959129a06'
  AND localizations->>'scopeTl' = 'Light Optimization';

UPDATE project_scopes
SET localizations = JSONB_SET(localizations, '{scopeTl}', '"Pagsasaayos ng Ilaw"')
WHERE id = 'eef6ecb6-8173-4920-8e57-dc2d39d8cea8'
  AND localizations->>'scopeTl' = 'Light Optimization';

-- scope_en = 'Lighting' rows — scopeTl already 'Ilaw' (correct Tagalog), no change needed

COMMIT;
