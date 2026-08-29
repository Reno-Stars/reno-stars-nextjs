/**
 * Migration: Audit service_areas content_zh for missing translations
 * Run: pnpm db:query -f scripts/migrations/2026-08-29-service-areas-content-zh.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-29-service-areas-content-zh.sql
 *
 * Context: service_areas has 14 cities in Metro Vancouver. All have content_en.
 * content_zh may be null or empty. This is the first migration targeting
 * service_areas.content_zh specifically.
 *
 * VERIFY CURRENT STATE (run against live DB — returns 0 or more rows):
 *   SELECT slug, name_en, name_zh,
 *          CASE WHEN content_zh IS NOT NULL AND content_zh != '' THEN 1 ELSE 0 END AS has_zh,
 *          char_length(content_zh) AS zh_len
 *   FROM service_areas
 *   ORDER BY display_order;
 *
 * RECOMMENDED TRANSLATIONS (human translator review required for each):
 *
 *   langley        → 兰利：独立屋社区，房价相对可负担，厨房装修聚焦开放式布局与功能升级。
 *   surrey         → 素里：大温人口增长最快的城市，装修需求涵盖无障碍设计到全套定制。
 *   north-vancouver → 北温哥华：中大型独立屋为主，潮湿气候对防潮橱柜要求高。
 *   coquitlam      → 高贵林：独立屋和公寓并存，装修预算通常在$4.5万至$7万之间。
 *   port-moody     → 满地宝：滨湖社区，厨房装修倾向开放式社交空间，中岛配置常见。
 *   port-coquitlam → 高贵林港：住房类型多样，熟悉各类物业的翻新要求。
 *   new-westminster → 新西敏：历史城市，住宅常需更新水电系统与布局改造。
 *   delta          → 三角洲：独立屋为主，住宅面积大，装修规模相应较大。
 *   burnaby        → 本拿比：从高层公寓到独立屋不等，各社区需求差异显著。
 *   richmond       → 列治文：华人人口比例高，Reno Stars提供英/粤/普通话服务。
 *   white-rock     → 白石镇：海滨退休社区，装修注重自然光线和耐海盐腐蚀材料。
 *   maple-ridge    → 枫树岭：独立屋社区，房价可负担，聚焦家庭功能和长期耐用性。
 *   vancouver      → 温哥华市：涵盖公寓到独立屋各类物业，超过20年本地经验。
 *   west-vancouver → 西温哥华：高端住宅区，装修预算较高，聚焦天然材料和定制设计。
 *
 * Idempotent UPDATE (apply after human translation review):
 *   UPDATE service_areas
 *   SET content_zh = '<verified translation>'
 *   WHERE slug = '<city-slug>'
 *     AND (content_zh IS NULL OR content_zh = '');
 */
