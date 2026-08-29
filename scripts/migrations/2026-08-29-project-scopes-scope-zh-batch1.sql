-- Migration: 2026-08-29-project-scopes-scope-zh-batch1.sql
-- Table:  project_scopes
-- Issue:  17 scope_en terms with placeholder scope_zh (2-4 chars).
--         149 total rows across projects are affected.
-- NOT APPLIED — needs human to run after PR merge.
-- Run: psql < scripts/migrations/2026-08-29-project-scopes-scope-zh-batch1.sql
--
-- Verify current state (returns 0 when migration is applied):
--   SELECT COUNT(*) FROM project_scopes WHERE scope_zh IS NULL OR LENGTH(scope_zh) < 5;
--
-- All IDs in this file are REAL database IDs fetched this run.
-- Prior migrations covered 298 IDs; these 149 were not yet addressed.

UPDATE project_scopes SET scope_zh = '台面更换' WHERE id IN (
  'dfc050c5-92ed-435d-bc26-068c83a522d7',
  'fce4c910-fc25-4b9c-8791-e3831d79d785',
  '6584103a-02dd-4451-9820-cfd0bab4980b',
  'f6cdcc21-8718-4ab1-99e6-d55e66b36b7b',
  'c6b2181a-3874-4583-8c88-a9a97c6e20df',
  'babccd29-18f0-4658-a6e6-92fa730eb208',
  '79d2bb62-8ac0-41d4-87e5-e1233205a321',
  '242feeb5-c583-4bfa-8a5d-7eec459dc4b1',
  '49ee1341-02b1-4fb4-b2e1-75a5cecba121',
  '5c3ece09-0980-4c02-a826-8bc4f29af887'
) AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '定制柜体' WHERE id IN (
  'ed0dea8b-2b7a-4e15-85b7-7ef21232b256',
  'd5745af0-7869-48e4-aba4-cbea3206d98a',
  '24fda372-e3f1-424a-9a48-81e2d06b148a'
) AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '拆除工程' WHERE id IN (
  '34dabe49-c025-4591-8ddd-676e0868f9f2',
  '8f023171-ad8d-409a-b9d0-4efa1d50a6a6',
  'a0614e89-e15c-4a88-84f0-669aec822b46',
  'bfcb73a9-adce-4cb8-a373-de87eb5d92f8',
  'bf0049e3-6a55-44b8-b058-f97b91034b02',
  '0b86173d-bc92-492e-a7bd-ce0687bf50fd',
  '9760cdeb-86ed-4a07-b60d-0fabb21ad60e',
  'f16435ce-770c-440e-adef-6531fed919f7',
  'f8d20aec-dac3-4d25-9d61-f63715599765',
  '872396a3-6e8e-4173-9234-25f65328b571',
  '400f5e95-0ff5-47f8-951b-44d7db7de527',
  '5f4373b7-5034-424c-9dc9-20d84ac845c9',
  '3110ff70-1599-4d03-be12-a216fd7fc016',
  '853a820c-8942-4f31-9415-8cc748d04d8b',
  '7817f12c-8ec9-4889-a989-2d26b1a379c5',
  'a709d9e3-5e26-4c48-9af9-b91b41088caf',
  'ac247e97-78b9-4c99-8152-a98071db963c',
  'f1154464-57b4-4f4a-9919-d2ea2778a902',
  '256ef242-9b1c-4d3b-a1b5-d6b839ca79af'
) AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '墙面修补' WHERE id IN (
  '0ee005c5-ef0c-4007-859d-12ef0edcdff4',
  '9b42612d-8383-4ba7-97ea-537008e2ba20',
  'fe830469-df58-4493-9021-619c9208a62c',
  '6c7844c2-038e-4ae8-a56e-fb1245a1f8f8',
  'f2f0d0c5-d11a-41eb-bb03-145d16e458bb',
  '6d2065cf-d9ac-480b-9d46-5ff15cc93472',
  '8de0e621-6bae-4047-9afe-902a679ca0c1',
  '0c217bf6-b6ac-4a20-b107-6fc3ad56875f',
  '9093c167-b630-4de6-9f49-34a062719d02',
  '1e997fda-2cac-4dfa-8e43-088a1e897672',
  'ff47e94f-01d1-412a-b754-fe1b6bb830f1',
  '9163491c-cd0c-4e9a-a424-5d640d3bd13b',
  'e358801b-3ac3-4873-8485-400e451025fb',
  '32793d47-a83b-44e2-b0f8-74badcd084d7'
) AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '电气工程' WHERE id IN (
  '32c27184-48af-41a8-a068-b06c0c24b00f',
  'fa7c14ac-84db-4650-93de-6518dd75c7bd',
  'fd5746b6-c0b3-482d-9ef4-744245c142c8',
  '54d331ef-0c52-4161-b619-d21253033182',
  '8fc8ec3c-0ccd-4996-9568-aac833db8ad4',
  '3a49a4de-0fb2-42b9-9fb0-d3ea4b78c396',
  '43818b84-b256-4490-b510-b3582bb9294c',
  '220f74ab-3e8b-4415-840e-6738ed7ddd6f',
  'ec1d1df3-2715-411d-a1cd-b7bebefe4c22',
  'fe7e2330-5d13-4dec-bae0-a8bdc743747a',
  '5ac2a0cf-0cf0-44f7-8ea8-14bce9485671'
) AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '电气工程' WHERE id = '0364e866-b6c4-4c2e-8c7d-38209c126348' AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '地板铺设' WHERE id IN (
  'b99ea422-ad00-4e5f-be8d-936e8f793375',
  'ec186271-dde6-46d7-bdaa-3222af72f00e',
  'b81c9fb7-df14-49a0-be17-086c7ec3d104',
  '0a3b81a4-7dbe-4900-b8d7-6d36bad35add',
  '7279cb7b-659d-4a03-a907-51639b019d51',
  '7bab9438-b7ad-420f-b4ab-8e7dc6c3519c',
  '7fda13dc-7333-41c1-b82a-9dbe9747b323',
  '8d9e7e7a-3281-4392-bcb8-c0ceb27fcff7',
  'c8d2addc-8d71-4f20-8efd-954d462fd5f5',
  'd370219c-61f4-4381-b1c4-40c5076f82ba',
  'd6d22485-6fb9-499d-a340-d2c7e15d1ed9',
  'ed72543d-37c9-446b-b4e0-16bc1549921a',
  'feb72cb7-6331-4841-9e80-ab04fd3b00b9',
  '7de6fe94-9592-43c5-b320-01ea4b7f1e40',
  '194942ba-7437-4966-bf7a-bee175861963',
  '60788a85-fa6e-49ec-b2b5-b83878aee88a',
  'dde2a8a6-c22b-4007-98b4-c40299baf9ae',
  'd72a3d7f-f7cf-4322-9a17-65a4e75f2971'
) AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '照明优化' WHERE id IN (
  '7d1091b5-25b2-4b07-a70b-1d3c13f3c896',
  '511f5939-91ed-44b2-b6f1-5c5dae760f3e',
  '0265a937-ad6f-499e-98ee-f20740b20c3d',
  '153271fc-af72-49a8-8238-babd21c65f5c',
  'd3956376-8350-4407-8652-c20f3b7bb968',
  '7756d24b-bf79-4a39-bb62-c71aa1f13ff0',
  '7daeaaf5-d098-4278-8091-dd2c566c4ffc',
  'a9dac7c9-eecf-47a0-a20a-ed2c5b73dbe2',
  'b447199b-5f47-424d-9d90-be84bb5258b5',
  'd91d6214-47f7-4e67-bdf3-e495b48c89ca',
  '95eabd3e-f6d8-47a1-985c-e27d8efa7a24',
  '67717f9c-3e1c-4782-8f48-b2f848209bb1',
  '43f9fd1f-9786-4ddb-86a3-1886a52bfd5f',
  '8ba1a8db-c3e2-4ec2-a6ad-7e49bff64d3f'
) AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '照明' WHERE id IN (
  '639ad012-9bd2-43e1-a982-670e8ac8805a',
  'e522df8c-f56d-4624-85d0-54b9baa1786e',
  'f77db9ae-6982-46f8-9bcf-e32f52742d7d',
  'dedb4327-f481-470f-9ed4-d6a7f7ab50a8',
  '149e7433-b5a1-4b1b-8ad4-5b1dd5f34c25',
  '208703e9-ba7e-4988-b6b9-2ad132cca976',
  '2de8bfee-354a-45ac-8ae4-3476f1da553e',
  '6dfa28fa-b423-47ec-acd7-5ac2e44dc912',
  '06c992d8-02e9-4cab-bbed-01693ed29f04',
  '92e3c714-4eca-402f-83f4-1a388d97214f',
  'e58469bf-7b2c-4fff-8091-b5bf185b3c57',
  'd4d99970-9c6f-4970-a715-2ddabbbf322d'
) AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '油漆工程' WHERE id IN (
  '055b689f-53ae-4e90-bc65-f585a2e65ed1',
  '668a25a8-15fa-48b7-a1c8-85c0eec2e392',
  '7682f312-3179-4361-b908-14bae49bad20',
  '7b0eb0d5-606c-4e09-9bed-4b215148ad9d',
  '994e7367-7764-4208-8b31-ceb190a03043',
  'c8216f1c-0956-43b1-9d85-5c68aaec1eb7',
  'd1fd1ba2-939d-432b-a44e-d70bc1e57870',
  'dba5dda0-0a15-4f32-8611-c3e84b4a36c4',
  'f9760500-a230-41c0-80c0-6e4369e31e15',
  '07092efc-8f09-40f2-bc77-4310182074ca',
  '7acb5492-0071-406d-a4f5-3129fac7d59d',
  '1910e500-47bc-4b11-98b9-15af02b0873b',
  '83d6c96b-c5e3-4499-8005-9c4faeabba76',
  'bed71bf6-776a-491a-98fe-0c2410190ef9',
  'c7d3aa4a-8a19-4214-875c-c61f1a907451',
  'e0837794-63ae-4e9a-a84e-ba44cca44632',
  'bd086a05-fad9-4ef0-a7d4-8cfe5b38184c',
  'babc0cae-173d-4a49-8db7-4b3814269965'
) AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '水管工程' WHERE id IN (
  '26c4d1b6-9860-4330-8206-fe8303184321',
  '269835a9-1b39-47e5-8a5d-665b4ac63b72',
  'ba0c22f3-597f-4948-ab12-e5dd418e805e',
  'd16ac52f-c032-4a35-9c6c-aaed9851fef2',
  'dbb70bbe-993a-4fba-8fbd-c7db0900b33a',
  'edb49cfe-c3b5-4c4a-9a7e-a7a928814823',
  'eb5ca383-9ee9-4c91-875a-a5f84c9a0e0c',
  '5aa7f9b1-4b54-42ef-9222-6d2d70ec0c59',
  '5bcf9232-c0fd-4535-8f43-d0bd3470d3d2',
  'b36349dd-3714-4ca9-964c-8567a0d18a93',
  'c6015ad0-28cb-4f94-87cb-39accb607fef',
  'fb3bc829-42a5-4249-af61-ebf44a0da09a',
  '433c3617-993f-40af-b965-4398ffc8a25e'
) AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '水管工程' WHERE id IN (
  '80617383-a8d8-4822-b7ea-7cb49d9c29a0',
  '7e6040df-113f-42a5-8c76-1271de9c485b',
  '55b11b7f-5d89-40a1-b411-ce8ea2d0ecc2',
  '15bd9131-9e00-46dd-b30c-6e9b9c081a38',
  '231ce72c-2709-4dce-9693-728fea39f74b',
  '26fbcab8-b6db-4fa6-8bd2-8fe4be755662',
  '54bf46d7-34a3-4dbc-8d54-d876ae36cd55',
  'b4295008-7f48-4c43-8458-b1bf5b6b5009',
  'd0a68a6d-105d-465a-8e84-4ad8862aecdf',
  'da0c6344-c872-4cee-804f-f5d72f656029'
) AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '水管工程' WHERE id IN (
  '3d6a125d-c915-434e-8656-38c0020e6096',
  '0ed067c3-bd2c-4e80-a2a7-893072ba43f7'
) AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '预制橱柜' WHERE id = '12cd9431-e6c6-42db-8a44-025386f517b8' AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '瓷砖工程' WHERE id = '98568cf2-9235-44b8-bcf4-52f8df9a4d6f' AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '瓷砖底座' WHERE id = '4a31f7dd-5537-45cc-9ca1-eac144f5425e' AND LENGTH(scope_zh) < 5;

UPDATE project_scopes SET scope_zh = '墙体改动' WHERE id = 'f3b90a3d-a9db-453c-99df-afa605ff7049' AND LENGTH(scope_zh) < 5;
