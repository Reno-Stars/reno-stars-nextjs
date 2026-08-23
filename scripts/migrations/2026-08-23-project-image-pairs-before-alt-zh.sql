-- Migration: project_image_pairs.before_alt_text_zh
-- Status: NOT APPLIED — needs human to run
-- Coverage: 150 rows where before_alt_text_zh IS NULL (no prior migration covers these ids)
-- Logic: "改造前" + project title_zh (same pattern as after_alt_text_zh which uses "改造后")
-- Source: project_image_pairs JOIN projects ON project_id

BEGIN;

UPDATE project_image_pairs
SET before_alt_text_zh = '温哥华预算友好型卫生间翻新 — 改造前'
WHERE id = '1d2f9425-5659-49dc-809c-716c43edc570'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '列治文低成本公寓翻新 — 改造前'
WHERE id = '40eb125c-4600-4ca6-a842-aa90e2708e49'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '温哥华本拿比卫生间翻新 — 定制特色 改造前'
WHERE id = 'ad3d59e1-9000-4b36-8f89-7a6f0fef7aca'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '商业仓库门翻新 — 改造前'
WHERE id = '3cba3895-b4c5-412f-8a96-35047192bdda'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '高贵林公寓卫生间翻新 — 改造前'
WHERE id = 'f32478df-b05d-4932-b82a-6f1c5e4e0da5'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '高贵林公寓厨房翻新 — 石英石台面 改造前'
WHERE id = 'df893f9f-54de-4f99-92df-df934196d5be'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '高贵林厨房装修：瀑布式石英石中岛 改造前'
WHERE id = '838f1ee4-beaa-42e7-bca5-73c810422d76'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '标准卫生间翻新 — 淋浴改造 改造前'
WHERE id = '59e00107-21be-45d5-886f-cd4de905694f'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '定制厨房翻新 — 木纹和白色定制柜撞色设计 改造前'
WHERE id = '02b37032-37bc-4562-8553-f9da01aa397d'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '定制厨房翻新 — 定制橱柜 改造前'
WHERE id = 'd043cb40-21ff-4b9b-aac3-e00339d0916f'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '女儿卫生间翻新 — 灰色瓷砖 改造前'
WHERE id = '7b2e5611-c53b-4fd7-9e29-73845dbef728'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '三角洲全屋装修：厨房与两间浴室 改造前'
WHERE id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '本拿比牙医诊所翻新 — 改造前'
WHERE id = '70047904-0a5b-4cfa-8b3e-e2afe4a04114'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '列治文带步入式淋浴间的套间浴室翻新 — 改造前'
WHERE id = 'a0690f3a-af1f-4cd1-a2b6-8920908801ea'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '列治文走廊浴室装修 — 改造前'
WHERE id = '9063e628-abf9-411a-a7a4-2ddc179c1689'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '高贵林经济型厨房翻新 — 改造前'
WHERE id = 'bdabe61c-1551-443b-9db5-e7d6c5d9bb82'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '厨房翻新 — 定制橱柜与石英石台面 改造前'
WHERE id = '4da79280-b84c-446c-8914-782e7e1fc1ef'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '厨房翻新 — 改造前'
WHERE id = 'e7ef381e-cd29-4868-91d8-f5b5efcb4cbc'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '时尚厨房翻新 — 白色橱柜与金色把手 改造前'
WHERE id = 'f6569579-4798-41a2-836e-322fc1c5c337'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '厨房翻新 — 瀑布岛台设计 改造前'
WHERE id = 'd1899877-1cc3-4043-9544-dfe0f7fdaba6'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '豪华卫生间翻新 — 定制特色 改造前'
WHERE id = '701ce355-942c-4df0-acab-593e05983d81'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '北温哥华无门槛淋浴卫生间翻新 — 改造前'
WHERE id = 'acebea3c-62fb-462e-a400-e9a24f911563'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '卫生间翻新 — 定制玻璃门 改造前'
WHERE id = '181c865f-23d5-4254-aa2d-a4eaf857201a'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '主卫生间翻新 — 定制特色 改造前'
WHERE id = '550493d9-5185-474c-af64-9ee819310746'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '简约温暖风格卫生间翻新 — 改造前'
WHERE id = '394bba39-b5ba-4a17-b408-bdb54643064a'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '简约时尚厨房翻新 — 木纹下柜与石英台面 改造前'
WHERE id = '183b5fb7-0fce-4f50-b3d3-3dc690eca445'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '简约温暖风格厨房翻新 — 改造前'
WHERE id = '03589549-6b2d-4720-b0ce-f234fc962d74'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '现代风格厨房翻新 — 白色Shaker橱柜 改造前'
WHERE id = '62476da2-c73a-4c00-a0c5-caef22c1b88f'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '现代厨房翻新配石英台面 — 改造前'
WHERE id = 'a83452cd-415b-457c-9ab0-5b533920ca5c'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '列治文现代厨房翻新 — 改造前'
WHERE id = '5f5770ac-b5e3-4089-bef7-d78d0fcac1be'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '现代厨房翻新 — 定制柜子 改造前'
WHERE id = '65163509-80c6-4572-bbba-831fdf31db9f'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '北温哥华浴室装修：黑色人字拼瓷砖 改造前'
WHERE id = '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '列治文客用洗手间翻新 — 改造前'
WHERE id = '018eda65-401d-4ec3-84cc-7793597e75c7'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '列治文老客户回购：白色shaker厨房翻新 — 石英台面 + 柜下灯带 改造前'
WHERE id = '25febb78-bca5-4b0a-bdfb-d08df7bfbbab'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '卫生间翻新 — 白色shaker style洗手柜 改造前'
WHERE id = '1a66b299-02d4-429b-a767-25aa7a39575f'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '列治文公寓全屋地板更换 — 改造前'
WHERE id = '3ef5531b-cfb9-454d-9cd2-90887b3775f0'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '两个半卫生间翻新 — 独特的Powder Room 改造前'
WHERE id = 'd9af4d6e-e73e-4d89-87dc-b5fdafab7b3a'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '列治文全屋装修：厨房、卫浴与全屋地板 改造前'
WHERE id = '331f03b3-624e-4ddf-9b38-c8768d3d1932'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '华丽厨房翻新 — 白色Shaker风格橱柜 改造前'
WHERE id = '3239a7b3-2c80-481f-a6f1-dfa6187b97e6'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '列治文全屋装修：仿大理石厨房 改造前'
WHERE id = 'c8a66604-00ed-4307-8b28-b95257eaa249'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '三角洲三间卫生间翻新 — 改造前'
WHERE id = '0f8df3ba-5f59-4abd-89c6-5567810e7d5e'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '家庭联排别墅厨房翻新 — 改造前'
WHERE id = '8a01e9c4-e89e-4784-b818-e5d68bd06bbd'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '本拿比Metrotown玩具店翻新 — 改造前'
WHERE id = '1ea53266-6319-4b03-b109-d7e72aa2d8d9'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '本拿比两个卫生间翻新 — 改造前'
WHERE id = 'c0afba82-fded-4375-8466-fc8feb22f991'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '本拿比双浴室定制翻新 — 改造前'
WHERE id = 'fe05b33d-9548-443a-adc7-35744b2fe6c8'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '家庭的两个卫生间翻新 — 改造前'
WHERE id = '66177cfa-9cbb-4ac4-94b9-515c66786a05'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '现代风格的两个卫生间翻新 — 改造前'
WHERE id = '906ab373-f8c0-4262-863f-25117f7b5efe'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '两个卫生间全面翻新 — 现代风格 改造前'
WHERE id = '2f7a992f-5372-4f03-9328-456fff969a97'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '列治文双浴室定制翻新 — 改造前'
WHERE id = '4ced0347-337e-4f7e-aedc-8ec256406770'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '一改二卫生间翻新 — 定制木纹柜 改造前'
WHERE id = '7a695f0f-55fe-46e9-a710-f9a8a5cc7bb9'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '温哥华全屋定制翻新 — 改造前'
WHERE id = '33a29a45-e781-41a3-9391-66eca2929f70'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '温哥华全屋装修：厨房、卫浴与全屋地板 改造前'
WHERE id = '9cbc6ccf-bc07-4c2f-a867-c57ab4218728'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '温哥华美容院室商业翻新 — 改造前'
WHERE id = '00efc301-c95b-4a9f-946b-2539a9a87d03'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '居家办公室改造 — 黑框玻璃隔断 + 双开门 改造前'
WHERE id = '47b532fc-74a5-4048-a038-d983091032ab'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '温哥华白色shaker风格厨房翻新 — 改造前'
WHERE id = 'be83574d-60b4-4ad9-805d-098c8a5cccfd'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '浴室装修 — 改造前'
WHERE id = '95830870-fb6b-4632-a19c-4729002bd91e'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '全屋翻新 — 卫生间更新 改造前'
WHERE id = '3a8a197d-01fd-4187-8ee6-9164a974c900'
  AND before_alt_text_zh IS NULL;

UPDATE project_image_pairs
SET before_alt_text_zh = '香槟金欧式豪华浴室 — 温哥华西区 改造前'
WHERE id = '561278cf-e1cd-453c-8ec7-302075e6cc54'
  AND before_alt_text_zh IS NULL;

COMMIT;
