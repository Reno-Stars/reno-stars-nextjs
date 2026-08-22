/**
 * Migration: Set seo_keywords_zh for 11 published projects missing this field.
 * IDs not covered by any prior migration (verified against scripts/migrations/).
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-22-projects-seo-keywords-zh-batch4.sql
 */

-- coquitlam-kitchen-renovation-quartz-island
UPDATE projects
SET seo_keywords_zh = '高贵林厨房装修,石英石台面厨房,高贵林厨房翻新,开放厨房设计,厨房岛台装修'
WHERE id = '838f1ee4-beaa-42e7-bca5-73c810422d76'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- north-vancouver-bathroom-renovation-herringbone-tile
UPDATE projects
SET seo_keywords_zh = '北温浴室装修,鱼骨拼贴浴室,北温哥华卫生间翻新,瓷砖浴室装修,主卧浴室改造'
WHERE id = '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- vancouver-house-renovation-kitchen-and-bathrooms
UPDATE projects
SET seo_keywords_zh = '温哥华房屋装修,厨房浴室翻新,温哥华整体装修,厨厕改造,房屋升级装修'
WHERE id = '9cbc6ccf-bc07-4c2f-a867-c57ab4218728'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- richmond-condo-flooring-renovation
UPDATE projects
SET seo_keywords_zh = '列治文公寓装修,地板翻新,列治文复合地板,公寓地板更换,地板装修'
WHERE id = '3ef5531b-cfb9-454d-9cd2-90887b3775f0'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- richmond-house-renovation-kitchen-bathrooms-flooring
UPDATE projects
SET seo_keywords_zh = '列治文房屋装修,厨房浴室地板,列治文整体翻新,厨厕地板改造'
WHERE id = '331f03b3-624e-4ddf-9b38-c8768d3d1932'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- delta-kitchen-renovation-apron-sink-quartz
UPDATE projects
SET seo_keywords_zh = '三角洲厨房装修,农舍水槽厨房,三角洲厨房翻新,石英石台面,开放厨房设计'
WHERE id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- richmond-whole-home-renovation-marble-kitchen
UPDATE projects
SET seo_keywords_zh = '列治文全屋装修,大理石厨房,列治文高端装修,全屋翻新,大理石台面厨房'
WHERE id = 'c8a66604-00ed-4307-8b28-b95257eaa249'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- hallway-bathroom-renovation-richmond
UPDATE projects
SET seo_keywords_zh = '列治文走廊浴室,走廊卫生间翻新,列治文小浴室装修,客用浴室改造'
WHERE id = '9063e628-abf9-411a-a7a4-2ddc179c1689'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- powder-room-renovation-richmond
UPDATE projects
SET seo_keywords_zh = '列治文化妆间装修,小卫生间翻新,列治文客卫装修,半浴室改造'
WHERE id = '018eda65-401d-4ec3-84cc-7793597e75c7'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- west-vancouver-luxury-bathroom-champagne-gold
UPDATE projects
SET seo_keywords_zh = '西温豪华浴室,香槟金浴室装修,西温哥华高端浴室,浴室翻新,浴缸淋浴改造'
WHERE id = '561278cf-e1cd-453c-8ec7-302075e6cc54'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ensuite-bathroom-renovation-richmond
UPDATE projects
SET seo_keywords_zh = '列治文主卧浴室,主人套房卫生间,列治文浴室翻新,主卫改造'
WHERE id = 'a0690f3a-af1f-4cd1-a2b6-8920908801ea'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
