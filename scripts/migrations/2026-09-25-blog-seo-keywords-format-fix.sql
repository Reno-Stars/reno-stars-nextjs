-- Migration: 2026-09-25-blog-seo-keywords-format-fix.sql
-- Target: blog_posts with seo_keywords not comma-delimited (STOP condition, >= 3 rows)
-- seoKeywordsEn/seoKeywordsZh must be COMMA-DELIMITED STRINGS per schema requirement.
-- Run: pnpm db:query -f scripts/migrations/2026-09-25-blog-seo-keywords-format-fix.sql

-- Fix 1: bathroom-waterproofing-metro-vancouver-2026 — seo_keywords_en uses pipe instead of comma
UPDATE blog_posts
SET seo_keywords_en = 'bathroom waterproofing metro vancouver, Schluter-Kerdi waterproofing, BC building code bathroom, hot mop roofing'
WHERE slug = 'bathroom-waterproofing-metro-vancouver-2026'
  AND seo_keywords_en = 'bathroom waterproofing metro vancouver | Schluter-Kerdi waterproofing | BC build';

-- Fix 2: adu-renovation-vancouver-2026 — seo_keywords_zh uses Chinese comma (、) instead of ASCII comma (,)
UPDATE blog_posts
SET seo_keywords_zh = '温哥华 ADU 翻新, SSMUH 附例, 地下室套房, 后巷屋, 多用途许可证, 二级套房'
WHERE slug = 'adu-renovation-vancouver-2026'
  AND seo_keywords_zh = '温哥华 adu 翻新、ssmuh 附例、地下室套房、后巷屋、多用途许可证、二级套房';

-- Fix 3: heritage-home-renovation-vancouver-2026 — seo_keywords_zh uses Chinese comma
UPDATE blog_posts
SET seo_keywords_zh = '温哥华遗产住宅翻新, 遗产改建许可证, 特色房屋翻新, 遗产登记, 保护区设计审查, 基斯兰奴翻新, 芒特愉快遗产'
WHERE slug = 'heritage-home-renovation-vancouver-2026'
  AND seo_keywords_zh = '温哥华遗产住宅翻新，遗产改建许可证，特色房屋翻新，遗产登记，保护区设计审查，基斯兰奴翻新，芒特愉快遗产';

-- Fix 4: metro-vancouver-renovation-cost-comparison-2026 — seo_keywords_zh uses Chinese comma
UPDATE blog_posts
SET seo_keywords_zh = '大温哥华装修费用 2026, 温哥华厨房装修造价, 浴室装修真实价格, 全屋装修真实费用'
WHERE slug = 'metro-vancouver-renovation-cost-comparison-2026'
  AND seo_keywords_zh = '大溫哥華裝修費用2026，溫哥華廚房裝修造價，浴室裝修真實價格，全屋裝修真實費用';

-- Fix 5: basement-vs-main-floor-renovation-vancouver-2026 — seo_keywords_zh uses Chinese comma
UPDATE blog_posts
SET seo_keywords_zh = '温哥华地下室装修费用, 主层装修费用, 温哥华装修对比, 套房许可温哥华'
WHERE slug = 'basement-vs-main-floor-renovation-vancouver-2026'
  AND seo_keywords_zh = '温哥华地下室装修费用，主层装修费用，温哥华装修对比，套房许可温哥华';

-- Fix 6: whole-home-renovation-timeline-vancouver-2026 — seo_keywords_zh uses space instead of comma
UPDATE blog_posts
SET seo_keywords_zh = '温哥华装修工期, 整体家居装修, 大温 2026, 许可证, 拆除, 管线'
WHERE slug = 'whole-home-renovation-timeline-vancouver-2026'
  AND seo_keywords_zh = '溫哥華裝修工期 整體家居裝修 大溫 2026 許可證 拆除 管線';

-- Fix 7: bathroom-renovation-cost-langley-bc-2026 — seo_keywords_zh uses Chinese comma
UPDATE blog_posts
SET seo_keywords_zh = '兰利浴室装修费用, BC 省兰利浴室装修价格'
WHERE slug = 'bathroom-renovation-cost-langley-bc-2026'
  AND seo_keywords_zh = '兰利浴室装修费用，BC省兰利浴室装修价格';
