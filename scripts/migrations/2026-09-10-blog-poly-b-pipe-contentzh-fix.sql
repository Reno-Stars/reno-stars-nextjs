-- Fix: Traditional Chinese city name variants in poly-b blog post content_zh
-- Wrong variants in committed draft: 科奎尔特兰 (should be 科奎爾蘭), 萨里 (should be 素里), 高贵林 (should be 高貴林)
-- Applied via idempotent UPDATE using REPLACE; row identified by slug
UPDATE blog_posts
SET content_zh = REPLACE(
    REPLACE(
        REPLACE(content_zh,
            '科奎尔特兰', '科奎爾蘭'),
        '萨里', '素里'),
    '高贵林', '高貴林')
WHERE slug = 'poly-b-pipe-replacement-vancouver-2026'
  AND (
    content_zh LIKE '%科奎尔特兰%'
    OR content_zh LIKE '%萨里%'
    OR content_zh LIKE '%高贵林%'
  );
