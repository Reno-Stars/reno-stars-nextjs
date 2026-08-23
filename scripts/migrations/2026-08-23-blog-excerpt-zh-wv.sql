-- Migration: blog_posts excerpt_zh for west-vancouver-home-renovation-guide-2026
-- Scope: 1 new row not covered by 2026-08-22 pending migration
-- NOT APPLIED — needs human run
-- Source: excerpt_en has real content; zh needs translation/drafting.
UPDATE blog_posts
SET excerpt_zh = 'West Vancouver 是大温哥华最高端的装修市场。从Ambleside到Dundarave，屋主们在2026年面对的是独特的高价值项目，需要本地专业团队。'
WHERE id = '27c9242e-44c6-4744-9122-59f830904950'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');
