-- Migration: populate meta_title_zh for two posts where all other SEO fields
-- are covered by 1c8d4f68 but meta_title_zh was accidentally omitted.
--
-- NOT APPLIED — run manually after review:
--   pnpm db:query -f scripts/migrations/2026-09-07-blog-meta-title-zh-fix.sql
--
-- Applies AFTER 2026-09-07-blog-missing-seo-metadata.sql

UPDATE blog_posts SET
  meta_title_zh = '溫哥華房屋裝修步驟指南：首次裝修必讀 | 聚星裝修'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (meta_title_zh IS NULL OR meta_title_zh = '');

UPDATE blog_posts SET
  meta_title_zh = '溫哥華獨立屋、公寓、聯排別墅裝修對比（2026） | 聚星裝修'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (meta_title_zh IS NULL OR meta_title_zh = '');
