-- NOT APPLIED: needs human to run against production DB
-- Fixes truncated meta_title_zh, meta_description_zh, and focus_keyword_zh
-- for blog post kitchen-vs-bathroom-reno-vancouver-2026 (id: c88b22eb-13c7-45f6-9597-4a6852742c54)
-- All three fields were incorrectly set to "温哥华装修" (first 5 chars of headline).
-- Correct values derived from the full Chinese headline on the live page.

BEGIN;

UPDATE blog_posts
SET
  meta_title_zh     = '温哥华装修：先装修厨房还是卫生间？2026年完整对比指南',
  meta_description_zh = '温哥华装修先厨房还是先卫生间？本文对比两大项目的预算、影响、时间和决策框架，附Reno Stars真实案例，助您做出最佳选择。',
  focus_keyword_zh  = '温哥华装修'
WHERE id = 'c88b22eb-13c7-45f6-9597-4a6852742c54'
  AND (
    meta_title_zh = '温哥华装修'
    OR meta_description_zh = '温哥华装修'
    OR focus_keyword_zh = '温哥华装修'
  );

COMMIT;
