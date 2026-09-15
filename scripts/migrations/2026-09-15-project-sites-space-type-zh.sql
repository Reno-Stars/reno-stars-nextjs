-- Migration: project_sites.space_type_zh
-- Rows affected: 3 (confirmed by live DB query)
-- Status: NOT APPLIED — needs a human to run this file
-- This file is idempotent: UPDATE ... WHERE skips already-set rows

-- Run: psql -f scripts/migrations/2026-09-15-project-sites-space-type-zh.sql
-- Or apply via the DB migration gateway with the same guard

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT id, title_en, title_zh, slug
        FROM project_sites
        WHERE (space_type_zh IS NULL OR space_type_zh = ''::text)
          AND id IS NOT NULL
    LOOP
        RAISE NOTICE '[DRY RUN] Would set space_type_zh for id=% (% / %)',
            r.id, r.title_en, COALESCE(r.title_zh, '(no zh title)');
    END LOOP;
    RAISE NOTICE 'Total project_sites needing space_type_zh: %',
        (SELECT COUNT(*) FROM project_sites WHERE space_type_zh IS NULL OR space_type_zh = ''::text);
END $$;

-- For human application — verify the DRY RUN output above first,
-- then uncomment the UPDATE block:
--
-- UPDATE project_sites SET space_type_zh =
--   CASE id
--     WHEN '64f0f111-4920-434f-ab7e-0c2c411e6633' THEN '独立项目'
--     WHEN '251a78d6-53dc-4fce-abba-163192389c67' THEN '独立屋'
--     WHEN '6d5050fa-48ec-43c4-8187-ecd814dbb947' THEN '办公室'
--   END
WHERE (space_type_zh IS NULL OR space_type_zh = ''::text)
  AND id IN (
--     '64f0f111-4920-434f-ab7e-0c2c411e6633',
--     '251a78d6-53dc-4fce-abba-163192389c67',
--     '6d5050fa-48ec-43c4-8187-ecd814dbb947'
--   );
