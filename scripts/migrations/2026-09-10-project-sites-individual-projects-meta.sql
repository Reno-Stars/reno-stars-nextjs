-- Migration: project_sites meta fields for individual-projects
-- NOT APPLIED — needs human to run after PR merge
-- Target: project_sites.slug = 'individual-projects'
UPDATE project_sites
SET
  meta_title_en = 'Individual Renovation Projects | Reno Stars',
  meta_description_en = 'Browse standalone renovation projects by Reno Stars in Metro Vancouver. Kitchen, bathroom, basement, and whole-home renovations with real photos and costs.'
WHERE slug = 'individual-projects'
  AND (meta_title_en IS NULL OR meta_description_en IS NULL);
