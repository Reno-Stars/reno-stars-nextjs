-- Clear English-only test content from two blog posts.
-- NOT APPLIED — needs human to review and run against live DB.
-- These rows contain English placeholder text in content_zh and excerpt_zh.

UPDATE blog_posts
SET content_zh = NULL,
    excerpt_zh = NULL,
    updated_at = NOW()
WHERE slug = 'test-seo-keywords-2026'
  AND content_zh IS DISTINCT FROM NULL
  AND excerpt_zh IS DISTINCT FROM NULL;

UPDATE blog_posts
SET content_zh = NULL,
    excerpt_zh = NULL,
    updated_at = NOW()
WHERE slug = 'test-english-only-db'
  AND content_zh IS DISTINCT FROM NULL
  AND excerpt_zh IS DISTINCT FROM NULL;
