-- NOT APPLIED: requires human to run against the live database.
-- 2026-09-18: outdoor-test-mtonly has Chinese title_zh and content_zh
-- but meta_title_zh and meta_description_zh are NULL.
UPDATE blog_posts
SET
  meta_title_zh = '温哥华户外空间装修完整指南：露台、甲板、后院改造 | 聚星装修',
  meta_description_zh = '温哥华专业户外装修：甲板、露台、后院改造及许可申请。聚星装修提供2026年最新报价与设计咨询。'
WHERE slug = 'outdoor-test-mtonly'
  AND (meta_title_zh IS NULL OR meta_description_zh IS NULL);
