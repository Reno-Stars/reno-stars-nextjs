/**
 * Migration: Set seo_keywords_en and focus_keyword_en for 2 published project_sites
 *             missing these fields (seo_keywords_zh already covered in 2026-08-16 migration).
 * Date: 2026-09-01
 * Status: NOT APPLIED — needs human to run
 *
 * ID exclusions from prior migrations:
 *   0e6748db — NOT in any previous migration (checked via grep)
 *   6d5050fa — NOT in any previous migration (checked via grep)
 *
 * NOT APPLIED — this is a data-change migration requiring human execution.
 * After apply, verify with:
 *   SELECT id, slug, focus_keyword_en, seo_keywords_en
 *     FROM project_sites
 *    WHERE id IN ('0e6748db-5c75-4c6b-91e3-179b84ebe030',
 *                 '6d5050fa-48ec-43c4-8187-ecd814dbb947');
 */

BEGIN;

-- ---------------------------------------------------------------
-- 1. Richmond Whole House Renovation Three Bathrooms
--    Slug: richmond-whole-house-renovation-three-bathrooms
--    Area: Richmond | Type: Whole House | Scale: 3 bathrooms + full house
--    excerpt_en: already populated (A complete interior refresh…)
--    Missing: focus_keyword_en, seo_keywords_en
-- ---------------------------------------------------------------
UPDATE project_sites
SET
  focus_keyword_en = 'whole house renovation Richmond',
  seo_keywords_en  = 'whole house renovation Richmond, three bathroom renovation Richmond, asbestos abatement Richmond, LVP flooring Richmond, modern renovation Richmond, Richmond renovation contractor, full house renovation BC'
WHERE id = '0e6748db-5c75-4c6b-91e3-179b84ebe030'
  AND (focus_keyword_en IS NULL OR focus_keyword_en = ''
   OR  seo_keywords_en  IS NULL OR seo_keywords_en  = '');

-- ---------------------------------------------------------------
-- 2. Vancouver WFH Glass Partition Office Conversion
--    Slug: vancouver-wfh-glass-partition-office
--    Area: Vancouver | Type: Home Office / WFH
--    excerpt_en: NULL — covered by 2026-09-01-project-sites-excerpt-en-wfh-glass.sql
--    Missing: focus_keyword_en, seo_keywords_en
-- ---------------------------------------------------------------
UPDATE project_sites
SET
  focus_keyword_en = 'Vancouver WFH office',
  seo_keywords_en  = 'work from home office Vancouver, glass partition office, Vancouver home office conversion, black frame glass partition, WFH office renovation, home office design Vancouver, dedicated office room Vancouver'
WHERE id = '6d5050fa-48ec-43c4-8187-ecd814dbb947'
  AND (focus_keyword_en IS NULL OR focus_keyword_en = ''
   OR  seo_keywords_en  IS NULL OR seo_keywords_en  = '');

COMMIT;
