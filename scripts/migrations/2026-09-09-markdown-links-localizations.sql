-- Migration: convert markdown links to anchors inside blog_posts.localizations.
--   pnpm db:query -f scripts/migrations/2026-09-09-markdown-links-localizations.sql
--
-- Follow-up to 2026-09-09-markdown-links-to-anchors.sql, which fixed content_en
-- and content_zh and looked complete. It was not: the other TWELVE locales live
-- in the `localizations` JSONB column, holding 107,427 markdown links across
-- 199 published posts — ten times the first pass.
--
-- ONLY content* KEYS ARE REWRITTEN. This is the important constraint. Of the
-- six localized fields, only content* reaches dangerouslySetInnerHTML
-- (components/pages/BlogPostPage.tsx). title*/excerpt* render as ESCAPED React
-- text and metaTitle*/metaDescription* go into <meta>/<title>/JSON-LD, so
-- turning "[C](/c)" into an anchor there would display the literal characters
-- <a href="/c">C</a> to the reader — strictly worse than the markdown. Every
-- one of the 107,427 links happens to sit in a content* key today, so the gate
-- changes nothing now; it stops a later excerpt link from being corrupted.
--
-- Non-string values are passed through untouched. jsonb_each_text coerces
-- numbers and booleans to strings and flattens nested objects, so rebuilding
-- blindly would silently retype anything added later. The previous draft relied
-- on a one-time check that every value was a string; this enforces it instead.
--
-- Two passes: the (^|[^!]) prefix is consumed, so consecutive links are missed
-- on a single pass. Image syntax ![alt](src) is preserved.
--
-- KNOWN EXCEPTION: one post does not converge — a truncated
-- "[…case study](https://www." with no closing paren. Damaged source, not a
-- pattern gap.

UPDATE blog_posts b
   SET localizations = COALESCE((
     SELECT jsonb_object_agg(
              e.key,
              CASE
                WHEN jsonb_typeof(e.value) = 'string' AND e.key LIKE 'content%'
                THEN to_jsonb(
                       regexp_replace(
                         regexp_replace(e.value #>> '{}',
                           '(^|[^!])\[([^\]]+)\]\((/[^)\s"]+|https?://[^)\s"]+)\)',
                           '\1<a href="\3">\2</a>', 'g'),
                           '(^|[^!])\[([^\]]+)\]\((/[^)\s"]+|https?://[^)\s"]+)\)',
                           '\1<a href="\3">\2</a>', 'g'))
                ELSE e.value
              END)
     FROM jsonb_each(b.localizations) AS e), b.localizations)
 WHERE b.localizations IS NOT NULL
   AND jsonb_typeof(b.localizations) = 'object'
   AND b.localizations::text ~ '\[[^\]]+\]\((/|https?://)[^)\s]+\)';
