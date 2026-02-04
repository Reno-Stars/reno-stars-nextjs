# SEO & Redirects

## Sitemap

Generated in `app/sitemap.ts` as an async function. Service slugs use static `serviceTypeToCategory` mapping. Project slugs, blog post slugs, and service areas are all fetched from the database via `getProjectSlugsFromDb()`, `getBlogPostSlugsFromDb()`, and `getServiceAreasFromDb()`. Includes:

- Static pages (home, services, projects, blog, contact, benefits, design)
- All service detail pages
- Service × location combination pages (e.g., `/en/services/kitchen/vancouver/`)
- Project category pages
- Individual project pages
- Blog post pages
- Service area pages

Each entry includes hreflang alternates for `en`, `zh`, and `x-default`.

## Structured Data (JSON-LD)

Components in `components/structured-data/`:

| Component | Schema Type | Used On |
|-----------|-------------|---------|
| `LocalBusinessSchema` | LocalBusiness | Layout (global, receives `company` + `socialLinks` props) |
| `ServiceSchema` | Service | Service detail pages |
| `ProductSchema` | Product | Project detail pages |
| `ArticleSchema` | Article | Blog post pages |
| `BreadcrumbSchema` | BreadcrumbList | All pages with breadcrumbs |
| `FAQSchema` | FAQPage | Benefits page |

## robots.txt

Generated in `app/robots.ts`. Allows all crawlers, references the sitemap. Disallows:
- `/api/`
- `/_next/`
- `/*/contact/thank-you/`

## Heading Hierarchy

Pages follow a consistent heading structure:
- `<h1>` — Page title (one per page, in hero section)
- `<h2>` — Section headings
- `<h3>` — List item titles (service cards, blog post cards, etc.)

## Semantic HTML

- Blog post cards wrapped in `<article>` elements
- Navbar dropdown uses `role="menu"` / `role="menuitem"`
- Decorative elements (video, star icons) have `aria-hidden="true"`
- CTA links use descriptive text (e.g., "Explore Kitchen Renovation" instead of generic "Learn More")

## Redirects

`next.config.ts` contains 50+ permanent (301) redirects organized into categories:

### 1. Root Redirect
`/` → `/en`

### 2. Double Locale Prefix
`/en/en/:path*` → `/en/:path*`
`/zh/zh/:path*` → `/zh/:path*`

### 3. Mixed Locale Prefix
`/zh/en/:path*` → `/zh/:path*`
`/en/zh/:path*` → `/en/:path*`

### 4. WordPress Page Renames
- `/project/:slug` → `/projects/:slug`
- `/have-a-project` → `/contact`
- `/features-benefits` → `/benefits`
- `/vancouver-renovation-blog` → `/blog`
- `/renovation_article/:slug` → `/blog/:slug`

### 5. Old Category Paths
- `/vancouver-renovation-projects/kitchen` → `/projects/kitchen`
- `/vancouver-renovation-projects/bathroom` → `/projects/bathroom`
- `/vancouver-renovation-projects/full-house` → `/projects/whole-house`
- `/category/:path*` → `/projects`

### 6. Category Renames
`/projects/full-house` → `/projects/whole-house`

### 7. Old Project Slugs
High-impression WordPress URLs mapped to closest matching new project or category. Examples:
- `/richmond-kitchen-remodel-bathroom-renovation-project` → `/projects/richmond-kitchen-remodel-bath`
- `/home-renovation-in-langley-kitchen-bathroom-basement` → `/projects/stunning-home-renovation-langley`

### 8. Non-localized Fallbacks
Root-level paths without locale redirect to `/en/`:
- `/projects/:path*` → `/en/projects/:path*`
- `/services/:path*` → `/en/services/:path*`
- `/contact` → `/en/contact`

## Trailing Slashes

Enabled via `trailingSlash: true` in `next.config.ts`. All URLs end with `/`.

## Image Optimization

Next.js `<Image>` component configured for two remote patterns:

```typescript
// Production images
{ protocol: 'https', hostname: 'reno-stars.com', pathname: '/wp-content/uploads/**' }
// Local MinIO
{ protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/reno-stars/**' }
```

## Canonical URLs

`NEXT_PUBLIC_BASE_URL` defines the canonical origin. `getBaseUrl()` in `lib/utils.ts` strips any trailing slashes to prevent double-slash URLs (e.g., `reno-stars.com//en/`). Used by:
- `sitemap.ts` for absolute URLs
- `buildAlternates()` for hreflang links
- Metadata generation in page components

## Favicon

Uses Next.js App Router file convention:
- `app/icon.png` — 32×32 favicon (auto-served as `/favicon.ico`)
- `app/apple-icon.png` — 180×180 Apple touch icon

## Security Headers

Added via `proxy.ts` on all responses:
- `Content-Security-Policy` (environment-aware: allows unsafe-eval in dev)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (restricts camera, microphone, geolocation, payment, usb)
- `X-Powered-By` disabled via `next.config.ts` (`poweredByHeader: false`)
