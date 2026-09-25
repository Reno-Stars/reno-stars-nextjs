---
title: "Fix stale year in 12 cost-index blog post titles (2024 → 2026)"
---
-- Ladder 3/4: 12 published cost-index blog posts have 2024 in their title_en,
-- focus_keyword_en, and seo_keywords_en, making them appear outdated in SERPs.
-- The 2023 batch was partially fixed by a prior migration that only targeted 6 slugs
-- and appears to not have applied. This batch covers ALL remaining stale 2024 slugs.
-- All posts verified published in DB.
UPDATE blog_posts SET
  title_en = REPLACE(title_en, '2024', '2026'),
  focus_keyword_en = REPLACE(focus_keyword_en, '2024', '2026'),
  seo_keywords_en = REPLACE(seo_keywords_en, '2024', '2026'),
  seo_keywords_zh = REPLACE(seo_keywords_zh, '2024', '2026'),
  updated_at = NOW()
WHERE slug IN (
    'metro-vancouver-renovation-cost-index-april-2024',
    'metro-vancouver-renovation-cost-index-august-2024',
    'metro-vancouver-renovation-cost-index-december-2024',
    'metro-vancouver-renovation-cost-index-february-2024',
    'metro-vancouver-renovation-cost-index-january-2024',
    'metro-vancouver-renovation-cost-index-july-2024',
    'metro-vancouver-renovation-cost-index-june-2024',
    'metro-vancouver-renovation-cost-index-march-2024',
    'metro-vancouver-renovation-cost-index-may-2024',
    'metro-vancouver-renovation-cost-index-november-2024',
    'metro-vancouver-renovation-cost-index-october-2024',
    'metro-vancouver-renovation-cost-index-september-2024'
  )
  AND is_published = true
  AND title_en LIKE '%2024%';
