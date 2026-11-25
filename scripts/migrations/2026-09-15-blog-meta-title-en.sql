-- 2026-09-15-blog-meta-title-en.sql
-- NOT APPLIED — needs human to run.
-- Populates meta_title_en for two blog posts that have title_en and content_en
-- but are missing the SEO meta_title_en field.

UPDATE blog_posts
SET
  meta_title_en = CASE id
    WHEN '27dd8051-1198-4c2f-97f2-b058b9ba7247'
      THEN 'How to Renovate Your House in Vancouver: A First-Timer'\''s Guide'
    WHEN '625cdf1c-8733-470c-9198-f56de2a152c6'
      THEN 'House vs Condo vs Townhouse Renovation in Vancouver (2026)'
    ELSE meta_title_en
  END
WHERE id IN ('27dd8051-1198-4c2f-97f2-b058b9ba7247', '625cdf1c-8733-470c-9198-f56de2a152c6')
  AND meta_title_en IS NULL;
