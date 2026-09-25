-- Migration: 2026-09-25-meta-description-en-chinese-fix.sql
-- Target: blog_posts.meta_description_en
-- Issue: Cross-column contamination — entire meta_description_en field contains Chinese text.
--   slug: metro-vancouver-renovation-cost-comparison-2026
--   meta_description_en = '2026年大溫哥華裝修真實價格：廚房$40k–$150k、浴室$12k–$95k、全屋$150k–$800k。查看58個項目的實際造價。'
--   This is the Chinese text that belongs in meta_description_zh.
-- Fix: Restore from the English title/excerpt context.
--   The English title is "Metro Vancouver Renovation Cost Comparison 2026" and the
--   English excerpt covers kitchen $40k–$150k, bathroom $12k–$95k, whole-house $150k–$800k.
-- Idempotent: WHERE slug guard + exact bad value match ensures re-run is safe.
-- NOT APPLIED — needs human to run against the live database.

UPDATE blog_posts
SET meta_description_en = 'Kitchen $40k–$150k, Bathroom $12k–$95k, Whole-House $150k–$800k. See real costs from 58 completed Metro Vancouver renovation projects — updated 2026.',
    updated_at = NOW()
WHERE slug = 'metro-vancouver-renovation-cost-comparison-2026'
  AND meta_description_en = '2026年大溫哥華裝修真實價格：廚房$40k–$150k、浴室$12k–$95k、全屋$150k–$800k。查看58個項目的實際造價。';
