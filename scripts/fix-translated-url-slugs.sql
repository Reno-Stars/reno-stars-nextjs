-- Fix machine-translated URL slugs that became 404s.
--
-- During earlier multi-locale content generation, the ML translator
-- translated URL paths along with body text — producing slugs like
-- `/fr/blog/coût-moyen-de-rénovation-de-salle-de-bain-vancouver` and
-- `/hi/blog/3-टुकड़ा-बनाम-4-टुकड़ा-बाथरूम-नवीनीकरण-लागत-वैंकूवर-2026`.
-- Slugs should never be translated (they're URL identifiers); each
-- broken slug is a 404 for users in that locale. This SQL replaces
-- known translated slugs with their English canonical, pointing where
-- possible directly at the canonical /guides/ URL to avoid the
-- redirect chain.
--
-- Scope: service_areas + blog_posts (the two tables with localized body content).
-- Run: psql $DATABASE_URL -f scripts/fix-translated-url-slugs.sql
-- Idempotent.

BEGIN;

-- ============================================================================
-- French (FR) translations
-- ============================================================================

-- coût-moyen-de-rénovation-de-salle-de-bain-vancouver = "average bathroom renovation cost vancouver"
-- → canonical: bathroom-renovation-cost-vancouver (under /guides/)
UPDATE service_areas SET
  localizations = (regexp_replace(localizations::text, '/blog/coût-moyen-de-rénovation-de-salle-de-bain-vancouver/?', '/guides/bathroom-renovation-cost-vancouver/', 'g'))::jsonb,
  updated_at = now()
WHERE localizations::text LIKE '%coût-moyen-de-rénovation-de-salle-de-bain-vancouver%';

UPDATE blog_posts SET
  localizations = (regexp_replace(localizations::text, '/blog/coût-moyen-de-rénovation-de-salle-de-bain-vancouver/?', '/guides/bathroom-renovation-cost-vancouver/', 'g'))::jsonb,
  updated_at = now()
WHERE is_published=true AND localizations::text LIKE '%coût-moyen-de-rénovation-de-salle-de-bain-vancouver%';

-- sous-sol-rénovation-vancouver = "basement renovation vancouver"
-- → canonical: basement-renovation-vancouver-complete-guide (real blog post)
UPDATE service_areas SET
  localizations = (regexp_replace(localizations::text, '/blog/sous-sol-rénovation-vancouver/?', '/blog/basement-renovation-vancouver-complete-guide/', 'g')::jsonb),
  updated_at = now()
WHERE localizations::text LIKE '%sous-sol-rénovation-vancouver%';

UPDATE blog_posts SET
  localizations = (regexp_replace(localizations::text, '/blog/sous-sol-rénovation-vancouver/?', '/blog/basement-renovation-vancouver-complete-guide/', 'g')::jsonb),
  updated_at = now()
WHERE is_published=true AND localizations::text LIKE '%sous-sol-rénovation-vancouver%';

-- Same patterns inside /guides/ path
UPDATE service_areas SET
  localizations = (regexp_replace(localizations::text, '/guides/sous-sol-rénovation-vancouver/?', '/guides/basement-renovation-cost-vancouver/', 'g')::jsonb),
  updated_at = now()
WHERE localizations::text LIKE '%/guides/sous-sol-rénovation-vancouver%';

UPDATE blog_posts SET
  localizations = (regexp_replace(localizations::text, '/guides/sous-sol-rénovation-vancouver/?', '/guides/basement-renovation-cost-vancouver/', 'g')::jsonb),
  updated_at = now()
WHERE is_published=true AND localizations::text LIKE '%/guides/sous-sol-rénovation-vancouver%';

-- ============================================================================
-- Hindi (HI) translations
-- ============================================================================

-- रसोई-नवीनीकरण-लागत-वैंकूवर = "kitchen renovation cost vancouver"
UPDATE service_areas SET
  localizations = (regexp_replace(localizations::text, '/(blog|guides)/रसोई-नवीनीकरण-लागत-वैंकूवर/?', '/guides/kitchen-renovation-cost-vancouver/', 'g')::jsonb),
  updated_at = now()
WHERE localizations::text LIKE '%रसोई-नवीनीकरण-लागत-वैंकूवर%';

UPDATE blog_posts SET
  localizations = (regexp_replace(localizations::text, '/(blog|guides)/रसोई-नवीनीकरण-लागत-वैंकूवर/?', '/guides/kitchen-renovation-cost-vancouver/', 'g')::jsonb),
  updated_at = now()
WHERE is_published=true AND localizations::text LIKE '%रसोई-नवीनीकरण-लागत-वैंकूवर%';

-- औसत-बाथरूम-नवीनीकरण-लागत-वैंकूवर = "average bathroom renovation cost vancouver"
UPDATE service_areas SET
  localizations = (regexp_replace(localizations::text, '/(blog|guides)/औसत-बाथरूम-नवीनीकरण-लागत-वैंकूवर/?', '/guides/bathroom-renovation-cost-vancouver/', 'g')::jsonb),
  updated_at = now()
WHERE localizations::text LIKE '%औसत-बाथरूम-नवीनीकरण-लागत-वैंकूवर%';

UPDATE blog_posts SET
  localizations = (regexp_replace(localizations::text, '/(blog|guides)/औसत-बाथरूम-नवीनीकरण-लागत-वैंकूवर/?', '/guides/bathroom-renovation-cost-vancouver/', 'g')::jsonb),
  updated_at = now()
WHERE is_published=true AND localizations::text LIKE '%औसत-बाथरूम-नवीनीकरण-लागत-वैंकूवर%';

-- 3-टुकड़ा-बनाम-4-टुकड़ा-बाथरूम-नवीनीकरण-लागत-वैंकूवर-2026 = "3-piece-vs-4-piece-bathroom-renovation-cost-vancouver-2026"
UPDATE service_areas SET
  localizations = (regexp_replace(localizations::text, '/blog/3-टुकड़ा-बनाम-4-टुकड़ा-बाथरूम-नवीनीकरण-लागत-वैंकूवर-2026/?', '/blog/3-piece-vs-4-piece-bathroom-renovation-cost-vancouver-2026/', 'g')::jsonb),
  updated_at = now()
WHERE localizations::text LIKE '%3-टुकड़ा-बनाम-4-टुकड़ा-बाथरूम-नवीनीकरण-लागत-वैंकूवर-2026%';

UPDATE blog_posts SET
  localizations = (regexp_replace(localizations::text, '/blog/3-टुकड़ा-बनाम-4-टुकड़ा-बाथरूम-नवीनीकरण-लागत-वैंकूवर-2026/?', '/blog/3-piece-vs-4-piece-bathroom-renovation-cost-vancouver-2026/', 'g')::jsonb),
  updated_at = now()
WHERE is_published=true AND localizations::text LIKE '%3-टुकड़ा-बनाम-4-टुकड़ा-बाथरूम-नवीनीकरण-लागत-वैंकूवर-2026%';

-- तहखाने-नवीनीकरण-वैंकूवर-पूर्ण-गाइड and तहखाने-नवीकरण-वैंकूवर-पूर्ण-गाइड = "basement renovation vancouver complete guide"
UPDATE service_areas SET
  localizations = (regexp_replace(localizations::text, '/blog/तहखाने-नवी(नी)?करण-वैंकूवर-पूर्ण-गाइड/?', '/blog/basement-renovation-vancouver-complete-guide/', 'g')::jsonb),
  updated_at = now()
WHERE localizations::text ~ '/blog/तहखाने-नवी(नी)?करण-वैंकूवर-पूर्ण-गाइड';

UPDATE blog_posts SET
  localizations = (regexp_replace(localizations::text, '/blog/तहखाने-नवी(नी)?करण-वैंकूवर-पूर्ण-गाइड/?', '/blog/basement-renovation-vancouver-complete-guide/', 'g')::jsonb),
  updated_at = now()
WHERE is_published=true AND localizations::text ~ '/blog/तहखाने-नवी(नी)?करण-वैंकूवर-पूर्ण-गाइड';

-- तहखाने-नवीनीकरण-उत्तर-वैंकूवर = "basement renovations north vancouver"
UPDATE service_areas SET
  localizations = (regexp_replace(localizations::text, '/blog/तहखाने-नवीनीकरण-उत्तर-वैंकूवर/?', '/blog/basement-renovations-north-vancouver/', 'g')::jsonb),
  updated_at = now()
WHERE localizations::text LIKE '%तहखाने-नवीनीकरण-उत्तर-वैंकूवर%';

UPDATE blog_posts SET
  localizations = (regexp_replace(localizations::text, '/blog/तहखाने-नवीनीकरण-उत्तर-वैंकूवर/?', '/blog/basement-renovations-north-vancouver/', 'g')::jsonb),
  updated_at = now()
WHERE is_published=true AND localizations::text LIKE '%तहखाने-नवीनीकरण-उत्तर-वैंकूवर%';

-- तहखाने-नवीनीकरण-लागत-वैंकूवर = "basement renovation cost vancouver"
UPDATE service_areas SET
  localizations = (regexp_replace(localizations::text, '/(blog|guides)/तहखाने-नवीनीकरण-लागत-वैंकूवर/?', '/guides/basement-renovation-cost-vancouver/', 'g')::jsonb),
  updated_at = now()
WHERE localizations::text LIKE '%तहखाने-नवीनीकरण-लागत-वैंकूवर%';

UPDATE blog_posts SET
  localizations = (regexp_replace(localizations::text, '/(blog|guides)/तहखाने-नवीनीकरण-लागत-वैंकूवर/?', '/guides/basement-renovation-cost-vancouver/', 'g')::jsonb),
  updated_at = now()
WHERE is_published=true AND localizations::text LIKE '%तहखाने-नवीनीकरण-लागत-वैंकूवर%';

-- बेसमेंट-सुइट-लागत-वैंकूवर = "basement suite cost vancouver"
UPDATE service_areas SET
  localizations = (regexp_replace(localizations::text, '/(blog|guides)/बेसमेंट-सुइट-लागत-वैंकूवर/?', '/guides/basement-suite-cost-vancouver/', 'g')::jsonb),
  updated_at = now()
WHERE localizations::text LIKE '%बेसमेंट-सुइट-लागत-वैंकूवर%';

UPDATE blog_posts SET
  localizations = (regexp_replace(localizations::text, '/(blog|guides)/बेसमेंट-सुइट-लागत-वैंकूवर/?', '/guides/basement-suite-cost-vancouver/', 'g')::jsonb),
  updated_at = now()
WHERE is_published=true AND localizations::text LIKE '%बेसमेंट-सुइट-लागत-वैंकूवर%';

-- ============================================================================
-- Vietnamese (VI) translations
-- ============================================================================

-- 3-mảnh-vs-4-mảnh-phòng tắm-renovation-cost-vancouver-2026 (note: has spaces)
UPDATE blog_posts SET
  localizations = (regexp_replace(localizations::text, '/blog/3-mảnh-vs-4-mảnh-phòng tắm-renovation-cost-vancouver-2026/?', '/blog/3-piece-vs-4-piece-bathroom-renovation-cost-vancouver-2026/', 'g')::jsonb),
  updated_at = now()
WHERE is_published=true AND localizations::text LIKE '%3-mảnh-vs-4-mảnh-phòng tắm-renovation-cost-vancouver-2026%';

-- phòng tắm-cải tạo-cost-vancouver (Vietnamese for "bathroom renovation cost vancouver")
UPDATE blog_posts SET
  localizations = (regexp_replace(localizations::text, '/(blog|guides)/phòng tắm-cải tạo-cost-vancouver/?', '/guides/bathroom-renovation-cost-vancouver/', 'g')::jsonb),
  updated_at = now()
WHERE is_published=true AND localizations::text LIKE '%phòng tắm-cải tạo-cost-vancouver%';

-- ============================================================================
-- Mixed-script broken slugs (Punjabi fragment leaking into English)
-- ============================================================================

-- 3-piece-vs-4-piece-novation-20st-2-2-2-ਟੁਕੜਾ-ਬਾਥਰੂਮ (clearly broken concat)
UPDATE blog_posts SET
  localizations = (regexp_replace(localizations::text, '/blog/3-piece-vs-4-piece-novation-20st-2-2-2-ਟੁਕੜਾ-ਬਾਥਰੂਮ/?', '/blog/3-piece-vs-4-piece-bathroom-renovation-cost-vancouver-2026/', 'g')::jsonb),
  updated_at = now()
WHERE is_published=true AND localizations::text LIKE '%3-piece-vs-4-piece-novation-20st-2-2-2-ਟੁਕੜਾ-ਬਾਥਰੂਮ%';

-- ============================================================================
-- Earlier broken URL: cover2-cover2-cover6 (mistranslation of cost-vancouver-2026)
-- ============================================================================
UPDATE service_areas SET
  localizations = (regexp_replace(localizations::text, '/blog/3-piece-vs-4-piece-bathroom-renovation-cover2-cover2-cover6', '/blog/3-piece-vs-4-piece-bathroom-renovation-cost-vancouver-2026', 'g')::jsonb),
  updated_at = now()
WHERE localizations::text LIKE '%cover2-cover2-cover6%';

UPDATE blog_posts SET
  localizations = (regexp_replace(localizations::text, '/blog/3-piece-vs-4-piece-bathroom-renovation-cover2-cover2-cover6', '/blog/3-piece-vs-4-piece-bathroom-renovation-cost-vancouver-2026', 'g')::jsonb),
  updated_at = now()
WHERE is_published=true AND localizations::text LIKE '%cover2-cover2-cover6%';

COMMIT;

-- Sanity: list any remaining non-ASCII URL slugs (should be empty for the patterns above)
WITH expanded AS (
  SELECT slug AS area, key, value
  FROM service_areas, jsonb_each_text(localizations)
)
SELECT area || ' / ' || key || ' / ' || (regexp_matches(value, '(/(?:en|zh|zh-Hant|ja|ko|es|fr|de|fa|tl|vi|ar|hi|pa|ru|pt|it)/(?:blog|guides)/[^/\)\\("'' .,;:!?#]*)', 'g'))[1] AS broken
FROM expanded
WHERE value ~ '/(?:en|zh|zh-Hant|ja|ko|es|fr|de|fa|tl|vi|ar|hi|pa|ru|pt|it)/(?:blog|guides)/[^/\)\\("'' .,;:!?#]*[^ -][^/\)\\("'' .,;:!?#]*';
