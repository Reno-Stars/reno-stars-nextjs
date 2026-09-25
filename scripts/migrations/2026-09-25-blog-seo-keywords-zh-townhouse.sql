-- Migration: 2026-09-25-blog-seo-keywords-zh-townhouse.sql
-- Fix blog_posts.seo_keywords_zh NULL for townhouse-reno-vancouver-2026.
-- The existing 2026-09-14 migration fixed seo_keywords_en only.
-- This migration fixes seo_keywords_zh for the same row.
-- Idempotent UPDATE with WHERE slug guard; only fires when NULL.
-- NOT APPLIED — needs human to run against the live database.
--
-- title_en: "Townhouse Renovation in Metro Vancouver Strata Rules and Permits 2026"
-- focus_keyword_zh: "聯排別墅翻新"
UPDATE blog_posts
SET seo_keywords_zh = '聯排別墅翻新 溫哥華, 溫哥華聯排別墅裝修, BC省分契裝修規定, 聯排別墅裝修許可, 分契審批流程, 聯排別墅翻新費用 溫哥華, 2026年聯排別墅翻新, 分契投票要求, 聯排別墅翻新規則, 溫哥華聯排別墅改造'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
