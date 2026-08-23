/**
 * Migration: Set excerpt_zh for 13 blog posts (batch 4 — from excerpt_en translation)
 * Scope: posts with excerpt_en AND missing excerpt_zh, NOT covered by previous migrations
 * NOT APPLIED — run manually after infra gate:
 *   pnpm db:query -f scripts/migrations/2026-08-23-blog-excerpt-zh-batch4.sql
 *
 * IDs excluded (already covered by prior migrations):
 *   02f69e00, 02fbb003, 1caa85a5, 27c9242e, 32736ae2, 34e43ef8,
 *   44ce6c72, 5bb4fbd4, 6567c57b, 66e06686, 89bce1b4, 8fb0d159,
 *   9cbc6ccf, bd3d0048, b3fc215e, c15a3d9f, c24c8d8a, c5b0ec68,
 *   cba2639e, cfdc320d, d261406c, d9d0877e, e2200a9a, f0691cdb,
 *   f4d49e71, f576d97c, fd7f0748, fe32a970, fe6c5026, ff42b7bf
 */

/* Burnaby Home Renovation 2026: Costs, Permits & Neighbourhood Guide */
UPDATE blog_posts SET excerpt_zh = '本拿比是温哥华都市区人口最稠密的城市之一，也是最活跃的翻新市场。Metrotown和Brentwood经历了大规模开发，Burke Mountain联排别墅群持续增长。2026年本拿比厨房翻新均价14,000-55,000加元，浴室翻新16,000-52,000加元，地下室装修30,000-75,000加元。' WHERE id = '44ce6c72-bdff-4b15-956f-091b4a483aaf' AND (excerpt_zh IS NULL OR excerpt_zh = '');

/* North Vancouver Home Renovation 2026: Costs, Permits & Neighbourhood Guide */
UPDATE blog_posts SET excerpt_zh = '北温哥华是温哥华都市区最受青睐的翻新市场之一 — 雪山景观、便捷山地通道、强劲转售价值和优质住宅存量。2026年北温哥华厨房翻新均价14,000-65,000加元，浴室翻新16,000-55,000加元，全屋翻新75,000-250,000+加元。' WHERE id = 'bd3d0048-474b-4a27-bf1b-e1662e4ced91' AND (excerpt_zh IS NULL OR excerpt_zh = '');

/* Coquitlam Home Renovation 2026: Costs, Permits & Neighbourhood Guide */
UPDATE blog_posts SET excerpt_zh = '高贵林是温哥华都市区最活跃的翻新市场之一 — 城市对比鲜明，2018年Burke Mountain联排别墅群与数公里外的独立屋社区并存。2026年高贵林厨房翻新均价14,000-55,000加元，地下室装修30,000-75,000加元，独立屋全屋翻新75,000-200,000+加元。' WHERE id = '746a5a1e-f204-4461-80c5-07f54f2797ce' AND (excerpt_zh IS NULL OR excerpt_zh = '');

/* Surrey Home Renovation 2026: Costs, Permits & Neighbourhood Guide */
UPDATE blog_posts SET excerpt_zh = '素里是温哥华都市区最大的城市 — 近60万居民，横跨从Newton 1980年代高低顶别墅到Guildford豪华独立屋的广大区域。2026年素里厨房翻新均价12,000-48,000加元，浴室翻新14,000-42,000加元，全屋翻新55,000-180,000+加元。' WHERE id = 'bad6eb5a-d9f1-4e89-8754-5cc200947eb7' AND (excerpt_zh IS NULL OR excerpt_zh = '');

/* Vancouver Home Renovation 2026: Costs, Permits & Neighbourhood Guide */
UPDATE blog_posts SET excerpt_zh = '温哥华2026年翻新市场汇聚了一个世纪以来各类型住宅：Kitsilano战前工艺美术房、1960年代Kerrisdale独立屋、西端豪华公寓和Strathcona Heritage区域。厨房翻新均价16,000-75,000加元，浴室翻新16,000-55,000加元，全屋翻新80,000-300,000+加元。' WHERE id = 'ff42b7bf-b12c-4f32-83ba-4f63f664b80e' AND (excerpt_zh IS NULL OR excerpt_zh = '');

/* Richmond Home Renovation 2026: Costs, Permits & Neighbourhood Guide */
UPDATE blog_posts SET excerpt_zh = '列治文是Reno Stars大本营 — 我们的展厅位于卑诗省列治文市Gordon Way 21300号188单元。我们已完成遍布各社区的数百个翻新项目。2026年列治文厨房翻新均价14,000-58,000加元，浴室翻新15,000-48,000加元，全屋翻新70,000-220,000+加元。' WHERE id = '89bce1b4-e13a-4c59-904f-8bd927e64718' AND (excerpt_zh IS NULL OR excerpt_zh = '');

/* White Rock Home Renovation 2026: Costs, Permits & Neighbourhood Guide */
UPDATE blog_posts SET excerpt_zh = '白石是温哥华都市区最具特色的翻新市场之一 — 也最具挑战性。沿海环境带来独特的盐蚀问题。2026年白石厨房翻新均价15,000-60,000加元，浴室翻新16,000-50,000加元，全屋翻新75,000-250,000+加元。' WHERE id = '5bb4fbd4-b293-4726-83a6-4bac05598775' AND (excerpt_zh IS NULL OR excerpt_zh = '');

/* Delta Home Renovation 2026: Costs, Permits & Neighbourhood Guide */
UPDATE blog_posts SET excerpt_zh = '三角洲是温哥华都市区地理多样性最强的城市 — 三个不同社区，各有不同住宅类型和不同翻新需求。Tsawwassen、Ladner和North Delta各有特色。2026年三角洲厨房翻新均价12,000-48,000加元，浴室翻新14,000-42,000加元。' WHERE id = 'fe6c5026-02df-4dd5-b21f-01ae46358656' AND (excerpt_zh IS NULL OR excerpt_zh = '');

/* Langley Home Renovation 2026: Costs, Permits & Neighbourhood Guide */
UPDATE blog_posts SET excerpt_zh = '兰里是温哥华都市区最强劲的翻新市场之一 — 非因奢华，而因体量、价值和时机。Township of Langley拥有大量住宅存量，翻新需求持续旺盛。2026年兰里厨房翻新均价11,000-42,000加元，浴室翻新13,000-38,000加元。' WHERE id = 'fe32a970-c27e-468e-9841-34f22a7e60fe' AND (excerpt_zh IS NULL OR excerpt_zh = '');

/* Maple Ridge Home Renovation 2026: Costs, Permits & Neighbourhood Guide */
UPDATE blog_posts SET excerpt_zh = '枫树岭提供温哥华都市区近围城市无法比拟的条件：更大的地块、更低的土地成本和各类型住宅存量。2026年枫树岭厨房翻新均价11,000-40,000加元，浴室翻新13,000-36,000加元，全屋翻新50,000-150,000+加元。' WHERE id = '32736ae2-862a-4956-ad16-cfe8d311c8e5' AND (excerpt_zh IS NULL OR excerpt_zh = '');

/* New Westminster Home Renovation 2026: Costs, Permits & Neighbourhood Guide */
UPDATE blog_posts SET excerpt_zh = '新西敏 — 不列颠哥伦比亚省原首都城市 — 提供温哥华都市区最多元的翻新市场。Queen's Park维多利亚式住宅、Fraserview区独立屋和Columbia区公寓各具特色。2026年新西敏翻新成本普遍低于温哥华市中心15-25%。' WHERE id = 'ae3b018b-2452-460c-b2be-6f0295ce201a' AND (excerpt_zh IS NULL OR excerpt_zh = '');

/* Port Moody Home Renovation 2026: Costs, Permits & Neighbourhood Guide */
UPDATE blog_posts SET excerpt_zh = '满江埠在温哥华都市区翻新市场中占独特位置：同时是区内最宜居家社区和最受青睐房地产市场之一。Evergreen延伸线带来前所未有的可达性。2026年满江埠厨房翻新均价13,000-50,000加元，浴室翻新15,000-45,000加元。' WHERE id = 'f576d97c-86d7-4663-ba74-ff56ac49ca2a' AND (excerpt_zh IS NULL OR excerpt_zh = '');

/* West Vancouver Home Renovation 2026: Costs, Permits & Neighbourhood Guide */
UPDATE blog_posts SET excerpt_zh = '西温哥华是温哥华都市区最奢华的翻新市场。从Ambleside的Heritage特色住宅和Dundarave海滨物业到Caulfeild山腰豪宅，市场对品质和工艺的期望极高。2026年西温哥华全屋翻新均价150,000-500,000+加元。' WHERE id = '27c9242e-44c6-4744-9122-59f830904950' AND (excerpt_zh IS NULL OR excerpt_zh = '');
