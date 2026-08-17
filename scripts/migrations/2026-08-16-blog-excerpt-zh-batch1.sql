/**
 * Migration: Set excerpt_zh for 15 blog posts — batch 1.
 * Run: pnpm db:query -f scripts/migrations/2026-08-16-blog-excerpt-zh-batch1.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-16-blog-excerpt-zh-batch1.sql
 */

/* Batch 1: City renovation guide + pre-sale posts with existing excerpt_en.
   15 posts, all Metro Vancouver cities. */

UPDATE blog_posts SET excerpt_zh =
  '本拿比是大温人口最密集的市政区，也是最活跃的装修市场之一。Metrotown和Brentwood地区经历了大规模开发，'
WHERE id = '44ce6c72-bdff-4b15-956f-091b4a483aaf'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh =
  '北温是，大温最受青睐的装修市场之一——优越的山景、便利的交通、强劲的转售价值，以及多样化的住房类型。'
WHERE id = 'bd3d0048-474b-4a27-bf1b-e1662e4ced91'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh =
  '高贵林是大温最活跃的装修市场之一——一个充满鲜明对比的城市，2018年的Burke Mountain联排别墅与几公里外的传统独立屋共存。'
WHERE id = '746a5a1e-f204-4461-80c5-07f54f2797ce'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh =
  '素里是大温最大的城市——近60万居民，涵盖从Newton地区1980年代的分层住宅到豪华庄园式别墅等多种房型。'
WHERE id = 'bad6eb5a-d9f1-4e89-8754-5cc200947eb7'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh =
  '2026年温哥华装修的业主面对的是一个融合了一个世纪住房存量的城市——Kitsilano的二战前工艺美术风格房屋、1960年代的高层公寓，以及当代新建项目。'
WHERE id = 'ff42b7bf-b12c-4f32-83ba-4f63f664b80e'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh =
  '列治文是Reno Stars的总部所在地——我们的展厅位于卑诗省列治文市Gordon Way 21300号188单元。我们在大温各城市完成了数百项装修工程。'
WHERE id = '89bce1b4-e13a-4c59-904f-8bd927e64718'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh =
  '白石镇是大温最独特、也最具挑战性的装修市场之一。独特的海滨位置为外墙材料、耐用性和景观设计带来了特殊要求。'
WHERE id = '5bb4fbd4-b293-4726-83a6-4bac05598775'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh =
  'Maple Ridge售前装修：Silver Valley、Albion和Haney卖家的高回报项目。挂牌前更新厨房、卫生间和地下室。Poly-B管道更换建议。免费报价。'
WHERE id = '6567c57b-8813-4894-b5b7-b69a51295d1a'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh =
  '三角洲是大温地理最多元化的市政区——三个各具特色的社区，拥有不同的住房类型、不同的装修需求和不同的许可要求。'
WHERE id = 'fe6c5026-02df-4dd5-b21f-01ae46358656'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh =
  '北温售前装修：Lynn Valley、Lonsdale和Deep Cove卖家的高回报项目。挂牌前更新厨房、卫生间和地下室。48小时内免费报价。'
WHERE id = 'cfdc320d-299c-4d4d-bc64-ae5c168aca11'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh =
  '新西敏寺——卑诗省原省会城市——提供大温最多元化的装修市场之一。Queens Park的维多利亚式住宅和现代公寓并存，相得益彰。'
WHERE id = 'ae3b018b-2452-460c-b2be-6f0295ce201a'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh =
  '西温是大温最高端的装修市场。从Ambleside的历史风貌住宅和Dundarave的滨水物业，到Cypress的豪华山间别墅，业主期望值极高。'
WHERE id = '27c9242e-44c6-4744-9122-59f830904950'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh =
  '高贵林港在大温装修市场中占据独特地位。它同时是该地区最多元化、最具成长性的社区之一，融合了工业遗产与滨水生活方式。'
WHERE id = 'f576d97c-86d7-4663-ba74-ff56ac49ca2a'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh =
  '兰里是大温最强劲的装修市场之一——不是因为高端，而是因为体量、价值和时机。Township of Langley的独立屋和联排别墅库存充足，装修性价比极高。'
WHERE id = 'fe32a970-c27e-468e-9841-34f22a7e60fe'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh =
  'Maple Ridge提供大温近城区域无法比拟的条件：更大的地块、更低的土地成本，以及从经典独立屋到现代住宅的多样化住房类型。'
WHERE id = '32736ae2-862a-4956-ad16-cfe8d311c8e5'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');
