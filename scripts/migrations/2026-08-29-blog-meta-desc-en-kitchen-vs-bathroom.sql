-- Migration: 2026-08-29 blog meta_description_en — kitchen-vs-bathroom-reno-vancouver-2026
-- Date: 2026-08-29
-- Status: NOT APPLIED — human action required
-- Topic: Fix thin meta_description_en (29 chars) on one published blog post
-- IDs covered: (by slug: kitchen-vs-bathroom-reno-vancouver-2026)
--
-- Source: DB query WHERE length(meta_description_en) < 50 AND is_published = true
-- Row count: 1
-- Post has 1,000+ words of substantive content. Description was a stub.
--
-- Proposed meta_description_en (156 chars):
-- "Kitchen vs bathroom renovation in Vancouver: cost comparison ($28K–$55K vs $15K–$45K),
--   ROI analysis, and a 7-factor decision framework to choose which project to do first."

UPDATE blog_posts
SET meta_description_en = 'Kitchen vs bathroom renovation in Vancouver: cost comparison ($28K–$55K vs $15K–$45K), ROI analysis, and a 7-factor decision framework to choose which project to do first.'
WHERE slug = 'kitchen-vs-bathroom-reno-vancouver-2026'
  AND is_published = true;
