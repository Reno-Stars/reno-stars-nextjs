-- Migration: 2026-09-23
-- Type:    UPDATE (idempotent)
-- Target:  blog_posts.featured_image_url — 8 published posts have NULL
-- Human action required: this file must be run manually against the database.
-- Status:  NOT APPLIED — pending human apply.
--
-- Background:
--   8 published blog posts (all 2026 guide-type posts) have featured_image_url = NULL.
--   These posts were published without featured images set — not caught at publish time
--   because the blog:publish script does not require featured_image_url.
--
-- Image assignment rationale:
--   Generic "social-ready-hero" images from the existing R2 pool, verified present
--   by prior migrations (2026-09-11-featured-image-404s.sql). Topics assigned by
--   thematic relevance; no topic-specific hero exists for ADU/infill/heritage/split-level.
--
--   mmy5qva3.jpg — used by ADU, condo, home-guide, heritage, and general guide posts
--   mmwlwyk0.jpg — used by kitchen renovation posts

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE slug = 'mid-century-rancher-renovation-vancouver-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE slug = 'vancouver-house-renovation-step-by-step-guide-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE slug = 'adu-renovation-vancouver-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE slug = 'split-level-home-renovation-burnaby-coquitlam-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE slug = 'vancouver-infill-development-cost-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE slug = 'vancouver-stair-renovation-cost-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
WHERE slug = 'heritage-home-renovation-vancouver-2026'
  AND featured_image_url IS NULL;

UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmwlwyk0.jpg'
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND featured_image_url IS NULL;
