/*
 * Migration: Deduplicate focus_keyword_en for 10 keyword groups.
 * Run: pnpm db:query -f scripts/migrations/2026-09-29-focus-keyword-en-dedup-batch2.sql
 *
 * NOT APPLIED — needs human to run after PR merge.
 *
 * Strategy per group: keep the most general post's keyword unchanged;
 * give each secondary post a distinct keyword reflecting its angle.
 */

BEGIN;

-- bathroom renovation Delta (2 posts)
-- Keep: comprehensive-bathroom-renovation-delta-bc-case-study (case study = general)
UPDATE blog_posts
SET focus_keyword_en = 'Delta bathroom renovation with brushed gold fixtures'
WHERE slug = 'two-bathroom-renovation-with-brushed-gold-fixtures'
  AND focus_keyword_en = 'bathroom renovation Delta';

-- Vancouver renovation permit (2 posts)
-- Keep: vancouver-renovation-permits-guide-2026 (guide = general)
UPDATE blog_posts
SET focus_keyword_en = 'Vancouver renovation permit checklist 2026'
WHERE slug = 'vancouver-renovation-permit-checklist-2026'
  AND focus_keyword_en = 'Vancouver renovation permit';

-- Maple Ridge bathroom renovation (2 posts, case study cluster)
-- Keep: maple-ridge-bathroom-renovation-case-study (first case study = general)
UPDATE blog_posts
SET focus_keyword_en = 'Maple Ridge bathroom renovation with custom glass doors'
WHERE slug = 'maple-ridge-bathroom-renovation-case-study-2'
  AND focus_keyword_en = 'Maple Ridge bathroom renovation';

-- bathroom renovation maple ridge (2 posts, cost/timeline cluster)
-- Keep: bathroom-renovation-maple-ridge-2026 (costs & timeline = more general)
UPDATE blog_posts
SET focus_keyword_en = 'Maple Ridge BC bathroom renovation 2026: costs, heritage homes'
WHERE slug = 'bathroom-renovation-maple-ridge-bc-2026'
  AND focus_keyword_en = 'bathroom renovation maple ridge';

-- bathroom renovation timeline Richmond (2 posts)
-- Keep: bathroom-renovation-timeline-richmond-bc-2026 (2026 in title)
UPDATE blog_posts
SET focus_keyword_en = 'Richmond bathroom renovation timeline 2026'
WHERE slug = 'bathroom-renovation-timeline-richmond-2026'
  AND focus_keyword_en = 'bathroom renovation timeline Richmond';

-- West Vancouver bathroom renovation (2 posts)
-- Keep: west-vancouver-two-bathroom-renovation-2026 (two-bathroom = more specific scope)
-- Give the whole-house case study a distinct angle
UPDATE blog_posts
SET focus_keyword_en = 'West Vancouver bathroom renovation case study: one into two'
WHERE slug = 'west-vancouver-bathroom-renovation-case-study'
  AND focus_keyword_en = 'West Vancouver bathroom renovation';

-- vancouver renovation cost (2 posts)
-- Keep: vancouver-renovation-cost-2026 (direct "cost" kw, broader appeal)
UPDATE blog_posts
SET focus_keyword_en = '2026 Metro Vancouver renovation cost report'
WHERE slug = 'metro-vancouver-renovation-cost-report-2026'
  AND focus_keyword_en = 'vancouver renovation cost';

-- living through renovation Vancouver (2 posts)
-- Keep: living-through-renovation-vancouver-what-to-expect-2026 (expectations = broader)
UPDATE blog_posts
SET focus_keyword_en = 'Living through renovation Vancouver: practical guide'
WHERE slug = 'living-through-renovation-vancouver-guide'
  AND focus_keyword_en = 'living through renovation Vancouver';

-- basement renovation vancouver (2 posts)
-- Keep: basement-renovation-vancouver-2026 (2026 = more current)
UPDATE blog_posts
SET focus_keyword_en = 'Vancouver basement renovation complete guide 2026'
WHERE slug = 'basement-renovation-vancouver-complete-guide'
  AND focus_keyword_en = 'basement renovation vancouver';

-- whole house renovation Vancouver (2 posts)
-- Keep: whole-house-renovation-vancouver-bc-2026 (costs & permits = broader appeal)
UPDATE blog_posts
SET focus_keyword_en = 'Custom whole house renovation Vancouver case study'
WHERE slug = 'custom-whole-house-renovation-in-vancouver'
  AND focus_keyword_en = 'whole house renovation Vancouver';

COMMIT;
