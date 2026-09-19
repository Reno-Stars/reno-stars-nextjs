-- Migration: NOT APPLIED — needs human to run
-- Clear English placeholder text from zh fields on two unpublished test blog posts
-- Rows: ae52f455-64eb-40fb-8f4a-7488902c53c3 ("Test Post Full Validation") and 76e1c252-b1ed-4268-89c5-20958dbb7cbd ("Test Rich Formatting 2026")
-- Both is_published=false; draft posts from 2026-09-05 that have "Test ZH" as all zh fields
UPDATE blog_posts SET
    title_zh = NULL,
    meta_title_zh = NULL,
    focus_keyword_zh = NULL,
    meta_description_zh = NULL
WHERE id IN (
    'ae52f455-64eb-40fb-8f4a-7488902c53c3',
    '76e1c252-b1ed-4268-89c5-20958dbb7cbd'
)
AND title_zh = 'Test ZH'
AND is_published = false;
