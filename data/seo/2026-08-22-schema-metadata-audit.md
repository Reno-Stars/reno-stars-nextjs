# SEO Schema + Metadata Audit — 2026-08-22

## Pages Audited

### /en/services/kitchen/ ✅
- og:title, og:description, og:image (×4 — multiple sizes) — present
- JSON-LD types: FAQPage, HomeAndConstructionBusiness, Service, WebSite+SearchAction, BreadcrumbList, AggregateRating, Review, ContactPoint, SpeakableSpecification, GeoCircle, GeoCoordinates, Offer, OfferCatalog, OpeningHoursSpecification, PriceSpecification, Answer, Question, City, Person, PostalAddress
- `<meta name="description">`: "Vancouver kitchen renovations — cabinetry, countertops, tile, plumbing & electrical. $5M insured, 3-yr workmanship warranty. Free quote."
- `<meta name="author">`: "Reno Stars"
- Google site verification: present
- Domain verification (p:domain_verify): present

### /en/blog/ ✅
- `<meta name="description">`: "Expert renovation tips, design trends, and practical ideas for your Vancouver home improvement project. Read case studies and before-and-after transformations."
- 3× JSON-LD scripts

### /en/guides/ ✅
- `<meta name="description">`: "Renovation costs per sq ft Vancouver 2026: $150–$400. Kitchen $15K–$72K, basement $30K–$120K+, bathroom $10K–$60K+. Real projects, free estimate."

### /en/projects/ ✅
- JSON-LD: FAQPage, BreadcrumbList, ItemList, AggregateRating, Review, ContactPoint, OpeningHoursSpecification, Person, PostalAddress, Question, Answer, City, GeoCoordinates, Rating
- `<meta name="description">`: "100+ real renovation projects across Metro Vancouver — before/after photos, actual costs, timelines. Kitchen, bathroom, basement, whole-house."

## Known Blockers

### Service-area pages — HTTP 404 (CRITICAL REGRESSION)
All `/en/service-areas/{city}/` return HTTP 404. Sitemap has 448 stale URLs.
Full report: `data/seo/2026-08-22-service-pages-404-regression.md`

### Blog API — HTTP 503
`POST https://www.reno-stars.com/api/blog/` → `{"error":"Blog API not configured."}`
Full remediation: `data/seo/2026-08-22-blog-api-503-remediation.md`

## Status: No schema or metadata issues found on any working page.
