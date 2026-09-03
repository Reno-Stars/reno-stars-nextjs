-- Migration: project_image_pairs — populate missing after_alt_text_en
-- Status: NOT APPLIED — needs human to run against live database
-- Finding: 38 rows across 7 projects had NULL after_alt_text_en
-- Alt text derived from project title_en + description_en (real descriptions, not invented)
-- Idempotent: WHERE id IN (...) with exact IDs, safe to re-run

-- coquitlam-kitchen-renovation-quartz-island (6 images)
UPDATE project_image_pairs SET after_alt_text_en = 'White and grey Shaker kitchen cabinets to ceiling, quartz waterfall island with four stools, Coquitlam renovation'
WHERE id = '6d619b10-4b1d-4dd7-b694-b08fb2e5fa9f';

UPDATE project_image_pairs SET after_alt_text_en = 'Quartz waterfall island with linear pendant lighting, white Shaker cabinetry, Coquitlam kitchen renovation'
WHERE id = 'e740b728-f490-4ebe-9fbd-c404af0a1396';

UPDATE project_image_pairs SET after_alt_text_en = 'White Shaker cabinetry, integrated appliances, marble-look quartz counters, Coquitlam kitchen renovation'
WHERE id = '88c0bdf1-fb8d-4c99-bc33-70c8c6f95d57';

UPDATE project_image_pairs SET after_alt_text_en = 'Marble-look tiled fireplace surround, quartz vanity, round backlit mirror, Coquitlam whole-home renovation'
WHERE id = 'e1244ff4-b2fa-46ed-a5d1-82852b8f6c71';

UPDATE project_image_pairs SET after_alt_text_en = 'Polished large-format tile flooring through open plan main floor, Coquitlam kitchen and living areas'
WHERE id = '79d2f843-d40d-4235-ae6d-41637d099885';

UPDATE project_image_pairs SET after_alt_text_en = 'White Shaker kitchen with soft grey cabinetry, quartz waterfall island, Coquitlam renovation complete'
WHERE id = 'c3184231-3286-4adb-a505-a44211a6e830';

-- delta-kitchen-renovation-apron-sink-quartz (6 images)
UPDATE project_image_pairs SET after_alt_text_en = 'White Shaker kitchen cabinets, quartz waterfall peninsula, brushed brass tapware, Delta BC whole-house renovation'
WHERE id = '15aef9e3-3521-4a24-8726-81f34abe20a3';

UPDATE project_image_pairs SET after_alt_text_en = 'White Shaker kitchen, oak plank flooring, brushed brass fixtures, Delta whole-house renovation'
WHERE id = '943f3f08-952b-443e-b43f-6574ca96eb39';

UPDATE project_image_pairs SET after_alt_text_en = 'Delta kitchen renovation — stacked tile backsplash, brushed brass tapware, quartz waterfall peninsula'
WHERE id = '63ae9638-32d2-488d-ab6a-cc26c0ea12ac';

UPDATE project_image_pairs SET after_alt_text_en = 'Delta bathroom renovation — grey vanity, black-framed mirror, marble-look tiled tub surround'
WHERE id = '411f96a2-b161-4d17-9d5e-f8cbf1a74bee';

UPDATE project_image_pairs SET after_alt_text_en = 'Delta whole-house renovation — white Shaker kitchen cabinets, quartz counters, brushed brass fixtures'
WHERE id = '91ad8b69-d896-4c1c-8532-abdd67c24880';

UPDATE project_image_pairs SET after_alt_text_en = 'Complete Delta kitchen renovation — white shaker cabinets, quartz waterfall island, oak plank floor, Delta BC'
WHERE id = '615f510e-b1aa-41be-bf81-2e75cb2817c1';

-- north-vancouver-bathroom-renovation-herringbone-tile (3 images)
UPDATE project_image_pairs SET after_alt_text_en = 'Black herringbone tile surround, white soaker tub, brushed gold fixtures, recessed niche, North Vancouver bathroom'
WHERE id = '59013c4c-0449-4d8f-86bf-4286c66402b8';

UPDATE project_image_pairs SET after_alt_text_en = 'Black herringbone tile full height, brushed gold tapware, downlights, compact North Vancouver bathroom renovation'
WHERE id = '11f4b471-0338-490b-aa72-4898c25450fd';

UPDATE project_image_pairs SET after_alt_text_en = 'North Vancouver bathroom renovation — black herringbone tile, white soaker tub, brushed gold fixtures, downlights'
WHERE id = '9d7aa325-ca6b-4744-8e63-5e0ade107288';

-- richmond-condo-flooring-renovation (5 images)
UPDATE project_image_pairs SET after_alt_text_en = 'Light oak engineered plank flooring, clean baseboard transitions, bright Richmond condo living area'
WHERE id = '4959025c-7002-4ffc-91d3-7ea1dbd7e2c3';

UPDATE project_image_pairs SET after_alt_text_en = 'Richmond condo flooring renovation — light oak plank, new baseboards, high-rise living room complete'
WHERE id = '04b0a43c-b793-4adf-92f6-15e912f19a8f';

UPDATE project_image_pairs SET after_alt_text_en = 'Richmond condo — engineered oak flooring, entry tile threshold, renovated living room and hallway'
WHERE id = 'fe53529a-0e3b-4bc1-8c0f-c51ac3bf9af7';

UPDATE project_image_pairs SET after_alt_text_en = 'Light oak engineered plank in Richmond condo bedroom, fresh paint, renovated flooring complete'
WHERE id = 'a7d11f64-e2d9-494e-abcb-21cb718b60b3';

UPDATE project_image_pairs SET after_alt_text_en = 'Richmond high-rise condo — light oak engineered floor, clean transitions, flooring replacement complete'
WHERE id = '921d4939-d5f5-43dd-b905-974830f8aa27';

-- richmond-house-renovation-kitchen-bathrooms-flooring (6 images)
UPDATE project_image_pairs SET after_alt_text_en = 'Richmond house renovation kitchen — refreshed maple cabinetry, quartz counters, marble-look tile backsplash, new dishwasher'
WHERE id = '57c2acb2-cd88-4573-8b24-1829e1033ae0';

UPDATE project_image_pairs SET after_alt_text_en = 'Richmond kitchen renovation — quartz countertop, undermount double sink, matte black hardware, marble-look tile'
WHERE id = 'a4ffea51-a939-4272-a816-658079a7b90f';

UPDATE project_image_pairs SET after_alt_text_en = 'Richmond bathroom renovation — shaker double vanity, wide framed mirror, glass shower, marble-look tile surround'
WHERE id = '2f4a067e-9e0e-4c98-8f6d-e9830139b5df';

UPDATE project_image_pairs SET after_alt_text_en = 'Richmond house — wide plank flooring, fresh paint, renovated kitchen and bathrooms, whole-home renovation'
WHERE id = 'fb27c850-afab-4b84-8f86-513a1a340c51';

UPDATE project_image_pairs SET after_alt_text_en = 'Richmond bathroom — glass shower enclosure, marble-look tile surround, shaker vanity, quartz countertop'
WHERE id = 'd86c126c-ee32-4365-bee2-64fa110b4493';

UPDATE project_image_pairs SET after_alt_text_en = 'Richmond whole-house renovation — kitchen, three bathrooms, flooring and paint throughout, family home complete'
WHERE id = '414d7d7a-8f79-49e8-9873-57457e3c79d4';

-- richmond-whole-home-renovation-marble-kitchen (6 images)
UPDATE project_image_pairs SET after_alt_text_en = 'Marble-look slab backsplash and counters, arched glass-front upper cabinets, brushed gold tapware, Richmond kitchen'
WHERE id = 'fc69c193-3a26-488b-895c-3b8210508a22';

UPDATE project_image_pairs SET after_alt_text_en = 'Richmond kitchen — black undermount sink, brushed gold fixtures, marble-look slab counters, arched glass cabinets'
WHERE id = '703c2c38-c9b4-412f-8df8-1a6dc6ea81da';

UPDATE project_image_pairs SET after_alt_text_en = 'Richmond powder room — vessel basin, organic-shaped mirror, marble-look tile, whole-home renovation'
WHERE id = '2a1cef46-85cb-4d95-aad0-691c07ecd63a';

UPDATE project_image_pairs SET after_alt_text_en = 'Richmond staircase rebuilt in light oak, open tread design, whole-home renovation complete'
WHERE id = 'd027d875-6748-47fb-a182-e837b7ed8505';

UPDATE project_image_pairs SET after_alt_text_en = 'Richmond bathroom — fluted-tile shower niche, marble surround, built-in wardrobes, integrated hallway lighting'
WHERE id = 'cd0f6d68-23d0-4665-ba68-ec04def54917';

UPDATE project_image_pairs SET after_alt_text_en = 'Richmond whole-home renovation — marble-look kitchen, powder room, staircase, marble bathroom, renovation complete'
WHERE id = '66a979e8-54e9-482f-aef5-82f03010caf2';

-- vancouver-house-renovation-kitchen-and-bathrooms (6 images)
UPDATE project_image_pairs SET after_alt_text_en = 'White Shaker kitchen, marble-look tile backsplash, matte black hardware, quartz counter, Vancouver home renovation'
WHERE id = 'b8285cfe-5ab0-4375-9747-8a4449e7d5d7';

UPDATE project_image_pairs SET after_alt_text_en = 'Vancouver kitchen renovation — double sink counter run, white shaker cabinets, quartz countertop, matte black fixtures'
WHERE id = '64caaaa4-729a-4dd8-a92c-7e95319b2131';

UPDATE project_image_pairs SET after_alt_text_en = 'Vancouver bathroom — large-format grey tile tub and shower surround, shaker vanity, quartz top, framed mirror'
WHERE id = '2eb5b788-4c3e-453c-89e9-7ad768fb4987';

UPDATE project_image_pairs SET after_alt_text_en = 'Vancouver bathroom renovation — large-format grey tile, glass shower, shaker vanity, quartz countertop, framed mirror'
WHERE id = '079663bb-9203-462c-b24d-436967a68404';

UPDATE project_image_pairs SET after_alt_text_en = 'Vancouver home renovation — wood-look vinyl plank flooring, recessed lighting, renovated kitchen and bathrooms'
WHERE id = '9570830f-3966-43fe-b938-75d1e34ee3e9';

UPDATE project_image_pairs SET after_alt_text_en = 'Vancouver whole-house renovation — kitchen, bathrooms, wood-look vinyl plank floor, new flooring throughout'
WHERE id = 'fa67f7e2-82e0-4101-baf7-7e585f8410cf';
