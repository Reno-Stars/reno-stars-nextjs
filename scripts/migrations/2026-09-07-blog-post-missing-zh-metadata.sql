-- Migration: populate excerpt_zh, meta_title_zh, meta_description_zh, focus_keyword_zh,
-- seo_keywords_zh for 2 blog posts that have Chinese content but no Chinese metadata.
--
-- NOT APPLIED — run manually after review:
--   pnpm db:query -f scripts/migrations/2026-09-07-blog-post-missing-zh-metadata.sql
--
-- Coverage check: neither slug appears in any existing migration.

-- ── Post 1: how-to-renovate-house-vancouver-first-timer-guide ─────────────────
--   title_zh: "温哥华房屋装修完整步骤指南：首次装修必读的流程与清单" ✓
--   content_zh: present ✓
--   excerpt_zh, meta_title_zh, meta_description_zh, focus_keyword_zh, seo_keywords_zh: NULL

UPDATE blog_posts SET
  excerpt_zh       = '大多数温哥华首次装修业主会低估时间线、跳过许可检查并在收到第一份合同就签署。本指南按顺序介绍每个步骤，包含2026年真实成本、BC省许可规则和完整流程。',
  meta_title_zh    = '温哥华房屋装修完整步骤指南 | 聚星装修',
  meta_description_zh = '首次在温哥华装修？本指南涵盖从许可到承包商选择的完整步骤，含2026年真实成本和BC省特定规则。',
  focus_keyword_zh = '温哥华首次装修指南',
  seo_keywords_zh = '温哥华装修指南,温哥华装修步骤,温哥华装修许可,温哥华装修成本2026,温哥华装修预算,温哥华装修承包商,BC省装修,温哥华房屋翻新,装修清单'
WHERE slug = 'how-to-renovate-house-vancouver-first-timer-guide'
  AND excerpt_zh IS NULL;

-- ── Post 2: vancouver-property-type-renovation-2026 ─────────────────────────
--   title_zh: "温哥华独立屋、公寓、联排别墅装修有何不同（2026）" ✓
--   content_zh: present ✓
--   excerpt_en: NULL, excerpt_zh, meta_title_zh, meta_description_zh, focus_keyword_zh, seo_keywords_zh: NULL

UPDATE blog_posts SET
  excerpt_en       = 'Detached houses, strata condos, and townhouses each carry different renovation rules, costs, and constraints. This guide breaks down what matters in 2026.',
  excerpt_zh       = '独立屋、共管公寓、联排别墅的装修规则、成本和限制各有不同。本指南解析2026年温哥华不同房产类型的装修差异，助您准确规划。',
  meta_title_zh    = '温哥华独立屋、公寓、联排别墅装修有何不同 | 聚星装修',
  meta_description_zh = '独立屋、共管公寓、联排别墅的装修规则、成本和限制各有不同。本指南解析2026年温哥华不同房产类型的装修差异，助您准确规划。',
  focus_keyword_zh = '温哥华房产类型装修差异',
  seo_keywords_zh = '温哥华独立屋装修,温哥华公寓装修,温哥华联排别墅装修,strata审批,共管公寓装修规定,2026温哥华装修,房产类型装修对比,温哥华装修规划'
WHERE slug = 'vancouver-property-type-renovation-2026'
  AND excerpt_zh IS NULL;
