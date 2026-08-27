-- Migration: blog_posts excerpt_zh for pre-sale-renovation-white-rock-bc-2026
-- NOT APPLIED — needs human run
-- Reason: blog_posts excerpt_zh NULL despite title_zh + content_zh populated
-- This is NOT a priority fix (title+content are translated, excerpt is secondary meta)

UPDATE blog_posts
SET excerpt_zh = '2026年白石预售翻新回报指南：厨房、浴室、海滨外观改造，回报率达售价150%至300%，适合Semiahmoo及Ocean Park区卖家。'
WHERE slug = 'pre-sale-renovation-white-rock-bc-2026'
  AND (excerpt_zh IS NULL OR excerpt_zh = '');
