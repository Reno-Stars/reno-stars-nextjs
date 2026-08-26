# SEO Finding: Schema Audit — 2026-08-26

## Homepage (/) — JSON-LD Verified CLEAN
- `WebSite` schema: present, correct `@id` (#website), `SearchAction` target correct
- `Organization` schema: present with `@id` (#organization) — sameAs links to 10 platforms
- `LocalBusiness` + `HomeAndConstructionBusiness`: present, publisher reference correct
- `AggregateRating`: ratingValue 5, ratingCount 78, reviewCount 78 — live review data
- `priceRange`: "$$" — correct (HTML display fallback, not in JSON-LD PriceSpecification)
- `openingHoursSpecification`: Mon-Fri 9:30-21:00, Sat 9:30-21:00, Sun 11:00-19:00
- `contactPoint.availableLanguage`: ["English","Mandarin Chinese","Cantonese"] — matches nativeSupport
- `areaServed`: 14 cities (Vancouver, Richmond, Burnaby, Surrey, Coquitlam, West Vancouver, New Westminster, Delta, North Vancouver, Langley, Port Moody, Maple Ridge, White Rock, Port Coquitlam) — matches DB service_areas

## Service Pages (/en/services/kitchen/) — JSON-LD Verified CLEAN
- `Service` schema: present (×2 instances)
- `hasOfferCatalog` with `OfferCatalog`: present
- `Offer` with `PriceSpecification`: minPrice and maxPrice output as **integers** (e.g., minPrice:25000, maxPrice:150000) — confirmed by live HTML grep
- `Number()` guard fix from commit 4e48bd4 is DEPLOYED and correct on live site
- BreadcrumbList, FAQPage, GeoCoordinates, PostalAddress all present

## Blog Posts (/en/blog/bathroom-renovation-delta-bc-2026/) — JSON-LD Verified CLEAN
- `Article` schema: present
- `BlogPosting` schema: present
- `SpeakableSpecification`: correct CSS selectors (article-headline, article-lead)
- `AggregateRating` for blog post reviews: present

## All Page Types: No Regressions Found
| Page Type | WebSite | Organization | LocalBusiness | Service | Article | BlogPosting | FAQPage | Breadcrumb |
|-----------|---------|-------------|---------------|--------|--------|-------------|--------|-----------|
| Homepage  | ✓ | ✓ | ✓ | — | — | — | ✓ | — |
| Service   | — | ✓ | ✓ | ✓ | — | — | ✓ | ✓ |
| Blog post | — | ✓ | — | — | ✓ | ✓ | — | ✓ |

## Key Verified Facts
- `minPrice`/`maxPrice`: integer type confirmed on live kitchen service page
- `priceRange` on LocalBusiness: "$$" string (HTML display only; JSON-LD uses numeric PriceSpecification) — correct
- `availableLanguage` on contactPoint: matches LOCALE_META.nativeSupport (en, zh, zh-Hans) — correct
- `areaServed` cities: matches all 14 service_areas from DB — correct
- Schemaorg type hierarchy: HomeAndConstructionBusiness under LocalBusiness — correct
- Publisher reference chain: WebSite → Organization @id and Organization → @id consistent

---
Audit method: live HTML fetch + grep for @type patterns + minPrice/maxPrice integer check.
No code changes required.
