-- Dedup: coquitlam-condo-renovation-case-study-2
-- Original focus_keyword 'Coquitlam condo renovation' duplicated across 3 posts
-- Differentiate: add city-year angle
UPDATE blog_posts
SET focus_keyword_en = 'Coquitlam condo renovation 2026'
WHERE id = '6dab4f23-d2d3-4201-84d7-cf1f8d6e16a8'
  AND focus_keyword_en = 'Coquitlam condo renovation';

-- Dedup: coquitlam-condo-whole-house-renovation-case-study
-- Differentiate: add whole-house specificity
UPDATE blog_posts
SET focus_keyword_en = 'Coquitlam condo whole-house renovation'
WHERE id = '99934a64-7d81-4bec-b5d8-f41414428348'
  AND focus_keyword_en = 'Coquitlam condo renovation';
