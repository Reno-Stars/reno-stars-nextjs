-- 2026-05-26 SEO agent — additive column letting the agent A/B-test blog meta
-- titles + descriptions without touching the content-team's authored fields.
--
-- Authored `meta_title_*` / `meta_description_*` remain the source of truth;
-- read path in `app/[locale]/blog/[slug]/page.tsx` prefers
-- `meta_overrides.title[locale]` then falls back to authored, then to the
-- post's title/excerpt. Empty default (`{}`) is interpreted as "no override".
--
-- Backfill: none — existing rows get `{}`, behavior unchanged.
-- Rollback: `ALTER TABLE blog_posts DROP COLUMN meta_overrides;` (no data
-- impact since reads tolerate the field being absent).

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS meta_overrides jsonb DEFAULT '{}'::jsonb NOT NULL;
