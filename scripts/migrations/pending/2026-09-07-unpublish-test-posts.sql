-- Migration: blog_posts — unpublish 3 published test posts
-- Date: 2026-09-07
-- Status: NOT APPLIED — needs human to run
-- Reason: these are placeholder/test posts with generic titles and thin content.
--   Publishing them hurts SEO quality signals and wastes crawl budget.
--   is_published=false keeps them in the DB for reference; they stop appearing on the live blog.
-- Idempotent: WHERE is_published=true guard prevents unnecessary writes.

UPDATE blog_posts SET is_published = false WHERE slug = 'test-full-2026-09-05' AND is_published = true;
UPDATE blog_posts SET is_published = false WHERE slug = 'test-rich-formatting-2026' AND is_published = true;
UPDATE blog_posts SET is_published = false WHERE slug = 'townhouse-renovation-strata-rules-vancouver-2026' AND is_published = true;
