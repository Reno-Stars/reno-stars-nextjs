-- 2026-09-06: populate null excerpt_zh + meta_description_zh for blog posts
-- that already have content_zh and title_zh translated.
-- NOT APPLIED: needs human to run before the next deploy.
-- Covers rows not yet in any pending migration (checked against scripts/migrations/).

UPDATE blog_posts
SET
  excerpt_zh     = CASE id
    WHEN '27dd8051-1198-4c2f-97f2-b058b9ba7247'
      THEN '了解温哥华首次装修的完整步骤——含2026年成本、BC省许可规则及Reno Stars客户流程指南，助您避免延误和超支。'
    WHEN '625cdf1c-8733-470c-9198-f56de2a152c6'
      THEN '比较温哥华独立屋、公寓、联排别墅装修差异——含2026年各类型装修规则、成本及Reno Stars施工案例。'
    ELSE excerpt_zh
  END,
  meta_description_zh = CASE id
    WHEN '27dd8051-1198-4c2f-97f2-b058b9ba7247'
      THEN '了解温哥华首次装修的完整步骤——含2026年成本、BC省许可规则及Reno Stars客户流程指南，助您避免延误和超支。'
    WHEN '625cdf1c-8733-470c-9198-f56de2a152c6'
      THEN '比较温哥华独立屋、公寓、联排别墅装修差异——含2026年各类型装修规则、成本及Reno Stars施工案例。'
    ELSE meta_description_zh
  END
WHERE id IN ('27dd8051-1198-4c2f-97f2-b058b9ba7247', '625cdf1c-8733-470c-9198-f56de2a152c6')
  AND excerpt_zh IS NULL
  AND meta_description_zh IS NULL;
