/**
 * Migration: Set seo_keywords_zh for 11 published project case studies.
 * Run: pnpm db:query -f scripts/migrations/2026-08-16-projects-seo-keywords-zh.sql
 *
 * NOT APPLIED — needs human to run: pnpm db:query -f scripts/migrations/2026-08-16-projects-seo-keywords-zh.sql
 */

-- Powder Room Renovation Richmond
UPDATE projects SET seo_keywords_zh = '列治文,洗手间翻新,客用洗手间,卫生间装修,小浴室' WHERE id = '018eda65-401d-4ec3-84cc-7793597e75c7' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Bathroom Renovation Herringbone North Vancouver
UPDATE projects SET seo_keywords_zh = '北温哥华,浴室装修,人字拼瓷砖,黑色瓷砖,浴室翻新,地板' WHERE id = '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- House Renovation Richmond Kitchen Bathrooms Flooring
UPDATE projects SET seo_keywords_zh = '列治文,全屋装修,厨房翻新,浴室装修,地板更换,室内装修' WHERE id = '331f03b3-624e-4ddf-9b38-c8768d3d1932' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Condo Flooring Replacement Richmond
UPDATE projects SET seo_keywords_zh = '列治文,公寓,地板更换,地板装修,室内装修' WHERE id = '3ef5531b-cfb9-454d-9cd2-90887b3775f0' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Champagne Gold European Luxury Bathroom West Vancouver
UPDATE projects SET seo_keywords_zh = '温哥华西区,豪华浴室,欧式浴室,香槟金,高端装修,浴室翻新' WHERE id = '561278cf-e1cd-453c-8ec7-302075e6cc54' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Whole House Renovation Delta Kitchen Two Bathrooms
UPDATE projects SET seo_keywords_zh = '三角洲,全屋装修,厨房翻新,浴室装修,两间浴室,室内装修' WHERE id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Kitchen Renovation Quartz Island Coquitlam
UPDATE projects SET seo_keywords_zh = '高贵林,厨房装修,石英石中岛,瀑布式中岛,厨房翻新,台面' WHERE id = '838f1ee4-beaa-42e7-bca5-73c810422d76' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Hallway Bathroom Renovation Richmond
UPDATE projects SET seo_keywords_zh = '列治文,走廊浴室,浴室装修,走廊翻新,卫生间' WHERE id = '9063e628-abf9-411a-a7a4-2ddc179c1689' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- House Renovation Vancouver Kitchen Bathrooms New Flooring
UPDATE projects SET seo_keywords_zh = '温哥华,全屋装修,厨房翻新,浴室装修,地板更换,室内装修' WHERE id = '9cbc6ccf-bc07-4c2f-a867-c57ab4218728' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Ensuite Bathroom Renovation Walk-In Shower Richmond
UPDATE projects SET seo_keywords_zh = '列治文,套间浴室,浴室翻新,步入式淋浴,卫生间装修' WHERE id = 'a0690f3a-af1f-4cd1-a2b6-8920908801ea' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Whole Home Renovation Marble-Look Kitchen Richmond
UPDATE projects SET seo_keywords_zh = '列治文,全屋装修,仿大理石厨房,厨房翻新,大理石效果,室内装修' WHERE id = 'c8a66604-00ed-4307-8b28-b95257eaa249' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
