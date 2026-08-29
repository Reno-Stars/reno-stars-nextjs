-- Migration: 2026-08-29-blog-outdoor-meta-desc-and-featured-alt.sql
-- Target: blog_posts.id = c7eabaf3-4afb-4cfa-980a-f416d450d0d3
-- Issue: meta_description_zh is 26 chars (below 50-char threshold); featuredImageAltEn/Zh
--         missing from localizations (rendered as undefined in BlogPosting JSON-LD).
-- Status: NOT APPLIED — needs human to run.
-- Verification (post-apply): SELECT meta_description_zh, localizations FROM blog_posts WHERE id = 'c7eabaf3-4afb-4cfa-980a-f416d450d0d3';

UPDATE blog_posts
SET
  meta_description_zh = '温哥华甲板、露台和有顶户外空间装修完整指南。涵盖2026年费用、许可要求及大温各市政流程。',
  localizations = jsonb_set(
    COALESCE(localizations, '{}'::jsonb)
    || '{"featuredImageAltEn": "Modern toys store renovation in Metrotown Burnaby with bright open-concept layout and contemporary finishes", "featuredImageAltZh": "本拿比铁道镇现代玩具店装修，开放式设计，当代饰面"}'
    , '{}'
  )
WHERE id = 'c7eabaf3-4afb-4cfa-980a-f416d450d0d3'
  AND (
    meta_description_zh = '温哥华甲板露台装修费用、许可要求及完整装修流程详解。'
    OR meta_description_zh IS NULL
  );
