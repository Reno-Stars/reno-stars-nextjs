# SEO Audit Notes — 2026-08-31

## Branch
`seo/daily-2026-08-31` — https://github.com/Reno-Stars/reno-stars-nextjs

## gh CLI Status
**UNAVAILABLE** — `gh pr list` returns "command not found". All GitHub CLI operations skipped per runtime reality check. RULE 2 (drain own open PRs) cannot execute.

## Schema / Metadata Audit — PASSED ✓

All page types verified clean on public URL https://www.reno-stars.com/:

| Page Type | URL Checked | hreflang (14 locales) | og:locale:alternate (14) | JSON-LD | Notes |
|-----------|-------------|----------------------|--------------------------|---------|-------|
| Home | /en/ | ✓ full | ✓ 14 alternates | WebSite+LocalBusiness+FAQPage | |
| Area | /en/areas/burnaby/ | ✓ full | ✓ 14 alternates | Organization+LocalBusiness+WebSite | aggregateRating ✓ |
| Services | /en/services/kitchen/ | ✓ full | ✓ 14 alternates | Organization+LocalBusiness+HomeAndConstructionBusiness | |
| Project | /en/projects/toystore-renovation-metrotown-burnaby/ | ✓ full | ✓ 14 alternates | Organization+LocalBusiness+WebSite | |
| Blog | /en/blog/bathroom-renovation-planning-guide-vancouver/ | ✓ full | ✓ 14 alternates | WebSite+Organization+LocalBusiness | |

**contactPoint.availableLanguage**: correctly limited to `["English","Mandarin Chinese","Cantonese"]` — matches nativeSupport (3 locales). NOT filtered by nativeSupport for hreflang/og:locale:alternate — correctly uses all 14 INDEXABLE_LEAF_LOCALES.

## Content Integrity — zh fields

Prior audit (2026-08-31 earlier session):
- `services.description_zh` = 0 NULLs ✓
- `service_areas.description_zh` = 0 NULLs ✓
- `blog_posts.content_zh` = 254/254 published ✓
- `blog_posts.excerpt_zh` = 253/254 (1 gap: `pre-sale-renovation-white-rock-bc-2026`) — migration committed
- `blog_posts.meta_description_zh` = 254/254 ✓
- `project_scopes.scope_zh` = 321/321 ✓

Non-zh locales: `services`, `service_areas`, `blog_posts` tables only have `en` and `zh` column pairs. No `ja/ko/es/fr/hi/tl/vi` columns exist — those 11 locales live in the `localizations` JSONB column.

## Known Backlog
- 142 published blog posts need `seo_keywords_zh` (backlog cap hit — 4 migration files pending human apply)
- `projects.project_story_zh` = 56/58 NULLs (content gaps — no English source; no migration yet)
- `projects.duration_zh` = 17 NULLs, `space_type_zh` = 8, `category_zh` = 7, `challenge_zh` = 11, `solution_zh` = 11 (all content gaps)
- 1 migration file pending for `pre-sale-renovation-white-rock-bc-2026` excerpt_zh

## No Issues Found
- No English bleed in zh fields (prior query: `SELECT id FROM faqs WHERE answer_zh !~ '[一-鿿]'` returned 136 rows — all fixed in prior batches)
- No duplicate JSON-LD (prior audit found and fixed duplicate ArticleJsonLd on blog post page)
- hreflang correct on all page types — 14 locales, x-default present
- `availableLanguage` in ContactPoint schema correctly gated to nativeSupport (English/Mandarin/Cantonese)
- No broken internal links detected in prior audit passes
