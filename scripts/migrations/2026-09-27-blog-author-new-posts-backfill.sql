-- Migration: backfill author for 10 newly published blog posts (2026-09-26 tick)
-- Status: STOP condition (author NULL on 10 new posts)
BEGIN;

UPDATE blog_posts SET author = 'Reno Stars'
WHERE slug IN (
  'mold-remediation-cost-vancouver-2026',
  'bathroom-renovation-cost-burnaby',
  'attic-insulation-cost-vancouver-2026',
  'bathroom-renovation-timeline-north-vancouver-2026',
  'attic-renovation-vancouver-2026',
  'garage-renovation-vancouver-2026',
  'fireplace-renovation-vancouver-2026',
  'powder-room-renovation-richmond-2026',
  'furnace-replacement-vancouver-2026',
  'heat-pump-installation-bc-hydro-rebates-2026'
) AND is_published = true AND (author IS NULL OR author = '');

COMMIT;
