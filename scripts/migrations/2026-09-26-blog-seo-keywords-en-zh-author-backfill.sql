-- Migration: backfill seoKeywordsEn, seoKeywordsZh, author for 9 blog posts
-- Status: STOP condition (Ladder 1 cap exceeded)
-- These posts are confirmed published on the live site but have NULL seoKeywords fields
BEGIN;

UPDATE blog_posts SET
  seo_keywords_en = 'bathroom plumbing renovation Vancouver,bathroom plumber Vancouver,plumbing rough-in Vancouver bathroom,Shower plumbing Vancouver',
  seo_keywords_zh = '温哥华浴室装修管道,浴室水管装修温哥华,淋浴管道安装温哥华',
  author = 'Reno Stars',
  focus_keyword_en = 'bathroom plumbing renovation Vancouver'
WHERE slug = 'bathroom-plumbing-renovation-vancouver-2026'
  AND is_published = true;

UPDATE blog_posts SET
  seo_keywords_en = 'Delta BC bathroom renovation,Delta bathroom renovation cost,Delta BC renovation contractor,bathroom renovation Delta',
  seo_keywords_zh = 'Delta浴室装修,Delta不列颠哥伦比亚省装修费用,Delta装修承包商,三角洲浴室装修',
  author = 'Reno Stars',
  focus_keyword_en = 'Delta BC bathroom renovation'
WHERE slug = 'bathroom-renovation-delta-bc-2026'
  AND is_published = true;

UPDATE blog_posts SET
  seo_keywords_en = 'commercial renovation cost Vancouver 2026,commercial renovation Vancouver,office renovation cost Vancouver,retail renovation Vancouver',
  seo_keywords_zh = '温哥华商业装修费用2026,商业装修温哥华,办公室装修费用温哥华,零售店铺装修温哥华',
  author = 'Reno Stars',
  focus_keyword_en = 'commercial renovation cost Vancouver 2026'
WHERE slug = 'commercial-renovation-cost-vancouver-2026'
  AND is_published = true;

UPDATE blog_posts SET
  seo_keywords_en = 'condo renovation cost Vancouver 2026,Vancouver condo renovation,apartment renovation Vancouver,condo renovation permit Vancouver',
  seo_keywords_zh = '温哥华公寓装修费用2026,温哥华共管公寓装修,公寓装修温哥华,共管公寓装修许可温哥华',
  author = 'Reno Stars',
  focus_keyword_en = 'condo renovation cost Vancouver 2026'
WHERE slug = 'condo-renovation-cost-vancouver-2026'
  AND is_published = true;

UPDATE blog_posts SET
  seo_keywords_en = 'kitchen vs bathroom renovation Vancouver,renovation cost Vancouver,kitchen renovation vs bathroom Vancouver,renovation priority Vancouver',
  seo_keywords_zh = '温哥华厨房vs浴室装修,温哥华装修费用,厨房装修与浴室装修比较,温哥华装修优先级',
  author = 'Reno Stars',
  focus_keyword_en = 'kitchen vs bathroom renovation cost Vancouver'
WHERE slug = 'kitchen-vs-bathroom-renovation-cost-vancouver-2026'
  AND is_published = true;

UPDATE blog_posts SET
  seo_keywords_en = 'poly b pipe replacement Vancouver,polybutylene pipe replacement Vancouver,repiping Vancouver home,poly b pipe recall Vancouver',
  seo_keywords_zh = '温哥华聚丁烯管更换,聚丁烯管道更换温哥华,温哥华房屋重铺管道,聚丁烯管道召回温哥华',
  author = 'Reno Stars',
  focus_keyword_en = 'poly b pipe replacement Vancouver'
WHERE slug = 'poly-b-pipe-replacement-vancouver-2026'
  AND is_published = true;

UPDATE blog_posts SET
  seo_keywords_en = 'Port Moody home renovation,Port Moody renovation permit,Port Moody home renovation cost,Tri-Cities renovation',
  seo_keywords_zh = '高贵林港家居装修,高贵林港装修许可,高贵林港家居装修费用,三城市装修',
  author = 'Reno Stars',
  focus_keyword_en = 'Port Moody home renovation'
WHERE slug = 'port-moody-home-renovation-guide-2026'
  AND is_published = true;

UPDATE blog_posts SET
  seo_keywords_en = 'renovation deposit BC,BC renovation deposit law,renovation deposit schedule BC,home renovation deposit British Columbia',
  seo_keywords_zh = 'BC装修押金,不列颠哥伦比亚省装修押金法律,装修押金时间表BC,住宅装修押金',
  author = 'Reno Stars',
  focus_keyword_en = 'renovation deposit BC'
WHERE slug = 'renovation-deposit-bc-guide'
  AND is_published = true;

UPDATE blog_posts SET
  seo_keywords_en = 'renovation insurance claims BC,home renovation insurance BC,contractor insurance BC,renovation damage claim British Columbia',
  seo_keywords_zh = 'BC装修保险索赔,住宅装修保险不列颠哥伦比亚省,承包商保险BC,不列颠哥伦比亚省装修损坏索赔',
  author = 'Reno Stars',
  focus_keyword_en = 'renovation insurance claims BC'
WHERE slug = 'renovation-insurance-claims-bc-2026'
  AND is_published = true;

COMMIT;
