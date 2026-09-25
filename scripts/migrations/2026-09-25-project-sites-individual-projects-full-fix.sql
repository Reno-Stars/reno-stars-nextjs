-- Migration: 2026-09-25-project-sites-individual-projects-full-fix.sql
-- Fix: individual-projects row (id=64f0f111-4920-434f-ab7e-0c2c411e6633) has THREE NULL fields:
--   1. focus_keyword_en  (NULL, while focus_keyword_zh = '温哥华独立装修项目')
--   2. seo_keywords_en  (NULL, while seo_keywords_zh = '温哥华独立项目,装修案例,温哥华装修,独立项目')
--   3. duration_en       (NULL, duration_zh already set to '待定' after yesterday's migration)
-- Three different columns — all under 3+ per-column backlog cap.
-- Inferred from related project_sites rows and the title.
-- WHERE guards ensure idempotency.
-- NOT APPLIED — needs human or ops to run against the live database.

UPDATE project_sites
SET focus_keyword_en = 'Vancouver renovation projects',
    updated_at = NOW()
WHERE slug = 'individual-projects'
  AND (focus_keyword_en IS NULL OR focus_keyword_en = '');

UPDATE project_sites
SET seo_keywords_en = 'Vancouver renovation projects, individual renovation projects Vancouver, custom home renovation Vancouver, Reno Stars portfolio, Vancouver renovation gallery, residential renovation Vancouver, Metro Vancouver renovation projects',
    updated_at = NOW()
WHERE slug = 'individual-projects'
  AND (seo_keywords_en IS NULL OR seo_keywords_en = '');

UPDATE project_sites
SET duration_en = 'TBD',
    updated_at = NOW()
WHERE slug = 'individual-projects'
  AND (duration_en IS NULL OR duration_en = '');
