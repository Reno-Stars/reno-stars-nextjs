-- Migration: project_image_pairs — after_alt_text_en batch 2 (batch 1 = 58 rows, 2026-08-24)
-- Status: NOT APPLIED — needs human to run
-- Coverage: 38 rows where after_image_url IS NOT NULL AND after_alt_text_en IS NULL
-- Logic: title_en IS NULL on all 38 rows; derive from project slug (hyphenated, title-style)
-- Idempotent: WHERE guard on after_alt_text_en IS NULL ensures safe re-run
-- Source: live DB query 2026-09-04
-- NOT APPLIED — requires human execution after PR merge

BEGIN;

-- coquitlam-kitchen-renovation-quartz-island (6 rows)
UPDATE project_image_pairs SET after_alt_text_en = 'Coquitlam kitchen renovation with quartz island' WHERE id = 'c3184231-3286-4adb-a505-a44211a6e830' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Coquitlam kitchen renovation with quartz island' WHERE id = 'e1244ff4-b2fa-46ed-a5d1-82852b8f6c71' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Coquitlam kitchen renovation with quartz island' WHERE id = '88c0bdf1-fb8d-4c99-bc33-70c8c6f95d57' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Coquitlam kitchen renovation with quartz island' WHERE id = 'e740b728-f490-4ebe-9fbd-c404af0a1396' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Coquitlam kitchen renovation with quartz island' WHERE id = '6d619b10-4b1d-4dd7-b694-b08fb2e5fa9f' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Coquitlam kitchen renovation with quartz island' WHERE id = '79d2f843-d40d-4235-ae6d-41637d099885' AND after_alt_text_en IS NULL;

-- delta-kitchen-renovation-apron-sink-quartz (6 rows)
UPDATE project_image_pairs SET after_alt_text_en = 'Delta kitchen renovation with apron sink and quartz countertops' WHERE id = '411f96a2-b161-4d17-9d5e-f8cbf1a74bee' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Delta kitchen renovation with apron sink and quartz countertops' WHERE id = '615f510e-b1aa-41be-bf81-2e75cb2817c1' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Delta kitchen renovation with apron sink and quartz countertops' WHERE id = '943f3f08-952b-443e-b43f-6574ca96eb39' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Delta kitchen renovation with apron sink and quartz countertops' WHERE id = '63ae9638-32d2-488d-ab6a-cc26c0ea12ac' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Delta kitchen renovation with apron sink and quartz countertops' WHERE id = '91ad8b69-d896-4c1c-8532-abdd67c24880' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Delta kitchen renovation with apron sink and quartz countertops' WHERE id = '15aef9e3-3521-4a24-8726-81f34abe20a3' AND after_alt_text_en IS NULL;

-- north-vancouver-bathroom-renovation-herringbone-tile (3 rows)
UPDATE project_image_pairs SET after_alt_text_en = 'North Vancouver bathroom renovation with herringbone tile' WHERE id = '11f4b471-0338-490b-aa72-4898c25450fd' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'North Vancouver bathroom renovation with herringbone tile' WHERE id = '9d7aa325-ca6b-4744-8e63-5e0ade107288' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'North Vancouver bathroom renovation with herringbone tile' WHERE id = '59013c4c-0449-4d8f-86bf-4286c66402b8' AND after_alt_text_en IS NULL;

-- richmond-condo-flooring-renovation (5 rows)
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond condo flooring renovation' WHERE id = '4959025c-7002-4ffc-91d3-7ea1dbd7e2c3' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond condo flooring renovation' WHERE id = 'a7d11f64-e2d9-494e-abcb-21cb718b60b3' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond condo flooring renovation' WHERE id = '921d4939-d5f5-43dd-b905-974830f8aa27' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond condo flooring renovation' WHERE id = '04b0a43c-b793-4adf-92f6-15e912f19a8f' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond condo flooring renovation' WHERE id = 'fe53529a-0e3b-4bc1-8c0f-c51ac3bf9af7' AND after_alt_text_en IS NULL;

-- richmond-house-renovation-kitchen-bathrooms-flooring (6 rows)
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond house renovation kitchen bathrooms flooring' WHERE id = '57c2acb2-cd88-4573-8b24-1829e1033ae0' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond house renovation kitchen bathrooms flooring' WHERE id = 'fb27c850-afab-4b84-8f86-513a1a340c51' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond house renovation kitchen bathrooms flooring' WHERE id = '414d7d7a-8f79-49e8-9873-57457e3c79d4' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond house renovation kitchen bathrooms flooring' WHERE id = 'd86c126c-ee32-4365-bee2-64fa110b4493' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond house renovation kitchen bathrooms flooring' WHERE id = '2f4a067e-9e0e-4c98-8f6d-e9830139b5df' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond house renovation kitchen bathrooms flooring' WHERE id = 'a4ffea51-a939-4272-a816-658079a7b90f' AND after_alt_text_en IS NULL;

-- richmond-whole-home-renovation-marble-kitchen (6 rows)
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond whole home renovation with marble kitchen' WHERE id = '66a979e8-54e9-482f-aef5-82f03010caf2' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond whole home renovation with marble kitchen' WHERE id = 'fc69c193-3a26-488b-895c-3b8210508a22' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond whole home renovation with marble kitchen' WHERE id = '2a1cef46-85cb-4d95-aad0-691c07ecd63a' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond whole home renovation with marble kitchen' WHERE id = 'd027d875-6748-47fb-a182-e837b7ed8505' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond whole home renovation with marble kitchen' WHERE id = 'cd0f6d68-23d0-4665-ba68-ec04def54917' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond whole home renovation with marble kitchen' WHERE id = '703c2c38-c9b4-412f-8df8-1a6dc6ea81da' AND after_alt_text_en IS NULL;

-- vancouver-house-renovation-kitchen-and-bathrooms (6 rows)
UPDATE project_image_pairs SET after_alt_text_en = 'Vancouver house renovation kitchen and bathrooms' WHERE id = 'b8285cfe-5ab0-4375-9747-8a4449e7d5d7' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Vancouver house renovation kitchen and bathrooms' WHERE id = '64caaaa4-729a-4dd8-a92c-7e95319b2131' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Vancouver house renovation kitchen and bathrooms' WHERE id = '2eb5b788-4c3e-453c-89e9-7ad768fb4987' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Vancouver house renovation kitchen and bathrooms' WHERE id = 'fa67f7e2-82e0-4101-baf7-7e585f8410cf' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Vancouver house renovation kitchen and bathrooms' WHERE id = '9570830f-3966-43fe-b938-75d1e34ee3e9' AND after_alt_text_en IS NULL;
UPDATE project_image_pairs SET after_alt_text_en = 'Vancouver house renovation kitchen and bathrooms' WHERE id = '079663bb-9203-462c-b24d-436967a68404' AND after_alt_text_en IS NULL;

COMMIT;
