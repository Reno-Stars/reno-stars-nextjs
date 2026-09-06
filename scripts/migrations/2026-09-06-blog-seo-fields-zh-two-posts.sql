-- Migration: populate NULL focus_keyword_zh, meta_title_zh, meta_description_zh for two published blog posts
-- NOT APPLIED — needs human run
-- Post 1: how-to-renovate-house-vancouver-first-timer-guide
UPDATE blog_posts SET
  focus_keyword_zh = '温哥华房屋装修,首次装修指南,装修步骤,BC省装修许可,温哥华装修流程',
  meta_title_zh   = '温哥华房屋装修完整步骤指南：首次装修必读的流程与清单',
  meta_description_zh = '温哥华首次装修完整步骤：许可→承包商→合同→施工→验收。含2026年BC省规则与Reno Stars实际流程。'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND is_published = true
  AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

-- Post 2: vancouver-property-type-renovation-2026
UPDATE blog_posts SET
  focus_keyword_zh = '温哥华独立屋装修,温哥华公寓装修,温哥华联排别墅装修,共管公寓装修,联排别墅装修',
  meta_title_zh   = '温哥华独立屋、公寓、联排别墅装修有何不同（2026）',
  meta_description_zh = '独立屋、共管公寓、联排别墅装修有何不同：治理结构、许可、成本、施工时间。含2026年温哥华市政规则对比。'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND is_published = true
  AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');
