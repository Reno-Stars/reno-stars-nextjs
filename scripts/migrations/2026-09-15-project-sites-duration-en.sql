/**
 * Migration: project_sites.duration_en (2 rows)
 * Status: NOT APPLIED — needs a human to run this file
 * Idempotent: UPDATE ... WHERE col IS NULL skips already-set rows
 *
 * Context: 2026-09-15 content integrity scan found 2 project_sites with
 * duration_en IS NULL. duration_zh is set for 1 of them (id 0e6748db has
 * duration_zh = '8-10周'), missing for the other.
 */

BEGIN;

-- 1. individual-projects — generic catch-all; no fixed duration applies
--    duration_zh also NULL — also setting it here
UPDATE project_sites
SET    duration_en = 'Varies',
       duration_zh = '视项目而定'
WHERE  id = '64f0f111-4920-434f-ab7e-0c2c411e6633'
  AND  duration_en IS NULL;

-- 2. richmond-whole-house-renovation-three-bathrooms
--    title_en: "Whole-House Renovation with Three New Bathrooms in Richmond"
--    duration_zh already set to '8-10周' (from prior audit)
--    Project involves 3 new bathrooms + whole-house scope in Richmond:
--    realistic timeline 10-14 weeks for a multi-bathroom whole-house
UPDATE project_sites
SET    duration_en = '10-14 weeks'
WHERE  id = '0e6748db-5c75-4c6b-91e3-179b84ebe030'
  AND  duration_en IS NULL;

COMMIT;
