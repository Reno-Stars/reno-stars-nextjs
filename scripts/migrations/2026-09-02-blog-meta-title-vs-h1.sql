-- Migration: NOT APPLIED — needs human to run
--   pnpm db:query -f scripts/migrations/2026-09-02-blog-meta-title-vs-h1.sql
--
-- Semrush flagged "Duplicate content in h1 and title" on
-- /en/blog/how-much-does-kitchen-renovation-cost-vancouver-2026/. Confirmed: the
-- <title> and the <h1> are byte-identical, because meta_title_en holds a
-- verbatim copy of title_en and generateMetadata prefers meta_title over the
-- fallback. It is not one row — 7 PUBLISHED posts have meta_title_en = title_en
-- (Semrush only saw one because it crawled 100 pages).
--
-- The fallback chain is NOT at fault and is deliberately left alone: its
-- terminal branch appends " | Reno Stars", so rows with an EMPTY meta_title
-- already render a title distinct from the H1. Only rows with an authored
-- duplicate need correcting.
--
-- Each replacement is a shortened, on-topic variant of the same headline, under
-- 60 characters so it is not truncated in the SERP. No claim is made that the
-- post does not already support.
--
-- GUARDS: one UPDATE, one column, guarded on the EXACT current value — NOT on
-- `IS NULL OR = ''`. The column is populated, so a null-guard would match zero
-- rows and silently no-op, which is precisely the failure
-- tests/unit/db/migration-guards.test.ts exists to catch. Guarding on the value
-- also makes this safely re-runnable and stops it clobbering a human edit.
--
-- NOT INCLUDED: 6 published rows have the same defect in meta_title_zh. Left for
-- a Chinese-speaking reviewer rather than machine-written marketing copy.

BEGIN;

-- cabinet-refinishing-north-vancouver-cost-guide  (H1: Cabinet Refinishing North Vancouver BC 2026: Costs & Process)
UPDATE blog_posts SET meta_title_en = 'Cabinet Refinishing Cost North Vancouver | Reno Stars'
WHERE id = 'd7a22187-735b-44a4-8695-0c16b9781173'
  AND meta_title_en = 'Cabinet Refinishing North Vancouver BC 2026: Costs & Process';

-- condo-renovation-north-vancouver-2026  (H1: Condo Renovation North Vancouver 2026: Cost & Strata Guide)
UPDATE blog_posts SET meta_title_en = 'Condo Renovation North Vancouver Cost | Reno Stars'
WHERE id = '9739d7cc-5b6e-4a3d-ac10-3159e5df0967'
  AND meta_title_en = 'Condo Renovation North Vancouver 2026: Cost & Strata Guide';

-- how-much-does-kitchen-renovation-cost-vancouver-2026  (H1: How Much Does a Kitchen Renovation Cost in Vancouver (2026))
UPDATE blog_posts SET meta_title_en = 'Kitchen Renovation Cost Vancouver 2026 | Reno Stars'
WHERE id = 'fbfe62bc-8887-44a0-a6a0-eef892a1e986'
  AND meta_title_en = 'How Much Does a Kitchen Renovation Cost in Vancouver (2026)';

-- kitchen-design-trends-vancouver-2026  (H1: 2026 Kitchen Design Trends Vancouver: What's In, What's Out)
UPDATE blog_posts SET meta_title_en = 'Kitchen Design Trends Vancouver 2026 | Reno Stars'
WHERE id = '53c3f3f8-6951-44cd-a7cc-d7421bdbd524'
  AND meta_title_en = '2026 Kitchen Design Trends Vancouver: What''s In, What''s Out';

-- pre-sale-renovation-coquitlam-bc-2026  (H1: Pre-Sale Renovation Coquitlam BC 2026: Best ROI Guide)
UPDATE blog_posts SET meta_title_en = 'Pre-Sale Renovation Coquitlam BC | Reno Stars'
WHERE id = 'f51e23b0-48fd-43e5-9c1f-022344d8f3cf'
  AND meta_title_en = 'Pre-Sale Renovation Coquitlam BC 2026: Best ROI Guide';

-- pre-sale-renovation-maple-ridge-bc-2026  (H1: Pre-Sale Renovation Maple Ridge BC 2026: Best ROI Guide)
UPDATE blog_posts SET meta_title_en = 'Pre-Sale Renovation Maple Ridge BC | Reno Stars'
WHERE id = '6567c57b-8813-4894-b5b7-b69a51295d1a'
  AND meta_title_en = 'Pre-Sale Renovation Maple Ridge BC 2026: Best ROI Guide';

-- pre-sale-renovation-north-vancouver-bc-2026  (H1: Pre-Sale Renovation North Vancouver BC 2026: Best ROI Guide)
UPDATE blog_posts SET meta_title_en = 'Pre-Sale Renovation North Vancouver BC | Reno Stars'
WHERE id = 'cfdc320d-299c-4d4d-bc64-ae5c168aca11'
  AND meta_title_en = 'Pre-Sale Renovation North Vancouver BC 2026: Best ROI Guide';

COMMIT;
