-- Migration: add featured_image_url to published blog posts missing one
-- NOT YET APPLIED — needs human review and execution
-- 10 published posts confirmed NULL for featured_image_url
-- Images matched by topic/location from projects table hero_image_url values

-- 1. how-to-renovate-house-vancouver-first-timer-guide
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg' WHERE slug = 'how-to-renovate-house-vancouver-first-timer-guide';

-- 2. vancouver-house-renovation-step-by-step-guide-2026
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg' WHERE slug = 'vancouver-house-renovation-step-by-step-guide-2026';

-- 3. mid-century-rancher-renovation-vancouver-2026
-- Topic: mid-century house renovation → matching to Vancouver whole-house project
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg' WHERE slug = 'mid-century-rancher-renovation-vancouver-2026';

-- 4. heritage-home-renovation-vancouver-2026
-- Topic: heritage house renovation → matching to Vancouver whole-house project
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg' WHERE slug = 'heritage-home-renovation-vancouver-2026';

-- 5. adu-renovation-vancouver-2026
-- Topic: ADU/suite renovation → matching to Vancouver whole-house project
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg' WHERE slug = 'adu-renovation-vancouver-2026';

-- 6. vancouver-infill-development-cost-2026
-- Topic: infill/development → matching to Vancouver whole-house project
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg' WHERE slug = 'vancouver-infill-development-cost-2026';

-- 7. split-level-home-renovation-burnaby-coquitlam-2026
-- Topic: split-level house renovation → matching to Vancouver whole-house project
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg' WHERE slug = 'split-level-home-renovation-burnaby-coquitlam-2026';

-- 8. vancouver-property-type-renovation-2026
-- Topic: house vs condo vs townhouse → matching to Vancouver whole-house project
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg' WHERE slug = 'vancouver-property-type-renovation-2026';

-- 9. vancouver-stair-renovation-cost-2026
-- Topic: stair renovation → matching to Vancouver bathroom (home renovation scope)
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-bathroom-renovation-hero-mmtznddu.jpg' WHERE slug = 'vancouver-stair-renovation-cost-2026';

-- 10. heat-pump-installation-vancouver-2026
-- Topic: heat pump → matching to Vancouver whole-house project
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-whole-house-renovation-bathroom-updates-hero-mmwil5gf.jpg' WHERE slug = 'heat-pump-installation-vancouver-2026';
