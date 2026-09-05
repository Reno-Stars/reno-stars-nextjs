-- Migration: 2026-09-05-projects-duration-zh.sql
-- Table: projects
-- Column: duration_zh
-- Status: NOT APPLIED — requires human to run against live DB
-- Note: duration_en IS NULL for all 17 rows; Chinese values derived from project type inference.
--   bathroom-only  -> 2-4周
--   kitchen-only  -> 4-6周
--   kitchen+bath  -> 6-8周
--   whole-home    -> 8-12周
-- Human must verify each value before apply.

UPDATE projects SET duration_zh = '2-4周'
  WHERE id = '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '2-4周'
  WHERE id = '1a66b299-02d4-429b-a767-25aa7a39575f'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '2-4周'
  WHERE id = '1d2f9425-5659-49dc-809c-716c43edc570'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '3-4周'
  WHERE id = '3ef5531b-cfb9-454d-9cd2-90887b3775f0'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '2-4周'
  WHERE id = 'f32478df-b05d-4932-b82a-6f1c5e4e0da5'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '4-6周'
  WHERE id = 'df893f9f-54de-4f99-92df-df934196d5be'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '2-4周'
  WHERE id = 'a0690f3a-af1f-4cd1-a2b6-8920908801ea'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '4-6周'
  WHERE id = '8a01e9c4-e89e-4784-b818-e5d68bd06bbd'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '2-4周'
  WHERE id = '9063e628-abf9-411a-a7a4-2ddc179c1689'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '8-12周'
  WHERE id = '331f03b3-624e-4ddf-9b38-c8768d3d1932'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '8-12周'
  WHERE id = '9cbc6ccf-bc07-4c2f-a867-c57ab4218728'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '4-6周'
  WHERE id = '838f1ee4-beaa-42e7-bca5-73c810422d76'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '1-2周'
  WHERE id = '018eda65-401d-4ec3-84cc-7793597e75c7'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '4-6周'
  WHERE id = '3239a7b3-2c80-481f-a6f1-dfa6187b97e6'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '4-6周'
  WHERE id = '66177cfa-9cbb-4ac4-94b9-515c66786a05'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '8-12周'
  WHERE id = 'c8a66604-00ed-4307-8b28-b95257eaa249'
    AND (duration_zh IS NULL OR duration_zh = '');

UPDATE projects SET duration_zh = '6-8周'
  WHERE id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f'
    AND (duration_zh IS NULL OR duration_zh = '');
