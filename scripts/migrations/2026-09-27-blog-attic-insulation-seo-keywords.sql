-- Migration: 2026-09-27-blog-attic-insulation-seo-keywords.sql
-- Topic: attic insulation cost Vancouver 2026
-- Status: published 2026-09-27
-- blog post: attic-insulation-cost-vancouver-2026
UPDATE blog_posts SET
  seo_keywords_en = 'attic insulation cost Vancouver, blown-in fiberglass Vancouver, spray foam attic Vancouver, BC Hydro insulation rebate, attic insulation 2026 Vancouver',
  seo_keywords_zh = '温哥华阁楼保温费用, 吹入式玻璃棉温哥华, 喷涂泡沫阁楼保温, BC Hydro保温补贴, 2026温哥华阁楼保温'
  WHERE slug = 'attic-insulation-cost-vancouver-2026'
  AND is_published = true;
