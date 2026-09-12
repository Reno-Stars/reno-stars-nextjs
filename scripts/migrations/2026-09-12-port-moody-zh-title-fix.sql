-- Migration: blog_posts — fix corrupted zh city names in port-moody post titles
-- Date: 2026-09-12
-- Status: NOT APPLIED — needs human to run against live database
-- Finding: title_zh for "kitchen-bathroom-renovation-port-moody-2026" contained "本拿比湾"
--   (Burnaby Bay, NOT Port Moody). "本拿比湾" is Brentwood Bay in Burnaby.
--   Also "港慕" in bathroom-renovation-port-moody-2026 is a transliteration error.
--   Port Moody correct zh: 穆迪港 (Simplified) / 滿地寶 (Traditional)
-- Idempotent: UPDATE only, no INSERT/DELETE, WHERE id IN (...) clause.
-- Excludes already-covered ids: none in pending migrations for blog_posts title_zh.

UPDATE blog_posts
SET
  title_zh = CASE id
    -- slug: kitchen-bathroom-renovation-port-moody-2026
    WHEN 'a25fa4c6-cfeb-47fe-9b12-6a38ec101c12'
      THEN '穆迪港厨房浴室翻新2026：实际费用与许可证指南'
    -- slug: bathroom-renovation-port-moody-2026
    WHEN 'c15a3d9f-1d8d-453d-be8f-99e6c2ac5f5a'
      THEN '穆迪港浴室翻新2026：费用、许可与设计指南'
    -- slug: pre-sale-renovation-port-moody-bc-2026
    WHEN 'c24c8d8a-6052-42b9-bb8c-32c73abdb5df'
      THEN '2026年穆迪港预售翻新：出售前提升物业价值完全指南'
    -- slug: kitchen-renovation-port-moody-bc-2026
    WHEN 'a57bd879-8c3f-4872-99ed-f581480bac62'
      THEN '穆迪港厨房翻新2026：费用、错层住宅与社区指南'
    -- slug: port-moody-home-renovation-guide-2026
    WHEN 'f576d97c-86d7-4663-ba74-ff56ac49ca2a'
      THEN '穆迪港家居翻新2026：费用、许可证与社区指南'
    ELSE title_zh
  END,
  excerpt_zh = CASE id
    -- kitchen-bathroom-renovation-port-moody-2026
    WHEN 'a25fa4c6-cfeb-47fe-9b12-6a38ec101c12'
      THEN '2026年穆迪港厨房和浴室装修成本指南。高端成本预算、穆迪港许可证、分层审批和 Poly-B 管道评估。'
    -- bathroom-renovation-port-moody-2026 (contained English "Port Moody" in zh excerpt)
    WHEN 'c15a3d9f-1d8d-453d-be8f-99e6c2ac5f5a'
      THEN '穆迪港浴室翻新完整成本指南：基础刷新16,000-24,000加元，中档翻新25,000-42,000加元，豪华套房39,000-55,000加元以上。涵盖浴缸更新、瓷砖、加热地板和无框玻璃淋浴等各档次选项。'
    -- pre-sale-renovation-port-moody-bc-2026 (contained English "Port Moody" and "Heritage Mountain")
    WHEN 'c24c8d8a-6052-42b9-bb8c-32c73abdb5df'
      THEN '2026年穆迪港预售翻新：出售前提升物业价值完全指南。SkyTrain 30分钟直达市中心、学区优质（穆迪港中学、Gleneagle Secondary IB项目）、海景山景稀缺、相比西温北温同等物业价格低25%-40%。遗产山是华人高端买家首选区域。'
    -- kitchen-renovation-port-moody-bc-2026 (contained "博迪港" transliteration error and English)
    WHEN 'a57bd879-8c3f-4872-99ed-f581480bac62'
      THEN '2026年穆迪港厨房翻新真实报价——从$25,000穆迪中心实用刷新到$55,000遗产山执行级厨房。含穆迪港错层住宅改造指南、格伦艾尔和学院公园 Poly-B 高风险区、长青走廊业主委员会审批流程及穆迪港市许可证信息。'
    -- port-moody-home-renovation-guide-2026 (contained English "Port Moody")
    WHEN 'f576d97c-86d7-4663-ba74-ff56ac49ca2a'
      THEN '穆迪港家居翻新费用概览：厨房翻新14,000-55,000加元，浴室翻新16,000-55,000加元，地下室（娱乐室）30,000-75,000加元。Evergreen SkyTrain 沿线物业（Newport Village、Suter Brook）翻新需求旺盛。'
    ELSE excerpt_zh
  END
WHERE id IN (
  'a25fa4c6-cfeb-47fe-9b12-6a38ec101c12',
  'c15a3d9f-1d8d-453d-be8f-99e6c2ac5f5a',
  'c24c8d8a-6052-42b9-bb8c-32c73abdb5df',
  'a57bd879-8c3f-4872-99ed-f581480bac62',
  'f576d97c-86d7-4663-ba74-ff56ac49ca2a'
);
