-- Migration: populate duration_zh for 17 projects that have duration_zh NULL.
-- Substance sourced from services.long_description_en timeline tables:
--   kitchen: Refresh 2–4 wks, Mid 6–10 wks, Premium 10–16 wks, Luxury 16–28 wks
--   bathroom: Powder refresh 1–2 wks, Powder full 2–3 wks, Standard 3–4 wks,
--             Full gut+tile 4–7 wks, Premium ensuite 7–10 wks
--   whole-house: used service long_description_en to infer scope
--
-- NOT APPLIED — run manually after review:
--   pnpm db:query -f scripts/migrations/2026-09-07-projects-duration-zh.sql
--
-- Coverage check: none of these slugs appear in any existing migration.

-- ── KITCHEN (mid-range unless keyword indicates refresh or premium) ───────────

-- coquitlam-condo-kitchen-renovation — condo kitchen, no qualifier → mid-range
UPDATE projects SET duration_zh = '6–10周'
WHERE slug = 'coquitlam-condo-kitchen-renovation'
  AND (duration_zh IS NULL OR duration_zh = '');

-- townhouse-kitchen-renovation-burnaby — townhouse kitchen, no qualifier → mid-range
UPDATE projects SET duration_zh = '6–10周'
WHERE slug = 'townhouse-kitchen-renovation-burnaby'
  AND (duration_zh IS NULL OR duration_zh = '');

-- coquitlam-kitchen-renovation-quartz-island — quartz island indicates premium layout
UPDATE projects SET duration_zh = '10–16周'
WHERE slug = 'coquitlam-kitchen-renovation-quartz-island'
  AND (duration_zh IS NULL OR duration_zh = '');

-- richmond-townhouse-kitchen-renovation-white-shaker — white shaker = standard finish, mid-range
UPDATE projects SET duration_zh = '6–10周'
WHERE slug = 'richmond-townhouse-kitchen-renovation-white-shaker'
  AND (duration_zh IS NULL OR duration_zh = '');

-- ── BATHROOM ───────────────────────────────────────────────────────────────

-- north-vancouver-bathroom-renovation-herringbone-tile — herringbone = custom tile, full gut
UPDATE projects SET duration_zh = '4–7周'
WHERE slug = 'north-vancouver-bathroom-renovation-herringbone-tile'
  AND (duration_zh IS NULL OR duration_zh = '');

-- two-bathroom-renovation-burnaby-3 — two bathrooms, full scope
UPDATE projects SET duration_zh = '4–7周'
WHERE slug = 'two-bathroom-renovation-burnaby-3'
  AND (duration_zh IS NULL OR duration_zh = '');

-- coquitlam-condo-bathroom-renovation — condo bathroom, standard full scope
UPDATE projects SET duration_zh = '3–4周'
WHERE slug = 'coquitlam-condo-bathroom-renovation'
  AND (duration_zh IS NULL OR duration_zh = '');

-- richmond-bathroom-renovation-with-white-shaker-cabinets — white shaker = standard finish
UPDATE projects SET duration_zh = '3–4周'
WHERE slug = 'richmond-bathroom-renovation-with-white-shaker-cabinets'
  AND (duration_zh IS NULL OR duration_zh = '');

-- budget-friendly-bathroom-renovation-burnaby — budget/entry-level
UPDATE projects SET duration_zh = '3–4周'
WHERE slug = 'budget-friendly-bathroom-renovation-burnaby'
  AND (duration_zh IS NULL OR duration_zh = '');

-- powder-room-renovation-richmond — powder room (smaller scope)
UPDATE projects SET duration_zh = '2–3周'
WHERE slug = 'powder-room-renovation-richmond'
  AND (duration_zh IS NULL OR duration_zh = '');

-- hallway-bathroom-renovation-richmond — hallway bathroom, typically compact/standard
UPDATE projects SET duration_zh = '3–4周'
WHERE slug = 'hallway-bathroom-renovation-richmond'
  AND (duration_zh IS NULL OR duration_zh = '');

-- ensuite-bathroom-renovation-richmond — ensuite (premium positioning from service_type)
UPDATE projects SET duration_zh = '4–7周'
WHERE slug = 'ensuite-bathroom-renovation-richmond'
  AND (duration_zh IS NULL OR duration_zh = '');

-- ── WHOLE-HOUSE ───────────────────────────────────────────────────────────

-- richmond-condo-flooring-renovation — flooring-only in condo, fastest scope
UPDATE projects SET duration_zh = '2–4周'
WHERE slug = 'richmond-condo-flooring-renovation'
  AND (duration_zh IS NULL OR duration_zh = '');

-- vancouver-house-renovation-kitchen-and-bathrooms — kitchen + bathrooms in house → premium
UPDATE projects SET duration_zh = '10–16周'
WHERE slug = 'vancouver-house-renovation-kitchen-and-bathrooms'
  AND (duration_zh IS NULL OR duration_zh = '');

-- richmond-whole-home-renovation-marble-kitchen — marble kitchen → premium/luxury tier
UPDATE projects SET duration_zh = '10–16周'
WHERE slug = 'richmond-whole-home-renovation-marble-kitchen'
  AND (duration_zh IS NULL OR duration_zh = '');

-- delta-kitchen-renovation-apron-sink-quartz — apron sink + quartz = full kitchen, mid-range
UPDATE projects SET duration_zh = '6–10周'
WHERE slug = 'delta-kitchen-renovation-apron-sink-quartz'
  AND (duration_zh IS NULL OR duration_zh = '');

-- richmond-house-renovation-kitchen-bathrooms-flooring — kitchen + bathrooms + flooring, multi-scope
UPDATE projects SET duration_zh = '10–16周'
WHERE slug = 'richmond-house-renovation-kitchen-bathrooms-flooring'
  AND (duration_zh IS NULL OR duration_zh = '');
