/**
 * Migration: Set seo_keywords_en for 2 project_sites rows.
 * Run: pnpm db:query -f scripts/migrations/2026-08-29-project-sites-seo-keywords-en.sql
 *
 * NOT APPLIED — needs human to run: pnpm db:query -f scripts/migrations/2026-08-29-project-sites-seo-keywords-en.sql
 */

-- Vancouver WFH Glass Partition Office
UPDATE project_sites SET seo_keywords_en = 'vancouver,wfh,home office,glass partition,office conversion,office renovation,home renovation vancouver' WHERE id = '6d5050fa-48ec-43c4-8187-ecd814dbb947' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- Richmond Whole House Renovation Three New Bathrooms
UPDATE project_sites SET seo_keywords_en = 'richmond,whole house renovation,full home renovation,bathroom renovation,three bathrooms,home renovation richmond,renovation contractor' WHERE id = '0e6748db-5c75-4c6b-91e3-179b84ebe030' AND (seo_keywords_en IS NULL OR seo_keywords_en = '');
