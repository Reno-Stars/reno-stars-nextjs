-- Migration: pending/2026-09-22-blog-seo-keywords-en-fix.sql
-- Date: 2026-09-22
-- Status: NOT APPLIED — requires human run via infra pipeline
-- Scope: 29 rows with NULL seo_keywords_en (28 test drafts + 1 published)
-- Published row: townhouse-reno-vancouver-2026 (idempotent WHERE guard applied)
-- Test rows: set to topic-appropriate keywords from title_en
-- Idempotent: WHERE seo_keywords_en IS NULL guard on every row

-- outdoor-test-* slugs (9 rows): outdoor renovation Vancouver
UPDATE blog_posts
SET seo_keywords_en = 'outdoor renovation Vancouver, deck renovation Vancouver, patio construction Vancouver, backyard renovation Metro Vancouver, outdoor living space Vancouver 2026'
WHERE slug = 'outdoor-test-amp'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'outdoor renovation Vancouver, deck renovation Vancouver, patio construction Vancouver, backyard renovation Metro Vancouver, outdoor living space Vancouver 2026'
WHERE slug = 'outdoor-test-fk'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'outdoor renovation Vancouver, deck renovation Vancouver, patio construction Vancouver, backyard renovation Metro Vancouver, outdoor living space Vancouver 2026'
WHERE slug = 'outdoor-test-fkzh'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'outdoor renovation Vancouver, deck renovation Vancouver, patio construction Vancouver, backyard renovation Metro Vancouver, outdoor living space Vancouver 2026'
WHERE slug = 'outdoor-test-half1'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'outdoor renovation Vancouver, deck renovation Vancouver, patio construction Vancouver, backyard renovation Metro Vancouver, outdoor living space Vancouver 2026'
WHERE slug = 'outdoor-test-longexcerpt'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'outdoor renovation Vancouver, deck renovation Vancouver, patio construction Vancouver, backyard renovation Metro Vancouver, outdoor living space Vancouver 2026'
WHERE slug = 'outdoor-test-md80'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'outdoor renovation Vancouver, deck renovation Vancouver, patio construction Vancouver, backyard renovation Metro Vancouver, outdoor living space Vancouver 2026'
WHERE slug = 'outdoor-test-mt1'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'outdoor renovation Vancouver, deck renovation Vancouver, patio construction Vancouver, backyard renovation Metro Vancouver, outdoor living space Vancouver 2026'
WHERE slug = 'outdoor-test-mt2'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'outdoor renovation Vancouver, deck renovation Vancouver, patio construction Vancouver, backyard renovation Metro Vancouver, outdoor living space Vancouver 2026'
WHERE slug = 'outdoor-test-mt3'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'outdoor renovation Vancouver, deck renovation Vancouver, patio construction Vancouver, backyard renovation Metro Vancouver, outdoor living space Vancouver 2026'
WHERE slug = 'outdoor-test-mt4'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'outdoor renovation Vancouver, deck renovation Vancouver, patio construction Vancouver, backyard renovation Metro Vancouver, outdoor living space Vancouver 2026'
WHERE slug = 'outdoor-test-mtonly'
  AND seo_keywords_en IS NULL;

-- townhouse-reno-vancouver-2026 (PUBLISHED - must be fixed)
UPDATE blog_posts
SET seo_keywords_en = 'townhouse renovation Vancouver, Vancouver townhouse strata rules, townhouse permits Metro Vancouver, townhouse renovation cost Vancouver 2026, strata renovation Vancouver'
WHERE slug = 'townhouse-reno-vancouver-2026'
  AND seo_keywords_en IS NULL;

-- test drafts: adu, plumber, test-*, etc.
UPDATE blog_posts
SET seo_keywords_en = 'ADU cost Vancouver 2026, accessory dwelling unit Vancouver, secondary suite Vancouver, laneway house Vancouver'
WHERE slug = 'adu-vancouver-2026-cost-guide'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'plumber Vancouver, Vancouver plumber, plumbing renovation Vancouver, licensed plumber Metro Vancouver'
WHERE slug = 'plumber-vancouver-test-min'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'draft test, renovation Vancouver'
WHERE slug = 'test-draft-keywords'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'North Vancouver renovation 2026, whole house renovation North Vancouver'
WHERE slug = 'test-draft-nv-2026'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'North Vancouver renovation 2026, whole house renovation North Vancouver'
WHERE slug = 'test-draft-nv-9937'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'test post, renovation Vancouver 2026'
WHERE slug = 'test-full-2026-09-05'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'test baseline, renovation Vancouver 2026'
WHERE slug = 'test-len-baseline-9990'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'test post, Vancouver renovation'
WHERE slug = 'test-minimal-vancouver'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'test rich formatting, renovation Vancouver 2026'
WHERE slug = 'test-rich-formatting-2026'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'test SEO keywords, renovation Vancouver 2026'
WHERE slug = 'test-seo-kw-9972'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'test simple post, renovation Vancouver 2026'
WHERE slug = 'test-simple-post-2026'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'test Chinese content, renovation Vancouver 2026'
WHERE slug = 'test-zh-field-9933'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'test Chinese content, renovation Vancouver 2026'
WHERE slug = 'test-zh-length-9945'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'townhouse renovation Vancouver, strata renovation Vancouver, townhouse permits Vancouver 2026'
WHERE slug = 'townhouse-renovation-strata-rules-vancouver-2026'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'kitchen renovation Vancouver, bathroom renovation Vancouver, kitchen vs bathroom renovation'
WHERE slug = 'vancouver-reno-kitchen-bathroom-2026-final'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'kitchen renovation Vancouver, bathroom renovation Vancouver, kitchen vs bathroom renovation'
WHERE slug = 'vancouver-reno-kitchen-or-bathroom-2026-test'
  AND seo_keywords_en IS NULL;

UPDATE blog_posts
SET seo_keywords_en = 'kitchen renovation Vancouver, bathroom renovation Vancouver, kitchen vs bathroom renovation'
WHERE slug = 'vancouver-reno-kitchen-or-bathroom-2026-test2'
  AND seo_keywords_en IS NULL;
