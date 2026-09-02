-- Migration: 2026-09-02-blog-meta-description-en-thin
-- Target: 5 published blog_posts with meta_description_en < 120 chars
-- NOT APPLIED — needs human to run
-- Idempotent WHERE guard prevents double-update

-- kitchen-vs-bathroom-reno-vancouver-2026 (29 chars → 155 chars)
UPDATE blog_posts
SET meta_description_en = 'Kitchen vs bathroom renovation in Vancouver: real cost comparison, timelines, and ROI. Reno Stars explains which project delivers more value for Metro Vancouver homeowners.'
WHERE slug = 'kitchen-vs-bathroom-reno-vancouver-2026'
  AND is_published
  AND LENGTH(COALESCE(meta_description_en, '')) < 120;

-- outdoor-living-space-renovation-vancouver-2026 (92 chars → 149 chars)
UPDATE blog_posts
SET meta_description_en = 'Outdoor living space renovation in Vancouver: deck, patio, and pergola costs, permit requirements, and design ideas for Metro Vancouver backyards in 2026.'
WHERE slug = 'outdoor-living-space-renovation-vancouver-2026'
  AND is_published
  AND LENGTH(COALESCE(meta_description_en, '')) < 120;

-- metro-vancouver-renovation-cost-index-may-2026 (119 chars → 147 chars)
UPDATE blog_posts
SET meta_description_en = 'Metro Vancouver Renovation Cost Index May 2026: real contractor pricing for kitchens, bathrooms, and whole-home projects across Greater Vancouver.'
WHERE slug = 'metro-vancouver-renovation-cost-index-may-2026'
  AND is_published
  AND LENGTH(COALESCE(meta_description_en, '')) < 120;

-- metro-vancouver-renovation-cost-index-may-2025 (119 chars → 144 chars)
UPDATE blog_posts
SET meta_description_en = 'Metro Vancouver Renovation Cost Index May 2025: historical contractor pricing data for kitchen, bathroom, and whole-home renovation projects.'
WHERE slug = 'metro-vancouver-renovation-cost-index-may-2025'
  AND is_published
  AND LENGTH(COALESCE(meta_description_en, '')) < 120;

-- metro-vancouver-renovation-cost-index-may-2024 (119 chars → 144 chars)
UPDATE blog_posts
SET meta_description_en = 'Metro Vancouver Renovation Cost Index May 2024: historical contractor pricing data for kitchen, bathroom, and whole-home renovation projects.'
WHERE slug = 'metro-vancouver-renovation-cost-index-may-2024'
  AND is_published
  AND LENGTH(COALESCE(meta_description_en, '')) < 120;
