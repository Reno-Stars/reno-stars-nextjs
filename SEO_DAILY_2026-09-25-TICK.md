# SEO Daily Tick — 2026-09-25

## Branch: `seo/daily-2026-09-25` — already on branch, up to date with origin

---

## STOP Check Results

| Check | Count | Status |
|-------|-------|--------|
| author NULL (published) | **243** | ⚠️ STOP HOLD — pre-existing, large backlog |
| reading_time_minutes NULL (published) | **4** | ⚠️ STOP — 3 have migrations, 1 missing |
| featured_image_url NULL (published) | **10** | ⚠️ STOP — needs migration |
| seo_keywords_en NULL (published) | **1** | ⚠️ STOP — `townhouse-reno-vancouver-2026` |
| seo_keywords_zh NULL (published) | **1** | ⚠️ STOP — same row |
| meta_description_en > 155 (blog) | **0** | ✅ CLEAR |
| meta_title_en > 70 (blog) | **0** | ✅ CLEAR |
| service_areas meta_description_en > 155 | **2** | ⚠️ Migrations written, NOT APPLIED |

### STOP — New Gaps Found This Tick

**1. `bathroom-renovation-cost-burnaby` — reading_time_minutes NULL (published 2026-09-25)**
- No migration written yet
- Content: 7,716 chars EN / 2,845 chars ZH → ~5 min reading time
- Migration needed

**2. `bathroom-renovation-timeline-langley-bc-2026` — reading_time_minutes NULL**
- No migration written yet
- Content: ~5 min reading time
- Migration needed

**3. `bathroom-renovation-cost-burnaby` — featured_image_url NULL**
- 10 published posts have NULL featured_image_url
- No migration targets this specific slug for featured_image backfill
- Migration needed (hero from projects table)

---

## Ladder 2/3/4 Gap Summary

### Ladder 2 — Content Integrity (STOP conditions)

| Gap | Rows | Migration Status |
|-----|------|-----------------|
| author NULL | 243 | ⚠️ Backlog large — no single-tick fix |
| reading_time NULL (4 posts) | 4 | 3 have migrations; `bathroom-renovation-cost-burnaby` + `bathroom-renovation-timeline-langley-bc-2026` missing |
| featured_image NULL (10 posts) | 10 | Migrations exist but don't cover these specific slugs |
| seo_keywords_en NULL | 1 (`townhouse-reno-vancouver-2026`) | ⚠️ Migration written but NOT the same as today's scope |
| seo_keywords_zh NULL | 1 (`townhouse-reno-vancouver-2026`) | ⚠️ Migration written but NOT the same as today's scope |
| service_areas meta_desc >155 | 2 (richmond, west-vancouver) | ⚠️ Migrations written, human has NOT applied |

### Ladder 3 — Unpublished Drafts with Real Content

6 unpublished drafts with >500 chars content_en, not test/demo slugs:

| Slug | Chars | Focus Keyword | Notes |
|------|-------|---------------|-------|
| `how-to-pay-for-renovation-metro-vancouver-2026` | 8,931 | how to pay for renovation vancouver | **STAGED** — AT MOST ONE (10 posts today) |
| `vancouver-bathroom-renovation-timeline-2026` | 5,808 | bathroom renovation timeline | Ladder 3 candidate |
| `townhouse-renovation-strata-rules-vancouver-2026` | 1,689 | test | ❌ focus_keyword is "test" — needs review |
| `vancouver-stair-renovation-guide-2026` | 1,255 | Vancouver stair renovation cost | Ladder 3 candidate |
| `how-to-renovate-house-vancouver-first-timer-guide` | 1,068 | Vancouver home renovation guide | Ladder 3 candidate |
| `vancouver-property-type-renovation-2026` | 1,026 | Vancouver property type renovation | Ladder 3 candidate |

### Ladder 4 — Schema / Structural

- 2 project_sites with NULL seo_keywords_en (out of 15 published)
- `featured_image_url` column doesn't exist on `project_sites` (uses `hero_image_url`)

---

## AT MOST ONE Rule

**10 posts published today** (already at limit):
1. `furnace-replacement-vancouver-2026`
2. `powder-room-renovation-richmond-2026`
3. `bathroom-renovation-timeline-north-vancouver-2026`
4. `fireplace-renovation-vancouver-2026`
5. `garage-renovation-vancouver-2026`
6. `attic-renovation-vancouver-2026`
7. `attic-insulation-cost-vancouver-2026`
8. `bathroom-renovation-cost-burnaby`
9. `mold-remediation-cost-vancouver-2026`
10. `heat-pump-installation-bc-hydro-rebates-2026`

`how-to-pay-for-renovation-metro-vancouver-2026` remains **STAGED** in `blog-drafts/`.

---

## Pending Migrations (Not Yet Applied by Human)

| File | Fix | Status |
|------|-----|--------|
| `2026-09-25-blog-reading-time-north-vancouver.sql` | bathroom-renovation-timeline-north-vancouver-2026 reading_time=5 | NOT APPLIED |
| `2026-09-25-blog-reading-time-garage-vancouver.sql` | garage-renovation-vancouver-2026 reading_time=6 | NOT APPLIED |
| `2026-09-25-blog-reading-time-langley.sql` | bathroom-renovation-timeline-langley-bc-2026 reading_time=5 | NOT APPLIED |
| `2026-09-25-blog-stop-conditions-fix.sql` | stop_conditions backfill | NOT APPLIED |
| `2026-09-25-service-areas-meta-description-en-richmond.sql` | richmond meta 163→155 | NOT APPLIED |
| `2026-09-25-service-areas-meta-description-en-west-vancouver.sql` | west-vancouver meta 157→155 | NOT APPLIED |

---

## New Findings — Migrations to Write

### 1. `bathroom-renovation-cost-burnaby` reading_time_minutes

Content: 7,716 chars EN, 2,845 chars ZH → **5 min reading time**.

```sql
-- 2026-09-25-blog-reading-time-burnaby.sql
UPDATE blog_posts
SET reading_time_minutes = 5,
    updated_at = NOW()
WHERE slug = 'bathroom-renovation-cost-burnaby'
  AND reading_time_minutes IS NULL;
```

### 2. `bathroom-renovation-timeline-langley-bc-2026` reading_time_minutes

Content: ~5 min reading time estimate.

```sql
-- 2026-09-25-blog-reading-time-langley-v2.sql
UPDATE blog_posts
SET reading_time_minutes = 5,
    updated_at = NOW()
WHERE slug = 'bathroom-renovation-timeline-langley-bc-2026'
  AND reading_time_minutes IS NULL;
```

### 3. `bathroom-renovation-cost-burnaby` featured_image_url

10 published posts with NULL featured_image_url include `bathroom-renovation-cost-burnaby`.
Need to check project_sites for a matching hero image before writing migration.

---

## Dedup Check — scripts/migrations/

Ran `grep` dedup against `scripts/migrations/`:

| Topic | Existing Migration | New Migration Needed |
|-------|-------------------|---------------------|
| reading_time (north-vancouver) | ✅ `2026-09-25-blog-reading-time-north-vancouver.sql` | No |
| reading_time (garage) | ✅ `2026-09-25-blog-reading-time-garage-vancouver.sql` | No |
| reading_time (langley) | ✅ `2026-09-25-blog-reading-time-langley.sql` | No |
| reading_time (burnaby) | ❌ | YES |
| reading_time (langley-bc-2026) | ❌ (file targets different slug) | YES |
| featured_image (burnaby) | ❌ | YES |
| townhouse seo_keywords | ✅ Multiple files exist | No |

---

## Push Status

Branch `seo/daily-2026-09-25` already pushed to origin and matches origin.
No new commits to push — this report documents findings only.

---

## Next Steps (Priority Order)

1. **Human applies** pending migrations from `scripts/migrations/` (6 files above)
2. **Write + apply** `bathroom-renovation-cost-burnaby` reading_time migration
3. **Write + apply** `bathroom-renovation-timeline-langley-bc-2026` reading_time migration
4. **Resolve featured_image_url** for 10 published posts (hero image from projects table)
5. **Publish** `how-to-pay-for-renovation-metro-vancouver-2026` (staged draft, ladder 3 financing)
6. **Author NULL backlog** — 243 rows; needs batch migration approach (out of scope for single tick)
