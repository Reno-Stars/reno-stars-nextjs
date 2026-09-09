-- Migration: 2026-09-08 blog posts zh translation gaps
-- STATUS: NOT APPLIED — requires human to run before publish
-- Covers two blog posts with NULL excerpt_zh, meta_title_zh, meta_description_zh,
--   focus_keyword_zh, seo_keywords_zh, and severely truncated content_zh.
-- Idempotent WHERE guard: only updates rows where those fields are currently NULL.

-- ============================================================
-- POST 1: how-to-renovate-house-vancouver-first-timer-guide
-- id: 27dd8051-1198-4c2f-97f2-b058b9ba7247
-- ============================================================

UPDATE blog_posts
SET
  excerpt_zh = '大多数温哥华首次装修者都低估了工期、跳过许可证检查，并签下收到的第一份合同。本指南覆盖每个步骤。',
  meta_title_zh = '温哥华房屋装修步骤指南 | 首次装修必读',
  meta_description_zh = '温哥华首次装修完整步骤指南：含2026年真实费用、BC省许可证规则及Reno Stars客户从签约到交钥匙的流程清单。',
  focus_keyword_zh = '温哥华装修步骤',
  seo_keywords_zh = '温哥华装修,温哥华装修步骤,温哥华房屋装修,温哥华装修费用,BC省装修许可证,温哥华装修公司,首次装修指南',
  content_zh = $$<p>如果您从未装修过房屋，从"我想要一个新厨房"到"承包商刚把钥匙交给我"的过程会让人感觉像在没有地图的情况下导航。大多数温哥华首次装修者都低估了工期、跳过许可证检查，并签下收到的第一份合同。本指南按顺序介绍每个步骤，包含2026年真实费用、BC省特定许可规则，以及Reno Stars客户从首次会议到交钥匙的完整流程。</p><p>温哥华的全面房屋装修仅施工阶段就需要4到9个月。施工前规划还需额外2到4个月，才能开始拆除任何墙壁。Reno Stars在签约前为每位首次客户提供书面里程碑时间表，使客户从第一天起就能看到完整时间线。</p><p>已完成装修项目的真实数据：Surrey厨房$20,000-$23,000（4-5周），Burnaby两间浴室$25,000-$30,000（4-5周），Richmond带洗手间的双浴室$33,000-$35,000（6-8周），温哥华全屋$70,000-$72,000（8-10周）。</p>$$
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND excerpt_zh IS NULL;

UPDATE blog_posts
SET
  focus_keyword_zh = '温哥华装修步骤',
  seo_keywords_zh = '温哥华装修,温哥华装修步骤,温哥华房屋装修,温哥华装修费用,BC省装修许可证,温哥华装修公司,首次装修指南'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND focus_keyword_zh IS NULL;

-- ============================================================
-- POST 2: vancouver-property-type-renovation-2026
-- id: 625cdf1c-8733-470c-9198-f56de2a152c6
-- ============================================================

UPDATE blog_posts
SET
  excerpt_zh = '独立屋、公寓、联排别墅：温哥华不同房产类型的装修规则、费用和限制有何区别？本指南为您详细对比。',
  meta_title_zh = '温哥华独立屋、公寓、联排别墅装修有何不同（2026）',
  meta_description_zh = '温哥华独立屋、公寓、联排别墅装修对比：许可要求、费用差异、strata规定详解，助您按房产类型准确规划装修。',
  focus_keyword_zh = '温哥华房产类型装修',
  seo_keywords_zh = '温哥华独立屋装修,温哥华公寓装修,温哥华联排别墅装修,温哥华strata装修,温哥华装修费用对比,温哥华装修许可',
  content_zh = $$<p>2026年，大温哥华地区的业主在装修时面临一个选择：您持有的是哪种房产类型？独立屋、分层公寓还是联排别墅——每种房产都有不同的规则、费用和限制。本指南详细解析影响装修规划的关键差异。</p><p>核心区别在于治理结构。独立屋只需对温哥华市或相关市政当局负责。而公寓和联排别墅首先需要对业主委员会（strata corporation）负责——这改变了一切。Strata审批使项目开工时间延长两到六周。它可以阻止 Cosmetic 变更（如果业主委员会投票反对），并可对承包商保险、工作时间和噪音施加独立屋业主永远不会遇到的限制。</p><p>Reno Stars已在列治文、温哥华、高贵林、Delta和北温哥华完成三个房产类型的项目。三种类型的逐步施工流程相同；不同的只是叠加在上面的许可层。</p>$$
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND excerpt_zh IS NULL;

UPDATE blog_posts
SET
  focus_keyword_zh = '温哥华房产类型装修',
  seo_keywords_zh = '温哥华独立屋装修,温哥华公寓装修,温哥华联排别墅装修,温哥华strata装修,温哥华装修费用对比,温哥华装修许可'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND focus_keyword_zh IS NULL;
