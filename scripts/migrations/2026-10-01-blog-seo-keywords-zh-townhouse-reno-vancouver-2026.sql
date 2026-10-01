-- Migration: 2026-10-01-blog-seo-keywords-zh-townhouse-reno-vancouver-2026
-- NOT APPLIED — needs human to run
-- Target: blog_posts.seo_keywords_zh = NULL for a published post that has no zh SEO keywords
-- Content integrity finding: blog_posts.is_published AND seo_keywords_zh IS NULL
-- Idempotent WHERE guard ensures no-op if already set
UPDATE blog_posts
SET    seo_keywords_zh = seo_keywords_en
WHERE  id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND  is_published
  AND (seo_keywords_zh IS NULL OR seo_keywords_zh = '');
