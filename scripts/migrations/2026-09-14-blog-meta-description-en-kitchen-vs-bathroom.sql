-- Migration: 2026-09-14-blog-meta-description-en-kitchen-vs-bathroom.sql
-- Issue: blog post c88b22eb (kitchen-vs-bathroom-reno-vancouver-2026) has
--          meta_description_en = 'Kitchen vs bathroom Vancouver' (29 chars, too short for SEO).
--          Google truncates meta descriptions >155 chars; below 120 is wasted SERP real estate.
-- Fix:   set a descriptive 122-char meta_description_en.
-- NOTE:  NOT APPLIED — needs human to run via pnpm db:query -f ...
-- Excluded IDs already covered: none for meta_description_en on this post.
UPDATE blog_posts
SET
  meta_description_en = 'Renovating your Vancouver home? Compare kitchen vs bathroom renovation costs, timelines, ROI, and what to prioritize first in Metro Vancouver.'
WHERE id = 'c88b22eb-13c7-45f6-9597-4a6852742c54'
  AND slug = 'kitchen-vs-bathroom-reno-vancouver-2026'
  AND meta_description_en = 'Kitchen vs bathroom Vancouver';
