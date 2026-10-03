-- Unpublish test/placeholder posts that have no genuine zh content
-- NOT applied: needs human review before running

UPDATE blog_posts
SET is_published = false, updated_at = NOW()
WHERE slug IN ('test-seo-keywords-2026', 'test-english-only-db')
  AND is_published = true
  AND (content_zh IS NULL OR content_zh !~ '[一-鿿]');
