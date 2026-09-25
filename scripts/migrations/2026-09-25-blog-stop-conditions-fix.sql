-- Migration: 2026-09-25-blog-stop-conditions-fix.sql
-- Target: All active STOP conditions for published blog_posts
-- STOP 1: featured_image_url NULL (8 posts)
-- STOP 2: author NULL (239 posts)
-- STOP 3: reading_time_minutes NULL (3 posts)
-- STOP 4: townhouse-reno-vancouver-2026 missing seo_keywords + author
-- Run: pnpm db:query -f scripts/migrations/2026-09-25-blog-stop-conditions-fix.sql

BEGIN;

-- ============================================================
-- STOP 1: Fix featured_image_url NULL (8 posts)
-- ============================================================
UPDATE blog_posts
SET featured_image_url =
  CASE slug
    WHEN 'mid-century-rancher-renovation-vancouver-2026'
      THEN 'https://images.reno-stars.com/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
    WHEN 'adu-renovation-vancouver-2026'
      THEN 'https://images.reno-stars.com/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
    WHEN 'split-level-home-renovation-burnaby-coquitlam-2026'
      THEN 'https://images.reno-stars.com/delta-kitchen-renovation-apron-sink-quartz-p01-after-v1.jpg'
    WHEN 'vancouver-infill-development-cost-2026'
      THEN 'https://images.reno-stars.com/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
    WHEN 'heritage-home-renovation-vancouver-2026'
      THEN 'https://images.reno-stars.com/richmond-whole-home-renovation-marble-kitchen-p01-after-v1.jpg'
    WHEN 'how-much-does-kitchen-renovation-cost-vancouver-2026'
      THEN 'https://images.reno-stars.com/delta-kitchen-renovation-apron-sink-quartz-p01-after-v1.jpg'
    WHEN 'vancouver-stair-renovation-cost-2026'
      THEN 'https://images.reno-stars.com/social-ready-hero-mmv4zlks.jpg'
    WHEN 'vancouver-house-renovation-step-by-step-guide-2026'
      THEN 'https://images.reno-stars.com/social-ready-hero-mmv4zlks.jpg'
  END
WHERE slug IN (
  'mid-century-rancher-renovation-vancouver-2026',
  'adu-renovation-vancouver-2026',
  'split-level-home-renovation-burnaby-coquitlam-2026',
  'vancouver-infill-development-cost-2026',
  'heritage-home-renovation-vancouver-2026',
  'how-much-does-kitchen-renovation-cost-vancouver-2026',
  'vancouver-stair-renovation-cost-2026',
  'vancouver-house-renovation-step-by-step-guide-2026'
)
AND is_published = true
AND featured_image_url IS NULL;

-- ============================================================
-- STOP 2: Backfill author for ALL published posts (239 NULL)
-- ============================================================
UPDATE blog_posts
SET author = 'Reno Stars'
WHERE is_published = true
AND (author IS NULL OR author = '');

-- ============================================================
-- STOP 3: reading_time_minutes NULL (3 posts)
-- bathroom-timeline-north: 7 min (comparable to surrey 7, vancouver 8)
-- garage-renovation: 9 min (comparable to similar ADU/renovation posts)
-- bathroom-timeline-langley: 7 min (comparable to surrey 7, north 7)
-- ============================================================
UPDATE blog_posts
SET reading_time_minutes =
  CASE slug
    WHEN 'bathroom-renovation-timeline-north-vancouver-2026' THEN 7
    WHEN 'garage-renovation-vancouver-2026' THEN 9
    WHEN 'bathroom-renovation-timeline-langley-bc-2026' THEN 7
  END
WHERE slug IN (
  'bathroom-renovation-timeline-north-vancouver-2026',
  'garage-renovation-vancouver-2026',
  'bathroom-renovation-timeline-langley-bc-2026'
)
AND is_published = true
AND reading_time_minutes IS NULL;

-- ============================================================
-- STOP 4: townhouse-reno-vancouver-2026 missing seo_keywords + author
-- ============================================================
UPDATE blog_posts
SET author = 'Reno Stars',
    seo_keywords_en = 'townhouse renovation Vancouver, Vancouver townhouse renovation cost, strata renovation Vancouver, townhouse renovation permit BC',
    seo_keywords_zh = '镇屋装修温哥华,温哥华镇屋装修费用,分层装修温哥华,BC镇屋装修许可',
    focus_keyword_en = 'townhouse renovation Vancouver',
    focus_keyword_zh = '镇屋装修温哥华'
WHERE slug = 'townhouse-reno-vancouver-2026'
AND is_published = true;

COMMIT;
