/**
 * Migration: Set seo_keywords_en for 2 project_sites rows.
 * Date: 2026-08-26
 * Status: NOT APPLIED — needs human to run against the live database.
 * Source: DB query (2026-08-26) confirmed 2 project_sites rows where
 *   is_published = true AND seo_keywords_en IS NULL.
 *   Same 2 rows addressed for zh in 2026-08-16-project-sites-seo-keywords-zh.sql.
 * Idempotent WHERE guard prevents re-execution.
 * Run: pnpm db:query -f scripts/migrations/2026-08-26-project-sites-seo-keywords-en.sql
 */

-- Vancouver WFH Glass Partition Office
UPDATE project_sites
SET    seo_keywords_en = 'vancouver,glass partition,home office,wfh,office conversion,office renovation,renovation contractor vancouver'
WHERE  id = '6d5050fa-48ec-43c4-8187-ecd814dbb947'
  AND  (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- Richmond Whole House Renovation with Three New Bathrooms
UPDATE project_sites
SET    seo_keywords_en = 'richmond,whole house renovation,three bathrooms,bathroom renovation,full home renovation,renovation contractor richmond'
WHERE  id = '0e6748db-5c75-4c6b-91e3-179b84ebe030'
  AND  (seo_keywords_en IS NULL OR seo_keywords_en = '');
