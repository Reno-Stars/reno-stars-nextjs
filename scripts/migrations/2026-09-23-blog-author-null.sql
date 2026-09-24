-- Migration: 2026-09-23-blog-author-null
-- Target: blog_posts.is_published=true where author IS NULL or empty
-- Estimated rows: 232 published posts (from DB scan 2026-09-23)
-- Status: NOT APPLIED — needs human to run
-- This migration is idempotent: re-running produces the same result

DO $$
DECLARE
    affected_count INTEGER;
BEGIN
    -- Guard clause: abort if no rows match the condition
    SELECT count(*) INTO affected_count
    FROM blog_posts
    WHERE is_published = true
      AND (author IS NULL OR trim(author) = '');

    IF affected_count = 0 THEN
        RAISE NOTICE 'No blog_posts rows with NULL/empty author where is_published=true — nothing to do.';
    ELSE
        RAISE NOTICE 'Found % rows to update (author to Reno Stars)', affected_count;
        UPDATE blog_posts
        SET author = 'Reno Stars',
            updated_at = now()
        WHERE is_published = true
          AND (author IS NULL OR trim(author) = '');

        RAISE NOTICE 'Updated % rows.', affected_count;
    END IF;
END;
$$;
