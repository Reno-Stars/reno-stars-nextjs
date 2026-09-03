/**
 * Migration: Set seo_keywords_zh for 10 blog posts — batch 5 (IDs 41-50).
 * Run: pnpm db:query -f scripts/migrations/2026-08-17-blog-seo-keywords-zh-batch5.sql
 *
 * NOT APPLIED — needs human to run: pnpm db:query -f scripts/migrations/2026-08-17-blog-seo-keywords-zh-batch5.sql
 */

-- Burnaby Home Renovation Guide 2026 (ID: 44ce6c72)
UPDATE blog_posts SET seo_keywords_zh = '本拿比,翻新,装修,费用,许可证,社区指南,Metrotown,Brentwood,全屋翻新,厨房翻新,浴室翻新,地下室装修,次级套间' WHERE id = '44ce6c72-bdff-4b15-956f-091b4a483aaf' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Rental Property Renovation Vancouver ROI (ID: 49f7448a)
UPDATE blog_posts SET seo_keywords_zh = '温哥华,出租房,装修,ROI,房东,投资回报率,租金翻新,投资分析,套房改装' WHERE id = '49f7448a-81ed-4b27-af26-025dad644c78' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Metro Vancouver Renovation Cost Index December 2024 (ID: 4d5b9ab2)
UPDATE blog_posts SET seo_keywords_zh = '大温哥华,装修成本,指数,2024年12月,装修费用,成本报告,装修报价' WHERE id = '4d5b9ab2-8445-46bb-861e-d7f92b2f0873' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Basement Renovations Port Coquitlam 2026 (ID: 523693d1)
UPDATE blog_posts SET seo_keywords_zh = '高贵林港,地下室装修,成本,许可证,附属套间,高贵林港装修,二级套房,装修费用' WHERE id = '523693d1-ba3d-4cbd-9ec8-a4e94ad96130' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Basement Renovations Port Moody (ID: 54d301dc)
UPDATE blog_posts SET seo_keywords_zh = '穆迪港,地下室装修,费用,许可,设计,房产投资,装修费用' WHERE id = '54d301dc-194a-4e97-a016-250e64de0df4' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Metro Vancouver Renovation Cost Index November 2023 (ID: 55dbdb54)
UPDATE blog_posts SET seo_keywords_zh = '大温哥华,装修成本,指数,2023年11月,装修费用,成本报告' WHERE id = '55dbdb54-e9d7-405f-84f9-5e4a95d7a7bd' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Kitchen Renovation Coquitlam BC 2026 (ID: 5739c350)
UPDATE blog_posts SET seo_keywords_zh = '高贵林,厨房翻新,费用,社区,业主委员会,Poly-B管道,高贵林厨房装修,2026' WHERE id = '5739c350-1f08-4498-a291-ade61c998951' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Metro Vancouver Renovation Cost Index January 2024 (ID: 57676bbc)
UPDATE blog_posts SET seo_keywords_zh = '大温哥华,装修成本,指数,2024年1月,装修费用,成本报告' WHERE id = '57676bbc-c454-41b3-89dd-d919eb611be7' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Cabinet Refinishing New Westminster Cost Guide (ID: 59b7b33e)
UPDATE blog_posts SET seo_keywords_zh = '新威斯敏斯特,橱柜翻新,费用,历史建筑,公寓,橱柜喷漆,橱柜更换' WHERE id = '59b7b33e-0804-4134-9a80-9e7f8fc06d87' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Basement Renovation Delta BC (ID: 5afedf59)
UPDATE blog_posts SET seo_keywords_zh = '三角洲,地下室装修,费用,许可,社区,Ladner,Tsawwassen,North Delta,套房' WHERE id = '5afedf59-f2bf-4845-bfeb-a249290c5cd0' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
