-- Migration: 2026-10-02
-- Fix: blog_posts content_zh contains English-only text (2 test posts)
-- Status: NOT APPLIED — needs human to review and run
-- These are draft posts (is_published = false), not live on the site

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM blog_posts
        WHERE id IN ('5f0fb183-c4c8-410b-a8c3-9c1093d14142', '835af76e-2175-4e38-b7af-b31c51cbc0ba')
        AND content_zh !~ '^[一-鿿]'
    ) THEN
        RAISE NOTICE 'All content_zh rows already fixed — skipping';
    END IF;
END $$;

UPDATE blog_posts SET content_zh = CASE slug
    WHEN 'test-seo-keywords-2026' THEN '<p>本篇测试博客文章探讨装修行业的SEO关键词优化策略。聚星装修团队在温哥华、列治文、本拿比等城市完成超过500个装修项目，积累了丰富的本地SEO经验。正确的关键词布局能够帮助装修公司在搜索引擎结果中获得更高排名，吸引更多潜在客户询价和预约。本指南涵盖装修行业常见关键词、长尾关键词选择、以及内容营销的最佳实践。</p><p>对于温哥华的装修公司而言，本地SEO尤为重要。通过优化Google我的商家资料、积累客户评价、以及发布高质量的本地化内容，装修公司可以在"温哥华装修"、"本拿比厨房翻新"等关键词上获得显著排名提升。聚星装修专注于为客户提供透明报价、专业施工和完善的售后服务，是大温哥华地区业主信赖的装修合作伙伴。</p><p>SEO优化是一个长期过程，需要持续投入和维护。定期发布与装修相关的博客文章、案例研究和行业资讯，能够为网站带来稳定的自然流量。建议装修公司每月至少发布2-3篇高质量原创内容，并在文章中合理融入目标关键词，同时确保内容的可读性和实用性。</p>'
    WHEN 'test-english-only-db' THEN '<p>本篇测试文章验证数据库内容管理系统的中文内容存储和展示功能。聚星装修使用先进的内容管理系统，确保所有中文内容在大温哥华地区14个城市的服务页面上正确显示。系统支持Traditional和Simplified两种中文字体，满足来自中国大陆、香港、台湾和新加波等地区客户的不同需求。</p><p>内容管理系统的主要功能包括：多语言内容发布、工作流程管理、版本控制和SEO元数据优化。聚星装修的技术团队定期对内容管理系统进行维护和升级，确保系统在高峰期依然能够快速响应，为编辑团队提供流畅的内容创作体验。</p><p>通过使用内容管理系统，装修公司可以高效管理大量项目案例、客户评价和服务介绍页面。所有内容均经过SEO优化，确保在Google、百度等搜索引擎上获得良好排名。</p>'
    ELSE content_zh
END
WHERE id IN ('5f0fb183-c4c8-410b-a8c3-9c1093d14142', '835af76e-2175-4e38-b7af-b31c51cbc0ba')
AND content_zh !~ '^[一-鿿]';

COMMIT;
