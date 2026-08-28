-- Migrate zh metadata for kitchen-vs-bathroom reno post from sibling draft
-- Source: vancouver-reno-kitchen-bathroom-2026-final (unpublished, has full content_zh)
-- Target: kitchen-vs-bathroom-reno-vancouver-2026 (is_published=true, live, has stub excerpt_zh)
--
-- NOT APPLIED — needs human run

UPDATE blog_posts
SET
  excerpt_zh        = '在温哥华装修房子，如果预算只够装修一个房间，大多数有经验的装修师傅会建议优先选择厨房而不是卫生间。厨房装修在房子出售时通常能带来更高的投资回报，而且厨房是每个家庭每天使用最频繁的空间。本指南详细分析实际成本、施工工期和取舍要点。',
  focus_keyword_zh = '温哥华装修',
  seo_keywords_zh  = '温哥华厨房装修,温哥华卫生间装修,厨房vs卫生间,温哥华装修费用2026,温哥华装修先厨房还是卫生间'
WHERE
  slug = 'kitchen-vs-bathroom-reno-vancouver-2026'
  AND is_published = true
  AND excerpt_zh = '温哥华装修';
