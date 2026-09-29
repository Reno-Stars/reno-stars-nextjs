-- Fix: meta_description_en contains Chinese text (cross-column contamination)
-- The English excerpt_en is correct; derive a proper English meta_description_en from it
-- Idempotent: guarded on exact bad value
UPDATE blog_posts
SET meta_description_en = '2026 Metro Vancouver renovation costs: kitchen $40k–$150k, bathroom $12k–$95k, whole-house $150k–$800k+. See real project prices from Reno Stars.'
WHERE id = '6e21e8a2-e6d1-4ecd-abfe-0a70c8060086'
  AND meta_description_en = '2026年大溫哥華裝修真實價格：廚房$40k–$150k、浴室$12k–$95k、全屋$150k–$800k。查看58個項目的實際造價。';
