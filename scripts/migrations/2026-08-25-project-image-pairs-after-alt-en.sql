-- Migration: NOT APPLIED — needs human to run
-- This file populates missing after_alt_text_en and after_alt_text_zh for
-- project_image_pairs rows where a before→after photo sequence exists
-- but the after images lack descriptive alt text.
-- Run manually against the production database.

BEGIN;

-- Project: 9cbc6ccf — Vancouver House Renovation (Kitchen, Bathrooms, Flooring)
UPDATE project_image_pairs SET after_alt_text_en = 'Finished kitchen with white shaker cabinets, quartz countertops, and stainless steel appliances in Vancouver home'
WHERE id = 'b8285cfe-5ab0-4375-9747-8a4449e7d5d7'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '温哥华住宅翻新后的厨房，白色面板橱柜、石英石台面、不锈钢家电'
WHERE id = 'b8285cfe-5ab0-4375-9747-8a4449e7d5d7'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Completed main bathroom renovation with glass shower enclosure, shaker vanity and marble-look tile in Vancouver'
WHERE id = '64caaaa4-729a-4dd8-a92c-7e95319b2131'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '温哥华翻新完工的主浴室，玻璃淋浴间、面板浴室柜、人造石瓷砖'
WHERE id = '64caaaa4-729a-4dd8-a92c-7e95319b2131'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Renovated secondary bathroom with modern vanity, framed mirror and ceramic tile flooring in Vancouver'
WHERE id = '2eb5b788-4c3e-453c-89e9-7ad768fb4987'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '温哥华翻新完工的次要浴室，现代浴室柜、框架镜子、瓷砖地面'
WHERE id = '2eb5b788-4c3e-453c-89e9-7ad768fb4987'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Open-concept living area with new wide-plank flooring and fresh paint after Vancouver whole-home renovation'
WHERE id = '079663bb-9203-462c-b24d-436967a68404'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '温哥华全屋翻新后，开放式客厅安装宽板地板，刷新墙面涂料'
WHERE id = '079663bb-9203-462c-b24d-436967a68404'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Powder room with updated vanity, lighting and tile flooring in renovated Vancouver house'
WHERE id = '9570830f-3966-43fe-b938-75d1e34ee3e9'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '温哥华翻新住宅的化妆间，更新浴室柜、灯具和瓷砖地面'
WHERE id = '9570830f-3966-43fe-b938-75d1e34ee3e9'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Kitchen and dining area with shaker cabinets, quartz island and hardwood-style flooring after renovation in Vancouver'
WHERE id = 'fa67f7e2-82e0-4101-baf7-7e585f8410cf'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '温哥华翻新后的厨房和餐厅区域，面板橱柜、石英石台面、仿木地板'
WHERE id = 'fa67f7e2-82e0-4101-baf7-7e585f8410cf'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

-- Project: 3ef5531b — Richmond Condo Flooring Replacement
UPDATE project_image_pairs SET after_alt_text_en = 'Light oak engineered plank flooring installed in Richmond condo living room, bright and modern finish'
WHERE id = '4959025c-7002-4ffc-91d3-7ea1dbd7e2c3'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '里士满公寓客厅安装浅色橡木工程木地板，简洁明亮'
WHERE id = '4959025c-7002-4ffc-91d3-7ea1dbd7e2c3'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Engineered oak flooring in Richmond condo entryway with clean transition to tile threshold'
WHERE id = '04b0a43c-b793-4adf-92f6-15e912f19a8f'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '里士满公寓入口处工程橡木地板，与瓷砖门槛干净衔接'
WHERE id = '04b0a43c-b793-4adf-92f6-15e912f19a8f'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Light oak plank flooring in renovated Richmond condo hallway, baseboards refitted to new floor height'
WHERE id = 'fe53529a-0e3b-4bc1-8c0f-c51ac3bf9af7'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '里士满翻新公寓走廊的浅色橡木地板，踢脚线已按新地板高度重新安装'
WHERE id = 'fe53529a-0e3b-4bc1-8c0f-c51ac3bf9af7'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Bedroom with new light oak engineered flooring and fresh neutral paint in Richmond condo renovation'
WHERE id = 'a7d11f64-e2d9-494e-abcb-21cb718b60b3'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '里士满翻新公寓卧室，新浅色橡木工程木地板配清新中性色调墙面'
WHERE id = 'a7d11f64-e2d9-494e-abcb-21cb718b60b3'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Open-plan living and dining area with light oak flooring and floor-to-ceiling windows in renovated Richmond condo'
WHERE id = '921d4939-d5f5-43dd-b905-974830f8aa27'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '里士满翻新公寓开放式客餐厅，浅色橡木地板配落地窗'
WHERE id = '921d4939-d5f5-43dd-b905-974830f8aa27'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

-- Project: c8a66604 — Richmond Whole Home Renovation (Marble-Look Kitchen)
UPDATE project_image_pairs SET after_alt_text_en = 'White shaker kitchen cabinets with marble-look quartz waterfall island and countertop in Richmond whole-home renovation'
WHERE id = 'fc69c193-3a26-488b-895c-3b8210508a22'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '里士满全屋翻新，白色面板橱柜配石材纹石英石瀑布台面和台面'
WHERE id = 'fc69c193-3a26-488b-895c-3b8210508a22'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Marble-look tile backsplash behind kitchen range with undermount double sink and brushed brass tapware in Richmond'
WHERE id = '703c2c38-c9b4-412f-8df8-1a6dc6ea81da'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '里士满厨房炉灶区域石材纹瓷砖背板，配台下双槽和拉丝黄铜水龙头'
WHERE id = '703c2c38-c9b4-412f-8df8-1a6dc6ea81da'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Full-height counter run with white quartz countertop and integrated cabinetry in renovated Richmond kitchen'
WHERE id = '2a1cef46-85cb-4d95-aad0-691c07ecd63a'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '里士满翻新厨房，配白色石英石台面的全高台面和一体化橱柜'
WHERE id = '2a1cef46-85cb-4d95-aad0-691c07ecd63a'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Renovated main bathroom with soft grey vanity, black-framed mirror and marble-look tub surround in Richmond'
WHERE id = 'd027d875-6748-47fb-a182-e837b7ed8505'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '里士满翻新主浴室，柔和灰色浴室柜、黑色框架镜子、石材纹浴缸围板'
WHERE id = 'd027d875-6748-47fb-a182-e837b7ed8505'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Oak-toned plank flooring in renovated Richmond home living room, carried through from kitchen to dining area'
WHERE id = 'cd0f6d68-23d0-4665-ba68-ec04def54917'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '里士满翻新住宅客厅的橡木色宽板地板，从厨房延伸至餐厅区域'
WHERE id = 'cd0f6d68-23d0-4665-ba68-ec04def54917'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Complete kitchen renovation with white cabinetry, marble-look quartz counters and brass hardware in Richmond whole-home project'
WHERE id = '66a979e8-54e9-482f-aef5-82f03010caf2'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '里士满全屋翻新整体厨房，白色橱柜配石材纹石英石台面和黄铜五金'
WHERE id = '66a979e8-54e9-482f-aef5-82f03010caf2'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

-- Project: 838f1ee4 — Coquitlam Kitchen Renovation (Quartz Island)
UPDATE project_image_pairs SET after_alt_text_en = 'White kitchen with quartz waterfall island, shaker cabinets and undermount sink in Coquitlam kitchen renovation'
WHERE id = '6d619b10-4b1d-4dd7-b694-b08fb2e5fa9f'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '高贵林厨房翻新，白色橱柜配石英石瀑布台面、面板橱柜和台下水槽'
WHERE id = '6d619b10-4b1d-4dd7-b694-b08fb2e5fa9f'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Kitchen renovation with marble-look quartz island, brushed gold hardware and integrated appliances in Coquitlam home'
WHERE id = 'e740b728-f490-4ebe-9fbd-c404af0a1396'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '高贵林住宅厨房翻新，石材纹石英石台面、刷金五金和嵌入式家电'
WHERE id = 'e740b728-f490-4ebe-9fbd-c404af0a1396'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

UPDATE project_image_pairs SET after_alt_text_en = 'Completed Coquitlam kitchen with waterfall quartz peninsula, soft-close cabinets and pendant lighting over island'
WHERE id = '88c0bdf1-fb8d-4c99-bc33-70c8c6f95d57'
  AND (after_alt_text_en IS NULL OR after_alt_text_en = '');

UPDATE project_image_pairs SET after_alt_text_zh = '高贵林完工厨房，瀑布式石英石半岛台面、静音橱柜、吊灯'
WHERE id = '88c0bdf1-fb8d-4c99-bc33-70c8c6f95d57'
  AND (after_alt_text_zh IS NULL OR after_alt_text_zh = '');

COMMIT;
