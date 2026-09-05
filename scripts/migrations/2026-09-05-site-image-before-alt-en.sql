-- Migration: site_image_pairs before_alt_text_en from Chinese alt text
-- Rows: 17 published site_image_pairs missing before_alt_text_en
-- Source: before_alt_text_zh field (Chinese text already present)
-- Pattern: UPDATE site_image_pairs SET before_alt_text_en = <English> WHERE id = '...' AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);
-- NOT APPLIED — requires human execution after PR merge
-- Context: these are published project pages; before_alt_text_en is used in img alt attributes for English SEO

BEGIN;

UPDATE site_image_pairs
SET before_alt_text_en = 'Richmond Whole House Renovation — Before'
WHERE id = 'e253ca3e-2da4-4a49-9f72-32c4f9240564'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Burnaby Townhouse Renovation — Before'
WHERE id = '7a79dcc9-a45e-40eb-9ce1-dff21e0997dd'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Burnaby Townhouse Renovation — Before 1'
WHERE id = 'fb6fc2a4-6138-4cca-9855-66bce234df51'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Burnaby Townhouse Renovation — Before 2'
WHERE id = '9162b4b2-600f-4005-bdd2-e562762db9a2'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Burnaby Townhouse Renovation — Before 3'
WHERE id = 'a564e215-7421-4952-82c1-612f3c0ecb7d'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Burnaby Townhouse Renovation — Before 4'
WHERE id = 'e2de2f03-bd1c-4d3d-8cd6-0ca7bcc47d9f'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Surrey Whole House Renovation — Before'
WHERE id = '7636aa14-e471-4c4e-b085-592f26d9e0cf'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Burnaby Whole House Renovation — Before'
WHERE id = '69bd5d91-38b0-4c64-be0c-9379ec9f355c'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Richmond Whole House Renovation — Before'
WHERE id = 'd626323e-3b7a-4c0a-bf9f-aff52348293f'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Burnaby Whole House Renovation — Before 1'
WHERE id = 'b81a1bb7-c3bb-4e52-81fe-cbe2939d6e67'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Richmond Whole House Renovation — Before 1'
WHERE id = 'db2a8af0-876d-4f23-be06-1ba5b44bfdb7'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Richmond Whole House Renovation — Before 2'
WHERE id = 'b9aa9416-11f5-43c4-873b-a7e6c55d894f'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Richmond Whole House Renovation — Before 3'
WHERE id = '7fe5c0bd-e57a-435c-93d0-09193f18d3bf'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Burnaby Whole House Renovation — Before 2'
WHERE id = '92f4f34f-c47b-4adb-94e6-1866c5a2ea06'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Burnaby Whole House Renovation — Before 3'
WHERE id = '26695b4c-21bc-484c-8f09-7e9876b63d7b'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Burnaby Whole House Renovation — Before 4'
WHERE id = '2f1404d9-5cc2-4181-8f92-12f2627106b7'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

UPDATE site_image_pairs
SET before_alt_text_en = 'Burnaby Whole House Renovation — Before 5'
WHERE id = 'aa948b3d-5d19-4283-9e00-3b5bd15fcf05'
  AND (before_alt_text_en IS NULL OR char_length(before_alt_text_en) = 0);

COMMIT;
