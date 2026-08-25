-- Migration: 2026-08-25-project-image-pairs-alt-text-zh.sql
-- Target: project_image_pairs — English text in before_alt_text_zh, after_alt_text_zh, caption_zh
-- Found via: CJK regex !~ '[一-鿿]' on project west-vancouver-luxury-bathroom-champagne-gold (561278cf)
-- Rows: 2 before_alt_text_zh, 7 after_alt_text_zh, 5 caption_zh — all belong to same published project
-- NOT APPLIED — needs human review

BEGIN;

-- before_alt_text_zh: 2 rows with English text
UPDATE project_image_pairs
SET before_alt_text_zh =
  CASE id
    WHEN '3fd23985-91a5-47bd-bf52-b08fd93791d9'
      THEN 'Original soaker tub with damask wallpaper and dated finishes — before renovation'
    WHEN 'aa1a98a5-46c5-4351-817a-ca82e370dd0c'
      THEN 'Original 1990s shower with floral wallpaper and gold-framed door — before renovation'
  END
WHERE id IN ('3fd23985-91a5-47bd-bf52-b08fd93791d9', 'aa1a98a5-46c5-4351-817a-ca82e370dd0c')
  AND before_alt_text_zh IS NOT NULL
  AND before_alt_text_zh !~ '[一-鿿]';

-- after_alt_text_zh: 7 rows with English text
UPDATE project_image_pairs
SET after_alt_text_zh =
  CASE id
    WHEN '3fd23985-91a5-47bd-bf52-b08fd93791d9'
      THEN 'Ornate gold-framed wall mirror over marble bathtub with plantation shutters'
    WHEN 'aa1a98a5-46c5-4351-817a-ca82e370dd0c'
      THEN 'Frameless glass walk-in shower with champagne gold rain head and basketweave marble mosaic floor'
    WHEN '48240e67-d904-426e-8846-2be0a5fbdd3f'
      THEN 'Walk-in shower with champagne gold fixtures and built-in marble bench'
    WHEN 'e7a449ad-659f-49e3-9050-0183c0c9fdeb'
      THEN 'Marble shower wall with backlit champagne gold trimmed niche'
    WHEN '16c45fa7-8bb7-4ea2-99f5-bbe1b1e24092'
      THEN 'Double-sink French-style vanity with arched ceiling and champagne gold faucets'
    WHEN '9e6b9b49-0ac3-4bbe-baa6-bea86452be29'
      THEN 'Brass sconces flanking arched mirror over double vanity in West Vancouver luxury bath'
    WHEN '1402cbba-2415-4435-b6ab-26aaba02830a'
      THEN 'Champagne gold arched dressing mirror with vintage brass wall sconces'
  END
WHERE id IN (
  '3fd23985-91a5-47bd-bf52-b08fd93791d9',
  'aa1a98a5-46c5-4351-817a-ca82e370dd0c',
  '48240e67-d904-426e-8846-2be0a5fbdd3f',
  'e7a449ad-659f-49e3-9050-0183c0c9fdeb',
  '16c45fa7-8bb7-4ea2-99f5-bbe1b1e24092',
  '9e6b9b49-0ac3-4bbe-baa6-bea86452be29',
  '1402cbba-2415-4435-b6ab-26aaba02830a'
)
  AND after_alt_text_zh IS NOT NULL
  AND after_alt_text_zh !~ '[一-鿿]';

-- caption_zh: 5 rows with English text (same project, subset of after_alt_text_zh rows)
UPDATE project_image_pairs
SET caption_zh =
  CASE id
    WHEN '48240e67-d904-426e-8846-2be0a5fbdd3f'
      THEN 'Walk-in shower with champagne gold fixtures and built-in marble bench'
    WHEN 'e7a449ad-659f-49e3-9050-0183c0c9fdeb'
      THEN 'Marble shower wall with backlit champagne gold trimmed niche'
    WHEN '16c45fa7-8bb7-4ea2-99f5-bbe1b1e24092'
      THEN 'Double-sink French-style vanity with arched ceiling and champagne gold faucets'
    WHEN '9e6b9b49-0ac3-4bbe-baa6-bea86452be29'
      THEN 'Brass sconces flanking arched mirror over double vanity in West Vancouver luxury bath'
    WHEN '1402cbba-2415-4435-b6ab-26aaba02830a'
      THEN 'Champagne gold arched dressing mirror with vintage brass wall sconces'
  END
WHERE id IN (
  '48240e67-d904-426e-8846-2be0a5fbdd3f',
  'e7a449ad-659f-49e3-9050-0183c0c9fdeb',
  '16c45fa7-8bb7-4ea2-99f5-bbe1b1e24092',
  '9e6b9b49-0ac3-4bbe-baa6-bea86452be29',
  '1402cbba-2415-4435-b6ab-26aaba02830a'
)
  AND caption_zh IS NOT NULL
  AND caption_zh !~ '[一-鿿]';

COMMIT;
