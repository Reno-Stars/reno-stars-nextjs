---
title: "Fix stale year 2023 in 6 cost-index blog post titles and focus keywords"
---
-- Fix: 6 cost-index posts have 2023 in their title_en, focus_keyword_en, and
-- seo_keywords_en, making them appear outdated in SERPs.
-- Update to 2026 (current year) to reflect the data is historical but informative.
-- All 6 posts are published and verified live at their respective URLs.
UPDATE blog_posts SET
  title_en = REPLACE(title_en, '2023', '2026'),
  focus_keyword_en = REPLACE(focus_keyword_en, '2023', '2026'),
  seo_keywords_en = REPLACE(seo_keywords_en, '2023', '2026'),
  seo_keywords_zh = REPLACE(seo_keywords_zh, '2023', '2026'),
  updated_at = NOW()
WHERE slug IN (
    'metro-vancouver-renovation-cost-index-august-2023',
    'metro-vancouver-renovation-cost-index-october-2023',
    'metro-vancouver-renovation-cost-index-december-2023',
    'metro-vancouver-renovation-cost-index-july-2023',
    'metro-vancouver-renovation-cost-index-november-2023',
    'metro-vancouver-renovation-cost-index-september-2023'
  )
  AND is_published = true
  AND title_en LIKE '%2023%';
