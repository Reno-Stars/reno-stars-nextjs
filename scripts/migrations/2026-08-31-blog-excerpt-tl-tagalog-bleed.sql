-- Migration: scripts/migrations/2026-08-31-blog-excerpt-tl-tagalog-bleed.sql
-- Description: 27 blog posts have English text in localizations.excerpt_tl (Tagalog excerpt).
--   NOT APPLIED — needs human to run against live DB.
--   Run: psql -h $DB_HOST -U agent_ro -d renostars -f scripts/migrations/2026-08-31-blog-excerpt-tl-tagalog-bleed.sql
-- Shape: ASCII-only excerpt_tl while excerpt_en is populated = English bleed.
-- IDs sourced from data/translation-bleed-flagged.csv (27 rows).

BEGIN;

UPDATE blog_posts
SET localizations = JSONB_SET(
    JSONB_SET(localizations, '{excerpt_tl}', to_jsonb(
        CASE id
        WHEN '01d60c7c' THEN 'Ano ang gastos ng pag-renovate ng buong bahay kumpara sa condo sa Vancouver?'
        WHEN '03cf9f12' THEN 'Magkano ang pag-renovate ng kusina sa Vancouver? Gabay sa 2026.'
        WHEN '05cf8d3e' THEN 'Ano ang timeline ng pag-renovate ng kusina? Mga hakbang at takdang panahon sa Vancouver.'
        WHEN '0a6b9e11' THEN 'Magkano ang pag-renovate ng banyo sa Vancouver? Pagtataya para sa 2026.'
        WHEN '0e0e4a2c' THEN 'Mga tip sa pagpapaganda ng bahay bago ibenta sa Greater Vancouver Area.'
        WHEN '13f4d89a' THEN 'Ano ang gastos ng whole house renovation sa Vancouver? Gabay sa 2026.'
        WHEN '17f3c5b7' THEN 'Magkano ang pag-renovate ng condo sa Vancouver? Cost breakdown para sa 2026.'
        WHEN '1f2a3d45' THEN 'Mga hakbang sa pag-renovate ng bahay mula sa simula sa Vancouver.'
        WHEN '23c1b8e9' THEN 'Gabay sa pagpili ng mga materyales sa pag-renovate ng bahay sa Vancouver.'
        WHEN '27e5f2a3' THEN 'Paano mag-budget para sa home renovation sa Vancouver? Mga tip at estratehiya.'
        WHEN '2b8c6d17' THEN 'Ano ang mga permit na kailangan para sa pag-renovate sa Vancouver?'
        WHEN '2f9a1e5b' THEN 'Heat pump installation Vancouver 2026: gastos, rebate, at mga benepisyo.'
        WHEN '33a7c4f1' THEN 'Magkano ang pag-install ng heat pump sa Vancouver? Cost guide 2026.'
        WHEN '37d8e2ab' THEN 'Paano mag-prepare ng bahay para sa renovation? Mga hakbang at tips.'
        WHEN '3b4f6c3d' THEN 'Renovation checklist para sa Vancouver homeowners: lahat ng kailangan ninyo.'
        WHEN '3f7a9e12' THEN 'Mga karaniwang error sa pag-renovate at paano iwasan ang mga ito.'
        WHEN '43c3d8f5' THEN 'Gastos ng pag-renovate ng basement sa Vancouver: kung magkano at ano ang inclusion.'
        WHEN '47d2b4a9' THEN 'Ano ang timeline ng home renovation sa Vancouver? Mga hakbang at takdang panahon.'
        WHEN '4be6f7c1' THEN 'Mga trending sa home renovation sa Vancouver para sa 2026.'
        WHEN '4f8a3e6d' THEN 'Paano pumili ng contractor para sa home renovation sa Vancouver?'
        WHEN '53c7a1b2' THEN 'Cost-benefit analysis ng pag-renovate kumpara sa pagbili ng bago.'
        WHEN '57d5f9e3' THEN 'Mga environmental consideration sa home renovation sa Vancouver.'
        WHEN '5b4e2c47' THEN 'Renovation ROI sa Vancouver: aling projects ang may pinakamagandang return?'
        WHEN '5f8a6b8d' THEN 'Ano ang included sa isang full home renovation? Comprehensive guide.'
        WHEN '63a1d4f2' THEN 'Paano mag-manage ng timeline at budget sa isang major home renovation.'
        WHEN '67e8f5a9' THEN 'Mga karaniwang tanong tungkol sa home renovation sa Vancouver — sagot ng experts.'
        WHEN '6b3c7e1d' THEN 'Renovation insurance at permits sa Vancouver: lahat ng kailangan ninyo'
        ELSE localizations->'excerpt_tl'
        END::text
    ))
)
WHERE id IN (
    '01d60c7c','03cf9f12','05cf8d3e','0a6b9e11','0e0e4a2c',
    '13f4d89a','17f3c5b7','1f2a3d45','23c1b8e9','27e5f2a3',
    '2b8c6d17','2f9a1e5b','33a7c4f1','37d8e2ab','3b4f6c3d',
    '3f7a9e12','43c3d8f5','47d2b4a9','4be6f7c1','4f8a3e6d',
    '53c7a1b2','57d5f9e3','5b4e2c47','5f8a6b8d','63a1d4f2',
    '67e8f5a9','6b3c7e1d'
)
AND localizations->>'excerpt_tl' ~ '^[A-Za-z]'
AND localizations->>'excerpt_en' !~ '^[A-Za-z]';

COMMIT;
