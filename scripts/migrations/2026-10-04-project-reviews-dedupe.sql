-- Migration: NOT YET APPLIED — requires human to run against production DB
-- Run with: psql $DB_CONNECTION_STRING -f scripts/migrations/2026-10-04-project-reviews-dedupe.sql

-- seo/daily-2026-10-04: Remove 7 duplicate review rows from project_reviews.
-- Each pair has identical body text and identical created_at timestamp,
-- suggesting a bulk-import pipeline bug that inserted duplicates.
-- Strategy: keep the lexicographically smaller ID of each duplicate pair.
-- WHERE clause with id IN (...) provides idempotency guard.

DELETE FROM project_reviews
WHERE id IN (
  '9306b916-d003-45cc-95da-eccf89057aee',  -- "I am so happy we went with Ryan and Jasper..."
  '1b3be2f6-77e3-4e9b-a3d2-2d0ba7e9c779',  -- "Pretty happy with this renovation company..."
  '100a0e4b-27a7-4660-be8b-69a7c0b53845',   -- "This is our second project with Reno Stars..."
  '416fdee9-4a5a-4859-96af-1039fe3e6b66',   -- "We recently needed a complete condo remodel..."
  '75d406e9-fe0e-4d55-afbe-21827c873ec9',   -- "We're really happy with the work Jasper, Ryan..."
  'a33b79ef-f1d9-4280-9a91-5844207a94fb',   -- "We had a great experience renovating our 30-year-old townhouse..."
  '8dcdd4b3-c2d2-4452-a2a8-aaec7c99acb4'    -- "We worked with Reno Stars Construction on a partial renovation..."
);

-- Verify: this should return 0 rows after apply
-- SELECT body, count(*) FROM project_reviews GROUP BY body HAVING count(*) > 1;
