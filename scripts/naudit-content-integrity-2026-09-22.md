-- seo-all WORK LADDER: content integrity audit
-- Date: 2026-09-22
-- Rule: checked all non-en locale columns for English-only content

-- blog_posts.content_zh (published only)
-- Status: 0 rows with English-only or NULL content_zh
-- Result: PASS

-- project_scopes.scope_zh
-- Status: 0 rows with English-only or NULL scope_zh
-- Result: PASS

-- services.description_zh
-- Status: 0 rows with English-only or NULL description_zh
-- Result: PASS

-- blog_posts.author (all published posts)
-- Status: 211 rows with NULL author
-- Migration: 2026-09-22-blog-author-backfill.sql (pending human apply)

-- service_areas.meta_description_en (varchar 155)
-- Status: 2 rows exceed 155: Richmond (163), West Vancouver (157)
-- Migration: 2026-09-22-service-areas-meta-description-en-truncate.sql (pending human apply)

-- blog_posts.reading_time_minutes (published, NULL)
-- Status: 4 rows with NULL reading_time_minutes
-- Migration: 2026-09-22-blog-reading-time-minutes.sql (pending human apply)

-- blog_drafts field length validation (scripts/audit_drafts.py)
-- Status: ALL 21 drafts PASS (0 violations)
-- Fields checked: metaTitleEn≤70, metaTitleZh≤70, metaDescriptionEn≤155,
--   metaDescriptionZh≤155, focusKeywordEn≤50, focusKeywordZh≤50,
--   titleEn≤255, titleZh≤255
