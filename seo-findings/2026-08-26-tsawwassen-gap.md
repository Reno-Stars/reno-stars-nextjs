SEO Coverage Gap — Tsawwassen Blog Posts
=========================================
Date: 2026-08-26
Source: sitemap.xml analysis via live fetch

FINDING: Tsawwassen has 0 dedicated blog posts but 28+ project pages.
- City blog coverage from sitemap (en locale):
  - Vancouver: 131 posts
  - Burnaby: 13 posts
  - Richmond: 11 posts
  - Surrey: 13 posts
  - Delta: 9 posts
  - North Vancouver: 7 posts
  - West Vancouver: 8 posts
  - Coquitlam: 19 posts
  - Port Coquitlam: 7 posts
  - Langley: 8 posts
  - Maple Ridge: 9 posts
  - New Westminster: 8 posts
  - Tsawwassen: 0 posts  ← GAP
  - White Rock: 7 posts

- Tsawwassen service-area page: EXISTS (0 blog posts linking to it)
- Tsawwassen project pages: 28+ (confirmed in sitemap across all locales)
- DEDUP check: cannot run (DB blocked by Cloudflare 403)
- Recommended topic: "Tsawwassen Whole-Home Renovation" or "Tsawwassen Kitchen Renovation Cost Guide"
  based on existing project portfolio

Blocker: DB API (https://api.reno-stars.com/query) returns HTTP 403 Cloudflare ASN block
from this runtime. Cannot query blog_posts to run DEDUP or get project data.

DB unblocked path: python3 script with urllib using env DB_QUERY_API_TOKEN.
