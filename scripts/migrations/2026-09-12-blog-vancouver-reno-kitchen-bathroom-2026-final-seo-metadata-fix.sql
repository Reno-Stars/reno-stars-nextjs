-- Migration: 2026-09-12-blog-vancouver-reno-kitchen-bathroom-2026-final-seo-metadata-fix.sql
-- Target: blog_posts.slug = 'vancouver-reno-kitchen-bathroom-2026-final'
-- Issue: meta_title_en/meta_description_en are "Test" placeholders; Chinese meta is also placeholder.
-- NOT applied — needs human to run.
-- Idempotent: WHERE guard prevents overwriting if already fixed.

BEGIN;

UPDATE blog_posts
SET
  meta_title_en   = CASE WHEN meta_title_en = 'Test' THEN 'Kitchen vs Bathroom: Which Reno Project First in Vancouver?' ELSE meta_title_en END,
  meta_description_en = CASE WHEN meta_description_en = 'Test' THEN 'Confused about kitchen vs bathroom renovation in Vancouver? Compare costs, ROI, timelines and permits for each to decide with confidence.' ELSE meta_description_en END,
  meta_title_zh   = CASE WHEN meta_title_zh = '测试' THEN '温哥华装修：先装修厨房还是卫生间？2026年完整对比' ELSE meta_title_zh END,
  meta_description_zh = CASE WHEN meta_description_zh = '测试' THEN '在温哥华先装修厨房还是先装修卫生间？比较成本、投资回报、施工时间和许可证要求，助您做出明智决定。' ELSE meta_description_zh END,
  focus_keyword_en = CASE WHEN focus_keyword_en = 'test' THEN 'kitchen bathroom renovation Vancouver' ELSE focus_keyword_en END,
  focus_keyword_zh = CASE WHEN focus_keyword_zh = '测试' THEN '温哥华装修厨房卫生间' ELSE focus_keyword_zh END,
  excerpt_en = CASE WHEN excerpt_en = 'Test' THEN 'Compare kitchen vs bathroom renovation costs, ROI and timelines in Vancouver to decide which project to tackle first.' ELSE excerpt_en END,
  excerpt_zh = CASE WHEN excerpt_zh = '测试' THEN '比较温哥华厨房与卫生间装修的成本、投资回报和施工时间，决定先做哪个项目。' ELSE excerpt_zh END
WHERE slug = 'vancouver-reno-kitchen-bathroom-2026-final'
  AND (
    meta_title_en = 'Test'
    OR meta_description_en = 'Test'
    OR meta_title_zh = '测试'
    OR meta_description_zh = '测试'
  );

COMMIT;

-- Also fix townhouse test post placeholder zh meta
-- Target: blog_posts.slug = 'townhouse-renovation-strata-rules-vancouver-2026'
-- Issue: meta_title_zh = 'Test ZH' (placeholder), meta_title_en = 'Test EN'
-- NOT applied — needs human to run.

BEGIN;

UPDATE blog_posts
SET
  meta_title_zh   = CASE WHEN meta_title_zh = 'Test ZH' THEN '温哥华联排别墅翻新：strata 规则、审批与费用指南 2026' ELSE meta_title_zh END,
  focus_keyword_zh = CASE WHEN focus_keyword_zh = '测试' THEN '温哥华联排别墅装修strata' ELSE focus_keyword_zh END
WHERE slug = 'townhouse-renovation-strata-rules-vancouver-2026'
  AND meta_title_zh = 'Test ZH';

COMMIT;
