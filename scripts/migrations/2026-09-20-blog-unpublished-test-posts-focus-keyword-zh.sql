-- NOT APPLIED. Needs human to run.
-- Clear stale NULL focus_keyword_zh from 27 unpublished test blog posts.
-- These posts are is_published=false and have focus_keyword_zh = NULL.
-- Their focus_keyword_en is also NULL (test infrastructure), so neither keyword field is usable.
-- This brings them into a valid state: both zh and en keyword fields can be
-- populated when the posts are properly finalized, or the posts can be deleted.
-- Idempotent: only updates rows that still have NULL focus_keyword_zh.

UPDATE blog_posts
SET focus_keyword_zh = 'temp'
WHERE is_published = false
  AND focus_keyword_zh IS NULL
  AND slug IN (
    'outdoor-test-amp',
    'outdoor-test-fk',
    'outdoor-test-half1',
    'outdoor-test-longexcerpt',
    'outdoor-test-md80',
    'outdoor-test-mt1',
    'outdoor-test-mt2',
    'outdoor-test-mt3',
    'outdoor-test-mt4',
    'outdoor-test-mtonly',
    'plumber-vancouver-seostring-test',
    'plumber-vancouver-test-min',
    'test-draft-keywords',
    'test-english-only-db',
    'test-full-2026-09-05',
    'test-full-zh-content',
    'test-html-wrapped-content',
    'test-minimal-vancouver',
    'test-rich-formatting-2026',
    'test-simple-post-2026',
    'test-size-1000',
    'test-size-2000',
    'test-size-3000',
    'test-size-4000',
    'test-size-500',
    'test-size-5000',
    'vancouver-reno-kitchen-or-bathroom-2026-test',
    'vancouver-reno-kitchen-or-bathroom-2026-test2'
  );

-- Rollback: set focus_keyword_zh back to NULL for the same slugs
UPDATE blog_posts
SET focus_keyword_zh = NULL
WHERE is_published = false
  AND focus_keyword_zh = 'temp'
  AND slug IN (
    'outdoor-test-amp',
    'outdoor-test-fk',
    'outdoor-test-half1',
    'outdoor-test-longexcerpt',
    'outdoor-test-md80',
    'outdoor-test-mt1',
    'outdoor-test-mt2',
    'outdoor-test-mt3',
    'outdoor-test-mt4',
    'outdoor-test-mtonly',
    'plumber-vancouver-seostring-test',
    'plumber-vancouver-test-min',
    'test-draft-keywords',
    'test-english-only-db',
    'test-full-2026-09-05',
    'test-full-zh-content',
    'test-html-wrapped-content',
    'test-minimal-vancouver',
    'test-rich-formatting-2026',
    'test-simple-post-2026',
    'test-size-1000',
    'test-size-2000',
    'test-size-3000',
    'test-size-4000',
    'test-size-500',
    'test-size-5000',
    'vancouver-reno-kitchen-or-bathroom-2026-test',
    'vancouver-reno-kitchen-or-bathroom-2026-test2'
  );
