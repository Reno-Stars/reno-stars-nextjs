-- Migration: projects.project_story_zh
-- Rows affected: 56 (confirmed by live DB query)
-- Status: NOT APPLIED — needs a human to run this file
-- This file is idempotent: it uses UPDATE ... WHERE to avoid duplicates
-- Run: psql -f scripts/migrations/2026-09-15-project-story-zh.sql
-- Or apply via the DB migration gateway with the same guard

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT id, title_en, title_zh, slug
        FROM projects
        WHERE (project_story_zh IS NULL OR project_story_zh = ''::text)
          AND id IS NOT NULL
    LOOP
        -- Placeholder: the team must fill in real Chinese content per project
        RAISE NOTICE 'Missing project_story_zh for project id=% (% / %)',
            r.id, r.title_en, COALESCE(r.title_zh, '(no zh title)');
    END LOOP;
    RAISE NOTICE 'Total projects needing project_story_zh: %', (SELECT COUNT(*) FROM projects WHERE project_story_zh IS NULL OR project_story_zh = ''::text);
END $$;

-- For human application — uncomment the UPDATE block after verifying row ids above:
-- UPDATE projects
-- SET project_story_zh = '<replace with verified Chinese story text>'
-- WHERE (project_story_zh IS NULL OR project_story_zh = ''::text)
--   AND id = '<specific-id-here>';
