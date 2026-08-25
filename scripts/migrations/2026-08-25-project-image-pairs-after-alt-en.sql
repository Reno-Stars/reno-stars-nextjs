-- Migration: project_image_pairs.after_alt_text_en
-- Status: NOT APPLIED — needs human to run
-- Coverage: 58 rows where after_alt_text_en IS NULL (same IDs as the after_alt_text_zh batch)
-- Logic: Sets after_alt_text_en = title_en (SQL column reference to the title_en column)
-- Idempotent: WHERE guard ensures safe re-run

BEGIN;

UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '1d2f9425-5659-49dc-809c-716c43edc570'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '40eb125c-4600-4ca6-a842-aa90e2708e49'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'ad3d59e1-9000-4b36-8f89-7a6f0fef7aca'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '3cba3895-b4c5-412f-8a96-35047192bdda'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'f32478df-b05d-4932-b82a-6f1c5e4e0da5'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'df893f9f-54de-4f99-92df-df934196d5be'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '838f1ee4-beaa-42e7-bca5-73c810422d76'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '59e00107-21be-45d5-886f-cd4de905694f'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '02b37032-37bc-4562-8553-f9da01aa397d'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'd043cb40-21ff-4b9b-aac3-e00339d0916f'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '7b2e5611-c53b-4fd7-9e29-73845dbef728'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '70047904-0a5b-4cfa-8b3e-e2afe4a04114'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'a0690f3a-af1f-4cd1-a2b6-8920908801ea'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '9063e628-abf9-411a-a7a4-2ddc179c1689'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'bdabe61c-1551-443b-9db5-e7d6c5d9bb82'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '4da79280-b84c-446c-8914-782e7e1fc1ef'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'e7ef381e-cd29-4868-91d8-f5b5efcb4cbc'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'f6569579-4798-41a2-836e-322fc1c5c337'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'd1899877-1cc3-4043-9544-dfe0f7fdaba6'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '701ce355-942c-4df0-acab-593e05983d81'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'acebea3c-62fb-462e-a400-e9a24f911563'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '181c865f-23d5-4254-aa2d-a4eaf857201a'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '550493d9-5185-474c-af64-9ee819310746'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '394bba39-b5ba-4a17-b408-bdb54643064a'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '183b5fb7-0fce-4f50-b3d3-3dc690eca445'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '03589549-6b2d-4720-b0ce-f234fc962d74'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '62476da2-c73a-4c00-a0c5-caef22c1b88f'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'a83452cd-415b-457c-9ab0-5b533920ca5c'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '5f5770ac-b5e3-4089-bef7-d78d0fcac1be'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '65163509-80c6-4572-bbba-831fdf31db9f'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '018eda65-401d-4ec3-84cc-7793597e75c7'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '25febb78-bca5-4b0a-bdfb-d08df7bfbbab'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '1a66b299-02d4-429b-a767-25aa7a39575f'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '3ef5531b-cfb9-454d-9cd2-90887b3775f0'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'd9af4d6e-e73e-4d89-87dc-b5fdafab7b3a'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '331f03b3-624e-4ddf-9b38-c8768d3d1932'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '3239a7b3-2c80-481f-a6f1-dfa6187b97e6'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'c8a66604-00ed-4307-8b28-b95257eaa249'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '0f8df3ba-5f59-4abd-89c6-5567810e7d5e'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '8a01e9c4-e89e-4784-b818-e5d68bd06bbd'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '1ea53266-6319-4b03-b109-d7e72aa2d8d9'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'c0afba82-fded-4375-8466-fc8feb22f991'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'fe05b33d-9548-443a-adc7-35744b2fe6c8'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '66177cfa-9cbb-4ac4-94b9-515c66786a05'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '906ab373-f8c0-4262-863f-25117f7b5efe'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '2f7a992f-5372-4f03-9328-456fff969a97'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '4ced0347-337e-4f7e-aedc-8ec256406770'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '7a695f0f-55fe-46e9-a710-f9a8a5cc7bb9'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '33a29a45-e781-41a3-9391-66eca2929f70'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '9cbc6ccf-bc07-4c2f-a867-c57ab4218728'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '00efc301-c95b-4a9f-946b-2539a9a87d03'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '47b532fc-74a5-4048-a038-d983091032ab'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = 'be83574d-60b4-4ad9-805d-098c8a5cccfd'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '95830870-fb6b-4632-a19c-4729002bd91e'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '3a8a197d-01fd-4187-8ee6-9164a974c900'
  AND after_alt_text_en IS NULL;
UPDATE project_image_pairs
SET after_alt_text_en = title_en
WHERE id = '561278cf-e1cd-453c-8ec7-302075e6cc54'
  AND after_alt_text_en IS NULL;

COMMIT;
