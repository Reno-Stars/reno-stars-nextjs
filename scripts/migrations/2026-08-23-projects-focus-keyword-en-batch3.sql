/**
 * Migration: Set focus_keyword_en for 5 published projects missing focus_keyword_en.
 * Run: pnpm db:query -f scripts/migrations/2026-08-23-projects-focus-keyword-en-batch3.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-23-projects-focus-keyword-en-batch3.sql
 *
 * IDs covered: 331f03b3, 561278cf, 7c9a9237, 838f1ee4, 9063e628
 * (018eda65, 0d7d6efd, 3ef5531b, 9cbc6ccf, c8a66604 covered by batch2)
 */

-- richmond-house-renovation-kitchen-bathrooms-flooring
UPDATE projects SET focus_keyword_en = 'house renovation richmond'
WHERE id = '331f03b3-624e-4ddf-9b38-c8768d3d1932'
  AND is_published = true
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');

-- west-vancouver-luxury-bathroom-champagne-gold
UPDATE projects SET focus_keyword_en = 'west vancouver luxury bathroom renovation'
WHERE id = '561278cf-e1cd-453c-8ec7-302075e6cc54'
  AND is_published = true
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');

-- delta-kitchen-renovation-apron-sink-quartz
UPDATE projects SET focus_keyword_en = 'delta kitchen renovation'
WHERE id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f'
  AND is_published = true
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');

-- coquitlam-kitchen-renovation-quartz-island
UPDATE projects SET focus_keyword_en = 'coquitlam kitchen renovation'
WHERE id = '838f1ee4-beaa-42e7-bca5-73c810422d76'
  AND is_published = true
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');

-- hallway-bathroom-renovation-richmond
UPDATE projects SET focus_keyword_en = 'hallway bathroom renovation richmond'
WHERE id = '9063e628-abf9-411a-a7a4-2ddc179c1689'
  AND is_published = true
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');
