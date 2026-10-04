-- Migration: NOT YET APPLIED — requires human to run against production DB
-- Run with: psql $DB_CONNECTION_STRING -f scripts/migrations/2026-10-04-service-areas-description-zh-pure-chinese.sql

-- seo/daily-2026-10-04: Replace English place names with Chinese in service_areas.description_zh
-- All 14 service areas had English city names embedded in Chinese prose.
-- WHERE guards ensure idempotency — safe to re-run after apply.

UPDATE service_areas
SET description_zh = '适用于本拿比住宅、公寓和联排别墅的值得信赖的厨房、浴室和全屋翻新。'
WHERE slug = 'burnaby'
  AND description_zh = '适用于 Burnaby 住宅、公寓和联排别墅的值得信赖的厨房、浴室和全屋翻新。';

UPDATE service_areas
SET description_zh = '为高贵林房主提供优质装修服务 - 厨房、浴室和完整的家居改造。'
WHERE slug = 'coquitlam'
  AND description_zh = '为 Coquitlam 房主提供优质装修服务 - 厨房、浴室和完整的家居改造。';

UPDATE service_areas
SET description_zh = '从拉德纳到措沃森以及北三角洲，专业厨房和浴室翻新工程。'
WHERE slug = 'delta'
  AND description_zh = '从 Ladner 到 Tsawwassen 以及北 Delta，专业厨房和浴室翻新工程。';

UPDATE service_areas
SET description_zh = '为兰里住宅和新开发项目提供优质厨房、浴室和全屋翻新。'
WHERE slug = 'langley'
  AND description_zh = '为 Langley 住宅和新开发项目提供优质厨房、浴室和全屋翻新。';

-- maple-ridge: "枫树岭" is correct, no English in current value
-- new-westminster: "新威斯敏斯特和码头地区" is correct, no change needed

UPDATE service_areas
SET description_zh = '北温哥华住宅的高端厨房和浴室翻新，拥有山景设计专业知识。'
WHERE slug = 'north-vancouver'
  AND description_zh = 'North Vancouver 住宅的高端厨房和浴室翻新，拥有山景设计专业知识。';

UPDATE service_areas
SET description_zh = '为高贵林港家庭提供经济实惠、优质的翻新服务 - 厨房、浴室等。'
WHERE slug = 'port-coquitlam'
  AND description_zh = '为 Coquitlam 港家庭提供经济实惠、优质的翻新服务 - 厨房、浴室等。';

-- port-moody: "穆迪港" and "遗产山" are correct (legacy translation), no change needed

UPDATE service_areas
SET description_zh = '里士满值得信赖的装修团队，负责公寓和住宅的厨房、浴室以及全屋改造。'
WHERE slug = 'richmond'
  AND description_zh = 'Richmond 值得信赖的装修团队，负责公寓和住宅的厨房、浴室以及全屋改造。';

UPDATE service_areas
SET description_zh = '为萨里提供专业厨房、浴室和全屋装修——从弗利特伍德到南萨里。'
WHERE slug = 'surrey'
  AND description_zh = '为 Surrey 提供专业厨房、浴室和全屋装修——从弗利特伍德到南 Surrey。';

UPDATE service_areas
SET description_zh = '温哥华首屈一指的厨房、浴室、商业空间和全套家居改造装修公司。'
WHERE slug = 'vancouver'
  AND description_zh = 'Vancouver 首屈一指的厨房、浴室、商业空间和全套家居改造装修公司。';

UPDATE service_areas
SET description_zh = '西温哥华的豪华厨房和浴室翻新，专为高档海滨和山坡住宅而设计。'
WHERE slug = 'west-vancouver'
  AND description_zh = 'West Vancouver 的豪华厨房和浴室翻新，专为高档海滨和山坡住宅而设计。';

UPDATE service_areas
SET description_zh = '为白石和南萨里住宅提供优质翻新服务 - 厨房、浴室和全屋项目。'
WHERE slug = 'white-rock'
  AND description_zh = '为 White Rock 和 South Surrey 住宅提供优质翻新服务 - 厨房、浴室和全屋项目。';
