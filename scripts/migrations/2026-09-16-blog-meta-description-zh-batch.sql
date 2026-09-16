-- Migration: 2026-09-16-blog-meta-description-zh-batch.sql
-- Target: blog_posts.meta_description_zh for 4 published posts with truncated Chinese meta descriptions
-- Issue: meta_description_zh is 26–37 chars (all below 40-char functional floor) while
--         the articles contain full substantive content. The Chinese excerpt exists and is
--         properly long — only the meta_description_zh field itself was truncated.
-- Status: NOT APPLIED — needs human to run before publish/merge.
-- Excludes rows already addressed in prior pending migrations (grep -h "WHERE id" confirmed clean):

UPDATE blog_posts
SET meta_description_zh = '大温联排别墅翻新共管物业规定与城市许可证：BC省共管物业哪些改动需要投票、哪些可自行做，附2026年最新规定与申请流程。'
WHERE id = 'e50092a6-59f9-45a1-8ad3-4db06f6048ba'
  AND meta_description_zh = '大温哥华联排别墅翻新的物业批准与城市许可证。BC省共管物业规定可更改内容。';

UPDATE blog_posts
SET meta_description_zh = '溫哥華西浴室翻新：將一個過大浴室改建為兩個符合法規的衛浴空間，造價57,000–60,000加元，9–11週工期，含定制櫥櫃與瓷磚。'
WHERE id = '6337cfaf-52ea-4e60-a595-39dc86fca573'
  AND meta_description_zh = '溫哥華西浴室翻新將一個浴室改建兩個浴室，57,000–60,000加元。';

UPDATE blog_posts
SET meta_description_zh = '溫哥華裝修生存指南：灰塵隔斷、臨時廚房、分階段付款與業主委員會規定，助您在施工期間維持正常生活。'
WHERE id = '69a819c7-827b-4d47-a1b1-5655da227991'
  AND meta_description_zh = '灰塵隔斷、臨時廚房、分階段付款、業主委員會規定——溫哥華裝修生存完整指南。';

UPDATE blog_posts
SET meta_description_zh = '溫哥華甲板露台裝修費用、許可要求及完整裝修流程詳解，附2026年各城市規定與露臺建造報價。'
WHERE id = 'c7eabaf3-4afb-4cfa-980a-f416d450d0d3'
  AND meta_description_zh = '溫哥華甲板露台裝修費用、許可要求及完整裝修流程詳解。';
