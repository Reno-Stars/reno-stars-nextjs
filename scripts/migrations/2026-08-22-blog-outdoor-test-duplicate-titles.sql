-- 2026-08-22-blog-outdoor-test-duplicate-titles.sql
-- 12 published outdoor-test-* blog posts share the same title_en.
-- Each gets a unique title derived from its slug.
-- NOT APPLIED — needs human review before running.

BEGIN;

-- outdoor-test-half1
UPDATE blog_posts
SET title_en = 'Outdoor Test: Half Content | Reno Stars'
WHERE slug = 'outdoor-test-half1'
  AND title_en = 'Outdoor Living Space Renovation in Vancouver -- Decks, Patios & Permits for 2026';

-- outdoor-test-mtonly
UPDATE blog_posts
SET title_en = 'Outdoor Test: Mt Only | Reno Stars'
WHERE slug = 'outdoor-test-mtonly'
  AND title_en = 'Outdoor Living Space Renovation in Vancouver -- Decks, Patios & Permits for 2026';

-- outdoor-test-md80
UPDATE blog_posts
SET title_en = 'Outdoor Test: 80-char Meta Description | Reno Stars'
WHERE slug = 'outdoor-test-md80'
  AND title_en = 'Outdoor Living Space Renovation in Vancouver -- Decks, Patios & Permits for 2026';

-- outdoor-test-fk
UPDATE blog_posts
SET title_en = 'Outdoor Test: Focus Keyword | Reno Stars'
WHERE slug = 'outdoor-test-fk'
  AND title_en = 'Outdoor Living Space Renovation in Vancouver -- Decks, Patios & Permits for 2026';

-- outdoor-test-fkzh
UPDATE blog_posts
SET title_en = 'Outdoor Test: Focus Keyword ZH | Reno Stars'
WHERE slug = 'outdoor-test-fkzh'
  AND title_en = 'Outdoor Living Space Renovation in Vancouver -- Decks, Patios & Permits for 2026';

-- outdoor-test-amp
UPDATE blog_posts
SET title_en = 'Outdoor Test: AMP Page | Reno Stars'
WHERE slug = 'outdoor-test-amp'
  AND title_en = 'Outdoor Living Space Renovation in Vancouver -- Decks, Patios & Permits for 2026';

-- outdoor-test-mt1
UPDATE blog_posts
SET title_en = 'Outdoor Test: Migration 1 | Reno Stars'
WHERE slug = 'outdoor-test-mt1'
  AND title_en = 'Outdoor Living Space Renovation in Vancouver -- Decks, Patios & Permits for 2026';

-- outdoor-test-mt2
UPDATE blog_posts
SET title_en = 'Outdoor Test: Migration 2 | Reno Stars'
WHERE slug = 'outdoor-test-mt2'
  AND title_en = 'Outdoor Living Space Renovation in Vancouver -- Decks, Patios & Permits for 2026';

-- outdoor-test-mt3
UPDATE blog_posts
SET title_en = 'Outdoor Test: Migration 3 | Reno Stars'
WHERE slug = 'outdoor-test-mt3'
  AND title_en = 'Outdoor Living Space Renovation in Vancouver -- Decks, Patios & Permits for 2026';

-- outdoor-test-mt4
UPDATE blog_posts
SET title_en = 'Outdoor Test: Migration 4 | Reno Stars'
WHERE slug = 'outdoor-test-mt4'
  AND title_en = 'Outdoor Living Space Renovation in Vancouver -- Decks, Patios & Permits for 2026';

-- outdoor-test-longexcerpt
UPDATE blog_posts
SET title_en = 'Outdoor Test: Long Excerpt | Reno Stars'
WHERE slug = 'outdoor-test-longexcerpt'
  AND title_en = 'Outdoor Living Space Renovation in Vancouver -- Decks, Patios & Permits for 2026';

-- outdoor-living-space-renovation-vancouver-2026 (the "real" post — keep as-is)
-- No change needed for this one; it has a unique slug that should match a good title.
-- It already has the "canonical" title for this topic.

COMMIT;
