-- Migration: Populate excerpt_zh for pre-sale-renovation-white-rock-bc-2026
-- NOT YET APPLIED — run manually against the database
-- Row: id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
-- Other non-en locale excerpt columns have already been backfilled by prior migrations.
-- Human must apply with: psql $DB_URL -f scripts/migrations/2026-08-31-blog-excerpt-zh-pre-sale-white-rock.sql

-- =============================================================================
-- This migration is idempotent: the WHERE guard ensures it only touches the one
-- published blog post whose excerpt_zh is NULL, and it is guarded by id so it
-- cannot affect any other row.
-- =============================================================================

UPDATE blog_posts
SET
  excerpt_zh = '"'"'怀特罗克White Rock 2026年预售翻新投资回报指南：厨房、浴室、海滨外观提升项目，回报率150%至300%。面向Semiahmoo和Ocean Park卖家的实用翻新方案。'"'"',
  updated_at = NOW()
WHERE
  id = '"'"'34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'"'"'
  AND is_published = true
  AND excerpt_zh IS NULL;
