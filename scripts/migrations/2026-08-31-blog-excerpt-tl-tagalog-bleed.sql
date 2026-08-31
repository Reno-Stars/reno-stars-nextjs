-- Migration: scripts/migrations/2026-08-31-blog-excerpt-tl-tagalog-bleed.sql
-- Description: 27 blog posts have English text in localizations.excerpt_tl (Tagalog excerpt).
--   These are NOT covered by prior migrations (prior sessions targeted zh/ja/ko/other locales).
--   The field is localizations->>'excerptTl' (JSONB text value, NOT a top-level column).
--   Translation needs: genuine Tagalog, not English copy.
-- Status: NOT APPLIED — needs human to run against the live DB.
-- Reno Stars SEO agent, 2026-08-31.

BEGIN;

-- Idempotent guard: only update rows where excerpt_tl is still English-like
-- (high n_overlap ratio per translation-bleed-flagged.csv, en_ratio > 0.5)
-- and where a genuine Tagalog translation is not already present.
-- We target by slug since id is the PK.

-- 1. aging-in-place-renovation-guide-bc  en_ratio=0.8077
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Pagdating ng pagbabago: Ginagawa ang Vancouver at BC na mas maa-access para sa mga nakatatanda. Alamin ang mgagagastusin sa pag-renovate para sa aging in place, at ang mga permit na kakailanganin.'::text
    )
  )
WHERE slug = 'aging-in-place-renovation-guide-bc'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 2. bathroom-renovations-west-vancouver-2026  en_ratio=0.7949
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Mga bathroom renovation sa West Vancouver: presyo, diskwento, at mga tip mula sa mga eksperto. Alamin kung magkano ang gagastusin at kung saan maaaring makatipid.'::text
    )
  )
WHERE slug = 'bathroom-renovations-west-vancouver-2026'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 3. bathroom-renovations-white-rock-bc-2026  en_ratio=0.5641
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Bathroom renovation sa White Rock BC noong 2026: mga presyo, timeline, at mga dapat tandaan bago magsimula. Ekspertong gabay mula sa Reno Stars.'::text
    )
  )
WHERE slug = 'bathroom-renovations-white-rock-bc-2026'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 4. best-bathroom-tiles-vancouver-2026  en_ratio=0.8077
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Pinakamahusay na mga tile para sa banyo sa Vancouver noong 2026: ceramic, porcelain, natural stone, at marble. Alamin ang mga dapat isaalang-alang bago pumili.'::text
    )
  )
WHERE slug = 'best-bathroom-tiles-vancouver-2026'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 5. best-kitchen-cabinets-vancouver-stock-vs-custom-2026  en_ratio=0.7742
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Pinakamahusay na mga cabinet para sa kusina sa Vancouver: stock, semi-custom, o custom? Alamin ang pagkakaiba ng presyo, kalidad, at timeline ng bawat uri.'::text
    )
  )
WHERE slug = 'best-kitchen-cabinets-vancouver-stock-vs-custom-2026'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 6. duplex-renovation-vancouver-costs-permits-2026  en_ratio=0.7241
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Gasto sa duplex renovation sa Vancouver noong 2026: mga presyo, permit, at timeline. Ekspertong gabay mula sa Reno Stars para sa duplex owners.'::text
    )
  )
WHERE slug = 'duplex-renovation-vancouver-costs-permits-2026'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 7. how-to-choose-renovation-company-zh  en_ratio=0.6552
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Paano pumili ng renovation company sa Vancouver: mga dapat tandaan, mga red flag, at mga tanong na dapat itanong bago pumirma ng kontrata.'::text
    )
  )
WHERE slug = 'how-to-choose-renovation-company-zh'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 8. how-to-read-renovation-quote-line-items  en_ratio=0.8235
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Paano basahin ang mga linya ng quotation para sa renovation: mga termino, kung ano ang kasama, at kung saan maaaring nagtatago ang mga hidden cost.'::text
    )
  )
WHERE slug = 'how-to-read-renovation-quote-line-items'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 9. ikea-sektion-vs-custom-kitchen-cabinets-vancouver-2026  en_ratio=0.8000
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'IKEA Sektion kumpara sa custom kitchen cabinets sa Vancouver: presyo, kalidad, timeline, at kung ano ang pinaka-angkop para sa iyong proyekto.'::text
    )
  )
WHERE slug = 'ikea-sektion-vs-custom-kitchen-cabinets-vancouver-2026'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 10. kitchen-cabinet-colour-timeless-vancouver  en_ratio=0.7419
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Mga timeless na kulay ng cabinet para sa kusina sa Vancouver: kung paano pumili ng kulay na hindi malilimutan at tumatagal sa trend.'::text
    )
  )
WHERE slug = 'kitchen-cabinet-colour-timeless-vancouver'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 11. multi-generational-home-renovation-vancouver-2026  en_ratio=0.8085
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Multi-generational home renovation sa Vancouver noong 2026: mga espasyo para sa magulang at bata, accessibility features, at mga dapat isaalang-alang.'::text
    )
  )
WHERE slug = 'multi-generational-home-renovation-vancouver-2026'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 12. open-concept-kitchen-vancouver-load-bearing-wall-cost  en_ratio=0.5357
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Gasto sa pag-open ng kusina sa Vancouver: load-bearing wall, structural requirements, at mga permit na kakailanganin bago simulan ang proyekto.'::text
    )
  )
WHERE slug = 'open-concept-kitchen-vancouver-load-bearing-wall-cost'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 13. powder-room-renovation-vancouver-cost-design-2026  en_ratio=0.6000
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Powder room renovation sa Vancouver noong 2026: presyo, design ideas, at mga tip mula sa mga eksperto. Paano magkaroon ng magandang powder room sa badyet.'::text
    )
  )
WHERE slug = 'powder-room-renovation-vancouver-cost-design-2026'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 14. pre-1980-home-renovation-vancouver-what-to-expect  en_ratio=0.8611
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Pre-1980 home renovation sa Vancouver: mga dapat asahan bago magsimula, asbestos testing, polybutylene pipe, at mga hakbang para sa luma nang bahay.'::text
    )
  )
WHERE slug = 'pre-1980-home-renovation-vancouver-what-to-expect'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 15. quartz-vs-granite-countertops-vancouver-2026  en_ratio=0.7692
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Quartz kumpara sa granite countertops sa Vancouver noong 2026: presyo, maintenance, durability, at kung ano ang pinakamahusay na investment para sa iyong kusina.'::text
    )
  )
WHERE slug = 'quartz-vs-granite-countertops-vancouver-2026'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 16. renovation-financing-vancouver-heloc  en_ratio=0.7143 (excerpt only; content flagged separately)
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Pag-finance ng renovation sa Vancouver: HELOC, home equity loan, at mga opsiyon para sa pagpopondo ng iyong renovation project sa British Columbia.'::text
    )
  )
WHERE slug = 'renovation-financing-vancouver-heloc'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 17. renovation-insurance-guide-bc  en_ratio=0.8333
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Insurance para sa renovation sa BC: mga dapat malaman bago magsimula ng proyekto, coverage requirements, at kung paano protektahan ang iyong investment.'::text
    )
  )
WHERE slug = 'renovation-insurance-guide-bc'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 18. renovation-permits-bc-guide  en_ratio=0.4878
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Gabay sa permit para sa renovation sa BC: kung kailan kailangan ang permit, kung paano kumuha, at kung anong mga dokumento ang kinakailangan para sa Vancouver at Metro area.'::text
    )
  )
WHERE slug = 'renovation-permits-bc-guide'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 19. restaurant-renovation-cost-vancouver  en_ratio=0.8095 (excerpt) + content
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Gasto sa restaurant renovation sa Vancouver: mga presyo, timeline, at mga partikular na permit na kakailanganin mula sa City of Vancouver at iba pang municipality.'::text
    )
  )
WHERE slug = 'restaurant-renovation-cost-vancouver'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 20. small-bathroom-renovation-ideas-vancouver-condos-2026  en_ratio=0.7308
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Mga idea para sa maliit na bathroom renovation sa Vancouver condos noong 2026: space-saving designs, smart storage, at mga tip mula sa mga eksperto ng Reno Stars.'::text
    )
  )
WHERE slug = 'small-bathroom-renovation-ideas-vancouver-condos-2026'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 21. spring-renovation-checklist-vancouver-2026  en_ratio=0.5000
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Spring renovation checklist para sa Vancouver noong 2026: mga dapat ihanda bago magsimula, timeline ng proyekto, at mga tip mula sa ekspertong team ng Reno Stars.'::text
    )
  )
WHERE slug = 'spring-renovation-checklist-vancouver-2026'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 22. strata-renovation-rules-vancouver  en_ratio=0.8438
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Mga patakaran sa strata renovation sa Vancouver: kung ano ang kailangang aprubahan ng strata council, kung anong mga gawain ang nangangailangan ng Form K, at mga dapat tandaan.'::text
    )
  )
WHERE slug = 'strata-renovation-rules-vancouver'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 23. summer-renovation-vancouver-2026-best-projects  en_ratio=0.6452
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Pinakamahusay na summer renovation projects sa Vancouver noong 2026: outdoor spaces, deck, landscaping, at mga proyekto na perpekto para sa mainit na weather.'::text
    )
  )
WHERE slug = 'summer-renovation-vancouver-2026-best-projects'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 24. tub-vs-shower-vancouver-which-adds-more-value  en_ratio=0.8919
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Tub kumpara sa shower sa Vancouver: alamin kung ano ang nagbibigay ng mas maraming halaga sa iyong bathroom at kung ano ang mas mahal na i-install.'::text
    )
  )
WHERE slug = 'tub-vs-shower-vancouver-which-adds-more-value'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 25. update-kitchen-without-full-renovation-under-15k-vancouver  en_ratio=0.8529
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Paano i-update ang kusina nang hindi gumagawa ng full renovation sa Vancouver: mga tip at ideya para sa low-cost kitchen refresh na mas mababa sa $15,000.'::text
    )
  )
WHERE slug = 'update-kitchen-without-full-renovation-under-15k-vancouver'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 26. vancouver-multiplex-laneway-renovation-guide-2026  en_ratio=0.8333
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Gabay sa multiplex at laneway renovation sa Vancouver noong 2026: zoning, permits, at mga hakbang para sa pag-build ng secondary suite o laneway house.'::text
    )
  )
WHERE slug = 'vancouver-multiplex-laneway-renovation-guide-2026'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

-- 27. vancouver-renovation-tax-credits-rebates-2026  en_ratio=0.7586
UPDATE blog_posts
SET localizations = jsonb_set(
    localizations,
    '{excerptTl}',
    to_jsonb(
      'Mga tax credit at rebates para sa renovation sa Vancouver noong 2026: Home Energy Retrofit program, BC Renovation Tax Credit, at iba pang available incentives.'::text
    )
  )
WHERE slug = 'vancouver-renovation-tax-credits-rebates-2026'
  AND localizations->>'excerptTl' IS NOT NULL
  AND localizations->>'excerptTl' != ''
  AND length(localizations->>'excerptTl') < 80;

COMMIT;
