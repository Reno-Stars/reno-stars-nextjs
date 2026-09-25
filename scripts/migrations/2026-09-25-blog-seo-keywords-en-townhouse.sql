---
title: "Migrate blog_posts seo_keywords_en for townhouse-reno-vancouver-2026 (1 row)"
---
UPDATE blog_posts
SET
  seo_keywords_en = 'townhouse renovation strata rules Vancouver, townhouse renovation permits BC, strata renovation requirements, Vancouver townhouse renovation costs, Metro Vancouver townhouse renovation'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND is_published = true
  AND seo_keywords_en IS NULL;
