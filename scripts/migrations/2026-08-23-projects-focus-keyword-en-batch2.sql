/**
 * Migration: Set focus_keyword_en for 5 published projects missing focus_keyword_en.
 * Run: pnpm db:query -f scripts/migrations/2026-08-23-projects-focus-keyword-en-batch2.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-23-projects-focus-keyword-en-batch2.sql
 *
 * These projects also have NULL focus_keyword_zh — a separate migration needed.
 * focus_keyword_zh backlog: 10 rows pending (PENDING — backlog cap reached).
 */

-- north-vancouver-bathroom-renovation-herringbone-tile
UPDATE projects SET focus_keyword_en = 'bathroom renovation north vancouver'
WHERE id = '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb'
  AND is_published = true
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');

-- vancouver-house-renovation-kitchen-and-bathrooms
UPDATE projects SET focus_keyword_en = 'house renovation vancouver'
WHERE id = '9cbc6ccf-bc07-4c2f-a867-c57ab4218728'
  AND is_published = true
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');

-- richmond-condo-flooring-renovation
UPDATE projects SET focus_keyword_en = 'condo renovation richmond'
WHERE id = '3ef5531b-cfb9-454d-9cd2-90887b3775f0'
  AND is_published = true
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');

-- richmond-whole-home-renovation-marble-kitchen
UPDATE projects SET focus_keyword_en = 'whole home renovation richmond'
WHERE id = 'c8a66604-00ed-4307-8b28-b95257eaa249'
  AND is_published = true
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');

-- powder-room-renovation-richmond
UPDATE projects SET focus_keyword_en = 'powder room renovation richmond'
WHERE id = '018eda65-401d-4ec3-84cc-7793597e75c7'
  AND is_published = true
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');
