-- Migration: set featured_image_url for 11 published posts that are missing one
-- NOT APPLIED — needs human to run
-- Rationale: 98% of published posts have a featured image; these 11 were missing it.
--   All mapped to a relevant project photo from the DB so the image matches the post topic.
UPDATE blog_posts
SET featured_image_url = CASE slug
    -- Burnaby bathroom post → budget bathroom in Burnaby
    WHEN 'bathroom-renovation-cost-burnaby'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/budget-friendly-bathroom-renovation-burnaby-hero-mo22rvh4.jpeg'
    -- ADU / Vancouver → Vancouver WFH office conversion (relevant whole-house scope)
    WHEN 'adu-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/po12051-glass-office-img_3171-g3ob4999.jpg'
    -- Vancouver stair renovation → Vancouver whole-house project
    WHEN 'vancouver-stair-renovation-cost-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg'
    -- Vancouver infill / heritage / split-level / step-by-step → Vancouver whole-house hero
    WHEN 'vancouver-infill-development-cost-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-condo-renovation-kitchen-two-bathrooms-p02-after-v1.jpg'
    WHEN 'heritage-home-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg'
    WHEN 'split-level-home-renovation-burnaby-coquitlam-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/townhouse-kitchen-renovation-burnaby-social-ready-hero-mn562i9n41fd7014-f.jpg'
    WHEN 'vancouver-house-renovation-step-by-step-guide-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-condo-renovation-kitchen-two-bathrooms-p02-after-v1.jpg'
    -- Kitchen cost guide → kitchen project in Vancouver
    WHEN 'how-much-does-kitchen-renovation-cost-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/returning-customer-kitchen-renovation-richmond-white-shaker-po5560-kitchen-img_3750-wja029kt.jpg'
    -- Before/after roundup → Vancouver whole-house before-after
    WHEN 'before-after-renovation-vancouver'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg'
    -- Mid-century rancher → Vancouver whole-house (best generic match)
    WHEN 'mid-century-rancher-renovation-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-condo-renovation-kitchen-two-bathrooms-p02-after-v1.jpg'
    -- Mold remediation → general Vancouver whole-house (no direct match; used as most relevant)
    WHEN 'mold-remediation-cost-vancouver-2026'
      THEN 'https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/uploads/admin/vancouver-house-renovation-kitchen-and-bathrooms-p01-after-v1.jpg'
  END
WHERE slug IN (
    'bathroom-renovation-cost-burnaby',
    'adu-renovation-vancouver-2026',
    'vancouver-stair-renovation-cost-2026',
    'vancouver-infill-development-cost-2026',
    'heritage-home-renovation-vancouver-2026',
    'split-level-home-renovation-burnaby-coquitlam-2026',
    'vancouver-house-renovation-step-by-step-guide-2026',
    'how-much-does-kitchen-renovation-cost-vancouver-2026',
    'before-after-renovation-vancouver',
    'mid-century-rancher-renovation-vancouver-2026',
    'mold-remediation-cost-vancouver-2026'
  )
AND is_published
AND (featured_image_url IS NULL OR featured_image_url = '');
