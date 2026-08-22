# SEO Technical Audit — 2026-08-22

## Hreflang Audit (real blog post slug)

**URL tested:** `https://www.reno-stars.com/en/blog/duplex-renovation-vancouver-costs-permits-2026/`

**Result: ✅ ALL 14 hreflang tags present + x-default**

```
<link rel="alternate" hreflang="en"           href="https://www.reno-stars.com/en/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
<link rel="alternate" hreflang="zh"            href="https://www.reno-stars.com/zh/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
<link rel="alternate" hreflang="zh-Hant"       href="https://www.reno-stars.com/zh-Hant/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
<link rel="alternate" hreflang="ja"            href="https://www.reno-stars.com/ja/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
<link rel="alternate" hreflang="ko"            href="https://www.reno-stars.com/ko/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
<link rel="alternate" hreflang="es"            href="https://www.reno-stars.com/es/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
<link rel="alternate" hreflang="pa"            href="https://www.reno-stars.com/pa/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
<link rel="alternate" hreflang="tl"            href="https://www.reno-stars.com/tl/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
<link rel="alternate" hreflang="fa"            href="https://www.reno-stars.com/fa/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
<link rel="alternate" hreflang="vi"            href="https://www.reno-stars.com/vi/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
<link rel="alternate" hreflang="ru"            href="https://www.reno-stars.com/ru/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
<link rel="alternate" hreflang="ar"            href="https://www.reno-stars.com/ar/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
<link rel="alternate" hreflang="hi"            href="https://www.reno-stars.com/hi/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
<link rel="alternate" hreflang="fr"            href="https://www.reno-stars.com/fr/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
<link rel="alternate" hreflang="x-default"     href="https://www.reno-stars.com/en/blog/duplex-renovation-vancouver-costs-permits-2026/"/>
```

**Canonical:** `<link rel="canonical" href="https://www.reno-stars.com/en/blog/duplex-renovation-vancouver-costs-permits-2026/"/>`

**og:locale:alternate:** All 14 locales present (zh_CN, zh_TW, ja_JP, ko_KR, es_ES, pa_IN, tl_PH, fa_IR, vi_VN, ru_RU, ar_AE, hi_IN, fr_CA)

## Redirect Chain Audit
- `/` → HTTP/2 308 → `/en/` ✅ (correct locale routing)
- `/api/blog` → HTTP/2 308 ✅ (trailing slash redirect)

## Robots.txt
- `Allow: /` — clean, no blocking

## All 8 Major Pages — Unique Meta Descriptions ✅
- `/en/`: "Vancouver's trusted renovation contractor for kitchens, bathrooms, basements & full-home renovations. 20+ years, 700+ projects, $5M insured, 5-star Google. Free quote in 24h."
- `/en/blog/`: "Expert renovation tips, design trends, and practical ideas for your Vancouver home improvement project."
- `/en/services/kitchen/`: "Vancouver kitchen renovations — cabinetry, countertops, tile, plumbing & electrical. $5M insured, 3-yr workmanship warranty. Free quote."
- `/en/projects/`: "100+ real renovation projects across Metro Vancouver — before/after photos, actual costs, timelines."
- `/en/guides/`: "Renovation costs per sq ft Vancouver 2026: $150–$400. Kitchen $15K–$72K, basement $30K–$120K+, bathroom $10K–$60K+."
- `/en/about/`: "Meet the team behind 100+ Metro Vancouver renovations. 20+ years experience, $5M insurance."
- `/en/contact/`: "Book a free renovation quote with Reno Stars — kitchen, bathroom, basement & whole..."

**All unique — no duplicate meta descriptions found.**

## Schema + JSON-LD Status

| Page | JSON-LD Types | Status |
|------|--------------|--------|
| /en/ | Organization, LocalBusiness, HomeAndConstructionBusiness, WebSite+SearchAction | ✅ |
| /en/services/kitchen/ | FAQPage, HomeAndConstructionBusiness, Service, WebSite+SearchAction, BreadcrumbList, AggregateRating, ContactPoint, SpeakableSpecification | ✅ |
| /en/blog/{slug}/ | Article, WebSite+SearchAction, Organization+LocalBusiness+HomeAndConstructionBusiness | ✅ |
| /en/projects/ | FAQPage, BreadcrumbList, ItemList, AggregateRating, Review, ContactPoint | ✅ |

## Known Blockers

### Service-area pages — HTTP 404 (CRITICAL REGRESSION)
All `/en/service-areas/{city}/` return HTTP 404.
Full report: `data/seo/2026-08-22-service-pages-404-regression.md`

### Blog API — HTTP 503
`POST https://www.reno-stars.com/api/blog/` → `{"error":"Blog API not configured."}`
Full remediation: `data/seo/2026-08-22-blog-api-503-remediation.md`
