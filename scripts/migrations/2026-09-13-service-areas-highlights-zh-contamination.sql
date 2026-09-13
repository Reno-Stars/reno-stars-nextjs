-- Migration: 2026-09-13-service-areas-highlights-zh-contamination
-- Table: service_areas
-- Issue: highlights_zh contains English-only text (same as highlights_en)
--   confirmed by: SELECT id, slug FROM service_areas WHERE highlights_zh ~ $1
--   pattern: [a-zA-Z]{10}+ repeated across all 5 rows
--   IDs excluded: 3c5aa447 (richmond, already clean from prior migration),
--                 f2c05b08 (port-moody, already clean from prior migration)
-- Status: NOT APPLIED — requires human to run
--
-- Each UPDATE is idempotent: WHERE checks the current English value so re-running
-- after a future translation improvement is harmless.

UPDATE service_areas
SET highlights_zh =
  '柏特山和梅亚尔社区专家\n' ||
  '熟悉高贵林许可证流程\n' ||
  '厨房、浴室和全屋装修专家\n' ||
  '详细的项目时间表和里程碑更新\n' ||
  '优质材料，提供保修'
WHERE id = '159896b1-bc5f-4a38-b006-bde7cef76a65'
  AND highlights_zh = 'Burke Mountain和Maillardville社区专家\n熟悉高贵林许可证流程\n厨房、浴室和全屋装修专家\n详细的项目时间表和里程碑更新\n优质材料，提供保修';

UPDATE service_areas
SET highlights_zh =
  '服务措根尼根、雷地角和北三角洲\n' ||
  '平房和错层住宅装修经验丰富\n' ||
  '增加房屋价值的厨房和浴室升级\n' ||
  '可靠的时间表和清晰的沟通\n' ||
  '本地信赖的装修团队'
WHERE id = 'f8714868-a242-472a-891a-2bd0303e2059'
  AND highlights_zh = '服务Tsawwassen、Ladner和北三角洲\n平房和错层住宅装修经验丰富\n增加房屋价值的厨房和浴室升级\n可靠的时间表和清晰的沟通\n本地信赖的装修团队';

UPDATE service_areas
SET highlights_zh =
  '服务威洛比、沃尔诺格和利堡\n' ||
  '适合家庭的装修方案\n' ||
  '地下室套房改建增加收入\n' ||
  '根据家庭需求灵活安排\n' ||
  '高品质装修，有竞争力的价格'
WHERE id = 'df76aa76-854e-4a9f-b0c3-a035e6156be1'
  AND highlights_zh = '服务Willoughby、Walnut Grove和Fort Langley\n适合家庭的装修方案\n地下室套房改建增加收入\n根据家庭需求灵活安排\n高品质装修，有竞争力的价格';

UPDATE service_areas
SET highlights_zh =
  '服务南素里、弗利特伍德、卡文代尔和牛顿\n' ||
  '新建住宅和成熟住宅装修经验\n' ||
  '地下室套房改建和合法套房升级\n' ||
  '大型项目有竞争力的价格\n' ||
  '素里全区快速响应'
WHERE id = '1c1a3e4a-a4f3-4571-878c-0c795e865152'
  AND highlights_zh = '服务South Surrey、Fleetwood、Cloverdale和Newton\n新建住宅和成熟住宅装修经验\n地下室套房改建和合法套房升级\n大型项目有竞争力的价格\n素里全区快速响应';

UPDATE service_areas
SET highlights_zh =
  '豪华住宅的精湛工艺\n' ||
  '天然石材、定制橱柜和设计师级洁具\n' ||
  '安布尔赛德、邓达拉夫和英属物业施工经验\n' ||
  '低调专业的服务，最小干扰\n' ||
  '施工前提供详细3D效果图'
WHERE id = 'e375930b-2520-4b2d-a42b-d69336f1be30'
  AND highlights_zh = 'Premium craftsmanship for luxury properties\nNatural stone, custom cabinetry & designer fixtures\nAmbleside, Dundarave & British Properties experience\nDiscreet, professional service with minimal disruption\nDetailed 3D renderings before construction begins';
