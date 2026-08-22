/**
 * Migration: Set focus_keyword_en and meta_description_en for outdoor-test blog posts.
 * Run: pnpm db:query -f scripts/migrations/2026-08-22-blog-outdoor-test-focus-meta.sql
 *
 * NOT APPLIED — needs human to run: pnpm db:query -f scripts/migrations/2026-08-22-blog-outdoor-test-focus-meta.sql
 * These are test/development posts with "outdoor-test-*" slugs published 2026-08-12.
 */

-- outdoor-test-half1: missing both focus_keyword_en and meta_description_en
UPDATE blog_posts SET focus_keyword_en = 'outdoor living space renovation vancouver', meta_description_en = 'Vancouver homeowners are transforming backyards into year-round living spaces. This guide covers 2026 deck and patio costs, permit requirements, and what to know before you break ground.' WHERE slug = 'outdoor-test-half1' AND (focus_keyword_en IS NULL OR meta_description_en IS NULL);

-- outdoor-test-mtonly: missing both focus_keyword_en and meta_description_en
UPDATE blog_posts SET focus_keyword_en = 'outdoor living space renovation vancouver', meta_description_en = 'Vancouver homeowners are transforming backyards into year-round living spaces. This guide covers 2026 deck and patio costs, permit requirements, and what to know before you break ground.' WHERE slug = 'outdoor-test-mtonly' AND (focus_keyword_en IS NULL OR meta_description_en IS NULL);

-- outdoor-test-md80: missing focus_keyword_en (has meta_description)
UPDATE blog_posts SET focus_keyword_en = 'outdoor living space renovation vancouver' WHERE slug = 'outdoor-test-md80' AND focus_keyword_en IS NULL;

-- outdoor-test-amp: missing both focus_keyword_en and meta_description_en
UPDATE blog_posts SET focus_keyword_en = 'outdoor living space renovation vancouver', meta_description_en = 'Vancouver homeowners are transforming backyards into year-round living spaces. This guide covers 2026 deck and patio costs, permit requirements, and what to know before you break ground.' WHERE slug = 'outdoor-test-amp' AND (focus_keyword_en IS NULL OR meta_description_en IS NULL);

-- outdoor-test-mt1: missing both focus_keyword_en and meta_description_en
UPDATE blog_posts SET focus_keyword_en = 'outdoor living space renovation vancouver', meta_description_en = 'Vancouver homeowners are transforming backyards into year-round living spaces. This guide covers 2026 deck and patio costs, permit requirements, and what to know before you break ground.' WHERE slug = 'outdoor-test-mt1' AND (focus_keyword_en IS NULL OR meta_description_en IS NULL);

-- outdoor-test-mt2: missing both focus_keyword_en and meta_description_en
UPDATE blog_posts SET focus_keyword_en = 'outdoor living space renovation vancouver', meta_description_en = 'Vancouver homeowners are transforming backyards into year-round living spaces. This guide covers 2026 deck and patio costs, permit requirements, and what to know before you break ground.' WHERE slug = 'outdoor-test-mt2' AND (focus_keyword_en IS NULL OR meta_description_en IS NULL);

-- outdoor-test-mt3: missing both focus_keyword_en and meta_description_en
UPDATE blog_posts SET focus_keyword_en = 'outdoor living space renovation vancouver', meta_description_en = 'Vancouver homeowners are transforming backyards into year-round living spaces. This guide covers 2026 deck and patio costs, permit requirements, and what to know before you break ground.' WHERE slug = 'outdoor-test-mt3' AND (focus_keyword_en IS NULL OR meta_description_en IS NULL);

-- outdoor-test-mt4: missing both focus_keyword_en and meta_description_en
UPDATE blog_posts SET focus_keyword_en = 'outdoor living space renovation vancouver', meta_description_en = 'Vancouver homeowners are transforming backyards into year-round living spaces. This guide covers 2026 deck and patio costs, permit requirements, and what to know before you break ground.' WHERE slug = 'outdoor-test-mt4' AND (focus_keyword_en IS NULL OR meta_description_en IS NULL);

-- outdoor-test-longexcerpt: missing both focus_keyword_en and meta_description_en
UPDATE blog_posts SET focus_keyword_en = 'outdoor living space renovation vancouver', meta_description_en = 'Vancouver homeowners are transforming backyards into year-round living spaces. This guide covers 2026 deck and patio costs, permit requirements, and what to know before you break ground.' WHERE slug = 'outdoor-test-longexcerpt' AND (focus_keyword_en IS NULL OR meta_description_en IS NULL);
