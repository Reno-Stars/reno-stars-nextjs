SEO Integrity Scan — 2026-08-26
================================

DATE: 2026-08-26
METHOD: curl to https://api.reno-stars.com/query (Bearer token)
TOOLS: curl + Python subprocess

FINDING: Content integrity CLEAN across all tables.

Queries run and results:
1. blog_posts content_zh CJK check
   SQL: SELECT id, slug, title_en FROM blog_posts WHERE is_published AND content_zh IS NOT NULL AND content_zh <> '' AND content_zh !~ '[一-鿿]'
   RESULT: 0 rows — all published blog_posts with content_zh contain Chinese characters (no English fallback in zh field)

2. services title_zh CJK check
   SQL: SELECT id, slug, title_en, title_zh FROM services WHERE title_zh IS NOT NULL AND title_zh !~ '[一-鿿]'
   RESULT: 0 rows — all services with title_zh contain Chinese characters

3. services description_zh CJK check
   SQL: SELECT id, slug, title_en, description_zh FROM services WHERE description_zh IS NOT NULL AND description_zh !~ '[一-鿿]'
   RESULT: 0 rows — all services with description_zh contain Chinese characters

4. service_areas name_zh CJK check
   SQL: SELECT id, name_en, name_zh FROM service_areas WHERE name_zh IS NOT NULL AND name_zh !~ '[一-鿿]'
   RESULT: 0 rows — all service_areas with name_zh contain Chinese characters

5. project_scopes scope_zh CJK check
   SQL: SELECT id, scope_en, scope_zh FROM project_scopes WHERE scope_zh IS NOT NULL AND scope_zh !~ '[一-鿿]'
   RESULT: 0 rows — all project_scopes with scope_zh contain Chinese characters

City blog coverage (from DB — UNION ALL query):
  Vancouver:        135 posts
  Coquitlam:         19 posts
  Surrey:            15 posts
  Burnaby:           13 posts
  Richmond:          12 posts
  Maple Ridge:        9 posts
  West Vancouver:     9 posts
  Delta:              9 posts
  Langley:            8 posts
  New Westminster:    8 posts
  Port Moody:         7 posts
  North Vancouver:    7 posts
  Port Coquitlam:     7 posts
  White Rock:         7 posts

All 14 service areas have 7+ dedicated blog posts. Sitemap "Tsawwassen 0 posts" finding was
a false alarm: sitemap uses locale-prefixed URLs (/zh/, /ko/, etc.) which were counted separately.
The /en/ sitemap correctly reflects 9 Delta posts covering Tsawwassen, Ladner, and North Delta.

Published posts total: 254 (DB COUNT(*) WHERE is_published = true)

Previously identified gaps and their status:
- excerpt_zh NULL (id 34e43ef8): migration written, not yet applied
- featured_image_url NULL (5 published posts): migration written, not yet applied
- meta_title_zh NULL: all are outdoor-test-* slugs (test drafts, no action)
- meta_description_zh NULL: all are outdoor-test-* slugs (test drafts, no action)

Blockers this tick:
- Blog API: POST https://www.reno-stars.com/api/blog/ returns 503 {"error":"Blog API not configured."}
  k8s service-layer issue. curl confirms URL is correct (no locale prefix, trailing slash present).
  Python urllib also returns 403 Cloudflare ASN block for blog API.
- DB via Python urllib: HTTP 403 (Cloudflare ASN block) — USE CURL INSTEAD.

Action items:
1. Apply pending migrations (2 files, 6 rows total affected)
2. Blog API unblock requires k8s secret BLOG_API_SECRET to be mounted in the reno-stars namespace
