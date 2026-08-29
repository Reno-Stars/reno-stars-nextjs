-- Migration: 2026-08-29-blog-excerpt-zh-pre-sale-white-rock.sql
-- Target: blog_posts.excerpt_zh NULL for pre-sale-renovation-white-rock-bc-2026
-- Status: NOT APPLIED — needs human to run
-- Source: DB query confirmed id=34e43ef8-6fde-4ef9-ac66-3f46f99b9df6, excerpt_zh IS NULL

UPDATE blog_posts
SET excerpt_zh = '预售翻新 White Rock BC 2026：沿海住宅投资回报率指南。南素里卖家的厨房、浴室及全屋翻新成本分析。免费获取报价。'
WHERE id = '34e43ef8-6fde-4ef9-ac66-3f46f99b9df6'
  AND excerpt_zh IS NULL;
