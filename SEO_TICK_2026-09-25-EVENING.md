# SEO Daily — 2026-09-25 (Evening Tick)

**Branch:** `seo/daily-2026-09-25`
**Pushed:** (commit pending)

---

## STOP Check

```sql
SELECT COUNT(*) FROM blog_posts WHERE author IS NULL AND is_published = true
```

**Result: 243** — STOPs hold (>= 3 cap). No new blog draft today. 10 posts already published 2026-09-25. `how-to-pay-for-renovation-metro-vancouver-2026` draft remains staged.

---

## Fresh Work: Ladder 2 / Ladder 3 / Ladder 4

### Ladder 2: `project_image_pairs` — `after_alt_text` NULL (38 rows)

**Issue:** 38 published rows have `after_image_url` populated but `after_alt_text_en` / `after_alt_text_zh` NULL. All are after-photos for real kitchen/bathroom/flooring renovation projects.

**Projects affected:**
- Delta Kitchen Renovation — 6 after photos (apron sink, quartz countertops)
- Coquitlam Kitchen Renovation Quartz Island — 6 after photos
- Richmond Whole Home Renovation Marble Kitchen — 6 after photos
- North Vancouver Bathroom Renovation Herringbone Tile — 3 after photos
- Richmond Condo Flooring Renovation — 5 after photos
- Richmond House Renovation Kitchen + Bathrooms Flooring — 6 after photos
- Vancouver House Renovation Kitchen + Bathrooms — 6 after photos

**Note:** 63 `before_alt_text_en` NULL rows exist BUT all have `before_image_url = NULL` — those are phantom/placeholder rows, not SEO gaps.

**Migrations written** (pending ops run against live DB):
- `scripts/migrations/2026-09-25-project-image-pairs-after-alt-text-p1.sql` (Delta + Coquitlam, 12 rows)
- `scripts/migrations/2026-09-25-project-image-pairs-after-alt-text-p2.sql` (Richmond Whole Home Marble, 6 rows)
- `scripts/migrations/2026-09-25-project-image-pairs-after-alt-text-p3.sql` (North Van Herringbone + Richmond Condo Flooring, 8 rows)
- `scripts/migrations/2026-09-25-project-image-pairs-after-alt-text-p4.sql` (Richmond House + Vancouver House, 12 rows)

---

### Ladder 3: `blog_posts` — `seo_keywords` NULL (1 row)

**Row:** `townhouse-reno-vancouver-2026` ("Townhouse Renovation in Metro Vancouver Strata Rules and Permits 2026")

Already has migration file from earlier today:
- `scripts/migrations/2026-09-25-blog-seo-keywords-townhouse-vancouver-2026.sql` — marked "NOT APPLIED" in comments, needs ops run against live DB

**Keyword values inferred from** `townhouse-renovation-cost-vancouver-2026` and similar published townhouse posts.

---

### Ladder 4: `site_image_pairs` — No real gaps

- 17 `before_alt_text_en` NULL rows exist BUT all have `before_image_url = NULL` — phantom/placeholder rows, not SEO gaps.
- No rows with actual image URLs missing alt text.

---

## Summary Table

| Ladder | Table | Issue | Rows | Status |
|--------|-------|-------|------|--------|
| L2 | `project_image_pairs` | `after_alt_text_en/zh` NULL, image present | 38 | Migration files written, needs ops run |
| L3 | `blog_posts` | `seo_keywords_en/zh` NULL | 1 | Migration exists, needs ops run |
| L4 | `site_image_pairs` | No real gaps (NULLs are phantom rows) | 0 | Clean |

---

## STOP Condition: `author IS NULL` published blog_posts

**243 rows** — this is the primary STOP condition. Author field needs to be backfilled for all these published posts. No new blog publish until this is resolved.

---

## Files Changed

New migration files:
- `scripts/migrations/2026-09-25-project-image-pairs-after-alt-text-p1.sql`
- `scripts/migrations/2026-09-25-project-image-pairs-after-alt-text-p2.sql`
- `scripts/migrations/2026-09-25-project-image-pairs-after-alt-text-p3.sql`
- `scripts/migrations/2026-09-25-project-image-pairs-after-alt-text-p4.sql`
