/**
 * Migration: Add seo_keywords_en for remaining cost-index blog posts
 * Run: pnpm db:query -f scripts/migrations/2026-08-27-blog-seo-keywords-en-remaining.sql
 *
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-27-blog-seo-keywords-en-remaining.sql
 *
 * Gap-filling migration for posts NOT covered by:
 *   - 2026-08-24-blog-seo-keywords-en.sql (2023 Apr-Dec, 2024 Jan-Nov, 2025 Apr/Aug)
 *   - 2026-08-27-blog-seo-keywords-en-cost-index.sql (2023 Jul/Sep/Oct, 2024 Aug-Dec,
 *       2025 Jan-Mar/May-Jul/Sep-Nov, 2026 Jan-Jun subset)
 * Uncovered posts:
 *   metro-vancouver-renovation-cost-index-april-2024    (2024, year mismatch)
 *   metro-vancouver-renovation-cost-index-march-2026    (2026, missed)
 *   metro-vancouver-renovation-cost-index-may-2026      (2026, missed)
 *   metro-vancouver-renovation-cost-index-june-2026     (2026, missed)
 */

BEGIN;

UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2024 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-april-2024'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-march-2026'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-may-2026'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE blog_posts SET seo_keywords_en = 'vancouver renovation cost, metro vancouver reno prices, 2026 cost index'
WHERE slug = 'metro-vancouver-renovation-cost-index-june-2026'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

COMMIT;
