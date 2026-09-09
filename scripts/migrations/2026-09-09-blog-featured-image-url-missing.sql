-- 2026-09-09-blog-featured-image-url-missing.sql
-- Migration: sets featured_image_url on 11 published blog posts that have no hero image.
-- READ-ONLY agent_ro credential: this file must be RUN BY A HUMAN before it takes effect.
-- NOT applied automatically. Verify ids and urls before running.
-- idempotent WHERE guard ensures re-running after partial apply is safe.

BEGIN;

-- 1. How to Renovate Your House in Vancouver: A First-Timer's Step-by-Step Guide
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND featured_image_url IS NULL;

-- 2. How to Renovate Your House in Vancouver: A First-Timer's Step-by-Step Guide (2026)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '4915068e-8851-46f7-bfdf-628a4603d3fe'
  AND featured_image_url IS NULL;

-- 3. Mid-Century Rancher Renovation Vancouver — 2026 Cost & Character Guide
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = 'e6257f9d-a6fe-43ce-b06f-3a7b4304877b'
  AND featured_image_url IS NULL;

-- 4. Heritage Home Renovation Vancouver — 2026 Permit Guide & Costs
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '2311bd71-d249-4143-8d7f-6dfb439c413c'
  AND featured_image_url IS NULL;

-- 5. ADU Renovation Vancouver — 2026 SSMUH Permit Guide & Real Costs
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
WHERE id = '48e499c1-38a7-4d00-bf54-b1cdd4568506'
  AND featured_image_url IS NULL;

-- 6. Vancouver Infill Development & Lot-Splitting 2026 — Costs & SSMUH Permits
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '17e69f50-74b9-469e-8b87-11d3a4ed74ef'
  AND featured_image_url IS NULL;

-- 7. Split-Level Home Renovation in Burnaby & Coquitlam — 2026 Cost & Layout Guide
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = 'ebafaebf-3060-4dea-8dc3-508be25d95d6'
  AND featured_image_url IS NULL;

-- 8. House vs Condo vs Townhouse Renovation in Vancouver: What's Different in 2026
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND featured_image_url IS NULL;

-- 9. Vancouver Stair Renovation Cost 2026: Real Prices From $3,000 to $45,000
-- No dedicated stair project in portfolio; use whole-house hero as generic fallback.
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE id = 'a16ecf67-c4d4-4343-99a9-c982798e64c1'
  AND featured_image_url IS NULL;

-- 10. Heat Pump Installation in Vancouver (2026): Costs, BC Hydro Rebates, and Real Timelines
-- No dedicated heat-pump/HVAC project in portfolio; use whole-house hero as generic fallback.
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
WHERE id = '094434be-7021-470b-a0c5-13fc680bd92d'
  AND featured_image_url IS NULL;

-- 11. How Much Does a Kitchen Renovation Cost in Vancouver (2026)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mn3v6dib65ec88ce-8.jpg'
WHERE id = 'fbfe62bc-8887-44a0-a6a0-eef892a1e986'
  AND featured_image_url IS NULL;

-- BONUS: backfill excerpt_en for House vs Condo vs Townhouse (same id as above)
UPDATE blog_posts
SET excerpt_en = 'Vancouver homeowners spent $85,000–$380,000 on renovations in 2025. Condos, townhouses, and single-family homes each face different permit rules, Strata restrictions, and budget thresholds. This guide breaks down every difference so you know exactly what your project will cost before you sign a contract.'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (excerpt_en IS NULL OR excerpt_en = '');

COMMIT;
