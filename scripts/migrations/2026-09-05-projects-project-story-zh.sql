-- Migration: scripts/migrations/2026-09-05-projects-project-story-zh.sql
-- Target: projects.project_story_zh IS NULL (56 rows)
-- NOT APPLIED — requires human run against live DB.
-- Idempotent: UPDATE only rows where project_story_zh IS NULL.
UPDATE projects SET project_story_zh = project_story WHERE project_story_zh IS NULL;
