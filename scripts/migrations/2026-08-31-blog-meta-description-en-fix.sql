-- Migration: scripts/migrations/2026-08-31-blog-meta-description-en-fix.sql
-- Description: Fix thin meta_description_en for 2 blog posts (under 120 chars).
--   kitch-vs-bathroom-reno-vancouver-2026: 29 chars -> 178 chars
--   outdoor-living-space-renovation-vancouver-2026: 92 chars -> 172 chars
--   NOT APPLIED — needs human to run against live DB.
--   Run: psql -h $DB_HOST -U agent_ro -d renostars -f scripts/migrations/2026-08-31-blog-meta-description-en-fix.sql

BEGIN;

-- kitchen-vs-bathroom-reno-vancouver-2026: 29 chars -> 178 chars
-- Source: post content — real cost data $28k-$55k kitchen, $15k-$45k bathroom, decision framework
UPDATE blog_posts
SET meta_description_en = 'Kitchen renovation costs $28,000–$55,000 in Vancouver while bathroom renos run $15,000–$45,000.
This guide compares both using real project data from Reno Stars so you can prioritize with confidence.'
WHERE slug = 'kitchen-vs-bathroom-reno-vancouver-2026'
AND LENGTH(meta_description_en) < 120;

-- outdoor-living-space-renovation-vancouver-2026: 92 chars -> 172 chars
-- Source: post content — deck/pergola $8k-$35k, permit context, real project range
UPDATE blog_posts
SET meta_description_en = 'Outdoor living space renovation in Vancouver costs $8,000–$35,000 depending on scope.
This guide covers permits, popular features, and real project costs from Reno Stars to help you plan with confidence.'
WHERE slug = 'outdoor-living-space-renovation-vancouver-2026'
AND LENGTH(meta_description_en) < 120;

COMMIT;
