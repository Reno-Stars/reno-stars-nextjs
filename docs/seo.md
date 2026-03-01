# SEO & Redirects

## Sitemap

Generated in `app/sitemap.ts` as an async function. Service slugs use static `serviceTypeToCategory` mapping. Project slugs, site slugs, blog post slugs, and service areas are all fetched from the database via `getProjectSlugsFromDb()`, `getSiteSlugsFromDb()`, `getBlogPostSlugsFromDb()`, and `getServiceAreasFromDb()`. Individual project, site, and blog post entries use actual `updated_at` timestamps from the database for `lastModified` (via date maps), while static pages use the current date. Includes:

- Static pages (home, services, projects, blog, contact, benefits, design, process, areas)
- All service detail pages
- Service × location combination pages (e.g., `/en/services/kitchen/vancouver/`)
- Project category pages
- Individual project pages
- Site pages (whole-house projects displayed as `/projects/{site-slug}/`, deduplicated against project slugs)
- Blog post pages
- Service area pages

Each entry includes hreflang alternates for `en`, `zh`, and `x-default`.

## Structured Data (JSON-LD)

Components in `components/structured-data/`:

| Component | Schema Type | Used On |
|-----------|-------------|---------|
| `LocalBusinessSchema` | LocalBusiness | Layout (global, `aggregateRating` from Google Reviews API) |
| `LocalBusinessAreaSchema` | HomeAndConstructionBusiness | Area pages (location-specific, `aggregateRating` from Google Reviews) |
| `WebSiteSchema` | WebSite | Layout (global, includes `SearchAction` for sitelinks search) |
| `ServiceSchema` | Service | Service detail pages |
| `ProjectSchema` | WebPage + Service (mainEntity) | Project detail pages (nested `HomeAndConstructionBusiness` provider with `aggregateRating` from Google Reviews) |
| `ArticleSchema` | Article | Blog post pages (includes `image` as `ImageObject` with width/height) |
| `BreadcrumbSchema` | BreadcrumbList | All pages with breadcrumbs |
| `FAQSchema` | FAQPage | Benefits page, Service detail pages (3 Q&A per service) |
| `ReviewSchema` | HomeAndConstructionBusiness + Review | Homepage (individual Google Reviews only, no aggregate — handled by layout) |
| `HowToSchema` | HowTo | Process page (5-step renovation workflow with tools and total time) |
| `ContactPageSchema` | ContactPage + ContactPoint | Contact page (HomeAndConstructionBusiness with phone, email, languages, areas served) |

## OpenGraph Locale Alternates

All pages include `alternateLocale` in their OpenGraph metadata to signal the availability of alternate-language versions:

```typescript
openGraph: {
  locale: ogLocaleMap[locale as Locale],  // 'en_US' or 'zh_CN'
  alternateLocale: locale === 'en' ? ['zh_CN'] : ['en_US'],
}
```

This is set in all 16 `generateMetadata()` functions across all page routes.

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

Where an `<h2>` is structurally required for valid heading hierarchy (H1 → H2 → H3) but visually redundant (e.g., benefits grid), use `<h2 className="sr-only">` to keep it accessible without displaying duplicate text.

## Semantic HTML

- Blog post cards wrapped in `<article>` elements
- Navbar dropdown uses `role="menu"` / `role="menuitem"`
- Decorative elements (video, star icons) have `aria-hidden="true"`
- CTA links use descriptive text (e.g., "Explore Kitchen Renovation" instead of generic "Learn More")
- Hero background image has descriptive alt text for SEO despite being decorative (crawlers index alt text)

## Image Alt Text

Before/after image pairs use a bilingual fallback pattern when alt text is not set in the database:

```tsx
alt={pair.beforeImage.alt || `${title} - ${t('projects.beforeLabel')}`}
```

- EN: `"Kitchen Remodel - Before"` / `"Kitchen Remodel - After"`
- ZH: `"厨房改造 - 施工前"` / `"厨房改造 - 施工后"`

Translation keys `projects.beforeLabel` and `projects.afterLabel` are used for i18n support. Title is always the localized project or site title, providing descriptive context for screen readers and search engines.

Components using this pattern: `ProjectModal`, `ProjectDetailPage`, `SiteDetailPage`.

## Meta Description Lengths

Static meta descriptions in `messages/en.json` and `messages/zh.json` target 120-160 characters (optimal for SERP display). All descriptions are bilingual.

Dynamic descriptions (blog posts, project pages) are truncated via `truncateMetaDescription()` in `lib/utils.ts` (max 155 chars, word-boundary truncation with ellipsis).

## Project URL Structure

Project URLs follow the pattern `/[locale]/projects/[slug]/` where slugs are human-readable, SEO-friendly strings derived from project titles.

- **First project:** `/projects/stunning-home-renovation-langley/`
- **Duplicate title:** `/projects/stunning-home-renovation-langley-2/`
- **Third duplicate:** `/projects/stunning-home-renovation-langley-3/`

Keywords appear first in the URL; numeric suffix only appended when necessary to prevent collisions. This is handled automatically by `ensureUniqueSlug()` during project creation/update.

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

## OpenGraph Images

All pages include `width: 1200`, `height: 630`, and `alt` text on their OpenGraph images. Twitter card images also include `alt` text. Pages use page-specific images where available:

| Page Type | OG Image Source | Alt Text Source |
|-----------|-----------------|-----------------|
| Homepage | Hero image | Page title (`metadata.home.title`) |
| Blog posts | `post.featured_image` (fallback: hero) | Localized post title |
| Projects | `project.hero_image` | Localized project title |
| Sites (whole house) | `site.hero_image` (fallback: hero) | Localized site title |
| Service detail | `service.image` (fallback: hero) | Localized service title |
| Service + location | `service.image` (fallback: hero) | Combined service+area title |
| Project category | Hero image | Localized category name |
| Area detail | Hero image | Localized area name |
| Hub pages | Hero image | Page title from translations |

## SEO Metadata from Database

Project and blog post pages use dedicated SEO fields from the database when available, with automatic fallbacks:

| Field | Source | Fallback |
|-------|--------|----------|
| `title` | `meta_title[locale]` | `${localizedTitle} \| ${SITE_NAME}` |
| `description` | `meta_description[locale]` | `truncateMetaDescription(excerpt \|\| description)` |
| `keywords` | `seo_keywords[locale]` (comma-split) | *(none)* |

Project meta descriptions use a three-tier fallback: dedicated SEO field → excerpt → full description. Excerpts are typically more concise and SERP-optimized than full descriptions.

Blog posts additionally include `og:article:published_time` and `og:article:modified_time` from `published_at` and `updated_at` timestamps.

## Twitter Cards

All pages include Twitter Card meta tags for optimized social sharing:

**Root layout** (`app/layout.tsx`) sets default Twitter card configuration:
```tsx
twitter: {
  card: 'summary_large_image',
  site: '@renostars',
  creator: '@renostars',
}
```

Individual pages override with page-specific titles, descriptions, and images.

## Canonical URLs

`NEXT_PUBLIC_BASE_URL` defines the canonical origin. `getBaseUrl()` in `lib/utils.ts` strips any trailing slashes to prevent double-slash URLs (e.g., `reno-stars.com//en/`). Used by:
- `sitemap.ts` for absolute URLs
- `buildAlternates()` for hreflang links
- Metadata generation in page components

## Favicon

Uses Next.js App Router file convention with the real Reno Stars logo (R+house icon mark sourced from the production WordPress site):

| File | Size | Purpose |
|------|------|---------|
| `app/icon.png` | 512×512 | Primary favicon (Next.js auto-generates optimized sizes) |
| `app/apple-icon.png` | 180×180 | Apple touch icon |
| `public/favicon.ico` | 32×32 | Legacy `.ico` fallback |
| `public/favicon.png` | 256×256 | High-res PNG fallback |
| `public/apple-icon.png` | 180×180 | Public fallback |

`app/layout.tsx` relies on file convention (no manual `icons` metadata config needed).

## Security Headers

Added via `proxy.ts` on all responses:
- `Content-Security-Policy` (environment-aware: allows unsafe-eval in dev; whitelists Google Analytics and Tag Manager in `script-src` and `connect-src`)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (restricts camera, microphone, geolocation, payment, usb)
- `X-Powered-By` disabled via `next.config.ts` (`poweredByHeader: false`)

## Meta Description Optimization

Meta descriptions are automatically truncated to 155 characters (optimal for SERP display) using `truncateMetaDescription()` in `lib/utils.ts`. This function:
- Truncates at word boundaries (doesn't cut mid-word)
- Appends ellipsis (`...`) when truncated
- Applied to blog posts, project pages, and service pages

## Blog Featured Image

Blog post pages render the featured image (`post.featured_image`) above the H1 title with `priority` for LCP optimization and a 2:1 aspect ratio. The image is not locale-specific.

## Service Area Internal Links

Service detail pages include an "Areas We Serve" section with a responsive grid of links to service+location pages (e.g., `/services/kitchen/vancouver/`). This creates internal links that improve crawlability and keyword targeting for location-based searches. Areas are fetched from the database and passed as an optional prop to `ServiceDetailPage`.

## Performance & SEO Balance

The homepage avoids Suspense streaming to ensure search engines receive fully-rendered content:
- Data fetching uses `Promise.all` for parallel queries
- Server fully renders all content before sending HTML
- Below-fold sections use `next/dynamic` for code-splitting (client-side, after initial HTML)
- Above-fold content (Hero, Service Areas) is directly imported for instant render

This approach ensures:
- Crawlers see complete content, links, and structured data
- Users get fast initial paint with progressive enhancement
- Code-splitting reduces JS bundle for below-fold sections
