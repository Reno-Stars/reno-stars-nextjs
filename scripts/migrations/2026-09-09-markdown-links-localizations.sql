-- Migration: convert markdown links to anchors inside blog_posts.localizations.
--   pnpm db:query -f scripts/migrations/2026-09-09-markdown-links-localizations.sql
--
-- Follow-up to 2026-09-09-markdown-links-to-anchors.sql, which fixed content_en
-- and content_zh and looked complete. It was not: the OTHER TWELVE locales live
-- in the `localizations` JSONB column, and it holds 107,427 markdown links
-- across 199 published posts — ten times what the first migration repaired.
-- Affected keys span contentAr/Es/Fa/Fr/Hi/Ja/Ko/Pa/Ru/Tl/Vi/ZhHant and their
-- excerpt/metaTitle/metaDescription siblings.
--
-- Rebuilt with jsonb_object_agg over jsonb_each_text rather than a ::text cast
-- and re-parse, so quoting inside the generated <a href="..."> cannot corrupt
-- the JSON. Verified first that EVERY value in the column is a plain string
-- (17,552 of them, zero nested objects) — a text rebuild would flatten nested
-- structure if any existed.
--
-- Two passes, same reason as the first migration: the (^|[^!]) prefix is
-- consumed, so consecutive links are missed on a single pass.

UPDATE blog_posts b
   SET localizations = (
     SELECT jsonb_object_agg(
              k,
              regexp_replace(
                regexp_replace(v,
                  '(^|[^!])\[([^\]]+)\]\((/[^)\s]+|https?://[^)\s]+)\)', '\1<a href="\3">\2</a>', 'g'),
                  '(^|[^!])\[([^\]]+)\]\((/[^)\s]+|https?://[^)\s]+)\)', '\1<a href="\3">\2</a>', 'g'))
     FROM jsonb_each_text(b.localizations) AS e(k, v))
 WHERE b.localizations IS NOT NULL
   AND b.localizations::text ~ '\[[^\]]+\]\((/|https?://)[^)\s]+\)';
