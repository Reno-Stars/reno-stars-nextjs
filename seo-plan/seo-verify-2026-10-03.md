# SEO Verification — 2026-10-03

## Live Post Schema Check: renovation-project-manager-vancouver-2026
- `@type: Article` ✅
- `@type: BlogPosting` ✅
- `@type: FAQPage` ✅
- `@type: WebPage` ✅
- `@type: Organization` ✅
- `@type: WebSite` ✅
- `@type: BreadcrumbList` ✅
- `@type: SpeakableSpecification` ✅
- `@type: GeoCoordinates` ✅
- `@type: PostalAddress` ✅
- `@type: ContactPoint` ✅
- `@type: OpeningHoursSpecification` ✅

## Hreflang
- `hrefLang="en"` ✅
- `hrefLang="x-default"` ✅
- `hrefLang="zh"` ✅ (nativeSupport only — correct)

## Meta
- `<title>`: What Does a Renovation Project Manager Do in Vancouver? (2026 Guide) ✅
- `<meta name="description">`: A renovation project manager coordinates trades... (within 155 chars) ✅
- `og:title`, `og:description`, `og:image`, `og:image:width`, `og:image:height`, `og:image:alt` ✅
- `og:locale:alternate`: zh_CN ✅
- `canonical`: https://www.reno-stars.com/en/blog/renovation-project-manager-vancouver-2026/ ✅

## Services Page
- JSON-LD: WebSite, Service (x11), FAQPage, BreadcrumbList, GeoCoordinates, PostalAddress, ContactPoint, OpeningHoursSpecification ✅
- Alt text: present on all service icons ✅

## Content Integrity (DB)
- `services.description_zh IS NULL or ''`: 0 rows ✅
- `service_areas.description_zh IS NULL or ''`: 0 rows ✅
- `blog_posts.content_zh IS NULL or '' AND is_published`: 0 rows ✅
- `project_scopes.scope_zh IS NULL or not Chinese`: 0 rows ✅
- `faqs.answer_zh IS NULL or not Chinese`: 0 rows ✅
- `service_areas.meta_description_en > 155 chars`: 2 rows (Richmond 182, West Vancouver 195) — migration already filed: 2026-10-03-service-areas-meta-description-en-overlimit.sql ✅

## Coverage
- 11 services × 14 service_areas combinations — service pages exist per city ✅
- No service x city gap detected ✅

## No-action items
- No English-in-zh content detected in any table ✅
- All locale fields properly populated ✅
