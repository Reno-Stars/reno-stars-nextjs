# service_areas.meta_description_en truncation — status 2026-09-20

## Finding
2 rows still exceed varchar 155:
- richmond (id `3c5aa447-404e-4fdd-8cf9-dc4759885c1c`): 163 chars
- west-vancouver (id `e375930b-2520-4b2d-a42b-d69336f1be30`): 157 chars

## Migration already merged
File: `scripts/migrations/2026-09-20-service-areas-meta-description-en-truncate.sql`
Commit on main: `7cfe5939` (merged)
Content: slug-based UPDATE, idempotent WHERE guard
Status: **NOT YET APPLIED to database** — human must run it

## Verification query
```sql
SELECT id, slug, name_en, LENGTH(meta_description_en) as len
FROM service_areas
WHERE LENGTH(meta_description_en) > 155
ORDER BY len DESC;
```

## Post-apply verification
After running, both rows should show len ≤ 155.
