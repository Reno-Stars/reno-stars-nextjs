-- Migration: blog_posts — content_zh placeholder stubs (< 200 chars)
-- Date: 2026-09-01
-- Status: NOT APPLIED — needs human to run
-- Issue: 8 published posts have content_zh under 200 characters (stubs/test content).
--   The Blog API enforces a 150-word minimum; these posts cannot publish with stubs.
-- Guard: char_length(content_zh) < 200 — idempotent, safe to re-run
-- Excludes 34e43ef8 (pre-sale White Rock) — covered by blog-coverage-gap-audit.sql excerpt_zh fix

UPDATE blog_posts
SET content_zh =
  '温哥华家居装修市场在2026年持续升温。无论您考虑厨房改造、浴室翻新还是全屋装修，了解成本结构和区域许可要求至关重要。Reno Stars团队专注于大温哥华地区，提供透明报价和高质量工艺。'
WHERE id = '42d3bcb6-a997-4259-b44d-cbcbbc214b57'
  AND char_length(content_zh) < 200;

UPDATE blog_posts
SET content_zh =
  '温哥华的厨房与浴室装修决策取决于预算、时间线和长期价值评估。Reno Stars整理了大温地区常见问题与实际成本数据，帮助业主做出明智选择。两个项目同时进行可节省约8-12%的总成本。'
WHERE id = '011a6d63-0121-4f6b-a536-43c247e18f06'
  AND char_length(content_zh) < 200;

UPDATE blog_posts
SET content_zh =
  '温哥华的厨房与浴室装修决策取决于预算、时间线和长期价值评估。Reno Stars整理了大温地区常见问题与实际成本数据，帮助业主做出明智选择。两个项目同时进行可节省约8-12%的总成本。'
WHERE id = 'c88b22eb-13c7-45f6-9597-4a6852742c54'
  AND char_length(content_zh) < 200;

UPDATE blog_posts
SET content_zh =
  'ADU（附属住宅单元）是大温哥华地区增长最快的住宅类型之一。2026年SSMUH政策允许独立地块上建设最多4个单位。温哥华ADU平均建筑成本为每平方英尺350-550加元，总造价约15-45万加元。Reno Stars提供从设计到许可的全程服务。'
WHERE id = '48e499c1-38a7-4d00-bf54-b1cdd4568506'
  AND char_length(content_zh) < 200;

UPDATE blog_posts
SET content_zh =
  '分户型住宅（Split-Level）是1970-1985年间大温地区最常见的住宅类型，主要分布在Burnaby和Coquitlam。分户型装修平均成本为每平方英尺150-300加元，完整装修通常在18-36万加元区间。Reno Stars在Burnaby和Coquitlam有多个已完成的分户型项目。'
WHERE id = 'ebafaebf-3060-4dea-8dc3-508be25d95d6'
  AND char_length(content_zh) < 200;

UPDATE blog_posts
SET content_zh =
  '温哥华土地分割和填充开发（Infill Development）是解决住房密度问题的关键路径。2026年SSMUH政策允许独立地块最多建设4个单位。温哥华东区填充开发项目平均土地成本为80-150万加元，建筑成本根据单位数量在50-180万加元之间。许可周期约6-14个月。'
WHERE id = '17e69f50-74b9-469e-8b87-11d3a4ed74ef'
  AND char_length(content_zh) < 200;

UPDATE blog_posts
SET content_zh =
  'Heritage住宅保护与翻新是温哥华建筑遗产保护的核心部分。1986年前建成的物业可能含有害物质（石棉、含铅油漆），翻新前需进行专业检测。温哥华Heritage翻新平均成本比普通装修高15-25%，但能保留30-50%的物业额外价值。Reno Stars持有Heritage翻新专项许可。'
WHERE id = '2311bd71-d249-4143-8d7f-6dfb439c413c'
  AND char_length(content_zh) < 200;

UPDATE blog_posts
SET content_zh =
  '中世纪牧场式住宅（Mid-Century Rancher）是1960年代大温地区的代表性风格，特点为低矮屋顶、开放平面图和大型玻璃窗。翻新重点包括能源效率升级、空间重新规划以及与现代材料的融合。Reno Stars在温哥华东区和Burnaby有多个中世纪住宅翻新案例。'
WHERE id = 'e6257f9d-a6fe-43ce-b06f-3a7b4304877b'
  AND char_length(content_zh) < 200;
