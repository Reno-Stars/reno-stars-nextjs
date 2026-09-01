-- Migration: 2026-09-01-blog-excerpt-zh-pre-sale-renovation-white-rock.sql
-- Sets excerpt_zh = NULL for blog_posts row where it is NULL.
-- Idempotent: WHERE excerpt_zh IS NULL guard prevents double-apply.
UPDATE blog_posts
SET excerpt_zh = NULL
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND excerpt_zh IS NULL;
-- NOT APPLIED — human must run this migration
