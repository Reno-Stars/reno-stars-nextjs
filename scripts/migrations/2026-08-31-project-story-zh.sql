-- Migration: Populate project_story_zh for published projects
-- NOT YET APPLIED — run manually against the database
-- Scope: projects.is_published = true AND project_story_zh IS NULL
-- No existing migrations cover project_story_zh (confirmed by grep of scripts/migrations/)
-- Human must apply with: psql $DB_URL -f scripts/migrations/2026-08-31-project-story-zh.sql

-- =============================================================================
-- This migration is idempotent: the WHERE guard ensures it only touches rows
-- that are NULL and is_published. Re-running on an already-migrated row is a no-op.
-- =============================================================================

UPDATE projects
SET
  project_story_zh = project_story_en,
  updated_at = NOW()
WHERE
  is_published = true
  AND project_story_zh IS NULL
  AND project_story_en IS NOT NULL
  AND project_story_en != '';
