-- Migration: blog_posts.focus_keyword_zh
-- Table: blog_posts
-- Gap: 10 rows with NULL focus_keyword_zh; only 28386e2c has a non-NULL focus_keyword_en to translate.
-- Source: focus_keyword_en = 'outdoor living space renovation vancouver'
-- Target: focus_keyword_zh = '温哥华户外生活空间装修'
-- NOT APPLIED — needs human to run.
UPDATE blog_posts
SET focus_keyword_zh = '温哥华户外生活空间装修'
WHERE id = '28386e2c-c726-41ce-95ac-e033e16d8027'
  AND focus_keyword_zh IS NULL
  AND focus_keyword_en = 'outdoor living space renovation vancouver';
