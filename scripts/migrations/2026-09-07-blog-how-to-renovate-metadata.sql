-- Migration: populate SEO metadata for published post how-to-renovate-house-vancouver-first-timer-guide.
--
-- NOT APPLIED — run manually after review:
--   pnpm db:query -f scripts/migrations/2026-09-07-blog-how-to-renovate-metadata.sql
--
-- Gap found: focus_keyword_en, focus_keyword_zh, seo_keywords_en, seo_keywords_zh,
-- and excerpt_zh all NULL for this published post.
-- vancouver-property-type-renovation-2026 already covered in prior migration (skipped).

UPDATE blog_posts SET
  focus_keyword_en  = 'vancouver house renovation',
  focus_keyword_zh = '温哥华装修指南',
  seo_keywords_en  = 'vancouver house renovation,vancouver home renovation guide,first time house renovation vancouver,vancouver renovation permits bc,how to renovate house vancouver,vancouver renovation cost 2026,vancouver renovation contractor',
  seo_keywords_zh  = '温哥华房屋装修,温哥华装修指南,温哥华装修流程,温哥华装修步骤,温哥华装修清单,温哥华装修费用2026,温哥华装修许可',
  excerpt_zh       = '温哥华首次装修业主常低估工期、跳过许可检查、收到合同就签署。本指南涵盖每一步的详细步骤、2026年真实成本和BC省specific许可规则。'
WHERE slug = 'how-to-renovate-house-vancouver-first-timer-guide'
  AND is_published = true
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');
