-- 2026-09-15-project-sites-meta-description-en.sql
-- NOT APPLIED — needs human to run.
-- Populates meta_title_en, meta_description_en and focus_keyword_en for project_sites row
-- 'individual-projects' (id: 64f0f111-4920-434f-ab7e-0c2c411e6633).
-- Idempotent: UPDATE ... WHERE skips already-populated rows.

UPDATE project_sites
SET
  meta_title_en      = 'Renovation Portfolio | 58 Completed Projects | Reno Stars',
  meta_description_en = 'Browse Reno Stars completed renovation projects in Metro Vancouver. Kitchen, bathroom, whole-house makeovers with real costs. 58 projects.',
  focus_keyword_en   = 'completed renovation projects'
WHERE id = '64f0f111-4920-434f-ab7e-0c2c411e6633'
  AND (meta_title_en IS NULL OR meta_description_en IS NULL OR focus_keyword_en IS NULL);
