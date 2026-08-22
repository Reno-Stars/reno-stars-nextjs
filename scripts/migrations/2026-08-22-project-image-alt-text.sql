-- Migration: project_image_pairs after_alt_text_en + after_alt_text_zh for 38 rows
-- Missing alt text on rows that have real after_image_url values
-- NOT APPLIED — needs human to run against the database

-- Vancouver House Renovation (6 after images)
UPDATE project_image_pairs
SET
  after_alt_text_en = CASE id
    WHEN 'b8285cfe-5ab0-4375-9747-8a4449e7d5d7' THEN 'Vancouver House Renovation with Kitchen, Bathrooms and New Flooring — Kitchen After 1'
    WHEN '64caaaa4-729a-4dd8-a92c-7e95319b2131' THEN 'Vancouver House Renovation with Kitchen, Bathrooms and New Flooring — Kitchen After 2'
    WHEN '2eb5b788-4c3e-453c-89e9-7ad768fb4987' THEN 'Vancouver House Renovation with Kitchen, Bathrooms and New Flooring — Bathroom After 1'
    WHEN '079663bb-9203-462c-b24d-436967a68404' THEN 'Vancouver House Renovation with Kitchen, Bathrooms and New Flooring — Bathroom After 2'
    WHEN '9570830f-3966-43fe-b938-75d1e34ee3e9' THEN 'Vancouver House Renovation with Kitchen, Bathrooms and New Flooring — Living Area After'
    WHEN 'fa67f7e2-82e0-4101-baf7-7e585f8410cf' THEN 'Vancouver House Renovation with Kitchen, Bathrooms and New Flooring — Flooring After'
  END,
  after_alt_text_zh = CASE id
    WHEN 'b8285cfe-5ab0-4375-9747-8a4449e7d5d7' THEN '温哥华厨房、浴室和地板翻新工程 — 厨房完工 1'
    WHEN '64caaaa4-729a-4dd8-a92c-7e95319b2131' THEN '温哥华厨房、浴室和地板翻新工程 — 厨房完工 2'
    WHEN '2eb5b788-4c3e-453c-89e9-7ad768fb4987' THEN '温哥华厨房、浴室和地板翻新工程 — 浴室完工 1'
    WHEN '079663bb-9203-462c-b24d-436967a68404' THEN '温哥华厨房、浴室和地板翻新工程 — 浴室完工 2'
    WHEN '9570830f-3966-43fe-b938-75d1e34ee3e9' THEN '温哥华厨房、浴室和地板翻新工程 — 客厅完工'
    WHEN 'fa67f7e2-82e0-4101-baf7-7e585f8410cf' THEN '温哥华厨房、浴室和地板翻新工程 — 地板完工'
  END
WHERE id IN (
  'b8285cfe-5ab0-4375-9747-8a4449e7d5d7',
  '64caaaa4-729a-4dd8-a92c-7e95319b2131',
  '2eb5b788-4c3e-453c-89e9-7ad768fb4987',
  '079663bb-9203-462c-b24d-436967a68404',
  '9570830f-3966-43fe-b938-75d1e34ee3e9',
  'fa67f7e2-82e0-4101-baf7-7e585f8410cf'
);

-- Richmond Condo Flooring Replacement (5 after images)
UPDATE project_image_pairs
SET
  after_alt_text_en = CASE id
    WHEN '4959025c-7002-4ffc-91d3-7ea1dbd7e2c3' THEN 'Condo Flooring Replacement in Richmond — After 1'
    WHEN '04b0a43c-b793-4adf-92f6-15e912f19a8f' THEN 'Condo Flooring Replacement in Richmond — After 2'
    WHEN 'fe53529a-0e3b-4bc1-8c0f-c51ac3bf9af7' THEN 'Condo Flooring Replacement in Richmond — After 3'
    WHEN 'a7d11f64-e2d9-494e-abcb-21cb718b60b3' THEN 'Condo Flooring Replacement in Richmond — After 4'
    WHEN '921d4939-d5f5-43dd-b905-974830f8aa27' THEN 'Condo Flooring Replacement in Richmond — After 5'
  END,
  after_alt_text_zh = CASE id
    WHEN '4959025c-7002-4ffc-91d3-7ea1dbd7e2c3' THEN '列治文公寓地板更换 — 完工 1'
    WHEN '04b0a43c-b793-4adf-92f6-15e912f19a8f' THEN '列治文公寓地板更换 — 完工 2'
    WHEN 'fe53529a-0e3b-4bc1-8c0f-c51ac3bf9af7' THEN '列治文公寓地板更换 — 完工 3'
    WHEN 'a7d11f64-e2d9-494e-abcb-21cb718b60b3' THEN '列治文公寓地板更换 — 完工 4'
    WHEN '921d4939-d5f5-43dd-b905-974830f8aa27' THEN '列治文公寓地板更换 — 完工 5'
  END
WHERE id IN (
  '4959025c-7002-4ffc-91d3-7ea1dbd7e2c3',
  '04b0a43c-b793-4adf-92f6-15e912f19a8f',
  'fe53529a-0e3b-4bc1-8c0f-c51ac3bf9af7',
  'a7d11f64-e2d9-494e-abcb-21cb718b60b3',
  '921d4939-d5f5-43dd-b905-974830f8aa27'
);

-- Richmond Whole Home Renovation with Marble-Look Kitchen (6 after images)
UPDATE project_image_pairs
SET
  after_alt_text_en = CASE id
    WHEN 'fc69c193-3a26-488b-895c-3b8210508a22' THEN 'Whole Home Renovation with Marble-Look Kitchen in Richmond — Kitchen After 1'
    WHEN '703c2c38-c9b4-412f-8df8-1a6dc6ea81da' THEN 'Whole Home Renovation with Marble-Look Kitchen in Richmond — Kitchen After 2'
    WHEN '2a1cef46-85cb-4d95-aad0-691c07ecd63a' THEN 'Whole Home Renovation with Marble-Look Kitchen in Richmond — Kitchen After 3'
    WHEN 'd027d875-6748-47fb-a182-e837b7ed8505' THEN 'Whole Home Renovation with Marble-Look Kitchen in Richmond — Kitchen After 4'
    WHEN 'cd0f6d68-23d0-4665-ba68-ec04def54917' THEN 'Whole Home Renovation with Marble-Look Kitchen in Richmond — Kitchen After 5'
    WHEN '66a979e8-54e9-482f-aef5-82f03010caf2' THEN 'Whole Home Renovation with Marble-Look Kitchen in Richmond — Kitchen After 6'
  END,
  after_alt_text_zh = CASE id
    WHEN 'fc69c193-3a26-488b-895c-3b8210508a22' THEN '列治文大理石风格厨房全屋翻新 — 厨房完工 1'
    WHEN '703c2c38-c9b4-412f-8df8-1a6dc6ea81da' THEN '列治文大理石风格厨房全屋翻新 — 厨房完工 2'
    WHEN '2a1cef46-85cb-4d95-aad0-691c07ecd63a' THEN '列治文大理石风格厨房全屋翻新 — 厨房完工 3'
    WHEN 'd027d875-6748-47fb-a182-e837b7ed8505' THEN '列治文大理石风格厨房全屋翻新 — 厨房完工 4'
    WHEN 'cd0f6d68-23d0-4665-ba68-ec04def54917' THEN '列治文大理石风格厨房全屋翻新 — 厨房完工 5'
    WHEN '66a979e8-54e9-482f-aef5-82f03010caf2' THEN '列治文大理石风格厨房全屋翻新 — 厨房完工 6'
  END
WHERE id IN (
  'fc69c193-3a26-488b-895c-3b8210508a22',
  '703c2c38-c9b4-412f-8df8-1a6dc6ea81da',
  '2a1cef46-85cb-4d95-aad0-691c07ecd63a',
  'd027d875-6748-47fb-a182-e837b7ed8505',
  'cd0f6d68-23d0-4665-ba68-ec04def54917',
  '66a979e8-54e9-482f-aef5-82f03010caf2'
);

-- Coquitlam Kitchen Renovation with Waterfall Quartz Island (6 after images)
UPDATE project_image_pairs
SET
  after_alt_text_en = CASE id
    WHEN '6d619b10-4b1d-4dd7-b694-b08fb2e5fa9f' THEN 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam — Kitchen After 1'
    WHEN 'e740b728-f490-4ebe-9fbd-c404af0a1396' THEN 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam — Kitchen After 2'
    WHEN '88c0bdf1-fb8d-4c99-bc33-70c8c6f95d57' THEN 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam — Kitchen After 3'
    WHEN 'e1244ff4-b2fa-46ed-a5d1-82852b8f6c71' THEN 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam — Kitchen After 4'
    WHEN '79d2f843-d40d-4235-ae6d-41637d099885' THEN 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam — Kitchen After 5'
    WHEN 'c3184231-3286-4adb-a505-a44211a6e830' THEN 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam — Kitchen After 6'
  END,
  after_alt_text_zh = CASE id
    WHEN '6d619b10-4b1d-4dd7-b694-b08fb2e5fa9f' THEN '高贵林瀑布式石英石台面厨房翻新 — 厨房完工 1'
    WHEN 'e740b728-f490-4ebe-9fbd-c404af0a1396' THEN '高贵林瀑布式石英石台面厨房翻新 — 厨房完工 2'
    WHEN '88c0bdf1-fb8d-4c99-bc33-70c8c6f95d57' THEN '高贵林瀑布式石英石台面厨房翻新 — 厨房完工 3'
    WHEN 'e1244ff4-b2fa-46ed-a5d1-82852b8f6c71' THEN '高贵林瀑布式石英石台面厨房翻新 — 厨房完工 4'
    WHEN '79d2f843-d40d-4235-ae6d-41637d099885' THEN '高贵林瀑布式石英石台面厨房翻新 — 厨房完工 5'
    WHEN 'c3184231-3286-4adb-a505-a44211a6e830' THEN '高贵林瀑布式石英石台面厨房翻新 — 厨房完工 6'
  END
WHERE id IN (
  '6d619b10-4b1d-4dd7-b694-b08fb2e5fa9f',
  'e740b728-f490-4ebe-9fbd-c404af0a1396',
  '88c0bdf1-fb8d-4c99-bc33-70c8c6f95d57',
  'e1244ff4-b2fa-46ed-a5d1-82852b8f6c71',
  '79d2f843-d40d-4235-ae6d-41637d099885',
  'c3184231-3286-4adb-a505-a44211a6e830'
);

-- North Vancouver Bathroom Renovation with Black Herringbone Tile (3 after images)
UPDATE project_image_pairs
SET
  after_alt_text_en = CASE id
    WHEN '59013c4c-0449-4d8f-86bf-4286c66402b8' THEN 'Bathroom Renovation with Black Herringbone Tile in North Vancouver — Bathroom After 1'
    WHEN '11f4b471-0338-490b-aa72-4898c25450fd' THEN 'Bathroom Renovation with Black Herringbone Tile in North Vancouver — Bathroom After 2'
    WHEN '9d7aa325-ca6b-4744-8e63-5e0ade107288' THEN 'Bathroom Renovation with Black Herringbone Tile in North Vancouver — Bathroom After 3'
  END,
  after_alt_text_zh = CASE id
    WHEN '59013c4c-0449-4d8f-86bf-4286c66402b8' THEN '北温哥华黑色人字纹瓷砖浴室翻新 — 浴室完工 1'
    WHEN '11f4b471-0338-490b-aa72-4898c25450fd' THEN '北温哥华黑色人字纹瓷砖浴室翻新 — 浴室完工 2'
    WHEN '9d7aa325-ca6b-4744-8e63-5e0ade107288' THEN '北温哥华黑色人字纹瓷砖浴室翻新 — 浴室完工 3'
  END
WHERE id IN (
  '59013c4c-0449-4d8f-86bf-4286c66402b8',
  '11f4b471-0338-490b-aa72-4898c25450fd',
  '9d7aa325-ca6b-4744-8e63-5e0ade107288'
);

-- Delta Whole House Renovation with Kitchen and Two Bathrooms (6 after images)
UPDATE project_image_pairs
SET
  after_alt_text_en = CASE id
    WHEN '15aef9e3-3521-4a24-8726-81f34abe20a3' THEN 'Whole House Renovation with Kitchen and Two Bathrooms in Delta — Kitchen After 1'
    WHEN '943f3f08-952b-443e-b43f-6574ca96eb39' THEN 'Whole House Renovation with Kitchen and Two Bathrooms in Delta — Kitchen After 2'
    WHEN '63ae9638-32d2-488d-ab6a-cc26c0ea12ac' THEN 'Whole House Renovation with Kitchen and Two Bathrooms in Delta — Bathroom After 1'
    WHEN '411f96a2-b161-4d17-9d5e-f8cbf1a74bee' THEN 'Whole House Renovation with Kitchen and Two Bathrooms in Delta — Bathroom After 2'
    WHEN '91ad8b69-d896-4c1c-8532-abdd67c24880' THEN 'Whole House Renovation with Kitchen and Two Bathrooms in Delta — Kitchen Detail After'
    WHEN '615f510e-b1aa-41be-bf81-2e75cb2817c1' THEN 'Whole House Renovation with Kitchen and Two Bathrooms in Delta — Overall After'
  END,
  after_alt_text_zh = CASE id
    WHEN '15aef9e3-3521-4a24-8726-81f34abe20a3' THEN 'Delta 厨房和两间浴室全屋翻新 — 厨房完工 1'
    WHEN '943f3f08-952b-443e-b43f-6574ca96eb39' THEN 'Delta 厨房和两间浴室全屋翻新 — 厨房完工 2'
    WHEN '63ae9638-32d2-488d-ab6a-cc26c0ea12ac' THEN 'Delta 厨房和两间浴室全屋翻新 — 浴室完工 1'
    WHEN '411f96a2-b161-4d17-9d5e-f8cbf1a74bee' THEN 'Delta 厨房和两间浴室全屋翻新 — 浴室完工 2'
    WHEN '91ad8b69-d896-4c1c-8532-abdd67c24880' THEN 'Delta 厨房和两间浴室全屋翻新 — 厨房细节完工'
    WHEN '615f510e-b1aa-41be-bf81-2e75cb2817c1' THEN 'Delta 厨房和两间浴室全屋翻新 — 全屋完工'
  END
WHERE id IN (
  '15aef9e3-3521-4a24-8726-81f34abe20a3',
  '943f3f08-952b-443e-b43f-6574ca96eb39',
  '63ae9638-32d2-488d-ab6a-cc26c0ea12ac',
  '411f96a2-b161-4d17-9d5e-f8cbf1a74bee',
  '91ad8b69-d896-4c1c-8532-abdd67c24880',
  '615f510e-b1aa-41be-bf81-2e75cb2817c1'
);

-- Richmond House Renovation with Kitchen, Bathrooms and Flooring (6 after images)
UPDATE project_image_pairs
SET
  after_alt_text_en = CASE id
    WHEN '57c2acb2-cd88-4573-8b24-1829e1033ae0' THEN 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond — Kitchen After 1'
    WHEN 'a4ffea51-a939-4272-a816-658079a7b90f' THEN 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond — Kitchen After 2'
    WHEN '2f4a067e-9e0e-4c98-8f6d-e9830139b5df' THEN 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond — Bathroom After 1'
    WHEN 'fb27c850-afab-4b84-8f86-513a1a340c51' THEN 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond — Bathroom After 2'
    WHEN 'd86c126c-ee32-4365-bee2-64fa110b4493' THEN 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond — Kitchen Detail After'
    WHEN '414d7d7a-8f79-49e8-9873-57457e3c79d4' THEN 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond — Flooring After'
  END,
  after_alt_text_zh = CASE id
    WHEN '57c2acb2-cd88-4573-8b24-1829e1033ae0' THEN '列治文厨房、浴室和地板房屋翻新 — 厨房完工 1'
    WHEN 'a4ffea51-a939-4272-a816-658079a7b90f' THEN '列治文厨房、浴室和地板房屋翻新 — 厨房完工 2'
    WHEN '2f4a067e-9e0e-4c98-8f6d-e9830139b5df' THEN '列治文厨房、浴室和地板房屋翻新 — 浴室完工 1'
    WHEN 'fb27c850-afab-4b84-8f86-513a1a340c51' THEN '列治文厨房、浴室和地板房屋翻新 — 浴室完工 2'
    WHEN 'd86c126c-ee32-4365-bee2-64fa110b4493' THEN '列治文厨房、浴室和地板房屋翻新 — 厨房细节完工'
    WHEN '414d7d7a-8f79-49e8-9873-57457e3c79d4' THEN '列治文厨房、浴室和地板房屋翻新 — 地板完工'
  END
WHERE id IN (
  '57c2acb2-cd88-4573-8b24-1829e1033ae0',
  'a4ffea51-a939-4272-a816-658079a7b90f',
  '2f4a067e-9e0e-4c98-8f6d-e9830139b5df',
  'fb27c850-afab-4b84-8f86-513a1a340c51',
  'd86c126c-ee32-4365-bee2-64fa110b4493',
  '414d7d7a-8f79-49e8-9873-57457e3c79d4'
);
