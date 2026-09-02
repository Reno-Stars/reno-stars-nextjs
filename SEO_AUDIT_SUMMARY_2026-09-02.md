# SEO Audit Summary — 2026-09-02 (Ticks 60-82)

## Branch: seo/daily-2026-09-02
**Head:** `7d97723` (Tick 81)

## Deploy Status
| Fix | Committed | Deployed |
|-----|-----------|----------|
| llms.txt dynamic count | Tick 26+ | ✅ Tick 77 live |
| robots.txt anthropic-ai/cohere-ai allow | Tick 26+ | ⚠️ Pending reno-stars-infra |

## Ladder 1 — Content Integrity
- **BLOCKED**: Migration cap hit (excerpt_zh 3+, focus_keyword_zh 3+)
- 4 migrations written, NOT APPLIED:
  - `2026-09-02-blog-featured-image-url-backfill.sql` — featured_image_url for 6 published posts
  - `2026-09-02-project-sites-duration-zh.sql` — duration_zh for `6d5050fa`
  - `2026-09-02-content-zh-stub-posts.sql` (main) — full zh body for 6 stub posts
  - `2026-09-02-content-zh-stub-posts.sql` (pending/) — duplicate
- All 8 localized tables audited: faqs, blog_posts, services, service_areas, project_scopes, projects, project_sites, project_reviews
- blog_posts.meta_description_zh: 0 NULL published rows ✅

## Ladder 2 — Schema + Metadata (Ticks 60-81)
### Pages audited:
- `/en/services/heat-pump-hvac/` — complete ✅
- `/en/services/kitchen/` — complete ✅
- `/en/services/bathroom/` — complete ✅
- `/en/services/whole-house/` — complete ✅
- `/en/services/commercial/` — complete ✅
- `/en/services/critical-load-panel/` — complete ✅
- `/en/services/accessible-bathroom/` — complete ✅
- `/en/services/basement/` — complete ✅ (22 types, PriceSpecification)
- `/en/services/cabinet/` — complete ✅
- `/en/services/poly-b-replacement/` — complete ✅ (20 types, no AdminArea)
- `/en/services/realtor/` — complete ✅ (20 types)
- `/en/services/accessible-bathroom/vancouver/` — complete ✅ (21 types)
- `/en/services/commercial/vancouver/` — complete ✅ (24 types, PriceSpecification+Offer)
- `/en/services/cabinet/vancouver/` — complete ✅ (23 types, Offer)
- `/en/areas/vancouver/` — complete ✅ (13 types)
- `/en/projects/richmond-whole-house-renovation-three-bathrooms/` — complete ✅ (17 types)
- `/en/projects/` listing — WebSite+BreadcrumbList+ItemList+FAQPage ✅ (no Org, aggregate listing)
- `/en/services/` listing — WebSite+BreadcrumbList+Service ✅ (no Org, aggregate listing)
- `/en/blog/` listing — Blog+WebSite+BreadcrumbList+ItemList+FAQPage ✅ (no Org)
- `/en/features/` — FAQPage+WebSite+BreadcrumbList ✅ (thin FAQ, legitimate)
- `/en/design/` — FAQPage+WebSite+BreadcrumbList ✅ (thin FAQ, legitimate)
- Blog post `kitchen-vs-bathroom-reno-vancouver-2026` — Organization+BlogPosting+FAQPage ✅

### Schema patterns confirmed:
- Service detail pages: HomeAndConstructionBusiness + Service + FAQPage + geo types
- Service-city pages: + City + AdministrativeArea (or City-only) + OfferCatalog + Offer
- Commercial pages: + PriceSpecification + Offer
- Basement pages: + PriceSpecification
- Project detail pages: 17 types including HomeAndConstructionBusiness, Service, Rating, Review
- Aggregate listing pages (services, projects, blog): no Organization (correct pattern)

## Ladder 3 — Coverage Gaps
- **6 posts with stub content_zh** (<200 chars): `kitchen-vs-bathroom-reno-vancouver-2026` (22 chars), `adu-renovation-vancouver-2026` (148), `split-level-home-renovation-burnaby-coquitlam-2026` (180), `vancouver-infill-development-cost-2026` (182), `heritage-home-renovation-vancouver-2026` (188), `mid-century-rancher-renovation-vancouver-2026` (193). Migration written.
- **`kitchen-vs-bathroom-reno-vancouver-2026` zero internal links**: 0 inbound links vs 9-33 for other 5 stub posts. Coverage gap.
- All 11 service pages have HTTP 200 with correct DB slugs ✅
- All 6 major service city sub-pages HTTP 200 ✅
- All 14 service areas rich ✅
- reading_time_minutes = 0 NULL ✅
- author = 39 NULL (Organization "Reno Stars Team" correct) ✅
- localizations empty on 3 posts (non-actionable) ✅
- project_id = 227 NULL (not actionable) ✅
- FAQ content embedded in service pages (no separate FAQ URLs in sitemap) — correct architecture ✅

## Ladder 4 — Technical (Ticks 63-64, 73, 77-81)
- Sitemap: 5,825 entries, HTTP 200 ✅
- 5 random sitemap URLs: all HTTP 200 ✅
- All 14 hreflang in sitemap ✅
- No redirect chains ✅
- Security headers: Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy ✅
- CSP header present ✅
- TTFB: 0.104s (healthy) ✅
- robots.txt blocks AI crawlers: anthropic-ai, cohere-ai still Disallow: / ⚠️
- llms.txt dynamic count: "Projects Completed: 700+" ✅

## Blog Drafts (12 total, all need human publish)
1. poly-b-pipe-replacement-vancouver-2026
2. heat-pump-installation-vancouver-bc-2026
3. renovation-warranty-bc-2026
4. renovation-estimate-vancouver-bc-2026
5. renovation-warning-signs-vancouver-bc-2026
6. renovation-insurance-claim-bc-2026
7. renovation-hidden-costs-vancouver-bc-2026
8. laneway-house-renovation-vancouver-bc-2026
9. bathroom-renovation-before-after-vancouver-bc-2026
10. renovation-spending-plan-vancouver-bc-2026
11. commercial-renovation-vancouver-bc-2026
12. cabinet-refinishing-vs-replacement-vancouver-2026 (dedup flag: marginal kw overlap, different angle)
- Blog API blocked at Canvas WAF (HTTP 503 from this runtime)
- 11 original slugs confirmed 404 on production (Tick 59)

## Pending Human Action
1. Apply 4 migrations in `scripts/migrations/` (featured_image_url, duration_zh, content_zh stubs x2)
2. Merge `seo/daily-2026-09-02` → main → reno-stars-infra PR → **human merge** → deploy
3. Publish 12 blog drafts via `POST https://www.reno-stars.com/api/blog/`
4. Review cabinet-refinishing-vs-replacement-vancouver-2026 dedup
