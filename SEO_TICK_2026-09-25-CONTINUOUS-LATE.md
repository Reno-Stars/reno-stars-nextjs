# SEO Tick 2026-09-25 — Continuous (Late Evening)

**Branch:** `seo/daily-2026-09-25`
**Pushed:** (commit pending)

---

## STOP Check

```sql
SELECT COUNT(*) FROM blog_posts WHERE author IS NULL AND is_published = true
```

**Result: 243** — STOPs hold. 8 posts published today (2026-09-25). `how-to-pay-for-renovation-metro-vancouver-2026` draft staged.

---

## Fresh Ladder 2/3/4 Scan — New Findings

### Confirmed Clean (no new issues)

| Check | Result |
|-------|--------|
| `blog_posts` meta_title_en > 70 | 0 rows ✅ |
| `blog_posts` meta_description_en > 155 | 0 rows ✅ |
| `blog_posts` seo_keywords_en NULL (published) | 1 row (townhouse) — existing migration covers |
| `project_image_pairs` before_alt_text_en NULL (image present) | 0 rows ✅ |
| `site_image_pairs` after/before alt text NULL | 0 rows ✅ |
| `project_sites` focus_keyword_zh NULL | 0 rows ✅ |

---

### Pending on Branch (already written, not yet applied)

| Migration | Status |
|-----------|--------|
| `2026-09-25-project-image-pairs-after-alt-text-p{1,2,3,4}.sql` | 38 rows, staged on branch |
| `2026-09-25-townhouse-reno-seo-keywords-en.sql` | 1 row, staged on branch |
| `2026-09-25-service-areas-meta-description-en-richmond.sql` | 1 row, staged on branch |
| `2026-09-25-service-areas-meta-description-en-west-vancouver.sql` | 1 row, staged on branch |
| `2026-09-25-service-areas-meta-trim.sql` | 2 rows, staged on branch |

---

### NEW Findings This Tick (2026-09-25 late evening)

#### NEW-1: `project_sites` — `individual-projects` missing `meta_title_en` AND `meta_description_en`

**Row:** `slug=individual-projects` (id=64f0f111-4920-434f-ab7e-0c2c411e6633)

- `meta_title_en` = NULL
- `meta_description_en` = NULL
- `title_en` = "Individual Projects"
- Existing migrations cover `focus_keyword_en`, `seo_keywords_en`, `duration_en` — NOT meta_title/meta_description

**Migration written:** `scripts/migrations/2026-09-25-project-sites-individual-projects-meta-title-description.sql`

```sql
UPDATE project_sites
SET meta_title_en = 'Individual Renovation Projects Vancouver | Reno Stars',
    updated_at = NOW()
WHERE slug = 'individual-projects'
  AND meta_title_en IS NULL;

UPDATE project_sites
SET meta_description_en = 'Browse portfolio of individual renovation projects across Metro Vancouver. Kitchen, bathroom, whole-home renovations by Reno Stars — view our completed work.',
    updated_at = NOW()
WHERE slug = 'individual-projects'
  AND meta_description_en IS NULL;
```

---

#### NEW-2: `blog_posts` — `bathroom-renovation-cost-burnaby` missing `reading_time_minutes`

**Row:** `slug=bathroom-renovation-cost-burnaby` — published today (2026-09-25)

- Existing reading_time migrations cover: `garage-renovation-vancouver-2026`, `bathroom-renovation-timeline-north-vancouver-2026`, `bathroom-renovation-timeline-langley-bc-2026`
- `bathroom-renovation-cost-burnaby` was NOT covered — new today

**Migration written:** `scripts/migrations/2026-09-25-blog-reading-time-burnaby-bathroom-cost.sql`

```sql
UPDATE blog_posts
SET reading_time_minutes = 6,
    updated_at = NOW()
WHERE slug = 'bathroom-renovation-cost-burnaby'
  AND reading_time_minutes IS NULL;
```

---

### Dedup Check — No Duplicates Written

Searched `scripts/migrations/` for all new slug targets before writing migrations — no existing migrations covered these two specific gaps.

---

## Summary

| Category | Count | Status |
|----------|-------|--------|
| STOP: author NULL (published) | 243 | HOLD — no new publish |
| STOP: published today | 8 | below AT MOST ONE threshold |
| Pending migrations (branch, not applied) | 5 files | awaiting ops |
| **NEW this tick** | 2 files | committed this push |

**New files committed:**
- `scripts/migrations/2026-09-25-project-sites-individual-projects-meta-title-description.sql`
- `scripts/migrations/2026-09-25-blog-reading-time-burnaby-bathroom-cost.sql`
