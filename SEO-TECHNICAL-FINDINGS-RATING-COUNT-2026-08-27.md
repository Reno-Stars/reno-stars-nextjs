# SEO Technical Findings — Rating Count Inflation
**Date:** 2026-08-27
**Branch:** seo/daily-2026-08-27
**Status:** Confirmed — requires code fix

## Finding

All area pages and the homepage declare `ratingCount: 78` in their LocalBusiness JSON-LD schemas, but the `project_reviews` database table contains only **35 rows** (all Google source).

Checked pages:
- `/en/` (homepage) — `ratingCount: 78` in Organization+LocalBusiness JSON-LD
- `/en/areas/richmond/` — `ratingCount: 78` (5 JSON-LD scripts)
- `/en/areas/vancouver/` — `ratingCount: 78`
- `/en/areas/burnaby/` — `ratingCount: 78`

## Impact

LocalBusiness `aggregateRating` with `ratingCount` misaligned from actual review count:
- Google may treat the inflated count as a trust signal discrepancy
- All 35 DB reviews are 5-star — the aggregateRating value of `5.0` is correct
- The `ratingCount` of 78 is ~2.2× the actual review count

## Required Fix

Update the hardcoded `ratingCount` in the area page and homepage JSON-LD generators to use the actual review count from the database, or remove `ratingCount` if reviews are managed externally.

DB query to get live count:
```sql
SELECT COUNT(*) FROM project_reviews
-- Returns: 35
```

## Schema Types on Area Pages (Richmond example)

5 JSON-LD scripts containing:
- `@type: City` (15 instances — likely list scaffolding)
- `@type: Question` (14) + `@type: Answer` (14) — FAQ schema
- `@type: Service` (11) + `@type: Offer` (11) — service/offer pairs
- `@type: Review` (5) + `@type: Rating` (5) + `@type: Person` (5) — 5 reviews
- `@type: OpeningHoursSpecification` (4)
- `@type: ListItem` (3)

This is structurally valid — but `ratingCount: 78` on an area page claiming 5 reviews is inconsistent.

## Noting Also

The `project_reviews` table schema has: id, project_id, source, author_name, rating (integer), body (text), body_lang, review_date, owner_response, source_url, created_at.

All 35 reviews have `rating = 5`. Owner response rate: 29/35 (83%).
