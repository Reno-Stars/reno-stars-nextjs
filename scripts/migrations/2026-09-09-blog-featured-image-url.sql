-- 2026-09-09-blog-featured-image-url.sql
-- Status: NOT APPLIED — needs human to run
-- Target: 11 published posts missing featured_image_url
-- Source images: from existing blog_posts.featured_image_url pool (same R2 bucket)
-- Guard: idempotent WHERE — only affects rows where featured_image_url IS NULL
--
-- Already covered: none (no prior migration addresses featured_image_url)

-- Post 1: how-to-renovatehouse-vancouver-first-timer-guide
--   image: reuse from how-much-does-kitchen-renovation-cost (same topic cluster)
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE slug = 'how-to-renovatehouse-vancouver-first-timer-guide'
  AND is_published = true
  AND featured_image_url IS NULL;

-- Post 2: vancouver-house-renovation-step-by-step-guide-2026
--   image: same whole-house hero
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE slug = 'vancouver-house-renovation-step-by-step-guide-2026'
  AND is_published = true
  AND featured_image_url IS NULL;

-- Post 3: mid-century-rancher-renovation-vancouver-2026
--   image: luxury bathroom as quality interior renovation proxy
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/luxury-bathroom-renovation-north-vancouver-hero-mmxy475p.jpg'
WHERE slug = 'mid-century-rancher-renovation-vancouver-2026'
  AND is_published = true
  AND featured_image_url IS NULL;

-- Post 4: heritage-home-renovation-vancouver-2026
--   image: luxury bathroom as quality interior renovation proxy
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/luxury-bathroom-renovation-north-vancouver-hero-mmxy475p.jpg'
WHERE slug = 'heritage-home-renovation-vancouver-2026'
  AND is_published = true
  AND featured_image_url IS NULL;

-- Post 5: adu-renovation-vancouver-2026
--   image: luxury bathroom as quality renovation proxy
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/luxury-bathroom-renovation-north-vancouver-hero-mmxy475p.jpg'
WHERE slug = 'adu-renovation-vancouver-2026'
  AND is_published = true
  AND featured_image_url IS NULL;

-- Post 6: vancouver-infill-development-cost-2026
--   image: luxury bathroom as quality renovation proxy
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/luxury-bathroom-renovation-north-vancouver-hero-mmxy475p.jpg'
WHERE slug = 'vancouver-infill-development-cost-2026'
  AND is_published = true
  AND featured_image_url IS NULL;

-- Post 7: split-level-home-renovation-burnaby-coquitlam-2026
--   image: modern kitchen Langley (contextually relevant - modern renovation)
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmnv5g4a.jpg'
WHERE slug = 'split-level-home-renovation-burnaby-coquitlam-2026'
  AND is_published = true
  AND featured_image_url IS NULL;

-- Post 8: vancouver-property-type-renovation-2026
--   image: modern kitchen Richmond (general renovation topic)
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/modern-kitchen-renovation-richmond-hero-mmms482z.jpg'
WHERE slug = 'vancouver-property-type-renovation-2026'
  AND is_published = true
  AND featured_image_url IS NULL;

-- Post 9: vancouver-stair-renovation-cost-2026
--   image: luxury bathroom as quality interior renovation proxy
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/luxury-bathroom-renovation-north-vancouver-hero-mmxy475p.jpg'
WHERE slug = 'vancouver-stair-renovation-cost-2026'
  AND is_published = true
  AND featured_image_url IS NULL;

-- Post 10: heat-pump-installation-vancouver-2026
--   image: modern kitchen Langley (contextually relevant - HVAC/electrical upgrade often paired)
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/social-ready-hero-mmnv5g4a.jpg'
WHERE slug = 'heat-pump-installation-vancouver-2026'
  AND is_published = true
  AND featured_image_url IS NULL;

-- Post 11: how-much-does-kitchen-renovation-cost-vancouver-2026
--   image: whole-house hero (same as #1 — same topic cluster)
UPDATE blog_posts SET featured_image_url = 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-custom-whole-house-renovation-hero-mmtwqbrf.jpg'
WHERE slug = 'how-much-does-kitchen-renovation-cost-vancouver-2026'
  AND is_published = true
  AND featured_image_url IS NULL;
