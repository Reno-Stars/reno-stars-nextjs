-- Migration: 2026-08-25-pre-sale-renovation-white-rock-excerpt-seo-keywords-zh.sql
-- Target: blog_posts WHERE slug = 'pre-sale-renovation-white-rock-bc-2026'
-- Source: live page HTML at https://www.reno-stars.com/en/blog/pre-sale-renovation-white-rock-bc-2026/
-- Status: published (is_published = true), zh excerpt_zh IS NULL, zh seo_keywords_zh IS NULL
-- NOT YET AUDITED: focus_keyword_zh may also be NULL (needs separate check)
-- Run: pnpm db:query -f scripts/migrations/2026-08-25-pre-sale-renovation-white-rock-excerpt-seo-keywords-zh.sql

BEGIN;

-- excerpt_zh: Chinese translation of the English excerpt
-- English: "Discover what renovations offer the highest ROI for White Rock and South Surrey sellers
--          in 2026 — kitchen, bathroom, flooring and more. Free on-site consultation."
UPDATE blog_posts
SET excerpt_zh = '探索2026年怀特罗克和南素里卖家投资回报率最高的装修项目——厨房、浴室、地板等。免费上门咨询。'
WHERE slug = 'pre-sale-renovation-white-rock-bc-2026'
  AND is_published = true
  AND (excerpt_zh IS NULL OR excerpt_zh = '');

-- seo_keywords_zh: Chinese SEO keywords translated from English source
-- English: "pre-sale renovation White Rock, home staging renovation White Rock,
--           presale renovation White Rock, renovation before selling White Rock,
--           real estate renovation White Rock, home value renovation White Rock"
UPDATE blog_posts
SET seo_keywords_zh = '怀特罗克预售翻新, 怀特罗克家居舞台装修, 怀特罗克预售装修, 售前翻新怀特罗克, 怀特罗克房地产翻新, 怀特罗克房产价值翻新'
WHERE slug = 'pre-sale-renovation-white-rock-bc-2026'
  AND is_published = true
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');

COMMIT;
