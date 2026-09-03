/**
 * Migration: Set seo_keywords_zh for 10 blog posts — batch 6 (IDs 51-60).
 * Run: pnpm db:query -f scripts/migrations/2026-08-17-blog-seo-keywords-zh-batch6.sql
 *
 * NOT APPLIED — needs human to run after PR merges.
 */

-- White Rock Home Renovation Guide 2026 (ID: 5bb4fbd4)
UPDATE blog_posts SET seo_keywords_zh = '白石镇,翻新,装修,费用,许可证,社区指南,全屋翻新,预售翻新,大温哥华' WHERE id = '5bb4fbd4-b293-4726-83a6-4bac05598775' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Cabinet Refinishing West Vancouver Cost Guide (ID: 60cffa7b)
UPDATE blog_posts SET seo_keywords_zh = '西温哥华,橱柜翻新,费用,喷漆,贴面,高端方案,橱柜更换,温哥华' WHERE id = '60cffa7b-95ae-4daf-8256-285960dc5fc8' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Cabinet Refinishing Richmond Cost Guide (ID: 60fddcec)
UPDATE blog_posts SET seo_keywords_zh = '列治文,橱柜翻新,费用,喷漆,贴面,橱柜更换,橱柜翻新指南' WHERE id = '60fddcec-7135-4612-9399-688a68821cf1' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Metro Vancouver Renovation Cost Index February 2024 (ID: 65648229)
UPDATE blog_posts SET seo_keywords_zh = '大温哥华,装修成本,指数,2024年2月,装修费用,成本报告,装修报价' WHERE id = '65648229-008b-46ed-b934-2392f6f2852d' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Pre-Sale Renovation Maple Ridge BC 2026 (ID: 6567c57b)
UPDATE blog_posts SET seo_keywords_zh = '枫树岭,预售翻新,装修,出售前,增值,投资回报率,房屋转售' WHERE id = '6567c57b-8813-4894-b5b7-b69a51295d1a' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Kitchen Renovation Maple Ridge BC 2026 (ID: 66dbb605)
UPDATE blog_posts SET seo_keywords_zh = '枫树岭,厨房翻新,费用,社区,许可证,高贵林,枫树岭厨房装修' WHERE id = '66dbb605-dee3-42f0-99bb-20960a7185fd' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Pre-Sale Renovation Delta BC 2026 (ID: 66e06686)
UPDATE blog_posts SET seo_keywords_zh = '三角洲,预售翻新,装修,出售前,增值,Ladner,Tsawwassen,North Delta' WHERE id = '66e06686-e4ff-4987-a62c-918ac0dea481' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Renovation Financing Vancouver HELOC (ID: 6b56391b)
UPDATE blog_posts SET seo_keywords_zh = '温哥华,装修融资,房贷净值,信贷额度,BC省补贴,房屋净值贷款,HELOC' WHERE id = '6b56391b-a7b9-45b9-b13c-f5d49aced950' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Pre-Sale Renovation Langley BC 2026 (ID: 6db67571)
UPDATE blog_posts SET seo_keywords_zh = '兰利,预售翻新,装修,出售前,增值,投资回报率,菲沙河谷' WHERE id = '6db67571-7d0e-455c-a88b-4601ed53a6e1' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- Bathroom Renovation Maple Ridge BC 2026 (ID: 6fb2a087)
UPDATE blog_posts SET seo_keywords_zh = '枫树岭,浴室翻新,费用,历史建筑,社区,许可证,浴室装修' WHERE id = '6fb2a087-098f-4561-afd3-5906ba36e5e7' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
