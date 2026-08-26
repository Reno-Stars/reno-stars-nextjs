-- Migration: Add excerpt_zh to blog_posts row missing it
-- Target: blog_posts.id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
-- Topic: pre-sale-renovation-white-rock-bc-2026
-- Status: NOT APPLIED — needs human to run
-- This is idempotent: only updates if excerpt_zh IS NULL
UPDATE blog_posts
SET
  excerpt_zh = 'White Rock與南素里是大溫哥華獨特的海濱房產市場，吸引退休置業者、置換家庭和華人買家群體。裝修專案根據子市場精準定位，廚房台面+櫃子更換和主浴潔具更換提供最高投資回報率。本指南分析買家偏好、裝修預算、許可要求和掛牌時機。',
  updated_at = NOW()
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND excerpt_zh IS NULL;
