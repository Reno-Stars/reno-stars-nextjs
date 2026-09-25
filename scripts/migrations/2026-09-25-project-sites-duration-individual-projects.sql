-- Migration: backfill project_sites.duration for individual-projects
-- Row: id=64f0f111-4920-434f-ab7e-0c2c411e6633, slug=individual-projects
-- Both duration_en AND duration_zh are NULL. Pattern from other rows:
--   "8-12 weeks" / "8至12周", "3-4 months" / "3至4个月"
-- This row is a generic container for individual/smaller projects — no single
-- duration applies. Using "TBD" / "待定" as a safe neutral placeholder.
-- WHERE guard ensures idempotency.
UPDATE project_sites
SET duration_en = 'TBD', duration_zh = '待定', updated_at = NOW()
WHERE slug = 'individual-projects'
  AND (duration_en IS NULL OR duration_en = '');
