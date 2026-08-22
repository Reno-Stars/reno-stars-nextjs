-- Migration: Add excerpt_zh for 15 blog posts (batch 3, remaining uncovered)
-- NOT APPLIED — run manually after infra gate
-- IDs excluded (already covered by batch1+2): 02f69e00, 02fbb003, 1caa85a5, 27c9242e, 32736ae2, 34e43ef8, 44ce6c72, 5bb4fbd4, 6567c57b, 89bce1b4, ff42b7bf, bd3d0048, 746a5a1e, bad6eb5a, fe6c5026, cfdc320d, ae3b018b, fe32a970, cba2639e, f4d49e71, 6db67571, 90eab35f

UPDATE blog_posts SET excerpt_zh = '三角洲预售翻新市场涵盖北三角洲、拉达和查瓦森，华人买家比例显著。厨卫翻新平均溢价15%-25%，在市天数缩短40%以上。直排式油烟机、双台盆主卫和智能马桶盖是华人买家最看重的评分项。' WHERE id = '66e06686-e4ff-4987-a62c-918ac0dea481' AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh = 'Burnaby的预售翻新房屋比未装修同类房屋销售快18-26天。15,000-50,000加元的战略更新通常产生30,000-120,000加元的额外销售收入，投资回报率在Metro Vancouver名列前茅。Metrotown、Brentwood、Lougheed等社区翻新优先。' WHERE id = 'b3fc215e-f51c-4857-9dd8-b535f9746f68' AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh = 'Port Moody华人买家核心优势：SkyTrain 30分钟直达市中心、学区优质（Port Moody Secondary、Gleneagle Secondary IB项目）、海景山景稀缺、相比西温北温同等物业价格低25%-40%。Heritage Mountain是华人高端买家首选区域。' WHERE id = 'c24c8d8a-6052-42b9-bb8c-32c73abdb5df' AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh = '北温哥华公寓翻新完整中文指南：Lonsdale走廊、Central Lonsdale和Lynn Valley为核心翻新区域。厨房翻新8,000-75,000加元，浴室8,000-55,000加元，全屋翻新45,000-120,000加元，按预算选择合适的翻新方案。' WHERE id = '9739d7cc-5b6e-4a3d-ac10-3159e5df0967' AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh = 'Port Moody浴室翻新完整成本指南：基础刷新16,000-24,000加元，中档翻新25,000-42,000加元，豪华套房39,000-55,000加元以上。涵盖浴缸更新、瓷砖、加热地板和无框玻璃淋浴等各档次选项。' WHERE id = 'c15a3d9f-1d8d-453d-be8f-99e6c2ac5f5a' AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh = 'Delta公寓翻新指南涵盖Ladner、Tsawwassen和North Delta三个社区。Tsawwassen渡轮码头改善和North Delta靠近SkyTrain Scott Road推动翻新需求增长。厨房25,000-75,000加元，浴室15,000-35,000加元。' WHERE id = 'c5b0ec68-78a5-4cfb-beb3-73806152bf3a' AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh = 'Port Coquitlam浴室翻新完整指南：Citadel Heights、Hyde Creek、Riverwood等社区翻新优先。基础更新15,000-22,000加元，中档翻新23,000-38,000加元，高级套房39,000-55,000加元以上。含步入式淋浴、独立浴缸和定制瓷砖。' WHERE id = '3ddc8b6b-10d6-4e27-9295-5732991d77ec' AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh = 'Coquitlam港家居装修完整指南：独立屋平均价值约100-130万加元，厨房翻新14,000-55,000加元，地下室30,000-75,000加元。WestCoast Express通勤铁路沿线房产受华人买家青睐，租赁市场活跃。' WHERE id = 'fd7f0748-f4e4-440b-8f6f-0955a4d83eca' AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh = 'Port Moody家居翻新费用概览：厨房翻新14,000-55,000加元，浴室翻新16,000-55,000加元，地下室（娱乐室）30,000-75,000加元。Evergreen SkyTrain沿线物业（Newport Village、Suter Brook）翻新需求旺盛。' WHERE id = 'f576d97c-86d7-4663-ba74-ff56ac49ca2a' AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh = '新威斯敏斯特公寓翻新完整中文指南：Sapperton、Downtown等区域华人移民家庭增长迅速。厨房翻新10,000-70,000加元，浴室翻新7,000-50,000加元。1988-2005年建成公寓楼居多，升级改造需求大。' WHERE id = '7bfed8e7-2b7d-4149-98bb-86298e327775' AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh = 'Surrey公寓翻新完整成本和分层指南：厨房25,000-75,000加元，浴室15,000-35,000加元，地板8,000+加元。Whalley、King George Boulevard、South Surrey等社区翻新需求创纪录增长。' WHERE id = '8fb0d159-29d6-4744-8203-7f5972eb31ed' AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh = '新威斯敏斯特预售翻新：房屋售价通常比同类Burnaby房产低15-25%。战略性预售翻新是实现竞争定位的最清晰途径。上城区和皇后区（Queensborough）华人买家活动显著增加，学区和轻轨步行性是家庭首要考量。' WHERE id = 'd261406c-b23b-42af-9d83-68ca2415b478' AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh = '白石地下室装修完整成本指南：基础装修42,000-65,000加元，海景套房90,000-125,000加元以上。沿海溢价和复杂地块地形使成本比Metro Vancouver中位数高10-18%。White Rock独立于Surrey的许可证要求需单独了解。' WHERE id = 'd9d0877e-e396-4950-9922-8402822b6f59' AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh = '列治文预售翻新：华人买家约占55%，经验丰富、要求严格。20,000-60,000加元的战略性预售翻新通常产生50,000-160,000加元的额外销售收益，在Metro Vancouver中属最高回报率。Steveston Village、Richmond Centre、South Arm等社区翻新优先。' WHERE id = 'e2200a9a-6f48-4fc5-af1d-2038fbdb1f73' AND (excerpt_zh IS NULL OR excerpt_zh = '');

UPDATE blog_posts SET excerpt_zh = '新威斯敏斯特浴室装修成本指南：化妆品更新6,000-14,000加元，中档翻新14,000-28,000加元，全套主浴室28,000-52,000加元。涵盖女王公园传统住宅、弗雷泽河畔现代公寓和市中心公寓各类型物业。' WHERE id = 'f0691cdb-80bf-469f-9201-d43b0c22c8ba' AND (excerpt_zh IS NULL OR excerpt_zh = '');
