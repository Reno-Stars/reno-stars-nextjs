-- Migration: populate meta_description_zh and focus_keyword_zh for outdoor-test-mtonly
-- NOT APPLIED — needs human run
-- Post: outdoor-test-mtonly (247e6fde-08dc-4285-b5c7-bbe236069047)
-- Title: Outdoor Living Space Renovation in Vancouver -- Decks, Patios & Permits for 2026
UPDATE blog_posts SET
  meta_description_zh = '温哥华户外空间装修完全指南：甲板、露台、后院改造与许可申请。含2026年温哥华市政规则、Reno Stars施工案例与报价。',
  focus_keyword_zh = '温哥华户外装修,甲板装修,露台改造,后院装修,温哥华装修许可,铺板地面,景观改造'
WHERE id = '247e6fde-08dc-4285-b5c7-bbe236069047'
  AND is_published = true
  AND (meta_description_zh IS NULL OR meta_description_zh = '');
