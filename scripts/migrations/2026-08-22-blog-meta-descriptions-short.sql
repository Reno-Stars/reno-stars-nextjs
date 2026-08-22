-- 2026-08-22-blog-meta-descriptions-short.sql
-- 3 published blog posts have severely truncated meta descriptions.
-- NOT APPLIED — needs human review before running.

BEGIN;

-- kitchen-vs-bathroom-reno-vancouver-2026
-- meta_description_en: 29 chars, meta_description_zh: 5 chars (truncated)
UPDATE blog_posts
SET
  meta_description_en = 'Kitchen renovation costs $30–75K in Vancouver. Bathroom remodels run $15–40K. Compare budgets, timelines, and ROI before you decide.',
  meta_description_zh = '温哥华厨房装修费用$30,000至$75,000，浴室翻新$15,000至$40,000。比较预算、工期和投资回报率后再做决定。'
WHERE slug = 'kitchen-vs-bathroom-reno-vancouver-2026'
  AND published_at IS NOT NULL;

-- outdoor-living-space-renovation-vancouver-2026
-- meta_description_en: 26 chars, meta_description_zh: 26 chars (truncated)
UPDATE blog_posts
SET
  meta_description_en = 'Vancouver outdoor living space renovation: decks, patios, and permits for 2026. Budget $20–$80K. Learn what adds value to your home.',
  meta_description_zh = '温哥华户外空间装修：甲板、露台及2026年许可证。预算$20,000至$80,000。了解哪些项目能真正提升房产价值。'
WHERE slug = 'outdoor-living-space-renovation-vancouver-2026'
  AND published_at IS NOT NULL;

-- test-simple-post-2026
-- meta_description_en: 5 chars (placeholder "Test.")
UPDATE blog_posts
SET
  meta_description_en = 'A practical guide to Vancouver home renovation planning, permits, and budgeting. Expert tips for a smooth renovation experience.'
WHERE slug = 'test-simple-post-2026'
  AND published_at IS NOT NULL;

COMMIT;
