-- Migration: 2026-09-15-project-image-pairs-alt-text-null.sql
-- Scope: project_image_pairs.before_alt_text_en IS NULL AND after_alt_text_en IS NULL (38 rows)
-- Status: NOT APPLIED — needs human to run
-- Work: Set before/after alt text for project image pairs that lack both alt fields.
--   Alt text derived from project title + sequential photo number extracted from image URL filename.
--   Example: north-vancouver-bathroom-renovation-herringbone-tile-p01-after → "North Vancouver Bathroom Renovation with Black Herringbone Tile - After 1"

-- North Vancouver Bathroom Renovation — Herringbone Tile (3 images, all null)
UPDATE project_image_pairs
SET
  before_alt_text_en = 'North Vancouver Bathroom Renovation with Black Herringbone Tile - Before',
  before_alt_text_zh = '北温哥华浴室装修：黑色人字拼瓷砖 — 装修前',
  after_alt_text_en  = 'North Vancouver Bathroom Renovation with Black Herringbone Tile - After',
  after_alt_text_zh  = '北温哥华浴室装修：黑色人字拼瓷砖 — 装修后'
WHERE id = '59013c4c-0449-4d8f-86bf-4286c66402b8'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'North Vancouver Bathroom Renovation with Black Herringbone Tile - Before 2',
  before_alt_text_zh = '北温哥华浴室装修：黑色人字拼瓷砖 — 装修前 2',
  after_alt_text_en  = 'North Vancouver Bathroom Renovation with Black Herringbone Tile - After 2',
  after_alt_text_zh  = '北温哥华浴室装修：黑色人字拼瓷砖 — 装修后 2'
WHERE id = '11f4b471-0338-490b-aa72-4898c25450fd'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'North Vancouver Bathroom Renovation with Black Herringbone Tile - Before 3',
  before_alt_text_zh = '北温哥华浴室装修：黑色人字拼瓷砖 — 装修前 3',
  after_alt_text_en  = 'North Vancouver Bathroom Renovation with Black Herringbone Tile - After 3',
  after_alt_text_zh  = '北温哥华浴室装修：黑色人字拼瓷砖 — 装修后 3'
WHERE id = '9d7aa325-ca6b-4744-8e63-5e0ade107288'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

-- Richmond House Renovation — Kitchen, Bathrooms, Flooring (6 images)
UPDATE project_image_pairs
SET
  before_alt_text_en = 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond - Before',
  before_alt_text_zh = '列治文全屋装修：厨房、卫浴与全屋地板 — 装修前',
  after_alt_text_en  = 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond - After',
  after_alt_text_zh  = '列治文全屋装修：厨房、卫浴与全屋地板 — 装修后'
WHERE id = '57c2acb2-cd88-4573-8b24-1829e1033ae0'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond - Before 2',
  before_alt_text_zh = '列治文全屋装修：厨房、卫浴与全屋地板 — 装修前 2',
  after_alt_text_en  = 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond - After 2',
  after_alt_text_zh  = '列治文全屋装修：厨房、卫浴与全屋地板 — 装修后 2'
WHERE id = 'a4ffea51-a939-4272-a816-658079a7b90f'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond - Before 3',
  before_alt_text_zh = '列治文全屋装修：厨房、卫浴与全屋地板 — 装修前 3',
  after_alt_text_en  = 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond - After 3',
  after_alt_text_zh  = '列治文全屋装修：厨房、卫浴与全屋地板 — 装修后 3'
WHERE id = '2f4a067e-9e0e-4c98-8f6d-e9830139b5df'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond - Before 4',
  before_alt_text_zh = '列治文全屋装修：厨房、卫浴与全屋地板 — 装修前 4',
  after_alt_text_en  = 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond - After 4',
  after_alt_text_zh  = '列治文全屋装修：厨房、卫浴与全屋地板 — 装修后 4'
WHERE id = 'fb27c850-afab-4b84-8f86-513a1a340c51'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond - Before 5',
  before_alt_text_zh = '列治文全屋装修：厨房、卫浴与全屋地板 — 装修前 5',
  after_alt_text_en  = 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond - After 5',
  after_alt_text_zh  = '列治文全屋装修：厨房、卫浴与全屋地板 — 装修后 5'
WHERE id = 'd86c126c-ee32-4365-bee2-64fa110b4493'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond - Before 6',
  before_alt_text_zh = '列治文全屋装修：厨房、卫浴与全屋地板 — 装修前 6',
  after_alt_text_en  = 'House Renovation with Kitchen, Bathrooms and Flooring in Richmond - After 6',
  after_alt_text_zh  = '列治文全屋装修：厨房、卫浴与全屋地板 — 装修后 6'
WHERE id = '414d7d7a-8f79-49e8-9873-57457e3c79d4'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

-- Richmond Condo Flooring Renovation (5 images)
UPDATE project_image_pairs
SET
  before_alt_text_en = 'Condo Flooring Replacement in Richmond - Before',
  before_alt_text_zh = '列治文公寓全屋地板更换 — 装修前',
  after_alt_text_en  = 'Condo Flooring Replacement in Richmond - After',
  after_alt_text_zh  = '列治文公寓全屋地板更换 — 装修后'
WHERE id = '4959025c-7002-4ffc-91d3-7ea1dbd7e2c3'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Condo Flooring Replacement in Richmond - Before 2',
  before_alt_text_zh = '列治文公寓全屋地板更换 — 装修前 2',
  after_alt_text_en  = 'Condo Flooring Replacement in Richmond - After 2',
  after_alt_text_zh  = '列治文公寓全屋地板更换 — 装修后 2'
WHERE id = '04b0a43c-b793-4adf-92f6-15e912f19a8f'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Condo Flooring Replacement in Richmond - Before 3',
  before_alt_text_zh = '列治文公寓全屋地板更换 — 装修前 3',
  after_alt_text_en  = 'Condo Flooring Replacement in Richmond - After 3',
  after_alt_text_zh  = '列治文公寓全屋地板更换 — 装修后 3'
WHERE id = 'fe53529a-0e3b-4bc1-8c0f-c51ac3bf9af7'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Condo Flooring Replacement in Richmond - Before 4',
  before_alt_text_zh = '列治文公寓全屋地板更换 — 装修前 4',
  after_alt_text_en  = 'Condo Flooring Replacement in Richmond - After 4',
  after_alt_text_zh  = '列治文公寓全屋地板更换 — 装修后 4'
WHERE id = 'a7d11f64-e2d9-494e-abcb-21cb718b60b3'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Condo Flooring Replacement in Richmond - Before 5',
  before_alt_text_zh = '列治文公寓全屋地板更换 — 装修前 5',
  after_alt_text_en  = 'Condo Flooring Replacement in Richmond - After 5',
  after_alt_text_zh  = '列治文公寓全屋地板更换 — 装修后 5'
WHERE id = '921d4939-d5f5-43dd-b905-974830f8aa27'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

-- Delta Whole House Renovation — Kitchen and Two Bathrooms (6 images)
UPDATE project_image_pairs
SET
  before_alt_text_en = 'Whole House Renovation with Kitchen and Two Bathrooms in Delta - Before',
  before_alt_text_zh = '三角洲全屋装修：厨房与两间浴室 — 装修前',
  after_alt_text_en  = 'Whole House Renovation with Kitchen and Two Bathrooms in Delta - After',
  after_alt_text_zh  = '三角洲全屋装修：厨房与两间浴室 — 装修后'
WHERE id = '15aef9e3-3521-4a24-8726-81f34abe20a3'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Whole House Renovation with Kitchen and Two Bathrooms in Delta - Before 2',
  before_alt_text_zh = '三角洲全屋装修：厨房与两间浴室 — 装修前 2',
  after_alt_text_en  = 'Whole House Renovation with Kitchen and Two Bathrooms in Delta - After 2',
  after_alt_text_zh  = '三角洲全屋装修：厨房与两间浴室 — 装修后 2'
WHERE id = '943f3f08-952b-443e-b43f-6574ca96eb39'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Whole House Renovation with Kitchen and Two Bathrooms in Delta - Before 3',
  before_alt_text_zh = '三角洲全屋装修：厨房与两间浴室 — 装修前 3',
  after_alt_text_en  = 'Whole House Renovation with Kitchen and Two Bathrooms in Delta - After 3',
  after_alt_text_zh  = '三角洲全屋装修：厨房与两间浴室 — 装修后 3'
WHERE id = '63ae9638-32d2-488d-ab6a-cc26c0ea12ac'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Whole House Renovation with Kitchen and Two Bathrooms in Delta - Before 4',
  before_alt_text_zh = '三角洲全屋装修：厨房与两间浴室 — 装修前 4',
  after_alt_text_en  = 'Whole House Renovation with Kitchen and Two Bathrooms in Delta - After 4',
  after_alt_text_zh  = '三角洲全屋装修：厨房与两间浴室 — 装修后 4'
WHERE id = '411f96a2-b161-4d17-9d5e-f8cbf1a74bee'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Whole House Renovation with Kitchen and Two Bathrooms in Delta - Before 5',
  before_alt_text_zh = '三角洲全屋装修：厨房与两间浴室 — 装修前 5',
  after_alt_text_en  = 'Whole House Renovation with Kitchen and Two Bathrooms in Delta - After 5',
  after_alt_text_zh  = '三角洲全屋装修：厨房与两间浴室 — 装修后 5'
WHERE id = '91ad8b69-d896-4c1c-8532-abdd67c24880'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Whole House Renovation with Kitchen and Two Bathrooms in Delta - Before 6',
  before_alt_text_zh = '三角洲全屋装修：厨房与两间浴室 — 装修前 6',
  after_alt_text_en  = 'Whole House Renovation with Kitchen and Two Bathrooms in Delta - After 6',
  after_alt_text_zh  = '三角洲全屋装修：厨房与两间浴室 — 装修后 6'
WHERE id = '615f510e-b1aa-41be-bf81-2e75cb2817c1'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

-- Coquitlam Kitchen Renovation — Quartz Island (6 images)
UPDATE project_image_pairs
SET
  before_alt_text_en = 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam - Before',
  before_alt_text_zh = '高贵林厨房装修：瀑布式石英石中岛 — 装修前',
  after_alt_text_en  = 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam - After',
  after_alt_text_zh  = '高贵林厨房装修：瀑布式石英石中岛 — 装修后'
WHERE id = '6d619b10-4b1d-4dd7-b694-b08fb2e5fa9f'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam - Before 2',
  before_alt_text_zh = '高贵林厨房装修：瀑布式石英石中岛 — 装修前 2',
  after_alt_text_en  = 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam - After 2',
  after_alt_text_zh  = '高贵林厨房装修：瀑布式石英石中岛 — 装修后 2'
WHERE id = 'e740b728-f490-4ebe-9fbd-c404af0a1396'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam - Before 3',
  before_alt_text_zh = '高贵林厨房装修：瀑布式石英石中岛 — 装修前 3',
  after_alt_text_en  = 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam - After 3',
  after_alt_text_zh  = '高贵林厨房装修：瀑布式石英石中岛 — 装修后 3'
WHERE id = '88c0bdf1-fb8d-4c99-bc33-70c8c6f95d57'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam - Before 4',
  before_alt_text_zh = '高贵林厨房装修：瀑布式石英石中岛 — 装修前 4',
  after_alt_text_en  = 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam - After 4',
  after_alt_text_zh  = '高贵林厨房装修：瀑布式石英石中岛 — 装修后 4'
WHERE id = 'e1244ff4-b2fa-46ed-a5d1-82852b8f6c71'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam - Before 5',
  before_alt_text_zh = '高贵林厨房装修：瀑布式石英石中岛 — 装修前 5',
  after_alt_text_en  = 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam - After 5',
  after_alt_text_zh  = '高贵林厨房装修：瀑布式石英石中岛 — 装修后 5'
WHERE id = '79d2f843-d40d-4235-ae6d-41637d099885'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam - Before 6',
  before_alt_text_zh = '高贵林厨房装修：瀑布式石英石中岛 — 装修前 6',
  after_alt_text_en  = 'Kitchen Renovation with Waterfall Quartz Island in Coquitlam - After 6',
  after_alt_text_zh  = '高贵林厨房装修：瀑布式石英石中岛 — 装修后 6'
WHERE id = 'c3184231-3286-4adb-a505-a44211a6e830'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

-- Vancouver House Renovation — Kitchen, Bathrooms, Flooring (6 images)
UPDATE project_image_pairs
SET
  before_alt_text_en = 'House Renovation with Kitchen, Bathrooms and New Flooring in Vancouver - Before',
  before_alt_text_zh = '温哥华全屋装修：厨房、卫浴与全屋地板 — 装修前',
  after_alt_text_en  = 'House Renovation with Kitchen, Bathrooms and New Flooring in Vancouver - After',
  after_alt_text_zh  = '温哥华全屋装修：厨房、卫浴与全屋地板 — 装修后'
WHERE id = 'b8285cfe-5ab0-4375-9747-8a4449e7d5d7'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'House Renovation with Kitchen, Bathrooms and New Flooring in Vancouver - Before 2',
  before_alt_text_zh = '温哥华全屋装修：厨房、卫浴与全屋地板 — 装修前 2',
  after_alt_text_en  = 'House Renovation with Kitchen, Bathrooms and New Flooring in Vancouver - After 2',
  after_alt_text_zh  = '温哥华全屋装修：厨房、卫浴与全屋地板 — 装修后 2'
WHERE id = '64caaaa4-729a-4dd8-a92c-7e95319b2131'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'House Renovation with Kitchen, Bathrooms and New Flooring in Vancouver - Before 3',
  before_alt_text_zh = '温哥华全屋装修：厨房、卫浴与全屋地板 — 装修前 3',
  after_alt_text_en  = 'House Renovation with Kitchen, Bathrooms and New Flooring in Vancouver - After 3',
  after_alt_text_zh  = '温哥华全屋装修：厨房、卫浴与全屋地板 — 装修后 3'
WHERE id = '2eb5b788-4c3e-453c-89e9-7ad768fb4987'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'House Renovation with Kitchen, Bathrooms and New Flooring in Vancouver - Before 4',
  before_alt_text_zh = '温哥华全屋装修：厨房、卫浴与全屋地板 — 装修前 4',
  after_alt_text_en  = 'House Renovation with Kitchen, Bathrooms and New Flooring in Vancouver - After 4',
  after_alt_text_zh  = '温哥华全屋装修：厨房、卫浴与全屋地板 — 装修后 4'
WHERE id = '079663bb-9203-462c-b24d-436967a68404'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'House Renovation with Kitchen, Bathrooms and New Flooring in Vancouver - Before 5',
  before_alt_text_zh = '温哥华全屋装修：厨房、卫浴与全屋地板 — 装修前 5',
  after_alt_text_en  = 'House Renovation with Kitchen, Bathrooms and New Flooring in Vancouver - After 5',
  after_alt_text_zh  = '温哥华全屋装修：厨房、卫浴与全屋地板 — 装修后 5'
WHERE id = '9570830f-3966-43fe-b938-75d1e34ee3e9'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'House Renovation with Kitchen, Bathrooms and New Flooring in Vancouver - Before 6',
  before_alt_text_zh = '温哥华全屋装修：厨房、卫浴与全屋地板 — 装修前 6',
  after_alt_text_en  = 'House Renovation with Kitchen, Bathrooms and New Flooring in Vancouver - After 6',
  after_alt_text_zh  = '温哥华全屋装修：厨房、卫浴与全屋地板 — 装修后 6'
WHERE id = 'fa67f7e2-82e0-4101-baf7-7e585f8410cf'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

-- Richmond Whole Home Renovation — Marble-Look Kitchen (6 images)
UPDATE project_image_pairs
SET
  before_alt_text_en = 'Whole Home Renovation with Marble-Look Kitchen in Richmond - Before',
  before_alt_text_zh = '列治文全屋装修：仿大理石厨房 — 装修前',
  after_alt_text_en  = 'Whole Home Renovation with Marble-Look Kitchen in Richmond - After',
  after_alt_text_zh  = '列治文全屋装修：仿大理石厨房 — 装修后'
WHERE id = 'fc69c193-3a26-488b-895c-3b8210508a22'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Whole Home Renovation with Marble-Look Kitchen in Richmond - Before 2',
  before_alt_text_zh = '列治文全屋装修：仿大理石厨房 — 装修前 2',
  after_alt_text_en  = 'Whole Home Renovation with Marble-Look Kitchen in Richmond - After 2',
  after_alt_text_zh  = '列治文全屋装修：仿大理石厨房 — 装修后 2'
WHERE id = '703c2c38-c9b4-412f-8df8-1a6dc6ea81da'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Whole Home Renovation with Marble-Look Kitchen in Richmond - Before 3',
  before_alt_text_zh = '列治文全屋装修：仿大理石厨房 — 装修前 3',
  after_alt_text_en  = 'Whole Home Renovation with Marble-Look Kitchen in Richmond - After 3',
  after_alt_text_zh  = '列治文全屋装修：仿大理石厨房 — 装修后 3'
WHERE id = '2a1cef46-85cb-4d95-aad0-691c07ecd63a'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Whole Home Renovation with Marble-Look Kitchen in Richmond - Before 4',
  before_alt_text_zh = '列治文全屋装修：仿大理石厨房 — 装修前 4',
  after_alt_text_en  = 'Whole Home Renovation with Marble-Look Kitchen in Richmond - After 4',
  after_alt_text_zh  = '列治文全屋装修：仿大理石厨房 — 装修后 4'
WHERE id = 'd027d875-6748-47fb-a182-e837b7ed8505'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Whole Home Renovation with Marble-Look Kitchen in Richmond - Before 5',
  before_alt_text_zh = '列治文全屋装修：仿大理石厨房 — 装修前 5',
  after_alt_text_en  = 'Whole Home Renovation with Marble-Look Kitchen in Richmond - After 5',
  after_alt_text_zh  = '列治文全屋装修：仿大理石厨房 — 装修后 5'
WHERE id = 'cd0f6d68-23d0-4665-ba68-ec04def54917'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;

UPDATE project_image_pairs
SET
  before_alt_text_en = 'Whole Home Renovation with Marble-Look Kitchen in Richmond - Before 6',
  before_alt_text_zh = '列治文全屋装修：仿大理石厨房 — 装修前 6',
  after_alt_text_en  = 'Whole Home Renovation with Marble-Look Kitchen in Richmond - After 6',
  after_alt_text_zh  = '列治文全屋装修：仿大理石厨房 — 装修后 6'
WHERE id = '66a979e8-54e9-482f-aef5-82f03010caf2'
  AND before_alt_text_en IS NULL AND after_alt_text_en IS NULL;
