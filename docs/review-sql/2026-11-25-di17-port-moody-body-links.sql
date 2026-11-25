-- =============================================================================
-- REVIEW ONLY - NOT EXECUTED - needs Captain/Ryan approval
-- =============================================================================
-- DI-17 follow-up (task 127/134), written 2026-11-25. Nobody has run this
-- against any database. Do not run it without explicit approval.
--
-- What: DB body content still links the nonexistent post
--   /<locale>/blog/port-moody-home-renovation-guide-2026/
-- Since #410 that URL answers a 301 (lib/seo/dead-link-redirects.ts) to
--   /<locale>/blog/whole-house-renovation-port-moody-2026/
-- This SQL rewrites the stored link so the 301 hop disappears. Only the part
-- from "/blog/" onward is replaced, so the locale prefix (/en/, /zh/, /ja/ …)
-- stays exactly as stored.
--
-- Known live occurrences (en HTML checked 2026-11-25 01:12 PT):
--   * Port Moody area page chips (service_areas content_* / localizations)
--   * the "other cities" line in 13 en blog posts: basement-renovations-port-moody,
--     kitchen-renovation-port-moody-bc-2026, pre-sale-renovation-port-moody-bc-2026,
--     kitchen-bathroom-renovation-port-moody-2026, cabinet-resurfacing-port-moody-cost-guide,
--     port-coquitlam-, burnaby-, coquitlam-, langley-, maple-ridge-, new-westminster-,
--     richmond-, surrey-, vancouver-, west-vancouver-, white-rock-home-renovation-guide-2026
--
-- NOT changed by this SQL: /<locale>/services/whole-house/port-moody/ (test A)
-- emits the same link from code (components/pages/ServiceLocationPage.tsx:152).
-- Test A is frozen, so that link stays and keeps answering a 301.
--
-- Columns that can hold body copy (lib/db/schema.ts):
--   blog_posts:    excerpt_en, excerpt_zh, content_en, content_zh, localizations (jsonb)
--   service_areas: description_en, description_zh, content_en, content_zh,
--                  highlights_en, highlights_zh, localizations (jsonb)
--   services:      description_en, description_zh, long_description_en,
--                  long_description_zh, localizations (jsonb)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- (1) READ-ONLY: count rows per table/column that contain the old link
-- ---------------------------------------------------------------------------
SELECT 'blog_posts.excerpt_en'        AS col, count(*) FROM blog_posts    WHERE excerpt_en          LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'blog_posts.excerpt_zh',        count(*) FROM blog_posts    WHERE excerpt_zh          LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'blog_posts.content_en',        count(*) FROM blog_posts    WHERE content_en          LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'blog_posts.content_zh',        count(*) FROM blog_posts    WHERE content_zh          LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'blog_posts.localizations',     count(*) FROM blog_posts    WHERE localizations::text LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'service_areas.description_en', count(*) FROM service_areas WHERE description_en      LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'service_areas.description_zh', count(*) FROM service_areas WHERE description_zh      LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'service_areas.content_en',     count(*) FROM service_areas WHERE content_en          LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'service_areas.content_zh',     count(*) FROM service_areas WHERE content_zh          LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'service_areas.highlights_en',  count(*) FROM service_areas WHERE highlights_en       LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'service_areas.highlights_zh',  count(*) FROM service_areas WHERE highlights_zh       LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'service_areas.localizations',  count(*) FROM service_areas WHERE localizations::text LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'services.description_en',      count(*) FROM services      WHERE description_en      LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'services.description_zh',      count(*) FROM services      WHERE description_zh      LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'services.long_description_en', count(*) FROM services      WHERE long_description_en LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'services.long_description_zh', count(*) FROM services      WHERE long_description_zh LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL SELECT 'services.localizations',       count(*) FROM services      WHERE localizations::text LIKE '%port-moody-home-renovation-guide-2026%';

-- Rows affected, for the record before any change:
SELECT 'blog_posts' AS tbl, slug FROM blog_posts
 WHERE concat_ws(' ', excerpt_en, excerpt_zh, content_en, content_zh, localizations::text) LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL
SELECT 'service_areas', slug FROM service_areas
 WHERE concat_ws(' ', description_en, description_zh, content_en, content_zh, highlights_en, highlights_zh, localizations::text) LIKE '%port-moody-home-renovation-guide-2026%'
UNION ALL
SELECT 'services', slug FROM services
 WHERE concat_ws(' ', description_en, description_zh, long_description_en, long_description_zh, localizations::text) LIKE '%port-moody-home-renovation-guide-2026%';

-- ---------------------------------------------------------------------------
-- (2) WRITE — DO NOT RUN without approval. One transaction; check the counts
--     printed by each UPDATE against (1) before COMMIT, else ROLLBACK.
--     Before running: take a backup of the three tables (pg_dump -t ...).
-- ---------------------------------------------------------------------------
BEGIN;

UPDATE blog_posts SET
  excerpt_en    = REPLACE(excerpt_en,    '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026'),
  excerpt_zh    = REPLACE(excerpt_zh,    '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026'),
  content_en    = REPLACE(content_en,    '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026'),
  content_zh    = REPLACE(content_zh,    '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026'),
  localizations = REPLACE(localizations::text, '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026')::jsonb
WHERE concat_ws(' ', excerpt_en, excerpt_zh, content_en, content_zh, localizations::text) LIKE '%port-moody-home-renovation-guide-2026%';

UPDATE service_areas SET
  description_en = REPLACE(description_en, '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026'),
  description_zh = REPLACE(description_zh, '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026'),
  content_en     = REPLACE(content_en,     '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026'),
  content_zh     = REPLACE(content_zh,     '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026'),
  highlights_en  = REPLACE(highlights_en,  '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026'),
  highlights_zh  = REPLACE(highlights_zh,  '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026'),
  localizations  = REPLACE(localizations::text, '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026')::jsonb
WHERE concat_ws(' ', description_en, description_zh, content_en, content_zh, highlights_en, highlights_zh, localizations::text) LIKE '%port-moody-home-renovation-guide-2026%';

UPDATE services SET
  description_en      = REPLACE(description_en,      '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026'),
  description_zh      = REPLACE(description_zh,      '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026'),
  long_description_en = REPLACE(long_description_en, '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026'),
  long_description_zh = REPLACE(long_description_zh, '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026'),
  localizations       = REPLACE(localizations::text, '/blog/port-moody-home-renovation-guide-2026', '/blog/whole-house-renovation-port-moody-2026')::jsonb
WHERE concat_ws(' ', description_en, description_zh, long_description_en, long_description_zh, localizations::text) LIKE '%port-moody-home-renovation-guide-2026%';

-- Verify: every count from (1) must now be 0 for the "/blog/" form.
-- If anything looks wrong:  ROLLBACK;
-- Otherwise:                COMMIT;
ROLLBACK;  -- default left in place on purpose; change to COMMIT only after approval

-- ---------------------------------------------------------------------------
-- Rollback after a COMMIT: restore the three tables from the backup taken
-- above, or run the inverse REPLACE (whole-house-renovation-port-moody-2026 →
-- port-moody-home-renovation-guide-2026) restricted to the slugs listed by the
-- "rows affected" query in (1). Either way the site keeps working, because the
-- old URL 301s in proxy.ts. Revalidate the affected pages afterwards
-- (POST /api/revalidate) so ISR serves the new copy.
-- =============================================================================
