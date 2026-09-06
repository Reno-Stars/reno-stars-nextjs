-- 2026-09-07-blog-excerpt-meta-zh-two-posts.sql
-- Migration: backfill excerpt_zh, meta_description_zh, meta_title_zh, focus_keyword_zh, seo_keywords_zh for 2 blog posts
-- Status: PENDING HUMAN APPLY — NOT auto-applied on merge
-- Posts: how-to-renovate-house-vancouver-first-timer-guide, vancouver-property-type-renovation-2026
-- NOTE: focus_keyword_en, seo_keywords_en are also NULL for these posts but not addressed here (English-side gap, separate concern)

BEGIN;

-- Post 1: How to Renovate Your House in Vancouver — First Timer Guide
UPDATE blog_posts
SET
  excerpt_zh = '温哥华首次装修完整步骤指南：许可、成本、选承包商、按时完工。本指南按顺序解析每个环节，附2026真实成本数据。',
  meta_title_zh = '温哥华房屋装修步骤指南：首次装修必读 | 聚星装修',
  meta_description_zh = '温哥华首次装修必读：按步骤解析从许可到完工的全流程，附真实成本数据，助您避开常见误区，稳妥完成装修。',
  focus_keyword_zh = '温哥华装修步骤',
  seo_keywords_zh = '温哥华装修,首次装修指南,温哥华装修步骤,BC省装修许可,温哥华装修成本,房屋装修流程'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (excerpt_zh IS NULL OR excerpt_zh = ''
       OR meta_title_zh IS NULL OR meta_title_zh = ''
       OR meta_description_zh IS NULL OR meta_description_zh = '');

-- Post 2: House vs Condo vs Townhouse Renovation in Vancouver 2026
UPDATE blog_posts
SET
  excerpt_zh = '温哥华独立屋、公寓、联排别墅装修有何不同？一篇指南拆解三种房产类型的装修规则、成本与注意事项，2026最新版。',
  meta_title_zh = '温哥华独立屋、公寓、联排别墅装修对比（2026） | 聚星装修',
  meta_description_zh = '温哥华独立屋、公寓、联排别墅装修有何不同？一篇指南拆解三种房产类型的治理结构、审批流程与成本差异，2026最新版。',
  focus_keyword_zh = '温哥华房产类型装修',
  seo_keywords_zh = '温哥华独立屋装修,温哥华公寓装修,温哥华联排别墅装修,共管公寓装修,温哥华装修类型,三种房产装修对比'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (excerpt_zh IS NULL OR excerpt_zh = ''
       OR meta_title_zh IS NULL OR meta_title_zh = ''
       OR meta_description_zh IS NULL OR meta_description_zh = '');

COMMIT;
