/**
 * Migration: Set seo_keywords_zh for 10 blog posts (batch 3 of content-gap migration).
 * Run: pnpm db:query -f scripts/migrations/2026-08-16-blog-seo-keywords-zh-batch3.sql
 *
 * Prerequisites: run batch 1 (2026-08-16-blog-seo-keywords-zh.sql) and
 * batch 2 (2026-08-16-blog-seo-keywords-zh-batch2.sql) first.
 * Covers IDs 21-30 of the 142 published blog posts missing seo_keywords_zh.
 * NOT APPLIED — needs human to run after PR review.
 */

BEGIN;

-- id 306cbc68 (How to Read a Renovation Quote)
UPDATE blog_posts SET seo_keywords_zh = '如何读懂装修报价单,装修报价详解,装修合同陷阱,温哥华装修报价,装修费用清单,装修预算指南' WHERE id = '306cbc68-c651-474f-a7c2-cc6953af61fb' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 31883d84 (Restaurant Renovation Vancouver 2026)
UPDATE blog_posts SET seo_keywords_zh = '温哥华餐厅装修,餐厅许可证温哥华,温哥华餐饮装修费用,餐厅卫生局规定,温哥华商业装修,餐厅装修成本' WHERE id = '31883d84-51a2-461b-9110-2fe38015d49f' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 31db6b9c (Kitchen Renovation Vancouver BC 2026)
UPDATE blog_posts SET seo_keywords_zh = '温哥华厨房翻新,温哥华厨房装修费用,2026年厨房翻新,厨房许可证温哥华,厨房翻新预算,温哥华厨房改造' WHERE id = '31db6b9c-4cc1-490f-ae3b-728e69fb86bc' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 32736ae2 (Maple Ridge Home Renovation 2026)
UPDATE blog_posts SET seo_keywords_zh = '枫树岭翻新,Maple Ridge装修,枫树岭房屋翻新,枫树岭许可证,枫树岭装修费用,菲沙河谷装修' WHERE id = '32736ae2-862a-4956-ad16-cfe8d311c8e5' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 33a7cf48 (Metro Vancouver Renovation Cost Index April 2026)
UPDATE blog_posts SET seo_keywords_zh = '大温哥华装修成本,温哥华装修价格指数,2026年温哥华装修费用,温哥华翻新成本,装修报价比较,大温地区装修预算' WHERE id = '33a7cf48-24af-49b9-b88a-70fb795bbabf' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 34e43ef8 (Pre-Sale Renovation White Rock BC 2026)
UPDATE blog_posts SET seo_keywords_zh = '怀特罗克预售翻新,White Rock装修,海滨房产翻新,预售装修ROI,White Rock房屋翻新,南素里装修' WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 3544e852 (Condo Kitchen Renovation Vancouver Space Saving)
UPDATE blog_posts SET seo_keywords_zh = '温哥华公寓厨房装修,公寓厨房翻新,温哥华小厨房装修,厨房节省空间设计,公寓装修预算,温哥华高层装修' WHERE id = '3544e852-c895-419f-882e-20ff9449adf3' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 357fe638 (Cabinet Refinishing Delta BC 2026)
UPDATE blog_posts SET seo_keywords_zh = '三角洲橱柜翻新,Delta橱柜翻新,橱柜喷漆vs贴面,三角洲厨房装修,橱柜翻新费用,Delta BC装修' WHERE id = '357fe638-43ac-4e15-b6de-a7c403b1df03' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 35a4dc47 (Metro Vancouver Renovation Cost Index March 2025)
UPDATE blog_posts SET seo_keywords_zh = '大温哥华装修成本,温哥华装修价格指数,2025年温哥华装修费用,温哥华翻新成本,装修报价比较,大温地区装修预算' WHERE id = '35a4dc47-2ed6-45ce-99b3-79fca3dd82e5' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

-- id 385552dc (Metro Vancouver Renovation Cost Index January 2025)
UPDATE blog_posts SET seo_keywords_zh = '大温哥华装修成本,温哥华装修价格指数,2025年温哥华装修费用,温哥华翻新成本,装修报价比较,大温地区装修预算' WHERE id = '385552dc-8fa3-4098-ab99-1da81a582ced' AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

COMMIT;
