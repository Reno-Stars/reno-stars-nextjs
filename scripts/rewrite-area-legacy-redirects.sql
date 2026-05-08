-- Rewrite legacy /blog/...-cost-vancouver URLs in service_areas to direct
-- /guides/... URLs. Mirrors scripts/rewrite-legacy-cost-redirects.ts but for
-- the service_areas table (which the TS script doesn't cover).
--
-- Run:
--   psql $DATABASE_URL -f scripts/rewrite-area-legacy-redirects.sql
--
-- Idempotent — running twice is a no-op.

BEGIN;

-- Bathroom variants → bathroom-renovation-cost-vancouver
UPDATE service_areas SET
  content_en       = regexp_replace(content_en,       '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/(average-bathroom-renovation-cost-vancouver|bathroom-renovation-cost-vancouver-by-size|bathroom-renovation-cost-vancouver-by-style)\M', '\1/guides/bathroom-renovation-cost-vancouver/', 'g'),
  content_zh       = regexp_replace(content_zh,       '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/(average-bathroom-renovation-cost-vancouver|bathroom-renovation-cost-vancouver-by-size|bathroom-renovation-cost-vancouver-by-style)\M', '\1/guides/bathroom-renovation-cost-vancouver/', 'g'),
  highlights_en    = regexp_replace(COALESCE(highlights_en, ''),    '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/(average-bathroom-renovation-cost-vancouver|bathroom-renovation-cost-vancouver-by-size|bathroom-renovation-cost-vancouver-by-style)\M', '\1/guides/bathroom-renovation-cost-vancouver/', 'g'),
  highlights_zh    = regexp_replace(COALESCE(highlights_zh, ''),    '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/(average-bathroom-renovation-cost-vancouver|bathroom-renovation-cost-vancouver-by-size|bathroom-renovation-cost-vancouver-by-style)\M', '\1/guides/bathroom-renovation-cost-vancouver/', 'g'),
  description_en   = regexp_replace(COALESCE(description_en, ''),   '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/(average-bathroom-renovation-cost-vancouver|bathroom-renovation-cost-vancouver-by-size|bathroom-renovation-cost-vancouver-by-style)\M', '\1/guides/bathroom-renovation-cost-vancouver/', 'g'),
  description_zh   = regexp_replace(COALESCE(description_zh, ''),   '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/(average-bathroom-renovation-cost-vancouver|bathroom-renovation-cost-vancouver-by-size|bathroom-renovation-cost-vancouver-by-style)\M', '\1/guides/bathroom-renovation-cost-vancouver/', 'g'),
  localizations    = (regexp_replace(localizations::text,           '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/(average-bathroom-renovation-cost-vancouver|bathroom-renovation-cost-vancouver-by-size|bathroom-renovation-cost-vancouver-by-style)\M', '\1/guides/bathroom-renovation-cost-vancouver/', 'g'))::jsonb,
  updated_at       = now()
WHERE content_en LIKE '%/blog/average-bathroom-renovation-cost-vancouver%'
   OR content_en LIKE '%/blog/bathroom-renovation-cost-vancouver-by-size%'
   OR content_en LIKE '%/blog/bathroom-renovation-cost-vancouver-by-style%'
   OR content_zh LIKE '%/blog/average-bathroom-renovation-cost-vancouver%'
   OR content_zh LIKE '%/blog/bathroom-renovation-cost-vancouver-by-size%'
   OR content_zh LIKE '%/blog/bathroom-renovation-cost-vancouver-by-style%'
   OR localizations::text LIKE '%/blog/average-bathroom-renovation-cost-vancouver%'
   OR localizations::text LIKE '%/blog/bathroom-renovation-cost-vancouver-by-size%'
   OR localizations::text LIKE '%/blog/bathroom-renovation-cost-vancouver-by-style%';

-- Basement → basement-renovation-cost-vancouver
UPDATE service_areas SET
  content_en       = regexp_replace(content_en,       '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/basement-renovation-cost-vancouver-2026\M', '\1/guides/basement-renovation-cost-vancouver/', 'g'),
  content_zh       = regexp_replace(content_zh,       '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/basement-renovation-cost-vancouver-2026\M', '\1/guides/basement-renovation-cost-vancouver/', 'g'),
  highlights_en    = regexp_replace(COALESCE(highlights_en, ''),    '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/basement-renovation-cost-vancouver-2026\M', '\1/guides/basement-renovation-cost-vancouver/', 'g'),
  highlights_zh    = regexp_replace(COALESCE(highlights_zh, ''),    '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/basement-renovation-cost-vancouver-2026\M', '\1/guides/basement-renovation-cost-vancouver/', 'g'),
  description_en   = regexp_replace(COALESCE(description_en, ''),   '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/basement-renovation-cost-vancouver-2026\M', '\1/guides/basement-renovation-cost-vancouver/', 'g'),
  description_zh   = regexp_replace(COALESCE(description_zh, ''),   '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/basement-renovation-cost-vancouver-2026\M', '\1/guides/basement-renovation-cost-vancouver/', 'g'),
  localizations    = (regexp_replace(localizations::text,           '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/basement-renovation-cost-vancouver-2026\M', '\1/guides/basement-renovation-cost-vancouver/', 'g'))::jsonb,
  updated_at       = now()
WHERE content_en LIKE '%/blog/basement-renovation-cost-vancouver-2026%'
   OR content_zh LIKE '%/blog/basement-renovation-cost-vancouver-2026%'
   OR localizations::text LIKE '%/blog/basement-renovation-cost-vancouver-2026%';

-- Basement-suite → basement-suite-cost-vancouver
UPDATE service_areas SET
  content_en       = regexp_replace(content_en,       '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/basement-suite-renovation-cost-vancouver(-zh)?\M', '\1/guides/basement-suite-cost-vancouver/', 'g'),
  content_zh       = regexp_replace(content_zh,       '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/basement-suite-renovation-cost-vancouver(-zh)?\M', '\1/guides/basement-suite-cost-vancouver/', 'g'),
  highlights_en    = regexp_replace(COALESCE(highlights_en, ''),    '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/basement-suite-renovation-cost-vancouver(-zh)?\M', '\1/guides/basement-suite-cost-vancouver/', 'g'),
  highlights_zh    = regexp_replace(COALESCE(highlights_zh, ''),    '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/basement-suite-renovation-cost-vancouver(-zh)?\M', '\1/guides/basement-suite-cost-vancouver/', 'g'),
  description_en   = regexp_replace(COALESCE(description_en, ''),   '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/basement-suite-renovation-cost-vancouver(-zh)?\M', '\1/guides/basement-suite-cost-vancouver/', 'g'),
  description_zh   = regexp_replace(COALESCE(description_zh, ''),   '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/basement-suite-renovation-cost-vancouver(-zh)?\M', '\1/guides/basement-suite-cost-vancouver/', 'g'),
  localizations    = (regexp_replace(localizations::text,           '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/basement-suite-renovation-cost-vancouver(-zh)?\M', '\1/guides/basement-suite-cost-vancouver/', 'g'))::jsonb,
  updated_at       = now()
WHERE content_en LIKE '%/blog/basement-suite-renovation-cost-vancouver%'
   OR content_zh LIKE '%/blog/basement-suite-renovation-cost-vancouver%'
   OR localizations::text LIKE '%/blog/basement-suite-renovation-cost-vancouver%';

-- Whole-house → whole-house-renovation-cost-vancouver
UPDATE service_areas SET
  content_en       = regexp_replace(content_en,       '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/renovation-cost-vancouver-2026-complete-guide\M', '\1/guides/whole-house-renovation-cost-vancouver/', 'g'),
  content_zh       = regexp_replace(content_zh,       '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/renovation-cost-vancouver-2026-complete-guide\M', '\1/guides/whole-house-renovation-cost-vancouver/', 'g'),
  highlights_en    = regexp_replace(COALESCE(highlights_en, ''),    '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/renovation-cost-vancouver-2026-complete-guide\M', '\1/guides/whole-house-renovation-cost-vancouver/', 'g'),
  highlights_zh    = regexp_replace(COALESCE(highlights_zh, ''),    '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/renovation-cost-vancouver-2026-complete-guide\M', '\1/guides/whole-house-renovation-cost-vancouver/', 'g'),
  description_en   = regexp_replace(COALESCE(description_en, ''),   '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/renovation-cost-vancouver-2026-complete-guide\M', '\1/guides/whole-house-renovation-cost-vancouver/', 'g'),
  description_zh   = regexp_replace(COALESCE(description_zh, ''),   '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/renovation-cost-vancouver-2026-complete-guide\M', '\1/guides/whole-house-renovation-cost-vancouver/', 'g'),
  localizations    = (regexp_replace(localizations::text,           '(/[a-z]{2}(?:-[A-Za-z]+)?)/blog/renovation-cost-vancouver-2026-complete-guide\M', '\1/guides/whole-house-renovation-cost-vancouver/', 'g'))::jsonb,
  updated_at       = now()
WHERE content_en LIKE '%/blog/renovation-cost-vancouver-2026-complete-guide%'
   OR content_zh LIKE '%/blog/renovation-cost-vancouver-2026-complete-guide%'
   OR localizations::text LIKE '%/blog/renovation-cost-vancouver-2026-complete-guide%';

COMMIT;

-- Sanity check: any legacy URL still present?
SELECT slug
FROM service_areas
WHERE content_en LIKE '%/blog/average-bathroom-renovation-cost-vancouver%'
   OR content_en LIKE '%/blog/bathroom-renovation-cost-vancouver-by-%'
   OR content_en LIKE '%/blog/basement-renovation-cost-vancouver-2026%'
   OR content_en LIKE '%/blog/basement-suite-renovation-cost-vancouver%'
   OR content_en LIKE '%/blog/renovation-cost-vancouver-2026-complete-guide%'
   OR content_zh LIKE '%/blog/average-bathroom-renovation-cost-vancouver%'
   OR content_zh LIKE '%/blog/bathroom-renovation-cost-vancouver-by-%'
   OR content_zh LIKE '%/blog/basement-renovation-cost-vancouver-2026%'
   OR content_zh LIKE '%/blog/basement-suite-renovation-cost-vancouver%'
   OR content_zh LIKE '%/blog/renovation-cost-vancouver-2026-complete-guide%'
   OR localizations::text LIKE '%/blog/average-bathroom-renovation-cost-vancouver%'
   OR localizations::text LIKE '%/blog/bathroom-renovation-cost-vancouver-by-%'
   OR localizations::text LIKE '%/blog/basement-renovation-cost-vancouver-2026%'
   OR localizations::text LIKE '%/blog/basement-suite-renovation-cost-vancouver%'
   OR localizations::text LIKE '%/blog/renovation-cost-vancouver-2026-complete-guide%';
