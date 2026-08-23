-- Migration: add before_alt_text_zh for 17 site_image_pairs rows
-- These rows have NULL before_alt_text_zh AND NULL before_alt_text_en
-- (before image was added without any alt text)
-- Source of truth for zh: area slug + generic renovation description
-- NOT APPLIED — human must run this file
-- Date: 2026-08-23

BEGIN;

-- richmond-whole-house-renovation-2
UPDATE site_image_pairs
SET before_alt_text_zh = '列治文全屋装修 — 改造前'
WHERE id = 'e253ca3e-2da4-4a49-9f72-32c4f9240564'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

-- burnaby-townhouse-renovation-2
UPDATE site_image_pairs
SET before_alt_text_zh = '本拿比联排别墅翻新 — 改造前 1'
WHERE id = 'fb6fc2a4-6138-4cca-9855-66bce234df51'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

UPDATE site_image_pairs
SET before_alt_text_zh = '本拿比联排别墅翻新 — 改造前 2'
WHERE id = '9162b4b2-600f-4005-bdd2-e562762db9a2'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

UPDATE site_image_pairs
SET before_alt_text_zh = '本拿比联排别墅翻新 — 改造前 3'
WHERE id = 'a564e215-7421-4952-82c1-612f3c0ecb7d'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

UPDATE site_image_pairs
SET before_alt_text_zh = '本拿比联排别墅翻新 — 改造前 4'
WHERE id = 'e2de2f03-bd1c-4d3d-8cd6-0ca7bcc47d9f'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

-- surrey-whole-house-renovation
UPDATE site_image_pairs
SET before_alt_text_zh = '素里全屋装修 — 改造前'
WHERE id = '7636aa14-e471-4c4e-b085-592f26d9e0cf'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

-- burnaby-whole-house-renovation
UPDATE site_image_pairs
SET before_alt_text_zh = '本拿比全屋装修 — 改造前'
WHERE id = '69bd5d91-38b0-4c64-be0c-9379ec9f355c'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

-- burnaby-townhouse-renovation
UPDATE site_image_pairs
SET before_alt_text_zh = '本拿比联排别墅装修 — 改造前'
WHERE id = '7a79dcc9-a45e-40eb-9ce1-dff21e0997dd'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

-- richmond-whole-house-renovation-5
UPDATE site_image_pairs
SET before_alt_text_zh = '列治文全屋装修 — 改造前'
WHERE id = 'd626323e-3b7a-4c0a-bf9f-aff52348293f'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

-- burnaby-whole-house-renovation-2
UPDATE site_image_pairs
SET before_alt_text_zh = '本拿比全屋装修 — 改造前 1'
WHERE id = 'b81a1bb7-c3bb-4e52-81fe-cbe2939d6e67'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

UPDATE site_image_pairs
SET before_alt_text_zh = '列治文全屋装修 — 改造前 1'
WHERE id = 'db2a8af0-876d-4f23-be06-1ba5b44bfdb7'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

UPDATE site_image_pairs
SET before_alt_text_zh = '列治文全屋装修 — 改造前 2'
WHERE id = 'b9aa9416-11f5-43c4-873b-a7e6c55d894f'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

UPDATE site_image_pairs
SET before_alt_text_zh = '列治文全屋装修 — 改造前 3'
WHERE id = '7fe5c0bd-e57a-435c-93d0-09193f18d3bf'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

UPDATE site_image_pairs
SET before_alt_text_zh = '本拿比全屋装修 — 改造前 2'
WHERE id = '92f4f34f-c47b-4adb-94e6-1866c5a2ea06'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

UPDATE site_image_pairs
SET before_alt_text_zh = '本拿比全屋装修 — 改造前 3'
WHERE id = '26695b4c-21bc-484c-8f09-7e9876b63d7b'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

UPDATE site_image_pairs
SET before_alt_text_zh = '本拿比全屋装修 — 改造前 4'
WHERE id = '2f1404d9-5cc2-4181-8f92-12f2627106b7'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

UPDATE site_image_pairs
SET before_alt_text_zh = '本拿比全屋装修 — 改造前 5'
WHERE id = 'aa948b3d-5d19-4283-9e00-3b5bd15fcf05'
  AND (before_alt_text_zh IS NULL OR before_alt_text_zh = '');

COMMIT;
