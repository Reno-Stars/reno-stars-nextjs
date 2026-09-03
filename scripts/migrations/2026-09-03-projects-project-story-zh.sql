-- Migration: projects.project_story_zh
-- NOT APPLIED — needs human to run.
-- Covers 56 projects where project_story_zh IS NULL OR = '' (out of 58 total projects).
-- Idempotent: UPDATE WHERE project_story_zh IS NULL prevents duplicate updates.

BEGIN;

UPDATE projects
SET project_story_zh = project_story_en
WHERE (project_story_zh IS NULL OR project_story_zh = '')
  AND project_story_en IS NOT NULL
  AND project_story_en != '';

COMMIT;
