/*
 * Migration: Deduplicate focus_keyword_zh for 18 keyword clusters.
 * Run: pnpm db:query -f scripts/migrations/2026-09-29-focus-keyword-zh-dedup.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Strategy: keep the most general post's keyword unchanged;
 * give each secondary post a distinct Chinese keyword reflecting its angle.
 */

BEGIN;

-- === 温哥华厨房装修 (4 → keep kitch-ren-vancouver-bc-2026 as general) ===
UPDATE blog_posts
SET focus_keyword_zh = '温哥华厨房装修案例'
WHERE slug = 'vancouver-kitchen-renovation-case-study'
  AND focus_keyword_zh = '温哥华厨房装修';

UPDATE blog_posts
SET focus_keyword_zh = '温哥华全面厨房装修案例'
WHERE slug = 'vancouver-kitchen-renovation-case-study-2'
  AND focus_keyword_zh = '温哥华厨房装修';

UPDATE blog_posts
SET focus_keyword_zh = '温哥华预算与豪华厨房装修对比'
WHERE slug = 'budget-vs-luxury-kitchen-renovation-vancouver-2026'
  AND focus_keyword_zh = '温哥华厨房装修';

-- === 温哥华地下室装修 (3 → keep basement-renovation-vancouver-2026-costs-permits as general) ===
UPDATE blog_posts
SET focus_keyword_zh = '温哥华地下室装修完整指南'
WHERE slug = 'basement-renovation-vancouver-complete-guide'
  AND focus_keyword_zh = '温哥华地下室装修';

UPDATE blog_posts
SET focus_keyword_zh = '温哥华地下室与主层装修对比'
WHERE slug = 'basement-vs-main-floor-renovation-vancouver-2026'
  AND focus_keyword_zh = '温哥华地下室装修';

-- === 温哥华厨房装修费用 (3 → keep kitchen-renovation-cost-vancouver-2026 as general) ===
UPDATE blog_posts
SET focus_keyword_zh = '温哥华厨房装修费用华人指南'
WHERE slug = 'vancouver-kitchen-renovation-cost-zh'
  AND focus_keyword_zh = '温哥华厨房装修费用';

UPDATE blog_posts
SET focus_keyword_zh = '温哥华厨房装修费用指南2026'
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND focus_keyword_zh = '温哥华厨房装修费用';

-- === 列治文全屋装修 (3 → keep richmond-whole-house-renovation-case-study-3 as general: minimalist is most distinctive) ===
UPDATE blog_posts
SET focus_keyword_zh = '列治文全屋装修现代化改造'
WHERE slug = 'richmond-whole-house-renovation-case-study'
  AND focus_keyword_zh = '列治文全屋装修';

UPDATE blog_posts
SET focus_keyword_zh = '列治文全屋装修女儿浴室翻新'
WHERE slug = 'richmond-whole-house-renovation-case-study-2'
  AND focus_keyword_zh = '列治文全屋装修';

-- === 西溫哥華浴室翻新 (2 → keep bathroom-renovation-west-vancouver-2026 as general) ===
UPDATE blog_posts
SET focus_keyword_zh = '西溫哥華雙浴室翻新案例'
WHERE slug = 'west-vancouver-two-bathroom-renovation-2026'
  AND focus_keyword_zh = '西溫哥華浴室翻新';

-- === 温哥华装修费用 (2 → keep vancouver-renovation-cost-2026 as general) ===
UPDATE blog_posts
SET focus_keyword_zh = '大温哥华装修费用报告2026'
WHERE slug = 'metro-vancouver-renovation-cost-report-2026'
  AND focus_keyword_zh = '温哥华装修费用';

-- === 社交准备厨房装修 (2 → keep case-study-3 as general) ===
UPDATE blog_posts
SET focus_keyword_zh = '社交厨房装修案例研究'
WHERE slug = 'social-ready-kitchen-renovation-case-study-2'
  AND focus_keyword_zh = '社交准备厨房装修';

-- === 温哥华商业装修 (2 → keep commercial-renovation-vancouver-metro-2026 as general) ===
UPDATE blog_posts
SET focus_keyword_zh = '温哥华皮肤实验室装修案例'
WHERE slug = 'vancouver-skin-lab-renovation-case-study'
  AND focus_keyword_zh = '温哥华商业装修';

-- === 素里厨房翻新 (2 → keep comprehensive-kitchen-renovation-surrey as general) ===
UPDATE blog_posts
SET focus_keyword_zh = '素里厨房翻新案例研究'
WHERE slug = 'surrey-kitchen-renovation-case-study'
  AND focus_keyword_zh = '素里厨房翻新';

-- === 素里全屋装修 (2 → keep case-study-2 as general: "transforming a Surrey Home" is broader) ===
UPDATE blog_posts
SET focus_keyword_zh = '素里全屋装修现代转变'
WHERE slug = 'surrey-whole-house-renovation-case-study'
  AND focus_keyword_zh = '素里全屋装修';

-- === 温哥华装修公司怎么选 (2 → keep how-to-choose-renovation-company-zh as general: Chinese homeowners guide is broader) ===
UPDATE blog_posts
SET focus_keyword_zh = '温哥华选装修承包商指南'
WHERE slug = 'how-to-choose-renovation-contractor-vancouver'
  AND focus_keyword_zh = '温哥华装修公司怎么选';

-- === 枫树岭厨房翻新 (2 → keep kitchen-renovation-maple-ridge-bc-2026 as general: costs/neighbourhoods/permits is broader) ===
UPDATE blog_posts
SET focus_keyword_zh = '枫树岭厨房浴室翻新费用指南'
WHERE slug = 'kitchen-bathroom-renovation-maple-ridge-2026'
  AND focus_keyword_zh = '枫树岭厨房翻新';

-- === 温哥华露台装修 (2 → keep patio as general: deck has its own separate kw) ===
UPDATE blog_posts
SET focus_keyword_zh = '温哥华Deck露台装修费用许可'
WHERE slug = 'deck-renovation-vancouver-2026-costs-permits'
  AND focus_keyword_zh = '温哥华露台装修';

-- === 溫哥華裝修師傅 (2 → keep vancouver-renovation-contractor-questions-2026 as general: "必問問題" is broader) ===
UPDATE blog_posts
SET focus_keyword_zh = '溫哥華裝修師傅怎麼找'
WHERE slug = 'how-to-hire-a-renovation-contractor-in-vancouver-2026'
  AND focus_keyword_zh = '溫哥華裝修師傅';

-- === 西温哥华厨房翻新 (2 → keep kitchen-renovation-west-vancouver-2026 as general: luxury costs is broader) ===
UPDATE blog_posts
SET focus_keyword_zh = '西温哥华时尚厨房白色橱柜装修'
WHERE slug = 'stylish-kitchen-renovation-with-white-cabinets-and-gold-handles'
  AND focus_keyword_zh = '西温哥华厨房翻新';

-- === 高贵林公寓装修 (2 → keep coquitlam-condo-whole-house as general: whole-house is more specific scope; keep as-is for primary, give case-study-2 a distinct angle) ===
UPDATE blog_posts
SET focus_keyword_zh = '高贵林公寓装修准备出售案例'
WHERE slug = 'coquitlam-condo-renovation-case-study-2'
  AND focus_keyword_zh = '高贵林公寓装修';

-- === 列治文浴室装修工期 (2 → keep bathroom-renovation-timeline-richmond-2026 as general: 2024-2026 is broader timespan) ===
UPDATE blog_posts
SET focus_keyword_zh = '列治文浴室装修工期2026真实项目'
WHERE slug = 'bathroom-renovation-timeline-richmond-bc-2026'
  AND focus_keyword_zh = '列治文浴室装修工期';

-- === 列治文卫生间翻新 (2 → keep daughters-bathroom-renovation-with-gray-tiles-and-black-fixtures as general: daughter bathroom is more specific story) ===
UPDATE blog_posts
SET focus_keyword_zh = '列治文双卫生间特色PowderRoom翻新'
WHERE slug = 'dual-bathroom-renovation-with-unique-powder-room'
  AND focus_keyword_zh = '列治文卫生间翻新';

COMMIT;
