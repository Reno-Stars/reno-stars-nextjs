-- Migration: repair 73 broken featured images on published blog posts.
--   pnpm db:query -f scripts/migrations/2026-09-11-featured-image-404s.sql
--
-- 75 of 313 published featured images returned 404. 73 share one cause: the
-- stored URL carries a duplicated "/reno-stars" path segment that the R2 bucket
-- does not have, e.g.
--     404  .../reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg
--     200  .../uploads/admin/social-ready-hero-mmpd6cyz.jpg
--
-- DO NOT turn this into a blanket regexp_replace. 123 published posts carry
-- that prefix and only 73 are broken: the other 50 RESOLVE at the prefixed path
-- and 404 without it. A "clean" rule would fix 73 and break 50 — a net loss.
-- Every row below was verified with a live HEAD request on both forms.
--
-- Also note the filename "socail-ready-hero-..." is NOT a typo to correct: that
-- misspelling is the real object name in R2. Fixing the spelling 404s it.
--
-- NOT covered here (2 posts, different causes, need a human):
--   bathroom-renovation-maple-ridge-2026            object missing from R2 entirely
--   whole-house-renovation-process-steps-vancouver  points at reno-stars-cdn.example.com

UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'burnaby-home-renovation-guide-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'cabinet-refinishing-burnaby-cost-guide' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'cabinet-refinishing-delta-cost-guide' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'cabinet-refinishing-new-westminster-cost-guide' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'cabinet-refinishing-north-vancouver-cost-guide' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'cabinet-refinishing-port-coquitlam-cost-guide' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'cabinet-refinishing-richmond-cost-guide' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'cabinet-refinishing-surrey-cost-guide' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'cabinet-refinishing-vancouver-cost-guide' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'cabinet-refinishing-west-vancouver-cost-guide' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'cabinet-refinishing-white-rock-cost-guide' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'condo-renovation-delta-bc-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'condo-renovation-new-westminster-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'condo-renovation-north-vancouver-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'condo-renovation-surrey-bc-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'coquitlam-home-renovation-guide-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'delta-home-renovation-guide-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/socail-ready-hero-mmwlwyk0.jpg'
 WHERE slug = 'kitchen-renovation-coquitlam-bc-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/socail-ready-hero-mmwlwyk0.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/socail-ready-hero-mmwlwyk0.jpg'
 WHERE slug = 'kitchen-renovation-langley-bc-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/socail-ready-hero-mmwlwyk0.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/socail-ready-hero-mmwlwyk0.jpg'
 WHERE slug = 'kitchen-renovation-maple-ridge-bc-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/socail-ready-hero-mmwlwyk0.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/socail-ready-hero-mmwlwyk0.jpg'
 WHERE slug = 'kitchen-renovation-new-westminster-bc-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/socail-ready-hero-mmwlwyk0.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/socail-ready-hero-mmwlwyk0.jpg'
 WHERE slug = 'kitchen-renovation-port-coquitlam-bc-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/socail-ready-hero-mmwlwyk0.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/socail-ready-hero-mmwlwyk0.jpg'
 WHERE slug = 'kitchen-renovation-port-moody-bc-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/socail-ready-hero-mmwlwyk0.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/socail-ready-hero-mmwlwyk0.jpg'
 WHERE slug = 'kitchen-renovation-surrey-bc-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/socail-ready-hero-mmwlwyk0.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/socail-ready-hero-mmwlwyk0.jpg'
 WHERE slug = 'kitchen-renovation-vancouver-bc-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/socail-ready-hero-mmwlwyk0.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'langley-home-renovation-guide-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'maple-ridge-home-renovation-guide-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-april-2024' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-april-2025' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-april-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-august-2023' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-august-2024' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-august-2025' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-december-2023' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-december-2024' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-december-2025' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-february-2024' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-february-2025' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-february-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-january-2024' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-january-2025' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-january-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-july-2023' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-july-2024' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-july-2025' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-june-2024' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-june-2025' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-june-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-march-2024' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-march-2025' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-march-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-may-2024' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-may-2025' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-may-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-november-2023' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-november-2024' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-november-2025' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-october-2023' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-october-2024' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-october-2025' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-september-2023' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-september-2024' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmpd6cyz.jpg'
 WHERE slug = 'metro-vancouver-renovation-cost-index-september-2025' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmpd6cyz.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'new-westminster-home-renovation-guide-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'port-coquitlam-home-renovation-guide-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'port-moody-home-renovation-guide-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'richmond-home-renovation-guide-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'shower-renovation-cost-vancouver-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'surrey-home-renovation-guide-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmmrrp3p.png'
 WHERE slug = 'surrey-renovation-permits-guide-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmmrrp3p.png';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'vancouver-home-renovation-guide-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'west-vancouver-home-renovation-guide-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmy5qva3.jpg'
 WHERE slug = 'white-rock-home-renovation-guide-2026' AND featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/reno-stars/uploads/admin/social-ready-hero-mmy5qva3.jpg';
