-- Migration: fix placeholder title_zh on two test blog_posts
-- NOT APPLIED — needs human to run
-- This corrects rows where title_zh contains English-only placeholder text
UPDATE blog_posts
SET
  title_zh = CASE
    WHEN slug = 'townhouse-renovation-strata-rules-vancouver-2026'
      THEN '溫哥華城市屋苑裝修：Strata 規則、許可證和業主須知 2026'
    WHEN slug = 'test-rich-formatting-2026'
      THEN '測試：多格式部落格文章 2026'
    ELSE title_zh
  END
WHERE slug IN ('townhouse-renovation-strata-rules-vancouver-2026', 'test-rich-formatting-2026')
  AND title_zh !~ '[一-鿿]';
