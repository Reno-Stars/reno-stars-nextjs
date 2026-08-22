/**
 * Migration: Set meta_title_en, meta_description_en, seo_keywords_en for project_sites row individual-projects.
 * Run: pnpm db:query -f scripts/migrations/2026-08-22-project-sites-missing-meta.sql
 *
 * NOT APPLIED — needs human to run: pnpm db:query -f scripts/migrations/2026-08-22-project-sites-missing-meta.sql
 * The meta_title_zh, meta_description_zh, seo_keywords_zh fields are also NULL and need human translator input.
 */

UPDATE project_sites
SET
  meta_title_en     = 'Our Projects | Reno Stars',
  meta_description_en = 'Browse Reno Stars completed renovation projects across Greater Vancouver — kitchen remodels, bathroom upgrades, whole-home renovations, and custom builds.',
  seo_keywords_en   = 'renovation projects,vancouver renovation,completed projects,kitchen remodel,bathroom renovation,whole house renovation'
WHERE id = '64f0f111-4920-434f-ab7e-0c2c411e6633'
  AND (meta_title_en IS NULL OR meta_description_en IS NULL);
