-- Migration: 2026-08-27
-- Scope:  blog_posts.seo_keywords_zh — batch for uncovered real-content posts
-- Status:  NOT APPLIED — needs human to run
-- IDs excluded (already covered by 2026-08-16 blog-seo-keywords-zh-batch2.sql + batch3.sql):
--   1837b084, 011a6d63, 0551ee30, 71c9b551, 79dc1aa5, dfb2f7ef,
--   f771b876, ea66766b, f622fd93, c88b22eb, 89bce1b4
-- Remaining uncovered posts from today's DB query (slug NOT LIKE 'outdoor-test%' AND slug NOT LIKE 'test-%')
-- Derivation: zh keywords from Chinese title + EN focus_keyword transliteration + zh equivalent terms

-- ===================== 1837b084 =====================
-- slug: renovate-vs-move-vancouver-2026
-- title_zh: 装修还是搬家：2026年温哥华房市哪个更划算？
-- focus_keyword_en: renovate vs move vancouver
UPDATE blog_posts SET seo_keywords_zh = '温哥华装修vs搬家,温哥华2026房市,卖房还是装修,温哥华房产翻修,房屋升级vs换房,装修vs搬家温哥华' WHERE id = '1837b084-cb01-4c31-a511-a54204f43ad5' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== 011a6d63 =====================
-- slug: vancouver-reno-kitchen-or-bathroom-2026-test
-- title_zh: 温哥华装修：先装修厨房还是卫生间？
-- focus_keyword_en: kitchen vs bathroom vancouver
UPDATE blog_posts SET seo_keywords_zh = '温哥华厨房vs卫生间,温哥华装修顺序,先装修厨房还是浴室,厨房翻新还是浴室翻新,温哥华装修规划' WHERE id = '011a6d63-0121-4f6b-a536-43c247e18f06' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== 0551ee30 =====================
-- slug: kitchen-refresh-without-full-renovation-vancouver-2026
-- title_zh: 厨房翻新省钱指南：不大动土木的7种方法（温哥华2026）
-- focus_keyword_en: kitchen refresh without renovation
UPDATE blog_posts SET seo_keywords_zh = '温哥华厨房翻新,厨房小翻新,厨房局部装修,厨房省钱翻新,温哥华厨房改造,厨房更新不换橱柜' WHERE id = '0551ee30-6d01-46d2-854f-c13ffdeb6985' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== 71c9b551 =====================
-- slug: vancouver-reno-kitchen-or-bathroom-2026-test2
-- title_zh: 温哥华装修：先装修厨房还是卫生间？
-- focus_keyword_en: kitchen vs bathroom vancouver
UPDATE blog_posts SET seo_keywords_zh = '温哥华厨房vs卫生间,温哥华装修顺序,先装修厨房还是浴室,厨房翻新还是浴室翻新,温哥华装修规划' WHERE id = '71c9b551-2fd2-4bba-968e-3a7c9b0200f6' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== 79dc1aa5 =====================
-- slug: kitchen-layout-planning-vancouver-2026
-- title_zh: 温哥华厨房布局规划 2026:走廊型、L 型、U 型与中岛(真实造价)
-- focus_keyword_en: kitchen layout planning Vancouver
UPDATE blog_posts SET seo_keywords_zh = '温哥华厨房布局,厨房布局规划,走廊型厨房,L型厨房,U型厨房,厨房中岛设计,温哥华厨房设计' WHERE id = '79dc1aa5-4fb6-4524-b78a-3eea035a7cd1' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== dfb2f7ef =====================
-- slug: bathroom-renovation-cost-richmond-bc-2026
-- title_zh: 列治文浴室装修费用（2026）：真实项目数据
-- focus_keyword_en: bathroom renovation richmond
UPDATE blog_posts SET seo_keywords_zh = '列治文浴室翻新,列治文卫生间装修,浴室翻新费用, Richmond浴室装修,浴室翻新价格' WHERE id = 'dfb2f7ef-af63-46b2-97bb-8e6b7aa15d4f' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== f771b876 =====================
-- slug: bathroom-renovation-planning-guide-vancouver
-- title_zh: 温哥华浴室装修规划完整指南：2025年版
-- focus_keyword_en: bathroom renovation vancouver
UPDATE blog_posts SET seo_keywords_zh = '温哥华浴室装修,浴室翻新规划,温哥华卫生间改造,浴室装修步骤,浴室翻新指南' WHERE id = 'f771b876-3164-471a-9ede-b20864cc039b' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== ea66766b =====================
-- slug: vancouver-reno-kitchen-bathroom-2026-final
-- title_zh: 温哥华装修：先装修厨房还是卫生间？2026年完整对比指南
-- focus_keyword_en: test
UPDATE blog_posts SET seo_keywords_zh = '温哥华厨房vs卫生间,温哥华装修顺序,先装修厨房还是浴室,厨房翻新还是浴室翻新,温哥华装修规划,厨房vs浴室对比' WHERE id = 'ea66766b-c230-4cb4-9fd8-8fb86e7bdb2f' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== f622fd93 =====================
-- slug: quartz-vs-granite-countertops-vancouver-2026
-- title_zh: 温哥华厨房石英石 vs 花岗岩台面对比指南（2026）
-- focus_keyword_en: quartz vs granite countertops vancouver
UPDATE blog_posts SET seo_keywords_zh = '温哥华台面材料,石英石vs花岗岩,厨房台面选择,温哥华石英石台面,花岗岩台面,石材台面对比' WHERE id = 'f622fd93-13b9-409e-865d-fa96b671a0ae' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== c88b22eb =====================
-- slug: kitchen-vs-bathroom-reno-vancouver-2026
-- title_zh: 温哥华装修：先装修厨房还是卫生间？2026年完整对比指南
-- focus_keyword_en: kitchen vs bathroom vancouver
UPDATE blog_posts SET seo_keywords_zh = '温哥华厨房vs卫生间,温哥华装修顺序,先装修厨房还是浴室,厨房翻新还是浴室翻新,温哥华装修规划,厨房vs浴室对比' WHERE id = 'c88b22eb-13c7-45f6-9597-4a6852742c54' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== 89bce1b4 =====================
-- slug: richmond-home-renovation-guide-2026
-- title_zh: 列治文装修翻新2026：费用、许可证与社区指南
-- focus_keyword_en: richmond home renovation
UPDATE blog_posts SET seo_keywords_zh = '列治文房屋翻新,列治文装修,列治文装修费用,列治文翻新指南,列治文装修许可证' WHERE id = '89bce1b4-e13a-4c59-904f-8bd927e64718' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== 7e9ebc6a =====================
-- slug: renovation-insurance-guide-bc
-- title_zh: BC省装修保险指南：您需要哪些保障？
-- focus_keyword_en: renovation insurance bc
UPDATE blog_posts SET seo_keywords_zh = 'BC装修保险,装修保险,BC省装修,装修工程保险,家居装修保险' WHERE id = '7e9ebc6a-c64a-4d33-8c0f-e3f3cddc31a6' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== 6567c57b =====================
-- slug: pre-sale-renovation-maple-ridge-bc-2026
-- title_zh: 2026年枫树岭Maple Ridge预售翻新：出售前增值完全指南
-- focus_keyword_en: pre-sale renovation maple ridge
UPDATE blog_posts SET seo_keywords_zh = 'Maple Ridge预售翻新,枫树岭装修,预售前翻新,房屋增值装修,枫树岭房产翻新' WHERE id = '6567c57b-8813-4894-b5b7-b69a51295d1a' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== 8ca7f563 =====================
-- slug: kitchen-lighting-design-vancouver-2026
-- title_zh: 厨房灯光设计指南(温哥华 2026):三层照明系统、真实造价与项目示例
-- focus_keyword_en: kitchen lighting design Vancouver
UPDATE blog_posts SET seo_keywords_zh = '温哥华厨房灯光,厨房照明设计,厨房灯光布局,温哥华厨房设计,三层照明系统' WHERE id = '8ca7f563-7ff3-4f3d-b9ae-8f9f38dc05b1' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== 85e1092d =====================
-- slug: spring-renovation-checklist-vancouver-2026
-- title_zh: 2026年温哥华春季装修备忘录：现在就要开始规划
-- focus_keyword_en: spring renovation checklist Vancouver 2026
UPDATE blog_posts SET seo_keywords_zh = '温哥华春季装修,装修清单,春季装修规划,温哥华装修准备,装修检查清单' WHERE id = '85e1092d-8839-4ee7-b75b-45dda0e1be6c' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== a9e5498d =====================
-- slug: hardwood-vs-laminate-vs-lvp-flooring-vancouver-comparison
-- title_zh: 实木地板vs强化地板vs LVP：温哥华2026年地板对比完整指南
-- focus_keyword_en: hardwood vs laminate vs lvp vancouver
UPDATE blog_posts SET seo_keywords_zh = '温哥华地板选择,实木地板vs强化地板,温哥华LVP地板,木地板对比,地板材料比较' WHERE id = 'a9e5498d-341a-4a4d-8f08-79f1a3f37639' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== a023b2f9 =====================
-- slug: aging-in-place-renovation-guide-bc
-- title_zh: 居家养老装修指南：BC省无障碍住宅改造（2026）
-- focus_keyword_en: aging in place renovation BC
UPDATE blog_posts SET seo_keywords_zh = 'BC省居家养老装修,无障碍住宅改造,老年家居翻新,居家养老改造,BC装修' WHERE id = 'a023b2f9-503b-4173-aa52-91a61971aee3' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== f1b954ac =====================
-- slug: metro-vancouver-renovation-cost-index-july-2023
-- title_zh: 大温哥华地区装修成本指数 — 2023 年 7 月
-- focus_keyword_en: vancouver renovation cost july 2023
UPDATE blog_posts SET seo_keywords_zh = '温哥华装修成本,大温地区装修指数,装修费用参考,温哥华翻新价格,装修成本指数' WHERE id = 'f1b954ac-113c-4822-9339-c3e73d7f6bb2' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== 3544e852 =====================
-- slug: condo-kitchen-renovation-vancouver-space-saving-ideas
-- title_zh: 温哥华公寓厨房装修：$35K以内节省空间设计方案（2026）
-- focus_keyword_en: condo kitchen renovation vancouver
UPDATE blog_posts SET seo_keywords_zh = '温哥华公寓厨房,公寓装修,小户型厨房设计,公寓厨房翻新,温哥华公寓改造' WHERE id = '3544e852-c895-419f-882e-20ff9449adf3' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

-- ===================== b0d59760 =====================
-- slug: open-concept-kitchen-vancouver-load-bearing-wall-cost
-- title_zh: 温哥华开放式厨房：承重墙、费用与建筑许可证全指南（2026）
-- focus_keyword_en: open concept kitchen vancouver
UPDATE blog_posts SET seo_keywords_zh = '温哥华开放式厨房,承重墙拆除,开放式厨房费用,温哥华厨房许可证,厨房拆墙装修' WHERE id = 'b0d59760-e2eb-4a10-98b0-a8c8a94ff583' AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
