/**
 * Migration: Set seo_keywords_zh for 10 blog posts (batch 2 of content-gap migration).
 * Run: pnpm db:query -f scripts/migrations/2026-08-16-blog-seo-keywords-zh-batch2.sql
 *
 * Prerequisite: run 2026-08-16-blog-seo-keywords-zh.sql first (batch 1, IDs 1-10).
 * This file covers IDs 11-20 of the 142 published blog posts missing seo_keywords_zh.
 * NOT APPLIED — needs human to run after PR review.
 */

BEGIN;

-- id 160e8ed1 (Basement Renovations Burnaby 2026)
UPDATE blog_posts SET seo_keywords_zh = '本拿比地下室翻新,地下室装修费用,本拿比ADU,本拿比套房合法化,本拿比装修许可证,本拿比地下室出租,温哥华地下室翻新' WHERE id = '160e8ed1-c62b-414a-8d70-c7f401c07c53' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 1837b084 (Renovate vs Move Vancouver 2026)
UPDATE blog_posts SET seo_keywords_zh = '温哥华装修vs搬家,温哥华2026房市,卖房还是装修,温哥华房产翻修,房屋升级vs换房,温哥华房地产市场' WHERE id = '1837b084-cb01-4c31-a511-a54204f43ad5' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 18aaeeb9 (Metro Vancouver Renovation Cost Index March 2024)
UPDATE blog_posts SET seo_keywords_zh = '大温哥华装修成本,温哥华装修价格指数,2024年温哥华装修费用,温哥华翻新成本,装修报价比较,大温地区装修预算' WHERE id = '18aaeeb9-d7c3-4959-9346-78da6ff19223' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 1a8fe47a (Metro Vancouver Renovation Cost Index December 2023)
UPDATE blog_posts SET seo_keywords_zh = '大温哥华装修成本,温哥华装修价格指数,2023年温哥华装修费用,温哥华翻新成本,装修报价比较,大温地区装修预算' WHERE id = '1a8fe47a-279c-4220-8578-fba56d2197ce' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 1caa85a5 (Surrey Renovation Permits Guide 2026)
UPDATE blog_posts SET seo_keywords_zh = '素里装修许可证,素里市许可证申请,Surrey建筑许可证,素里装修规定,2026素里翻新指南,素里房屋装修' WHERE id = '1caa85a5-3449-469c-b1fc-9c9054ec8efe' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 1d426773 (Metro Vancouver Renovation Cost Index June 2026)
UPDATE blog_posts SET seo_keywords_zh = '大温哥华装修成本,温哥华装修价格指数,2026年温哥华装修费用,温哥华翻新成本,装修报价比较,大温地区装修预算' WHERE id = '1d426773-ac86-4a1c-b57b-ebc45aceda0c' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 1ec55196 (Metro Vancouver Renovation Cost Index July 2025)
UPDATE blog_posts SET seo_keywords_zh = '大温哥华装修成本,温哥华装修价格指数,2025年温哥华装修费用,温哥华翻新成本,装修报价比较,大温地区装修预算' WHERE id = '1ec55196-518e-41d9-8457-95d3044a1286' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 2081f870 (Basement Renovations Langley)
UPDATE blog_posts SET seo_keywords_zh = '兰利地下室装修,Langley BC地下室翻新,兰利市套房装修,兰利装修费用,兰利建筑许可证,bc省地下室出租' WHERE id = '2081f870-05a1-44c9-b668-7266df2beb8a' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 27c9242e (West Vancouver Home Renovation 2026)
UPDATE blog_posts SET seo_keywords_zh = '西温哥华翻新,West Vancouver装修,西温房屋翻新,西温哥华许可证,西温装修费用,北温哥华装修' WHERE id = '27c9242e-44c6-4744-9122-59f830904950' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 2c6568be (Kitchen Backsplash Cost Vancouver 2026)
UPDATE blog_posts SET seo_keywords_zh = '温哥华厨房防溅板,厨房装修费用,温哥华浴室翻新,厨房台面装修,温哥华装修报价,厨房翻新预算' WHERE id = '2c6568be-21d7-4b07-a395-ace1965fb28e' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

COMMIT;
