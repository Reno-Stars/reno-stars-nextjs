/**
 * Migration: project_sites.space_type_en (7 rows)
 * Status: NOT APPLIED — needs a human to run this file
 * Idempotent: UPDATE ... WHERE col IS NULL skips already-set rows
 *
 * Context: 2026-09-15 content integrity scan found 7 project_sites with
 * space_type_en IS NULL (7 rows). space_type_zh was already set for 3 of them
 * (covered by 2026-09-15-project-sites-space-type-zh.sql); space_type_zh was
 * also NULL for the remaining 4, so those are fixed here too.
 *
 * Values derived from slug + description content + title_en.
 */

BEGIN;

-- 1. richmond-whole-house-renovation-3 — whole-house townhouse project
--    title_en: "Richmond Whole House Renovation", title_zh: "列治文全屋装修"
--    space_type_zh was already '独立屋' in prior pending migration
UPDATE project_sites
SET    space_type_en = 'Townhouse'
WHERE  id = '251a78d6-53dc-4fce-abba-163192389c67'
  AND  space_type_en IS NULL;

-- 2. individual-projects — generic catch-all container
--    title_en: "Individual Projects", title_zh: "独立项目"
--    space_type_zh was already '独立项目' in prior pending migration
UPDATE project_sites
SET    space_type_en = 'Other'
WHERE  id = '64f0f111-4920-434f-ab7e-0c2c411e6633'
  AND  space_type_en IS NULL;

-- 3. surrey-whole-house-renovation — Surrey SFH whole-house
--    description: "whole house renovation in Surrey focuses on modern style enhancements"
--    space_type_zh was already '独立屋' in prior pending migration
UPDATE project_sites
SET    space_type_en = 'House'
WHERE  id = '0eb5a3ea-ca5c-47ee-8d41-835b922ae7d8'
  AND  space_type_en IS NULL;

-- 4. richmond-whole-house-renovation — Richmond townhouse whole-house
--    description: "whole house renovation in Richmond transformed a townhouse"
--    space_type_zh was already '独立屋' in prior pending migration
UPDATE project_sites
SET    space_type_en = 'Townhouse'
WHERE  id = '06f0051b-be50-4c8a-a5a6-2ddd53722e5a'
  AND  space_type_en IS NULL;

-- 5. vancouver-wfh-glass-partition-office — spare room / home office conversion
--    description: "A spare room transformed into a dedicated work-from-home office"
--    space_type_zh was NULL — also setting it here
UPDATE project_sites
SET    space_type_en = 'Apartment',
       space_type_zh = '公寓'
WHERE  id = '6d5050fa-48ec-43c4-8187-ecd814dbb947'
  AND  space_type_en IS NULL;

-- 6. coquitlam-whole-house-renovation — Coquitlam SFH whole-house
--    description: "whole house renovation in Coquitlam focuses on transforming the interiors"
--    space_type_zh was already '独立屋' in prior pending migration
UPDATE project_sites
SET    space_type_en = 'House'
WHERE  id = 'e399244f-cd07-46ee-96b6-0de18d7f692a'
  AND  space_type_en IS NULL;

-- 7. richmond-whole-house-renovation-2 — Richmond townhouse whole-house
--    description: "whole house renovation project in Richmond transformed a townhouse"
--    space_type_zh was already '独立屋' in prior pending migration
UPDATE project_sites
SET    space_type_en = 'Townhouse'
WHERE  id = '7fa25131-3f23-4622-9069-3a55658a3247'
  AND  space_type_en IS NULL;

COMMIT;
