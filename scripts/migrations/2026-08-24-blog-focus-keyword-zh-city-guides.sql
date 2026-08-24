-- Migration: blog_posts — focus_keyword_zh for remaining city guide posts
-- Date: 2026-08-24
-- Status: NOT APPLIED — needs human to run against production DB
--
-- These are the 10 city/neighbourhood guide posts that are indexed and
-- live on the site but are missing focus_keyword_zh. They are the highest-traffic
-- content category. Translated from the English focus_keyword_en pattern:
--   "<city> home renovation" -> "<city in Chinese> 房屋装修"
--   city kitchen guides also include "厨房翻新"
-- Pattern derived from project focus_keyword_zh translations already in the DB.
--
-- NOT APPLIED — needs human to run

UPDATE blog_posts SET focus_keyword_zh = '温哥华厨房布局规划,厨房设计,橱柜布局,L形厨房,U形厨房,厨房岛台,温哥华厨房装修' WHERE id = '79dc1aa5-4fb6-4524-b78a-3eea035a7cd1' AND is_published = true AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE blog_posts SET focus_keyword_zh = '西温哥华房屋装修,西温装修,温哥华西区翻新,West Vancouver renovation' WHERE id = '27c9242e-44c6-4744-9122-59f830904950' AND is_published = true AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE blog_posts SET focus_keyword_zh = '白石房屋装修,白石翻新,南素里装修,White Rock home renovation' WHERE id = '5bb4fbd4-b293-4726-83a6-4bac05598775' AND is_published = true AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE blog_posts SET focus_keyword_zh = '素里房屋装修,素里翻新, Surrey home renovation,素里装修成本' WHERE id = 'bad6eb5a-d9f1-4e89-8754-5cc200947eb7' AND is_published = true AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE blog_posts SET focus_keyword_zh = '北温哥华售前装修,北温房屋装修,预售装修,North Vancouver renovation' WHERE id = 'cfdc320d-299c-4d4d-bc64-ae5c168aca11' AND is_published = true AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE blog_posts SET focus_keyword_zh = '温哥华厨房防溅板,厨房瓷砖,后挡板成本,温哥华浴室装修' WHERE id = '2c6568be-21d7-4b07-a395-ace1965fb28e' AND is_published = true AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE blog_posts SET focus_keyword_zh = '满地可房屋装修,满地可翻新,Port Moody home renovation,装修成本' WHERE id = 'f576d97c-86d7-4663-ba74-ff56ac49ca2a' AND is_published = true AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE blog_posts SET focus_keyword_zh = '兰里房屋装修,兰里翻新,Langley home renovation,装修成本' WHERE id = 'fe32a970-c27e-468e-9841-34f22a7e60fe' AND is_published = true AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE blog_posts SET focus_keyword_zh = '枫树岭房屋装修,枫树岭翻新,Maple Ridge home renovation,装修成本' WHERE id = '32736ae2-862a-4956-ad16-cfe8d311c8e5' AND is_published = true AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');

UPDATE blog_posts SET focus_keyword_zh = '素里厨房翻新, Surrey kitchen renovation,素里橱柜,厨房装修成本' WHERE id = 'dfd15150-07b0-4816-870a-89ade51612dc' AND is_published = true AND (focus_keyword_zh IS NULL OR focus_keyword_zh = '');
