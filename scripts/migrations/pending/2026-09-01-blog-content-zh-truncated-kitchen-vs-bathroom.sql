-- Migration: blog_posts — content_zh truncated placeholder
-- Date: 2026-09-01
-- Status: NOT APPLIED — needs human review before running
-- Issue: post "kitchen-vs-bathroom-reno-vancouver-2026" (id: c88b22eb-13c7-45f6-9597-4a6852742c54)
--   is_published=true, content_zh has only 22 chars (<p>温哥华装修先厨房还是先卫生间？</p>)
--   content_en has 11,328 chars (full article). content_zh is a title-only stub, not a translation.
--   Shipping English text on Chinese URLs damages E-E-A-T and user trust.
--
-- Action: set content_zh and excerpt_zh to NULL so the Chinese URL falls back to English
--   rather than showing a placeholder. This is the safest migration — next-intl will render
--   the Chinese URL with English content (not blank), preserving SEO while removing the stub.
--   A full translation can be added separately by a bilingual team member.
--
-- Idempotent WHERE guard:
UPDATE blog_posts
SET content_zh = NULL,
    excerpt_zh = NULL,
    updated_at = NOW()
WHERE id = 'c88b22eb-13c7-45f6-9597-4a6852742c54'
  AND content_zh IS NOT NULL
  AND LENGTH(content_zh) < 100;
