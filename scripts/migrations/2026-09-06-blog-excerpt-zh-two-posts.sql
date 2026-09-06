-- Migration: 2026-09-06
-- Fix: blog_posts.excerpt_zh IS NULL for two published posts
-- Status: NOT APPLIED — needs human to run
-- Why: author omitted Chinese excerpt during EN→ZH translation pass

UPDATE blog_posts
SET excerpt_zh = CASE id
  WHEN '27dd8051-1198-4c2f-97f2-b058b9ba7247'
    THEN '温哥华首次装修者大多低估工期、跳过许可证检查，并在收到第一份合同后就签约。本指南涵盖每个步骤。'
  WHEN '625cdf1c-8733-470c-9198-f56de2a152c6'
    THEN '独立屋、公寓、联排别墅装修各有不同的规则、成本和限制。本指南拆解温哥华不同房产类型装修的实际差异。'
END
WHERE id IN ('27dd8051-1198-4c2f-97f2-b058b9ba7247', '625cdf1c-8733-470c-9198-f56de2a152c6')
  AND excerpt_zh IS NULL;
