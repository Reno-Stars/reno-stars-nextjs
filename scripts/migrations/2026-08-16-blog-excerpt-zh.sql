/**
 * Migration: Set excerpt_zh for blog posts that have title_zh + content_zh but missing excerpt_zh.
 * Run:  pnpm db:query -f scripts/migrations/2026-08-16-blog-excerpt-zh.sql
 *
 * These posts all have full Chinese content but the excerpt field was never populated,
 * leaving the zh listing page with blank meta descriptions for Chinese search.
 */

BEGIN;

-- 1. burnaby-home-renovation-guide-2026
UPDATE blog_posts
SET excerpt_zh = '本拿比是大温地区人口密度最高的市镇，Metrotown和Brentwood拥有大量联排和公寓，独立屋建于1960–1980年代。涵盖2026年翻新费用、许可证要求与各社区特点。'
WHERE slug = 'burnaby-home-renovation-guide-2026'
  AND excerpt_zh IS NULL;

-- 2. north-vancouver-home-renovation-guide-2026
UPDATE blog_posts
SET excerpt_zh = '北温哥华是大温最受欢迎的装修市场之一，拥有山景、便捷户外设施和较高房产保值能力。涵盖北岸各社区装修费用、许可证要求与隐性风险分析。'
WHERE slug = 'north-vancouver-home-renovation-guide-2026'
  AND excerpt_zh IS NULL;

-- 3. coquitlam-home-renovation-guide-2026
UPDATE blog_posts
SET excerpt_zh = '高贵林是大温最活跃的装修市场之一，从伯克山2018年联排别墅到马拉丁维尔1965年特色住宅，各有不同装修机会与许可证要求。含2026年真实翻新费用参考。'
WHERE slug = 'coquitlam-home-renovation-guide-2026'
  AND excerpt_zh IS NULL;

-- 4. surrey-home-renovation-guide-2026
UPDATE blog_posts
SET excerpt_zh = '素里是大温人口最多的城市，从牛顿1980年代分层独立屋到南素里豪华庄园住宅差异显著。本指南涵盖2026年素里翻新费用、许可证要求及各社区装修特点。'
WHERE slug = 'surrey-home-renovation-guide-2026'
  AND excerpt_zh IS NULL;

-- 5. pre-sale-renovation-surrey-bc-2026
UPDATE blog_posts
SET excerpt_zh = '素里预售翻新投资理念因子市场而异。本指南帮助业主在2026年上市前确定投资回报率最高的翻修项目，在售价中收回成本并减少上市天数。含Newton、Fleetwood、南素里等细分市场分析。'
WHERE slug = 'pre-sale-renovation-surrey-bc-2026'
  AND excerpt_zh IS NULL;

-- 6. vancouver-home-renovation-guide-2026
UPDATE blog_posts
SET excerpt_zh = '温哥华翻新涵盖百年历史工匠式平房、战后住宅、现代公寓大厦，以及加拿大最严格的许可和业主委员会法规。含2026年厨房、浴室、地下室、全屋翻新真实费用参考。'
WHERE slug = 'vancouver-home-renovation-guide-2026'
  AND excerpt_zh IS NULL;

-- 7. richmond-home-renovation-guide-2026
UPDATE blog_posts
SET excerpt_zh = '列治文是Reno Stars大本营，样品展厅位于21300 Gordon Way 188号单元。列治文拥有大温最佳地下室套间投资回报率，1卧室合法套间月租$2,100-$2,600。含2026年翻新费用与许可证要求。'
WHERE slug = 'richmond-home-renovation-guide-2026'
  AND excerpt_zh IS NULL;

-- 8. white-rock-home-renovation-guide-2026
UPDATE blog_posts
SET excerpt_zh = '白石镇是大温最具特色的翻新市场，面临海洋盐雾腐蚀、山坡排水难题和独立于素里市的市政机构。本指南涵盖2026年翻新费用、许可证要求与海滨社区装修特点。'
WHERE slug = 'white-rock-home-renovation-guide-2026'
  AND excerpt_zh IS NULL;

-- 9. pre-sale-renovation-white-rock-bc-2026
UPDATE blog_posts
SET excerpt_zh = '怀特罗克与南素里是大温独特海滨房产市场，物业从公寓（$600K-$900K）到豪宅（$2M-$4M+）。本指南分析华人买家偏好、翻新ROI及海滨防潮材料选择。'
WHERE slug = 'pre-sale-renovation-white-rock-bc-2026'
  AND excerpt_zh IS NULL;

-- 10. pre-sale-renovation-maple-ridge-bc-2026
UPDATE blog_posts
SET excerpt_zh = '枫树岭是大温最具性价比的预售翻新市场，更大的地块、老旧建筑存量和较低的许可证费用使针对性翻新带来强劲回报。含各社区翻新优先事项与投资回报参考。'
WHERE slug = 'pre-sale-renovation-maple-ridge-bc-2026'
  AND excerpt_zh IS NULL;

COMMIT;
