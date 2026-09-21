-- Migration: backfill featured_image_url for 9 published blog posts that have none.
-- FIX: corrects slug typos in the 2026-09-21 migration (underscores → hyphens).
-- NOT APPLIED — needs human to run after PR merge.
-- Images sourced from the projects table matching each post's topic.

-- Post: mid-century-rancher-renovation-vancouver-2026
-- Image: modern-kitchen-renovation-richmond (modern/century aesthetic match)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/modern-kitchen-renovation-richmond-hero-mmms482z.jpg'
WHERE slug = 'mid-century-rancher-renovation-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- Post: vancouver-house-renovation-step-by-step-guide-2026
-- Image: vancouver-custom-whole-house-renovation
-- FIX: was 'vancouver-house-renovation_step-by-step-guide-2026' (underscores — never matched)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE slug = 'vancouver-house-renovation-step-by-step-guide-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- Post: adu-renovation-vancouver-2026
-- Image: ensuite-bathroom-renovation-richmond (secondary suite context)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/richmond-whole-house-renovation-three-bathrooms-p11-after-v3.jpg'
WHERE slug = 'adu-renovation-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- Post: split-level-home-renovation-burnaby-coquitlam-2026
-- Image: modern-kitchen-renovation-langley (generic whole-home renovation)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/modern-kitchen-renovation-langley-hero-mmnv5g4a.jpg'
WHERE slug = 'split-level-home-renovation-burnaby-coquitlam-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- Post: vancouver-infill-development-cost-2026
-- Image: modern-kitchen-renovation-surrey (generic renovation for infill context)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/modern-kitchen-renovation-surrey-hero-mmnzas1t.jpg'
WHERE slug = 'vancouver-infill-development-cost-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- Post: vancouver-stair-renovation-cost-2026
-- Image: vancouver-whole-house-bathroom-renovation (entry/stair context from a whole-house project)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-media-hero-mmtznddu.jpg'
WHERE slug = 'vancouver-stair-renovation-cost-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- Post: heat-pump-installation-vancouver-2026
-- Image: modern-kitchen-renovation-langley-2 (generic renovation for mechanical scope)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmo1xa2q.jpeg'
WHERE slug = 'heat-pump-installation-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- Post: heritage-home-renovation-vancouver-2026
-- Image: vancouver-whole-house-renovation-bathroom-updates (heritage character context)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg'
WHERE slug = 'heritage-home-renovation-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');

-- Post: how-much-does-kitchen-renovation-cost-vancouver-2026
-- Image: vancouver-white-shaker-kitchen-renovation (direct kitchen topic match)
UPDATE blog_posts
SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-media-hero-mmtznef3.jpg'
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND (featured_image_url IS NULL OR featured_image_url = '');
