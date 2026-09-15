-- Migration: 2026-09-15-blog-seo-keywords-townhouse-reno-vancouver.sql
-- Task: Ladder 1 — Content integrity, blog_posts.seo_keywords_zh/en NULL for published post
-- NOT APPLIED — needs human to run and verify
UPDATE blog_posts
SET
  seo_keywords_en = 'townhouse renovation, strata rules Vancouver, Metro Vancouver townhouse, strata approval BC, townhouse permits, townhouse renovation permit Vancouver, BC strata renovation, townhouse common property, strata renovation vote',
  seo_keywords_zh = '聯排別墅翻新, 共管物業規定溫哥華, 大溫聯排別墅, BC共管物業批准, 聯排別墅許可證, 溫哥華聯排別墅翻新許可證, BC共管物業翻新, 聯排別墅公共區域, 共管物業翻新投票'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND is_published = true
  AND (seo_keywords_en IS NULL OR seo_keywords_zh IS NULL);
