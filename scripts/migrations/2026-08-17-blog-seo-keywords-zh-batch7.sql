/**
 * Migration: Set seo_keywords_zh for 10 blog posts — batch 7 (IDs 61-70).
 * Run: pnpm db:query -f scripts/migrations/2026-08-17-blog-seo-keywords-zh-batch7.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-17-blog-seo-keywords-zh-batch7.sql
 */

-- Batch 7: Richmond cabinet refinishing, Metro Van cost index Feb 2024,
-- Maple Ridge pre-sale, Maple Ridge kitchen, Delta pre-sale,
-- Vancouver HELOC financing, outdoor test pages (2), Langley pre-sale, Maple Ridge bathroom

UPDATE blog_posts SET seo_keywords_zh =
  '列治文橱柜翻新,列治文橱柜喷漆,列治文橱柜贴面,橱柜翻新费用,温哥华橱柜改造,Richmond cabinet refinishing,cabinet painting Richmond,cabinet veneer'
WHERE id = '60fddcec-7135-4612-9399-688a68821cf1'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '大温装修成本指数,温哥华装修价格,大温地区装修费用,2024温哥华装修成本,装修预算指南,Metro Vancouver renovation cost index,Vancouver renovation price,cost index 2024'
WHERE id = '65648229-008b-46ed-b934-2392f6f2852d'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '枫树岭预售翻新,Maple Ridge售前装修,预售房屋翻新,枫树岭房产增值,卖房前翻新,枫树岭房地产,pre-sale renovation Maple Ridge,pre-sale renovation BC'
WHERE id = '6567c57b-8813-4894-b5b7-b69a51295d1a'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '枫树岭厨房翻新,Maple Ridge厨房装修,枫树岭厨房费用,厨房翻新许可证,枫树岭厨房预算,Maple Ridge kitchen renovation,kitchen renovation cost Maple Ridge'
WHERE id = '66dbb605-dee3-42f0-99bb-20960a7185fd'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '三角洲预售翻新,Delta售前装修,三角洲房产增值,卖房前翻新,Delta pre-sale renovation,pre-sale home improvement Delta BC'
WHERE id = '66e06686-e4ff-4987-a62c-918ac0dea481'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '温哥华装修融资,HELOC装修贷款,BC省装修补贴,房屋净值信贷,温哥华房贷,renovation financing Vancouver,HELOC Vancouver,BC renovation grant'
WHERE id = '6b56391b-a7b9-45b9-b13c-f5d49aced950'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '温哥华户外空间装修,露台翻新,甲板装修,后院改造,温哥华户外许可,温哥华庭院,outdoor renovation Vancouver,deck renovation Vancouver,backyard renovation permit'
WHERE id = '6b86f73f-a05d-40a3-a456-5c7d73bf87bb'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '温哥华户外空间装修,露台翻新,甲板装修,后院改造,温哥华户外许可,温哥华庭院,outdoor renovation Vancouver,deck renovation Vancouver,backyard renovation permit'
WHERE id = '6cdfba34-5fe1-4cc2-8292-b4c2ed0007e8'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '兰利售前翻新,Langley预售翻新,兰利房产增值,卖房前翻新,兰利装修,Langley pre-sale renovation,pre-sale renovation Langley BC'
WHERE id = '6db67571-7d0e-455c-a88b-4601ed53a6e1'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);

UPDATE blog_posts SET seo_keywords_zh =
  '枫树岭浴室翻新,Maple Ridge浴室装修,枫树岭浴室费用,浴室翻新许可证,枫树岭浴室预算,Maple Ridge bathroom renovation,bathroom renovation cost Maple Ridge'
WHERE id = '6fb2a087-098f-4561-afd3-5906ba36e5e7'
  AND (seo_keywords_zh IS NULL OR char_length(seo_keywords_zh) = 0);
