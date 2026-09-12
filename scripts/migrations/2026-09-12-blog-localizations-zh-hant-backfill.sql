-- Migration: NOT YET APPLIED — requires human to run
-- 2026-09-12-blog-localizations-zh-hant-backfill.sql
-- Desired state: 10 recently published posts have zh-Hant localizations populated
--   from their existing content_zh / title_zh fields.
--   These posts have content_zh filled but localizations = {} (empty object),
--   so zh-Hant readers receive no translated content for these posts.
-- Verification after apply: SELECT slug, localizations FROM blog_posts
--   WHERE id IN ('dfe1d28e-...','cd26ba53-...','670936df-...','b679b129-...',
--     '5c924cc3-...','2477d915-...','5cb854f1-...','ed3f1f11-...',
--     '9b99f428-...','4728d80b-...')
--   AND localizations->>'titleZhHant' IS NOT NULL;

UPDATE blog_posts
SET
  localizations = jsonb_build_object(
    'titleZhHant', title_zh,
    'contentZhHant', content_zh,
    'metaTitleZhHant', meta_title_zh,
    'metaDescriptionZhHant', meta_description_zh,
    'focusKeywordZhHant', focus_keyword_zh,
    'seoKeywordsZhHant', seo_keywords_zh,
    'excerptZhHant', excerpt_zh
  )
WHERE id = 'dfe1d28e-3767-4679-ba75-9b64038def47'
  AND localizations = '{}'
  AND title_zh IS NOT NULL AND title_zh != '';

UPDATE blog_posts
SET
  localizations = jsonb_build_object(
    'titleZhHant', title_zh,
    'contentZhHant', content_zh,
    'metaTitleZhHant', meta_title_zh,
    'metaDescriptionZhHant', meta_description_zh,
    'focusKeywordZhHant', focus_keyword_zh,
    'seoKeywordsZhHant', seo_keywords_zh,
    'excerptZhHant', excerpt_zh
  )
WHERE id = 'cd26ba53-c4df-4d0b-af41-33324c83589e'
  AND localizations = '{}'
  AND title_zh IS NOT NULL AND title_zh != '';

UPDATE blog_posts
SET
  localizations = jsonb_build_object(
    'titleZhHant', title_zh,
    'contentZhHant', content_zh,
    'metaTitleZhHant', meta_title_zh,
    'metaDescriptionZhHant', meta_description_zh,
    'focusKeywordZhHant', focus_keyword_zh,
    'seoKeywordsZhHant', seo_keywords_zh,
    'excerptZhHant', excerpt_zh
  )
WHERE id = '670936df-8c3d-44b4-bc1a-162bd1d2abc7'
  AND localizations = '{}'
  AND title_zh IS NOT NULL AND title_zh != '';

UPDATE blog_posts
SET
  localizations = jsonb_build_object(
    'titleZhHant', title_zh,
    'contentZhHant', content_zh,
    'metaTitleZhHant', meta_title_zh,
    'metaDescriptionZhHant', meta_description_zh,
    'focusKeywordZhHant', focus_keyword_zh,
    'seoKeywordsZhHant', seo_keywords_zh,
    'excerptZhHant', excerpt_zh
  )
WHERE id = 'b679b129-d5d9-4693-8ddf-846e24a3406c'
  AND localizations = '{}'
  AND title_zh IS NOT NULL AND title_zh != '';

UPDATE blog_posts
SET
  localizations = jsonb_build_object(
    'titleZhHant', title_zh,
    'contentZhHant', content_zh,
    'metaTitleZhHant', meta_title_zh,
    'metaDescriptionZhHant', meta_description_zh,
    'focusKeywordZhHant', focus_keyword_zh,
    'seoKeywordsZhHant', seo_keywords_zh,
    'excerptZhHant', excerpt_zh
  )
WHERE id = '5c924cc3-43d5-4d91-bc2f-02d7abc75280'
  AND localizations = '{}'
  AND title_zh IS NOT NULL AND title_zh != '';

UPDATE blog_posts
SET
  localizations = jsonb_build_object(
    'titleZhHant', title_zh,
    'contentZhHant', content_zh,
    'metaTitleZhHant', meta_title_zh,
    'metaDescriptionZhHant', meta_description_zh,
    'focusKeywordZhHant', focus_keyword_zh,
    'seoKeywordsZhHant', seo_keywords_zh,
    'excerptZhHant', excerpt_zh
  )
WHERE id = '2477d915-de6e-46f2-94e8-e0731af8c505'
  AND localizations = '{}'
  AND title_zh IS NOT NULL AND title_zh != '';

UPDATE blog_posts
SET
  localizations = jsonb_build_object(
    'titleZhHant', title_zh,
    'contentZhHant', content_zh,
    'metaTitleZhHant', meta_title_zh,
    'metaDescriptionZhHant', meta_description_zh,
    'focusKeywordZhHant', focus_keyword_zh,
    'seoKeywordsZhHant', seo_keywords_zh,
    'excerptZhHant', excerpt_zh
  )
WHERE id = '5cb854f1-c179-47d0-b739-b95daa77877e'
  AND localizations = '{}'
  AND title_zh IS NOT NULL AND title_zh != '';

UPDATE blog_posts
SET
  localizations = jsonb_build_object(
    'titleZhHant', title_zh,
    'contentZhHant', content_zh,
    'metaTitleZhHant', meta_title_zh,
    'metaDescriptionZhHant', meta_description_zh,
    'focusKeywordZhHant', focus_keyword_zh,
    'seoKeywordsZhHant', seo_keywords_zh,
    'excerptZhHant', excerpt_zh
  )
WHERE id = 'ed3f1f11-a2a2-435c-a4cf-5476a1e6560a'
  AND localizations = '{}'
  AND title_zh IS NOT NULL AND title_zh != '';

UPDATE blog_posts
SET
  localizations = jsonb_build_object(
    'titleZhHant', title_zh,
    'contentZhHant', content_zh,
    'metaTitleZhHant', meta_title_zh,
    'metaDescriptionZhHant', meta_description_zh,
    'focusKeywordZhHant', focus_keyword_zh,
    'seoKeywordsZhHant', seo_keywords_zh,
    'excerptZhHant', excerpt_zh
  )
WHERE id = '9b99f428-16e2-4139-ad6e-633e876ddff2'
  AND localizations = '{}'
  AND title_zh IS NOT NULL AND title_zh != '';

UPDATE blog_posts
SET
  localizations = jsonb_build_object(
    'titleZhHant', title_zh,
    'contentZhHant', content_zh,
    'metaTitleZhHant', meta_title_zh,
    'metaDescriptionZhHant', meta_description_zh,
    'focusKeywordZhHant', focus_keyword_zh,
    'seoKeywordsZhHant', seo_keywords_zh,
    'excerptZhHant', excerpt_zh
  )
WHERE id = '4728d80b-fe19-4a17-8071-475029968bf9'
  AND localizations = '{}'
  AND title_zh IS NOT NULL AND title_zh != '';
