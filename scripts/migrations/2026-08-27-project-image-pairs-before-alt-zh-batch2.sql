-- Migration: project_image_pairs beforeAltTextZh batch 2 — new projects after 2026-08-23
-- Rows: 150 published project_image_pairs missing before_alt_text_zh (38 projects)
-- NOT APPLIED — requires human execution after PR merge
-- Logic: '改造前 ' + title_zh (title_zh may include photo suffix like '— 照片 4')
-- Rows with NULL title_zh (8 rows, projects with no zh translation) left as TODO for human translator:
--   coquitlam-condo-kitchen-renovation (1 row: a56fab00)
--   coquitlam-kitchen-renovation-quartz-island (6 rows: c3184231, e1244ff4, 88c0bdf1, e740b728, 6d619b10, 79d2f843)
--   delta-kitchen-renovation-apron-sink-quartz (1 row: 15aef9e3)
-- Pattern: UPDATE project_image_pairs SET before_alt_text_zh = '...' WHERE id = '...' AND before_alt_text_zh IS NULL;

BEGIN;

-- Rows with NULL title_zh — needs human translator:
-- UPDATE project_image_pairs SET before_alt_text_zh = '[TRANSLATION NEEDED]' WHERE id = 'a56fab00-9b26-421d-a7c3-c2c8a71044f5' AND before_alt_text_zh IS NULL;
-- UPDATE project_image_pairs SET before_alt_text_zh = '[TRANSLATION NEEDED]' WHERE id = 'c3184231-3286-4adb-a505-a44211a6e830' AND before_alt_text_zh IS NULL;
-- UPDATE project_image_pairs SET before_alt_text_zh = '[TRANSLATION NEEDED]' WHERE id = 'e1244ff4-b2fa-46ed-a5d1-82852b8f6c71' AND before_alt_text_zh IS NULL;
-- UPDATE project_image_pairs SET before_alt_text_zh = '[TRANSLATION NEEDED]' WHERE id = '88c0bdf1-fb8d-4c99-bc33-70c8c6f95d57' AND before_alt_text_zh IS NULL;
-- UPDATE project_image_pairs SET before_alt_text_zh = '[TRANSLATION NEEDED]' WHERE id = 'e740b728-f490-4ebe-9fbd-c404af0a1396' AND before_alt_text_zh IS NULL;
-- UPDATE project_image_pairs SET before_alt_text_zh = '[TRANSLATION NEEDED]' WHERE id = '6d619b10-4b1d-4dd7-b694-b08fb2e5fa9f' AND before_alt_text_zh IS NULL;
-- UPDATE project_image_pairs SET before_alt_text_zh = '[TRANSLATION NEEDED]' WHERE id = '79d2f843-d40d-4235-ae6d-41637d099885' AND before_alt_text_zh IS NULL;
-- UPDATE project_image_pairs SET before_alt_text_zh = '[TRANSLATION NEEDED]' WHERE id = '15aef9e3-3521-4a24-8726-81f34abe20a3' AND before_alt_text_zh IS NULL;

-- Rows with title_zh populated:
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 列治文低成本公寓翻新 — 照片 5' WHERE id = '60d1487f-d256-493e-9fa5-7eb8d7147449' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 列治文低成本公寓翻新 — 照片 9' WHERE id = 'ae05fc34-7c61-4ba7-b2ba-ba19ecf825b7' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 列治文低成本公寓翻新 — 照片 8' WHERE id = 'af891bb0-8dad-401d-a3e3-dd54e0efe7c8' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 列治文低成本公寓翻新 — 照片 6' WHERE id = '8fbec064-59db-4d7a-ac19-31cd36b156b7' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 列治文低成本公寓翻新 — 照片 10' WHERE id = 'd289b9da-58bc-4c8b-a1fa-a54259e3b3c5' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 列治文低成本公寓翻新 — 照片 7' WHERE id = '043a5990-a3be-48d5-a430-252595770930' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 温哥华本拿比卫生间翻新 — 定制特色 — 照片 4' WHERE id = '9d03b2e5-0044-4a42-9e32-14f8db8278b5' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 温哥华本拿比卫生间翻新 — 定制特色 — 照片 2' WHERE id = '91f6a224-771c-4913-9458-69e53035855b' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 温哥华本拿比卫生间翻新 — 定制特色 — 照片 3' WHERE id = '0cccfeaa-c331-4f27-ad93-b884c5fa5a9f' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 商业仓库门翻新 — 照片 1' WHERE id = 'dc430730-d441-4610-84e2-8bdb68d38e72' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 商业仓库门翻新 — 照片 2' WHERE id = '30f6a9cd-4c46-4d81-aa58-7542523d3b8d' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 商业仓库门翻新 — 照片 5' WHERE id = 'dee146a9-260c-4c97-8f0d-f9d58306ceee' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 商业仓库门翻新 — 照片 4' WHERE id = '8be9ceac-59b2-416f-b024-ec08bcd830af' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 商业仓库门翻新 — 照片 3' WHERE id = '2ea04405-51e8-4e63-92f4-c5d9c4d31f3f' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 商业仓库门翻新 — 照片 6' WHERE id = '27984aaf-72b2-4763-b8c7-d41be0f7a74c' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 定制厨房翻新 — 木纹和白色定制柜撞色设计 — 照片 4' WHERE id = '6b8e2018-9b25-4fd8-8488-087ddff5c71a' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 定制厨房翻新 — 木纹和白色定制柜撞色设计 — 照片 3' WHERE id = 'da5aa467-4ae8-44e7-89e3-58fa030f8deb' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 定制厨房翻新 — 木纹和白色定制柜撞色设计 — 照片 5' WHERE id = 'c2ca3b99-d3b3-41f5-9059-8db29d60bf01' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 定制厨房翻新 — 定制橱柜 — 照片 5' WHERE id = 'deb62913-d242-4659-84f5-6854c656619f' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 定制厨房翻新 — 定制橱柜 — 照片 4' WHERE id = 'c7f0c86d-cd1b-454f-a74f-974223540404' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 女儿卫生间翻新 — 灰色瓷砖 — 照片 4' WHERE id = '6fd6dfc2-e41e-44c9-b060-d765bd1c9651' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 前台接待区' WHERE id = 'f475714e-fa8e-4125-896d-580f0fac3859' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 诊室' WHERE id = 'e76f3370-a056-4850-8b6d-fafa71d8b002' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 医生办公室' WHERE id = 'bd5751c3-8a15-41d4-84d5-c59f431e1dd9' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 茶水间全景' WHERE id = '262b20fa-1673-44a6-92c9-6ec7b06d1e03' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 行政办公区' WHERE id = 'b4e16007-50e5-47a0-94ca-7bfb99d296d8' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 诊疗室橱柜' WHERE id = 'daa98126-8cab-42fd-9c60-72c14e1525c6' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 厨房翻新 — 照片 4' WHERE id = '280a2f50-3fb9-41c7-ab10-00327df48998' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 厨房翻新 — 照片 3' WHERE id = 'a9d6653a-219c-43ed-8974-4f51d4a25e26' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 厨房翻新 — 照片 5' WHERE id = '624ce942-ff70-45e3-93fa-87d5cc5a5690' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 厨房翻新 — 照片 6' WHERE id = '4a3137f1-b6c6-49a6-b09f-8966e6bf1c9c' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 厨房翻新 — 照片 7' WHERE id = '5904ed07-6a71-4838-83c4-308ff127b1e5' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 时尚厨房翻新 — 白色橱柜与金色把手 — 照片 6' WHERE id = '01628097-425e-455f-b2f1-361b2074f441' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 时尚厨房翻新 — 白色橱柜与金色把手 — 照片 8' WHERE id = 'ad0d5023-ebc8-4cb8-b63a-d95a0b875548' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 时尚厨房翻新 — 白色橱柜与金色把手 — 照片 7' WHERE id = '1a448beb-d3ea-4bf2-b235-39a57ffff378' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 时尚厨房翻新 — 白色橱柜与金色把手 — 照片 4' WHERE id = '9d7214b0-fda6-43ad-9534-3352b09008e9' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 厨房翻新 — 瀑布岛台设计 — 照片 6' WHERE id = 'e373dc0d-4512-41af-8595-74f9a2a12ebf' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 厨房翻新 — 瀑布岛台设计 — 照片 5' WHERE id = '65f21c0f-de71-4b97-9384-589babbeb639' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 厨房翻新 — 瀑布岛台设计 — 照片 4' WHERE id = '4fbab49e-8c3e-4e42-9174-3eae92144dff' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 豪华卫生间翻新 — 定制特色 — 照片 7' WHERE id = '1a2b0349-c244-4b59-b7cf-c77ace2eead6' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 豪华卫生间翻新 — 定制特色 — 照片 8' WHERE id = 'b41d1955-348f-4cbd-8dc9-c6b4802a876b' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 豪华卫生间翻新 — 定制特色 — 照片 9' WHERE id = '51195d80-9519-4a22-80f5-a556187a28b6' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 北温哥华无门槛淋浴卫生间翻新 — 照片 9' WHERE id = '9180cee7-e0e3-41cc-8f91-2d624d7191ca' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 北温哥华无门槛淋浴卫生间翻新 — 照片 10' WHERE id = '7298abce-3854-436a-be46-fa051b846227' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 北温哥华无门槛淋浴卫生间翻新 — 照片 8' WHERE id = '319f473b-7db3-4367-86b0-ecc04fe9d219' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 北温哥华无门槛淋浴卫生间翻新 — 照片 7' WHERE id = 'd4761a85-7fa2-4eac-81c9-e4a8cd1cd8de' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 北温哥华无门槛淋浴卫生间翻新 — 照片 6' WHERE id = '260ced37-d170-4d13-b5ad-28ff7d1449a6' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 北温哥华无门槛淋浴卫生间翻新 — 照片 11' WHERE id = '3a9a1034-fcf4-42c1-9aac-463c87049cd3' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 现代风格厨房翻新 — 白色Shaker橱柜 — 照片 7' WHERE id = '50e6b9d6-adea-4f7b-81f5-4c61924b0526' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 现代风格厨房翻新 — 白色Shaker橱柜 — 照片 6' WHERE id = '0443ad16-cb06-474a-ac45-00bbd0c4bd8b' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 现代风格厨房翻新 — 白色Shaker橱柜 — 照片 4' WHERE id = 'c58947b5-234f-4503-bea8-ca246a9e9b5b' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 现代风格厨房翻新 — 白色Shaker橱柜 — 照片 5' WHERE id = 'a4c102f3-61ab-44c5-8346-73b6b1056402' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 现代厨房翻新 — 定制柜子 — 照片 6' WHERE id = '2e1f609c-d809-4e2d-8c84-06f0f3dd0b52' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 现代厨房翻新 — 定制柜子 — 照片 4' WHERE id = 'f16b3233-5fcb-4cfe-8ad0-cc6073e8902d' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 现代厨房翻新 — 定制柜子 — 照片 5' WHERE id = 'fcd6422e-ff03-49d2-a00b-0b10a47dbc31' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 两个半卫生间翻新 — 独特的Powder Room — 照片 5' WHERE id = '8ae07580-9724-4481-94bf-db1c2ceec344' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 本拿比Metrotown玩具店翻新 — 照片 1' WHERE id = 'db3479cd-4b5b-4758-af95-eca0ce0d49e8' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 本拿比Metrotown玩具店翻新 — 照片 3' WHERE id = '05870cd5-23d4-4841-8a05-e44cf4e8c6ff' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 本拿比Metrotown玩具店翻新 — 照片 5' WHERE id = '47b9b4f2-e311-419c-bc1c-6f7b028905ed' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 本拿比Metrotown玩具店翻新 — 照片 4' WHERE id = 'c488e65e-a434-4031-8e61-518be1743073' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 本拿比Metrotown玩具店翻新 — 照片 6' WHERE id = '7d3eb212-b3c5-4662-a467-b6beaa498b97' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 本拿比Metrotown玩具店翻新 — 照片 2' WHERE id = '11fb5bca-d4e3-4b58-8f31-ae299d983f20' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 本拿比两个卫生间翻新 — 照片 5' WHERE id = '6b94df3a-4795-4e03-8d3a-df8a97e1406f' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 本拿比两个卫生间翻新 — 照片 6' WHERE id = '9d684111-066d-4e5d-be33-a11b692f5865' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 本拿比两个卫生间翻新 — 照片 4' WHERE id = '37ca610f-eed9-4810-a128-01b01855da8f' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 本拿比双浴室定制翻新 — 照片 6' WHERE id = 'd672a50e-d3a7-43cb-8520-7a9064c67fdd' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 本拿比双浴室定制翻新 — 照片 8' WHERE id = '595f74b9-96ff-4ea9-97f6-c170687f7b64' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 本拿比双浴室定制翻新 — 照片 7' WHERE id = '5f2e41d0-7c37-41e2-99ff-63e758f4bef5' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 现代风格的两个卫生间翻新 — 照片 6' WHERE id = 'ef32215a-1d41-4482-befa-f24bf8d160e7' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 两个卫生间全面翻新 — 现代风格 — 照片 5' WHERE id = 'a209098d-2652-4ca3-87d3-5b559f82b079' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 一改二卫生间翻新 — 定制木纹柜 — 照片 10' WHERE id = '1aa17cdd-481d-4cc2-a8b5-7ed6edfdceb7' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 一改二卫生间翻新 — 定制木纹柜 — 照片 2' WHERE id = '4ea6eae8-4a85-4ca8-bf3c-e32f1508bd7d' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 一改二卫生间翻新 — 定制木纹柜 — 照片 3' WHERE id = 'f52f9925-80b0-4a66-8043-e85475ef46ab' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 一改二卫生间翻新 — 定制木纹柜 — 照片 4' WHERE id = '4b3b4225-d02e-47d8-b9b2-cc9c0f112dab' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 一改二卫生间翻新 — 定制木纹柜 — 照片 5' WHERE id = '707ec9da-e32f-4f7f-b035-553a19715d48' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 一改二卫生间翻新 — 定制木纹柜 — 照片 6' WHERE id = 'e65995a9-f3fc-4ab2-b094-828aba1de792' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 一改二卫生间翻新 — 定制木纹柜 — 照片 7' WHERE id = '37dc99d9-9445-4817-91f0-97033af8da63' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 一改二卫生间翻新 — 定制木纹柜 — 照片 8' WHERE id = '30d8c770-ce1d-4750-b30f-297dfb807bee' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 一改二卫生间翻新 — 定制木纹柜 — 照片 9' WHERE id = '161918b8-4bb4-4472-89f1-80195274c655' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 温哥华全屋定制翻新 — 照片 3' WHERE id = 'a9bbcf90-d1cb-4d7a-8cd3-776668784623' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 温哥华全屋定制翻新 — 照片 5' WHERE id = '4fa30b78-a92e-41fa-8799-b967f155c24c' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 温哥华全屋定制翻新 — 照片 7' WHERE id = '5cff9d8e-87cb-481c-a873-e24e23ed3640' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 温哥华全屋定制翻新 — 照片 6' WHERE id = 'fbff8746-2caf-4ad6-92c2-09b680f3857a' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 温哥华全屋定制翻新 — 照片 4' WHERE id = '10be56a7-49d8-4511-8d00-b4ee8da6e27a' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 温哥华美容院室商业翻新 — 照片 8' WHERE id = 'f584ee99-553c-42d9-8316-6835da354a30' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 温哥华美容院室商业翻新 — 照片 5' WHERE id = '4e8d194e-d07e-409a-aa62-2a7b9bbc1416' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 温哥华美容院室商业翻新 — 照片 9' WHERE id = '591e8bb1-ca5c-41dc-98d7-305cde4c8d26' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 温哥华美容院室商业翻新 — 照片 10' WHERE id = '05e42107-088a-457a-a5aa-db325d678bd7' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 全屋翻新 — 卫生间更新 — 照片 4' WHERE id = '491d2f11-127f-4e9d-a3d1-b831daef4842' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 全屋翻新 — 卫生间更新 — 照片 2' WHERE id = '6dbc0d43-1a78-4827-a4af-1ff564c4c7c8' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 全屋翻新 — 卫生间更新 — 照片 1' WHERE id = '369a850f-6942-4c6b-9e9c-0c8e392739b0' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 全屋翻新 — 卫生间更新 — 照片 5' WHERE id = 'c4825ab7-4fbe-409c-82a3-881d286de4bd' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 全屋翻新 — 卫生间更新 — 照片 3' WHERE id = 'eb20e5a6-5541-4567-9634-706fe0c4ff70' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 全屋翻新 — 卫生间更新 — 照片 6' WHERE id = '645dbb52-1c04-4e2e-b147-d811afaf4f0b' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 Reno Stars 温哥华西区 — vanity-1' WHERE id = '16c45fa7-8bb7-4ea2-99f5-bbe1b1e24092' AND before_alt_text_zh IS NULL;
UPDATE project_image_pairs SET before_alt_text_zh = '改造前 Reno Stars 温哥华西区 — vanity-2' WHERE id = '9e6b9b49-0ac3-4bbe-baa6-bea86452be29' AND before_alt_text_zh IS NULL;

COMMIT;
