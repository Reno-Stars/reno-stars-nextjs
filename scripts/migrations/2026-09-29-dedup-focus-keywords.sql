-- Migration: 2026-09-29-dedup-focus-keywords.sql
-- Fix: 9 remaining focus_keyword_en duplicate groups (2 posts each)
-- Strategy: keep most-general post's keyword unchanged; give each secondary post a distinct long-tail keyword

BEGIN;

-- Group: "bathroom renovation Delta" (2 posts)
-- Keep: comprehensive-bathroom-renovation-delta-bc-case-study (case study = general)
-- Differentiate: two-bathroom-renovation-with-brushed-gold-fixtures
UPDATE blog_posts
SET focus_keyword_en = 'Delta BC bathroom renovation custom fixtures',
    focus_keyword_zh = '三角洲浴室装修定制五金'
WHERE slug = 'two-bathroom-renovation-with-brushed-gold-fixtures'
  AND is_published = true
  AND focus_keyword_en = 'bathroom renovation Delta';

-- Group: "Vancouver renovation permit" (2 posts)
-- Keep: vancouver-renovation-permits-guide-2026 (general guide)
-- Differentiate: vancouver-renovation-permit-checklist-2026
UPDATE blog_posts
SET focus_keyword_en = 'Vancouver renovation permit checklist 2026',
    focus_keyword_zh = '温哥华装修许可清单2026'
WHERE slug = 'vancouver-renovation-permit-checklist-2026'
  AND is_published = true
  AND focus_keyword_en = 'Vancouver renovation permit';

-- Group: "Maple Ridge bathroom renovation" (2 posts)
-- Keep: maple-ridge-bathroom-renovation-case-study (case study = general)
-- Differentiate: maple-ridge-bathroom-renovation-case-study-2
UPDATE blog_posts
SET focus_keyword_en = 'Maple Ridge bathroom renovation custom glass door',
    focus_keyword_zh = '枫树岭浴室装修定制玻璃门'
WHERE slug = 'maple-ridge-bathroom-renovation-case-study-2'
  AND is_published = true
  AND focus_keyword_en = 'Maple Ridge bathroom renovation';

-- Group: "bathroom renovation maple ridge" (2 posts)
-- Keep: bathroom-renovation-maple-ridge-2026 (general 2026 guide)
-- Differentiate: bathroom-renovation-maple-ridge-bc-2026
UPDATE blog_posts
SET focus_keyword_en = 'Bathroom renovation Maple Ridge BC heritage homes 2026',
    focus_keyword_zh = 'BC省枫树岭浴室装修 Heritage Home 2026'
WHERE slug = 'bathroom-renovation-maple-ridge-bc-2026'
  AND is_published = true
  AND focus_keyword_en = 'bathroom renovation maple ridge';

-- Group: "bathroom renovation timeline Richmond" (2 posts)
-- Keep: bathroom-renovation-timeline-richmond-bc-2026 (general BC suffix)
-- Differentiate: bathroom-renovation-timeline-richmond-2026
UPDATE blog_posts
SET focus_keyword_en = 'Richmond BC bathroom renovation timeline guide',
    focus_keyword_zh = '列治文浴室装修时间表指南'
WHERE slug = 'bathroom-renovation-timeline-richmond-2026'
  AND is_published = true
  AND focus_keyword_en = 'bathroom renovation timeline Richmond';

-- Group: "West Vancouver bathroom renovation" (2 posts)
-- Keep: west-vancouver-two-bathroom-renovation-2026 (two-bathroom = more specific)
-- Differentiate: west-vancouver-bathroom-renovation-case-study
UPDATE blog_posts
SET focus_keyword_en = 'West Vancouver whole-house bathroom renovation case study',
    focus_keyword_zh = '西温哥华全屋浴室装修案例'
WHERE slug = 'west-vancouver-bathroom-renovation-case-study'
  AND is_published = true
  AND focus_keyword_en = 'West Vancouver bathroom renovation';

-- Group: "vancouver renovation cost" (2 posts)
-- Keep: vancouver-renovation-cost-2026 (general Vancouver costs)
-- Differentiate: metro-vancouver-renovation-cost-report-2026
UPDATE blog_posts
SET focus_keyword_en = 'Metro Vancouver renovation cost report 2026',
    focus_keyword_zh = '大温哥华地区装修成本报告2026'
WHERE slug = 'metro-vancouver-renovation-cost-report-2026'
  AND is_published = true
  AND focus_keyword_en = 'vancouver renovation cost';

-- Group: "living through renovation Vancouver" (2 posts)
-- Keep: living-through-renovation-vancouver-what-to-expect-2026 (what to expect = general)
-- Differentiate: living-through-renovation-vancouver-guide
UPDATE blog_posts
SET focus_keyword_en = 'Vancouver renovation living guide for homeowners',
    focus_keyword_zh = '温哥华装修居住实用指南'
WHERE slug = 'living-through-renovation-vancouver-guide'
  AND is_published = true
  AND focus_keyword_en = 'living through renovation Vancouver';

-- Group: "basement renovation vancouver" (2 posts)
-- Keep: basement-renovation-vancouver-2026 (general 2026 costs/permits)
-- Differentiate: basement-renovation-vancouver-complete-guide
UPDATE blog_posts
SET focus_keyword_en = 'Basement renovation Vancouver complete guide 2026',
    focus_keyword_zh = '温哥华地下室装修完整指南2026'
WHERE slug = 'basement-renovation-vancouver-complete-guide'
  AND is_published = true
  AND focus_keyword_en = 'basement renovation vancouver';

COMMIT;
