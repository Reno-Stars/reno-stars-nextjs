-- Migration: populate meta_description_zh and meta_title_zh for 10 unpublished test-draft
-- blog_posts with NULL meta_description_zh.
-- NOT APPLIED — needs human to run after review.
-- Rows identified from: SELECT slug, id, is_published, meta_title_zh
--   WHERE meta_description_zh IS NULL OR meta_description_zh = ''
--   ORDER BY updated_at DESC;
--
-- One UPDATE per column, each guarded on the column it writes. The previous
-- single multi-column UPDATE was guarded only on meta_description_zh, so on any
-- row that already had a description the statement skipped the row entirely and
-- meta_title_zh was never backfilled — silently, reporting success on 0 rows.
-- COALESCE is no longer needed: the guard already excludes rows that have a value.

UPDATE blog_posts
SET meta_title_zh = title_zh
WHERE
  is_published = FALSE
  AND (meta_title_zh IS NULL OR meta_title_zh = '')
  AND title_zh IS NOT NULL
  AND slug IN (
    'outdoor-test-longexcerpt',
    'outdoor-test-mt4',
    'outdoor-test-mt3',
    'outdoor-test-mt2',
    'outdoor-test-mt1',
    'outdoor-test-amp',
    'outdoor-test-fkzh',
    'outdoor-test-fk',
    'outdoor-test-md80',
    'outdoor-test-half1'
  );

UPDATE blog_posts
SET meta_description_zh = excerpt_zh
WHERE
  is_published = FALSE
  AND (meta_description_zh IS NULL OR meta_description_zh = '')
  AND excerpt_zh IS NOT NULL
  AND slug IN (
    'outdoor-test-longexcerpt',
    'outdoor-test-mt4',
    'outdoor-test-mt3',
    'outdoor-test-mt2',
    'outdoor-test-mt1',
    'outdoor-test-amp',
    'outdoor-test-fkzh',
    'outdoor-test-fk',
    'outdoor-test-md80',
    'outdoor-test-half1'
  );
