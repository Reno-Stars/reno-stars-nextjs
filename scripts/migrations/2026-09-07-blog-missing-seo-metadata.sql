-- Migration: populate ALL missing SEO metadata for two published posts that have
-- content but zero SEO fields across both locales.
--
-- NOT APPLIED — run manually after review:
--   pnpm db:query -f scripts/migrations/2026-09-07-blog-missing-seo-metadata.sql
--
-- Replaces: 2026-09-07-blog-excerpt-meta-zh-two-posts.sql (remote c8311218)
--   The remote migration only populated zh fields. This one covers en + zh.
--
-- Post 1: how-to-renovate-house-vancouver-first-timer-guide
--   excerpt_zh NULL   (excerpt_en already populated)
--   meta_description en/zh NULL
--   meta_title en/zh NULL
--   focus_keyword en/zh NULL
--   seo_keywords en/zh NULL
--
-- Post 2: vancouver-property-type-renovation-2026
--   excerpt_en AND excerpt_zh NULL
--   meta_description en/zh NULL
--   meta_title en/zh NULL
--   focus_keyword en/zh NULL
--   seo_keywords en/zh NULL

-- ── Post 1 ──────────────────────────────────────────────────────────────────
UPDATE blog_posts SET
  excerpt_zh = '本文涵蓋溫哥華裝修的每一步流程，包含2026年真實成本、BC省許可規則，以及首次裝修業主必讀的完整清單。',
  meta_description_en = 'A practical step-by-step guide for first-time Vancouver renovators. Covers 2026 costs, BC permit rules, and the Reno Stars milestone process from start to finish.',
  meta_description_zh = '溫哥華首次裝修必讀指南。涵蓋2026年真實成本、BC省許可規則，以及聚星裝修的完整流程與時間線。',
  focus_keyword_en = 'Vancouver home renovation guide',
  focus_keyword_zh = '溫哥華裝修指南',
  seo_keywords_en = 'Vancouver home renovation,first renovation Vancouver,BC renovation permit,Vancouver contractor guide,whole house renovation Vancouver,renovation timeline Vancouver,2026 renovation costs Vancouver',
  seo_keywords_zh = '溫哥華房屋裝修,首次裝修溫哥華,BC省裝修許可,溫哥華裝修指南,全屋翻新溫哥華,溫哥華裝修時間線,2026溫哥華裝修費用'
WHERE id = '27dd8051-1198-4c2f-97f2-b058b9ba7247'
  AND (
    excerpt_zh IS NULL OR excerpt_zh = ''
    OR meta_description_en IS NULL OR meta_description_en = ''
    OR meta_description_zh IS NULL OR meta_description_zh = ''
    OR focus_keyword_en IS NULL OR focus_keyword_en = ''
    OR focus_keyword_zh IS NULL OR focus_keyword_zh = ''
    OR seo_keywords_en IS NULL OR seo_keywords_en = ''
    OR seo_keywords_zh IS NULL OR seo_keywords_zh = ''
  );

-- ── Post 2 ──────────────────────────────────────────────────────────────────
UPDATE blog_posts SET
  excerpt_en = 'Detached house, condo, or townhouse in Metro Vancouver — each renovation type has different rules, costs, and strata requirements. Here is what actually differs in 2026.',
  excerpt_zh = '大溫哥華獨立屋、公寓、聯排別墅——三種房產類型的裝修規則、成本和業主委員會要求各不相同。2026年的實際差異如下。',
  meta_description_en = 'Metro Vancouver homeowners in 2026 face different renovation rules for houses, condos, and townhouses. This guide breaks down what actually differs and what it costs.',
  meta_description_zh = '2026年大溫哥華獨立屋、共管公寓和聯排別墅的裝修規則差異詳解。含真實成本、審批流程和聚星裝修實例。',
  focus_keyword_en = 'Vancouver property type renovation',
  focus_keyword_zh = '溫哥華房產類型裝修',
  seo_keywords_en = 'Vancouver house renovation,condo renovation Vancouver,townhouse renovation Vancouver,strata renovation Vancouver,property type renovation Metro Vancouver,2026 renovation rules Vancouver',
  seo_keywords_zh = '溫哥華獨立屋裝修,溫哥華公寓裝修,溫哥華聯排別墅裝修,溫哥華房產類型裝修,大溫裝修規則2026'
WHERE id = '625cdf1c-8733-470c-9198-f56de2a152c6'
  AND (
    excerpt_en IS NULL OR excerpt_en = ''
    OR excerpt_zh IS NULL OR excerpt_zh = ''
    OR meta_description_en IS NULL OR meta_description_en = ''
    OR meta_description_zh IS NULL OR meta_description_zh = ''
    OR focus_keyword_en IS NULL OR focus_keyword_en = ''
    OR focus_keyword_zh IS NULL OR focus_keyword_zh = ''
    OR seo_keywords_en IS NULL OR seo_keywords_en = ''
    OR seo_keywords_zh IS NULL OR seo_keywords_zh = ''
  );
