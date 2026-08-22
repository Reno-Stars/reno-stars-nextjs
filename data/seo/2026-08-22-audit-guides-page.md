# SEO Audit Tick — /en/guides/ Schema Audit

**Date:** 2026-08-22  
**Page audited:** `/en/guides/`  
**HTTP status:** 200

## Head metadata

| Element | Value | Status |
|---------|-------|--------|
| `<title>` | Renovation Costs Vancouver 2026: $150–$400/sqft \| Reno Stars | ✅ |
| `<meta name="description">` | Renovation costs per sq ft Vancouver 2026: $150–$400. Kitchen $15K–$72K, basement $30K–$120K+, bathroom $10K–$60K+. Real projects, free estimate. | ✅ |
| `<link rel="canonical">` | https://www.reno-stars.com/en/guides/ | ✅ |
| `<link rel="alternate" hreflang>` in HTML | All 14 locales + x-default (confirmed in raw HTML) | ✅ |
| `og:locale:alternate` | All 14 locales | ✅ |
| Google site verification | FuaUhlygBAgGgvbRm4saQDfrnX9EBkdo98ZSQU3B4Oo | ✅ |
| Pinterest domain verification | aba89ace071fac8fe04f3fd8d6e83160 | ✅ |
| Twitter card | summary_large_image | ✅ |
| theme-color | #1B365D | ✅ |

## JSON-LD Schema Types (confirmed via raw HTML grep)

| Type | Count | Notes |
|------|-------|-------|
| WebSite | 1 | + SearchAction |
| Organization | 1 | Full entity |
| LocalBusiness | 1 | Merged with Organization |
| HomeAndConstructionBusiness | 1 | Merged with Organization |
| FAQPage | 1 | 5 Question entities |
| BreadcrumbList | 1 | |
| ItemList | 1 | |
| Review | 5 | 5 inline Person + Rating + ReviewBody |
| Rating | 5 | |
| AggregateRating | 1 | ratingValue=5, ratingCount=77 |
| SpeakableSpecification | 1 | |
| ContactPoint | 1 | availableLanguage: ["English","Mandarin Chinese","Cantonese"] — nativeSupport gated ✅ |
| PostalAddress | 1 | Full Richmond address |
| GeoCoordinates | 1 | |
| OpeningHoursSpecification | 2 | Mon-Sat 09:30–21:00, Sun 11:00–19:00 |
| City (areaServed) | 14 | All 14 Metro Vancouver cities |
| ListItem | 11 | Breadcrumb items |

## Organization schema details

- **name:** Reno Stars
- **alternateName:** Reno Stars, Reno Star, RenoStars, Renostars, 聚星装修, 聚星裝修
- **image:** CloudFront CDN logo
- **url:** https://www.reno-stars.com
- **telephone:** +177****7999 (redacted)
- **email:** info@reno-stars.com
- **address:** 21300 Gordon Way, Unit 188, Richmond, BC V6W 1M2, CA
- **geo:** lat 49.1658907, lon -122.9872706
- **areaServed:** 14 cities (Vancouver, Richmond, Burnaby, Surrey, Coquitlam, West Vancouver, New Westminster, Delta, North Vancouver, Langley, Port Moody, Maple Ridge, White Rock, Port Coquitlam)
- **priceRange:** $$
- **openingHours:** Mon-Sat 09:30–21:00, Sun 11:00–19:00
- **sameAs:** Facebook, Instagram, WhatsApp, Xiaohongshu, X, YouTube, TikTok, Reddit, LinkedIn, Google Maps — 10 platforms ✅
- **aggregateRating:** 5/5, 77 reviews
- **foundingDate:** 2020
- **numberOfEmployees:** 17
- **knowsAbout:** 14 topics including Kitchen Renovation, Bathroom Renovation, Whole-House Renovation, BC Building Code Compliance, Vancouver Building Permits, etc.
- **contactPoint.availableLanguage:** ["English","Mandarin Chinese","Cantonese"] ✅ — gated on nativeSupport

## 5 Inline Reviews

1. **shane groves** — 5★, 2026-06-22 — Vancouver bathroom renovation
2. **Alice L** — 5★, 2026-06-21 — small renovation, Jacky team
3. **Angela Lu** — 5★, 2026-03-10 — townhouse renovation, Ryan + Chen
4. **Cindy Tong** — 5★, 2026-03-25 — master bathroom update
5. **Lisa Jung** — 5★, 2026-05-15 — second project, kitchen

## Status: FULLY STRUCTURED

No missing metadata. No broken schema. All hreflang tags present in HTML `<head>`. All 14 locale alternates in both `<link>` tags and JSON-LD. `availableLanguage` correctly gated on nativeSupport (3 locales). No action needed.
