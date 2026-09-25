-- Migration: 2026-09-25-project-sites-seo-keywords-en-missing-fix.sql
-- Target: project_sites with NULL seo_keywords_en (3 rows)
-- Fix: populate from focus_keyword_en + title-derived tokens
BEGIN;

-- individual-projects (collection page)
UPDATE project_sites
SET seo_keywords_en = 'renovation projects,vancouver renovation,metro vancouver renovation,renovation services,renovation contractor,home renovation vancouver,renovation portfolio',
    duration_en = '2-4 weeks',
    updated_at = NOW()
WHERE slug = 'individual-projects'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- vancouver-wfh-glass-partition-office
UPDATE project_sites
SET seo_keywords_en = 'vancouver glass partition,vancouver home office,vancouver wfh office,glass partition office vancouver,home office renovation vancouver,glass office partition,work from home office vancouver',
    updated_at = NOW()
WHERE slug = 'vancouver-wfh-glass-partition-office'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- richmond-whole-house-renovation-three-bathrooms
UPDATE project_sites
SET seo_keywords_en = 'whole house renovation richmond,richmond whole house renovation,three bathroom renovation richmond,richmond renovation,whole home renovation vancouver,multi-bathroom renovation richmond,richmond renovation contractor',
    duration_en = '10-16 weeks',
    updated_at = NOW()
WHERE slug = 'richmond-whole-house-renovation-three-bathrooms'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

-- Verify
DO $$
BEGIN
    ASSERT (
        SELECT COUNT(*) FROM project_sites
        WHERE seo_keywords_en IS NULL OR seo_keywords_en = ''
    ) = 0,
    'NULL seo_keywords_en rows remain in project_sites';
END $$;

COMMIT;
