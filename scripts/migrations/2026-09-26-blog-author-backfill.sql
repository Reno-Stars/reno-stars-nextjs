-- Migration: backfill author for 22 published blog posts
-- Status: STOP condition (author column at cap)
BEGIN;

UPDATE blog_posts SET author = 'Reno Stars'
WHERE slug IN (
  'bathroom-renovation-timeline-north-vancouver-2026',
  'bathroom-renovation-timeline-surrey-bc-2026',
  'bathroom-renovation-timeline-vancouver-2026',
  'commercial-warehouse-door-renovation-burnaby-2026',
  'ensuite-bathroom-renovation-richmond-2026',
  'fireplace-renovation-vancouver-2026',
  'furnace-replacement-vancouver-2026',
  'garage-renovation-vancouver-2026',
  'heat-pump-installation-bc-hydro-rebates-2026',
  'home-office-renovation-metro-vancouver-2026',
  'home-office-renovation-vancouver-complete-guide-2026',
  'how-long-does-whole-house-renovation-take-richmond-bc-2026',
  'medical-office-renovation-vancouver-2026',
  'metro-vancouver-renovation-cost-by-city-2026',
  'modern-bathroom-renovation-features-burnaby-2026',
  'powder-room-renovation-richmond-2026',
  'retail-renovation-cost-vancouver-2026',
  'surrey-kitchen-renovation-cost-2026',
  'two-bathroom-renovation-burnaby-family-2026',
  'two-bathroom-renovation-custom-features-richmond-2026',
  'vancouver-renovation-cost-2026',
  'why-realtors-recommend-pre-sale-renovation-metro-vancouver-2026'
) AND is_published = true AND (author IS NULL OR author = '');

COMMIT;
