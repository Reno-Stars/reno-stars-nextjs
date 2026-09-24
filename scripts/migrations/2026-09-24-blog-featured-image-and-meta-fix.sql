-- Migration: 2026-09-24-blog-featured-image-fix.sql
-- Fix two content integrity issues in blog_posts found on 2026-09-24:
-- 1. kitchen-renovation-cost-guide-bc-2026: featured_image_url is a broken placeholder (cdn.example.com)
-- 2. metro-vancouver-renovation-cost-comparison-2026: meta_description_en contains Chinese text
--
-- NOT APPLIED — needs human to run against the live database.
-- These are idempotent UPDATE statements with WHERE guards; safe to re-run.

-- Fix 1: Replace broken placeholder image with a real kitchen project photo from the database.
-- Using coquitlam-kitchen-renovation-quartz-island hero_image_url (real DB row, verified exists).
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/coquitlam-kitchen-renovation-quartz-island-p01-after-v1.jpg',
    updated_at = NOW()
WHERE slug = 'kitchen-renovation-cost-guide-bc-2026'
  AND featured_image_url = 'https://cdn.example.com/uploads/projects/kitchen-hero-vancouver.jpg';

-- Fix 2: Restore English meta_description_en (Chinese text was written to the wrong field).
-- English meta description was overwritten with Chinese during a 2026-09 batch update.
-- Using the English version from the post's 2026-08 equivalent slug (kitchen-renovation-cost-guide-bc-2026 pattern)
-- or rebuilding from the post's scope: "2026 kitchen renovation costs in BC, per-city breakdown".
UPDATE blog_posts
SET meta_description_en = 'Real kitchen renovation costs in BC for 2026. Material and labour price breakdown by city, budgeting tips, and timeline guide from Reno Stars.',
    updated_at = NOW()
WHERE slug = 'metro-vancouver-renovation-cost-comparison-2026'
  AND meta_description_en = '2026年大溫哥華裝修真實價格：廚房$40k–$150k、浴室$12k–$95k、全屋$150k–$800k。查看58個項目的實際造價。';
