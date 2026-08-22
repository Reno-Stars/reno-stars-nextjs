/**
 * Migration: Set focus_keyword_en and meta_description_en for 5 published projects missing focus_keyword_en.
 * 3 also missing meta_description_en.
 * IDs verified NOT covered by any prior migration for focus_keyword_en (only seo_keywords_zh was set before).
 * NOT APPLIED — needs human to run:
 *   pnpm db:query -f scripts/migrations/2026-08-22-projects-focus-keyword-en.sql
 */

-- coquitlam-kitchen-renovation-quartz-island
-- missing focus_keyword_en AND meta_description_en
UPDATE projects
SET
  focus_keyword_en = 'kitchen renovation coquitlam',
  meta_description_en = 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam. Custom cabinetry, quartz countertops, modern design. Get a free consultation.'
WHERE id = '838f1ee4-beaa-42e7-bca5-73c810422d76'
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');

-- richmond-house-renovation-kitchen-bathrooms-flooring
-- missing focus_keyword_en AND meta_description_en
UPDATE projects
SET
  focus_keyword_en = 'house renovation richmond',
  meta_description_en = 'Complete House Renovation with Kitchen, Bathrooms and Flooring in Richmond. Expert craftsmanship, transparent pricing. Request your free quote.'
WHERE id = '331f03b3-624e-4ddf-9b38-c8768d3d1932'
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');

-- delta-kitchen-renovation-apron-sink-quartz
-- missing focus_keyword_en AND meta_description_en
UPDATE projects
SET
  focus_keyword_en = 'kitchen renovation delta bc',
  meta_description_en = 'Whole House Renovation with Kitchen and Two Bathrooms in Delta. Apron sink, quartz countertops, expert renovation services. Book your free consultation.'
WHERE id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f'
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');

-- hallway-bathroom-renovation-richmond
-- missing focus_keyword_en only
UPDATE projects
SET focus_keyword_en = 'hallway bathroom renovation richmond'
WHERE id = '9063e628-abf9-411a-a7a4-2ddc179c1689'
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');

-- west-vancouver-luxury-bathroom-champagne-gold
-- missing focus_keyword_en only
UPDATE projects
SET focus_keyword_en = 'luxury bathroom renovation west vancouver'
WHERE id = '561278cf-e1cd-453c-8ec7-302075e6cc54'
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');
