-- Migration: NOT APPLIED — needs human to run
-- Date: 2026-09-20
-- Table: project_sites
-- Issue: space_type_zh is NULL for published WFH office conversion project
-- Background: the project site was created with zh fields partially populated;
--   duration_zh is correctly "1周" but space_type_zh was omitted.
--   The child project record correctly uses "住宅" (Home/Residential).
--   This fix aligns the parent site record with the child.
-- Idempotent WHERE guard: only updates if space_type_zh is still NULL.

BEGIN;

UPDATE project_sites
SET space_type_zh = '住宅'
WHERE id = '6d5050fa-48ec-43c4-8187-ecd814dbb947'
  AND space_type_zh IS NULL;

COMMIT;
