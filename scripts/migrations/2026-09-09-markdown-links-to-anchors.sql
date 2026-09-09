-- Migration: convert markdown links to real anchors in blog_posts.
--   pnpm db:query -f scripts/migrations/2026-09-09-markdown-links-to-anchors.sql
--
-- 211 published posts contain `[Text](url)` written as markdown inside HTML.
-- HTML does not interpret it, so visitors see the literal square brackets and
-- the link does not exist: 11,025 across content_en and content_zh, one post
-- carrying 129 alone. Beyond looking broken, each is a lost internal link to an
-- /areas/ or /services/ page on a site whose purpose is local SEO.
--
-- Covers BOTH target shapes. An earlier draft handled only "/..." and left
-- absolute-URL links behind — including internal https://www.reno-stars.com
-- ones — which would have looked like a complete fix while 3+ posts kept
-- rendering raw markdown.
--
-- (?<!!) excludes markdown IMAGE syntax ![alt](src), which must not become an
-- anchor. Existing real <a href> anchors are untouched: the pattern only
-- matches the markdown form.
--
-- KNOWN EXCEPTIONS, left deliberately — 4 posts survive two passes and do NOT
-- converge with more (verified to pass 6, count stays flat). These are damaged
-- source content, not a pattern gap, and need a human with the real URLs:
--   basement-renovations-coquitlam-2026        (en)
--   duplex-renovation-vancouver-costs-permits  (zh)
--   multi-generational-home-renovation-vanco…  (zh)
--   basement-renovations-burnaby-2026          (zh)
-- e.g. "[Coquitlam condo renovation case study](https://www." — truncated
-- mid-URL, no closing paren, nothing to link to.

UPDATE blog_posts
   SET content_en = regexp_replace(content_en,
        '(^|[^!])\[([^\]]+)\]\((/[^)\s]+|https?://[^)\s]+)\)', '\1<a href="\3">\2</a>', 'g')
 WHERE content_en ~ '\[[^\]]+\]\((/|https?://)[^)\s]+\)';

-- second pass: the (^|[^!]) prefix is consumed, so consecutive links
-- are missed on a single pass. Re-running is a no-op once none remain.
UPDATE blog_posts
   SET content_en = regexp_replace(content_en,
        '(^|[^!])\[([^\]]+)\]\((/[^)\s]+|https?://[^)\s]+)\)', '\1<a href="\3">\2</a>', 'g')
 WHERE content_en ~ '\[[^\]]+\]\((/|https?://)[^)\s]+\)';

UPDATE blog_posts
   SET content_zh = regexp_replace(content_zh,
        '(^|[^!])\[([^\]]+)\]\((/[^)\s]+|https?://[^)\s]+)\)', '\1<a href="\3">\2</a>', 'g')
 WHERE content_zh ~ '\[[^\]]+\]\((/|https?://)[^)\s]+\)';

-- second pass: the (^|[^!]) prefix is consumed, so consecutive links
-- are missed on a single pass. Re-running is a no-op once none remain.
UPDATE blog_posts
   SET content_zh = regexp_replace(content_zh,
        '(^|[^!])\[([^\]]+)\]\((/[^)\s]+|https?://[^)\s]+)\)', '\1<a href="\3">\2</a>', 'g')
 WHERE content_zh ~ '\[[^\]]+\]\((/|https?://)[^)\s]+\)';

UPDATE blog_posts
   SET excerpt_en = regexp_replace(excerpt_en,
        '(^|[^!])\[([^\]]+)\]\((/[^)\s]+|https?://[^)\s]+)\)', '\1<a href="\3">\2</a>', 'g')
 WHERE excerpt_en ~ '\[[^\]]+\]\((/|https?://)[^)\s]+\)';

-- second pass: the (^|[^!]) prefix is consumed, so consecutive links
-- are missed on a single pass. Re-running is a no-op once none remain.
UPDATE blog_posts
   SET excerpt_en = regexp_replace(excerpt_en,
        '(^|[^!])\[([^\]]+)\]\((/[^)\s]+|https?://[^)\s]+)\)', '\1<a href="\3">\2</a>', 'g')
 WHERE excerpt_en ~ '\[[^\]]+\]\((/|https?://)[^)\s]+\)';

UPDATE blog_posts
   SET excerpt_zh = regexp_replace(excerpt_zh,
        '(^|[^!])\[([^\]]+)\]\((/[^)\s]+|https?://[^)\s]+)\)', '\1<a href="\3">\2</a>', 'g')
 WHERE excerpt_zh ~ '\[[^\]]+\]\((/|https?://)[^)\s]+\)';

-- second pass: the (^|[^!]) prefix is consumed, so consecutive links
-- are missed on a single pass. Re-running is a no-op once none remain.
UPDATE blog_posts
   SET excerpt_zh = regexp_replace(excerpt_zh,
        '(^|[^!])\[([^\]]+)\]\((/[^)\s]+|https?://[^)\s]+)\)', '\1<a href="\3">\2</a>', 'g')
 WHERE excerpt_zh ~ '\[[^\]]+\]\((/|https?://)[^)\s]+\)';
