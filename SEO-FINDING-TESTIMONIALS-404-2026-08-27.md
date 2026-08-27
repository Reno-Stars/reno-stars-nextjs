# SEO-FINDING-TESTIMONIALS-404-2026-08-27

## Finding: Testimonials Page Returns HTTP 404

### Summary
The `/en/testimonials/` route does not exist (HTTP 404). Three testimonial rows exist in the `testimonials` DB table but are inaccessible to site visitors.

### Evidence
**DB table `testimonials`** (3 rows):
| id | name | location | is_featured | verified |
|----|------|----------|-------------|---------|
| 9acb67a9-... | Sarah M. | Vancouver, BC | true | true |
| 1334cfe1-... | David L. | Richmond, BC | true | true |
| 2cee1f5c-... | Jennifer K. | Burnaby, BC | true | true |

Schema: `id, text_en, name, location, is_featured, verified`

**HTTP check:**
```
curl -s -o /dev/null -w "%{http_code}" "https://www.reno-stars.com/en/testimonials/"
→ 404
```

**Note:** The `/en/reviews/` page (HTTP 200) renders Google reviews from `googleReviewsCache`, which is separate from the `testimonials` table. The 3 DB rows in `testimonials` are not displayed anywhere on the live site.

### Impact
- 3 featured testimonials with `text_en` content are inaccessible — SEO value of the review content (rich snippets, structured data, internal links) is unrealized.
- The page would support `AggregateRating` + `Review` schema if implemented with the existing DB content.
- No testimonials route exists in `app/[locale]/testimonials/` — requires developer to create the page component.

### Resolution
Developer action required:
1. Create `app/[locale]/testimonials/page.tsx` to query and render the `testimonials` DB table.
2. Add `Review` schema using the `text_en` field from each row.
3. Add the new URL to the sitemap and add hreflang entries.

### Status
- [x] Confirmed 404 route
- [x] Confirmed DB rows exist
- [ ] Awaiting developer implementation
