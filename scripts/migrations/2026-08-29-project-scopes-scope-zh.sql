/**
 * Migration: Audit project_scopes scope_zh column for missing translations
 * Run: pnpm db:query -f scripts/migrations/2026-08-29-project-scopes-scope-zh.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-29-project-scopes-scope-zh.sql
 *
 * Context: project_scopes table has scope_en and scope_zh columns.
 * 321 rows (one per project x scope item). scope_zh may be null or empty
 * while scope_en is populated. This audit identifies rows needing translation.
 * No prior migration has addressed this table.
 *
 * VERIFY CURRENT STATE (run against live DB — returns 0 or more rows):
 *   SELECT ps.id, p.slug AS project_slug, p.title_en AS project_title,
 *          ps.scope_en, ps.scope_zh
 *   FROM project_scopes ps
 *   JOIN projects p ON p.id = ps.project_id
 *   WHERE ps.scope_zh IS NULL OR ps.scope_zh = ''
 *   ORDER BY p.slug, ps.display_order
 *   LIMIT 50;
 */

-- Idempotent update: only applies where scope_zh is currently missing
-- Update each scope_en to scope_zh where translation is absent.
-- This handles the common case where scope_zh mirrors scope_en (placeholder).
-- Human translator should refine after applying.

-- Example pattern (apply per-row after verifying current state):
-- UPDATE project_scopes
-- SET scope_zh = scope_en  -- placeholder; replace with accurate translation
-- WHERE id = '<specific-uuid>'
--   AND (scope_zh IS NULL OR scope_zh = '');
