-- 2026-09-15: populate seo_keywords_zh for published blog posts missing them
-- NOT applied — requires human to run before merge confirmation
UPDATE blog_posts
SET
  seo_keywords_zh = CASE id
    WHEN 'e50092a6-59f9-45a1-8ad3-4db06f6048ba' THEN
      '联排别墅翻新大温,温哥华联排别墅装修,共管物业装修规定,素里联排翻新,本拿比联排装修,高贵林联排别墅,列治文联排翻新,白石联排别墅翻新,温哥华装修许可,共管物业装修许可,BC建筑许可,ADU后巷屋,独立住宅装修,联排别墅装修费用,温哥华装修报价'
    WHEN '5d0c7200-3e8f-474a-9d80-d5fcf90a6f8b' THEN
      '温哥华ADU费用,ADU建造成本温哥华,后巷屋费用温哥华,ADU许可温哥华,温哥华ADU多少钱,ADU装修预算,附属住宅费用温哥华,后巷屋建筑成本,ADU贷款温哥华,温哥华ADU申请,后巷屋装修费用,ADU成本细分,温哥华ADU报价,独立住宅加建,温哥华装修费用'
    ELSE seo_keywords_zh
  END
WHERE id IN (
  'e50092a6-59f9-45a1-8ad3-4db06f6048ba',
  '5d0c7200-3e8f-474a-9d80-d5fcf90a6f8b'
)
AND seo_keywords_zh IS NULL
AND is_published = true;
