# Architecture

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React | 19.0.0 |
| Language | TypeScript (strict) | 5.7 |
| Styling | Tailwind CSS | 4.0 |
| Database ORM | Drizzle ORM | 0.36 |
| Database | PostgreSQL 16 (Neon prod / pg local) | — |
| i18n | next-intl | 4.8 |
| Testing | Vitest + Playwright | — |
| Deployment | Vercel | — |

## Directory Layout

```
app/                      # Next.js App Router
  [locale]/               # Dynamic locale segment (en | zh)
    layout.tsx            # Locale layout (NextIntlClientProvider, Navbar, Footer)
    not-found.tsx         # Locale-aware 404 (uses translations)
    page.tsx              # Homepage
    projects/             # Portfolio routes
    services/             # Service routes
    areas/                # Service area routes
    blog/                 # Blog routes
    contact/              # Contact form
    benefits/             # Benefits page
    design/               # Design showcase
  admin/                  # Admin dashboard (auth-protected)
    (auth)/               # Login page
    (dashboard)/          # CRUD pages (projects, blog, etc.)
    layout.tsx            # Admin shell with sidebar
  layout.tsx              # Root layout (<html>/<body>, locale detection, fonts, metadata)
  not-found.tsx           # Root 404 (fallback, no <html>/<body>)
  sitemap.ts              # Dynamic async sitemap (DB + static data)
  robots.ts               # robots.txt
  actions/                # Server Actions
    contact.ts            # Contact form submission
    admin/                # Admin CRUD actions (projects, blog, etc.)

components/
  pages/                  # One component per page route
  home/                   # Homepage section components (13 files: Hero, ServiceAreas, Testimonials, GoogleAvatar, Gallery, Services, Stats, About, TrustBadges, FAQ, Blog, Showroom, Contact)
  admin/                  # Admin UI components (DataTable, ProjectForm, HouseStack, Tooltip, DragHandle, etc.)
  structured-data/        # JSON-LD schema components (9 schemas)
  Navbar.tsx              # Global navigation (unified, no variants)
  Footer.tsx              # Global footer (5-column + service areas bar)
  ContactForm.tsx         # Contact form (client component)
  ProjectModal.tsx        # Project detail modal (uses DisplayProject type)
  ProductLink.tsx         # External product link with hover preview
  TetrisGallery.tsx       # Masonry gallery layout

lib/
  db/                     # Database layer
    schema.ts             # Drizzle table definitions
    index.ts              # Lazy-init DB client
    queries.ts            # Cached query functions (company, services, projects, sites, blog, etc.)
    helpers.ts            # Query aggregation helpers (budget, duration, images, products)
    seed.ts               # Seed script
  data/                   # Static assets & localization helpers
    index.ts              # Images, video constants, type re-exports, localization helpers
    projects.ts           # Project localization helpers, category slugs
    services.ts           # Service type mappings and localization helpers
    areas.ts              # Area localization helper (getLocalizedArea)
  admin/                  # Admin utilities
    auth.ts               # Session cookie auth (24h TTL)
    form-utils.ts         # Form validation helpers (getString, isValidUrl, etc.)
    gallery-categories.ts # Shared gallery category constants
    constants.ts          # Shared constants (SERVICE_TYPES, SPACE_TYPES, mappings)
    translations.ts       # Admin translation hooks
  google-reviews.ts       # Google Places API reviews (24h cached, 5-star only)
  storage.ts              # Asset URL rewriting (prod ↔ MinIO)
  types.ts                # Shared TypeScript types (includes DisplayProject for modals)
  theme.ts                # Neumorphic design tokens
  utils.ts                # Utility functions

proxy.ts                  # Request proxy (i18n routing + admin auth + security headers)

i18n/                     # Internationalization
  config.ts               # Locale definitions, routing config
  request.ts              # Server request handler

messages/                 # Translation JSON files
  en.json
  zh.json

scripts/
  seed-storage.ts         # MinIO asset seeder
  seed-projects.ts        # Import static projects into DB
  seed-blog.ts            # WordPress blog crawler (EN via REST API, ZH via HTML crawling)

hooks/
  useDragReorder.ts       # Reusable drag-and-drop reordering with optimistic UI
  useIsMobile.ts          # Mobile breakpoint detection hook

tests/
  unit/                   # Vitest tests
  e2e/                    # Playwright tests
```

## Request Flow

```
Browser → proxy.ts (admin auth check OR next-intl locale routing + security headers)
       → App Router ([locale] segment)
       → Root layout (detects locale via getLocale(), renders <html>/<body>)
       → Locale layout (fetches company, socialLinks, services from DB; renders Navbar/Footer)
       → Server page.tsx (fetches page-specific data from DB or static data)
       → Client page component hydrates (receives data as props)
```

## Data Architecture

The app uses a **hybrid static/database** model:

- **Database-driven** (`lib/db/queries.ts`): Company info, services, social links, about sections, projects, service areas, blog posts, gallery items, trust badges, and showroom info are all fetched from PostgreSQL at runtime via cached async query functions. These use React `cache()` for per-request deduplication.
- **Google Reviews** (`lib/google-reviews.ts`): Testimonials are fetched from the Google Places API (New, v1) with 24h server-side caching, replacing the former database-managed testimonials. Two parallel requests (MOST_RELEVANT + NEWEST sort) are deduplicated and filtered to 5-star reviews.
- **Static data** (`lib/data/`): Only `video` and `images` constants (hardcoded asset URLs) and localization helpers (`getLocalizedBlogPost`, `getLocalizedArea`) remain as static TypeScript. `lib/data/projects.ts` retains localization helpers and category slug constants.
- **Asset URLs**: Wrapped with `getAssetUrl()` which rewrites production URLs to local MinIO when `NEXT_PUBLIC_STORAGE_PROVIDER=minio`.

### Query Layer (`lib/db/queries.ts`)

Cached async functions fetch data from the database and return the same TypeScript types as the former static exports:

| Function | Returns | Notes |
|----------|---------|-------|
| `getCompanyFromDb()` | `Company` | Computes `yearsExperience` from `foundingYear` |
| `getSocialLinksFromDb()` | `SocialLink[]` | Filters `isActive`, orders by `displayOrder` |
| `getServicesFromDb()` | `Service[]` | Orders by `displayOrder`, applies `getAssetUrl()` |
| `getAboutSectionsFromDb()` | `AboutSections` | Replaces `{yearsExperience}` placeholder |
| `getProjectsFromDb()` | `Project[]` | Published projects with images and scopes |
| `getProjectBySlugFromDb(slug)` | `Project \| null` | Single project lookup by slug |
| `getProjectSlugsFromDb()` | `string[]` | Published slugs for sitemap |
| `getServiceAreasFromDb()` | `ServiceArea[]` | Active areas, ordered by `displayOrder` |
| `getBlogPostsFromDb()` | `BlogPost[]` | Published posts, ordered by `publishedAt desc` |
| `getBlogPostBySlugFromDb(slug)` | `BlogPost \| null` | Single post lookup, includes related project if linked |
| `getBlogPostSlugsFromDb()` | `string[]` | Published slugs for sitemap (uncached) |
| `getGalleryItemsFromDb()` | `GalleryItem[]` | Published items, `getAssetUrl()` applied to images |
| `getTrustBadgesFromDb()` | `{ en: string; zh: string }[]` | Active badges, ordered by `displayOrder` |
| `getShowroomFromDb()` | `Showroom` | Singleton row |
| `getFaqsFromDb()` | `Faq[]` | Active FAQs, replaces `{yearsExperience}` placeholder |
| `getSitesAsProjectsFromDb()` | `SiteWithProjects[]` | Sites with aggregated data for "Whole House" display |

Admin-only (uncached) query functions: `getAllProjectsAdmin()`, `getAllServicesAdmin()`, `getAllBlogPostsAdmin()`, `getAllContactsAdmin()`, `getAllSocialLinksAdmin()`, `getAllServiceAreasAdmin()`, `getAllGalleryItemsAdmin()`, `getAllTrustBadgesAdmin()`, `getAllFaqsAdmin()`, `getAllSitesAdmin()`.

#### Query Helpers (`lib/db/helpers.ts`)

Aggregation utilities used when building `SiteWithProjects` data:

| Function | Purpose |
|----------|---------|
| `calculateCombinedBudget(projects)` | Sum budget ranges from child projects |
| `aggregateDurations(projects)` | Sum week-based durations or concatenate mixed formats |
| `mergeServiceScopes(projects)` | Deduplicate scopes across projects |
| `collectAllImages(projects, site?)` | Combine project + site images; site images prepended with `SITE_IMAGE_SLUG` |
| `collectAllExternalProducts(projects)` | Deduplicate external product links by URL |

`SITE_IMAGE_SLUG = '__site__'` is a sentinel value used to distinguish site-level images from project images in aggregated image lists.

**Google Reviews** (not in `queries.ts`): Homepage testimonials are fetched via `getGoogleReviews()` from `lib/google-reviews.ts` using the Google Places API with `next: { revalidate: 86400 }` for 24h caching. Returns `GooglePlaceRating` type with rating, userRatingCount, and reviews array.

### Slug Utilities (`lib/utils.ts`)

Project slugs are auto-deduplicated to prevent URL collisions:

```typescript
ensureUniqueSlug(slug, existingSlugs, excludeSlug?) → string
```

- If slug doesn't collide, returns it unchanged (clean URL)
- On collision, appends `-2`, `-3`, etc. until unique
- Used by `createProject()`, `updateProject()`, and `createServiceArea()` admin actions
- `excludeSlug` param allows updates to keep their own slug without collision

### Layout Data Flow

**Root layout** (`app/layout.tsx`):
- Detects locale via `getLocale()` from next-intl/server
- Renders the single `<html lang={locale}>` and `<body>` wrapper for the entire app
- Prevents hydration mismatches by ensuring only one `<html>` element exists

**Locale layout** (`app/[locale]/layout.tsx`) is a Server Component that:
1. Fetches `company`, `socialLinks`, `services`, `areas`, `googleReviews` from DB / Google API (via `Promise.all`)
2. Renders `<Navbar>` and `<Footer>` with this data as props
3. Renders `<LocalBusinessSchema>` for JSON-LD structured data (receives `areas`, `googleRating`, `googleReviewCount` props)
4. Does **not** render `<html>/<body>` (root layout handles that)

Page components (`components/pages/`) do **not** render Navbar or Footer — they only render page content and receive data as props from their server page files.

### Proxy (`proxy.ts`)

Replaces the deprecated `middleware.ts` (Next.js 16). Handles:
1. **Admin auth** — Session cookie check for `/admin/*` routes, redirects to `/admin/login` if invalid
2. **i18n routing** — Delegates to `next-intl/middleware` for locale detection and prefix enforcement
3. **Security headers** — Adds CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc. to all responses

### Type System

```typescript
type Locale = 'en' | 'zh';
type Localized<T> = Record<Locale, T>;  // { en: T, zh: T }

// Bilingual content uses Localized<string>:
interface Project {
  slug: string;
  title: Localized<string>;
  description: Localized<string>;
  external_products?: { url: string; image_url?: string; label: Localized<string> }[];
  // ...
}

// Display-ready project (for modals, cards) with optional site aggregation:
interface DisplayProject extends LocalizedProject {
  isSiteProject?: boolean;
  projectCount?: number;
  childAreas?: string[];
  totalBudget?: string;
  totalDuration?: string;
  allServiceScopes?: string[];
  allExternalProducts?: { url: string; image_url?: string; label: string }[];
}
```

## Design System

Neumorphic design with warm tones defined in `lib/theme.ts`:

| Token | Value | Usage |
|-------|-------|-------|
| Navy | `#1B365D` | Primary text, buttons |
| Gold | `#C8922A` | Accents, CTAs |
| Surface | `#E8E2DA` | Main background |
| Card | `#EDE8E1` | Card backgrounds |

Shadow utilities: `neu(size)` for raised elements, `neuIn(size)` for pressed/inset states.

## Component Patterns

- **Page components** (`components/pages/`): One per route. All are `'use client'` components. Receive `locale`, `company`, and page-specific data as props. Do **not** render Navbar or Footer.
- **Homepage sections** (`components/home/`): 13 section components extracted from HomePage for code-splitting. 9 are Server Components (HeroSection, ServiceAreasBar, TestimonialsSection, ServicesSection, StatsSection, AboutSection, TrustBadgesSection, BlogSection, ShowroomSection), 3 are Client Components (GallerySection, FaqSection, ContactSection), 1 is a Client utility (GoogleAvatar). TestimonialsSection uses CSS `@keyframes` marquee for infinite horizontal scroll with pause-on-hover. FaqSection uses CSS Grid accordion animation (`grid-template-rows: 0fr` → `1fr`). Below-fold sections are loaded via `next/dynamic` with skeleton fallbacks.
- **Structured data** (`components/structured-data/`): JSON-LD schema injected via `<script type="application/ld+json">`. Used in server page route files. Schema components accept `company` as a prop. Includes 9 schemas: LocalBusinessSchema, LocalBusinessAreaSchema, ServiceSchema, ProjectSchema, ArticleSchema, BreadcrumbSchema, FAQSchema, ReviewSchema. Rating data comes from Google Reviews API (`googleRating`/`googleReviewCount` props) — no longer stored in the Company model. `aggregateRating` is conditionally rendered only when Google data is available. ReviewSchema emits individual reviews only (aggregate rating handled globally by LocalBusinessSchema in the layout).
- **Navbar**: Unified navigation with 7 links (Home, Services, Projects, Design, Benefits, Contact, Blog & News) + Areas dropdown (14 cities). Receives `company` and `areas` as props from layout. Uses `useMemo` for link arrays, `useCallback` for locale switching, focus trap for mobile menu. Logo uses `priority` for faster LCP. Toggle state setters use functional updater form.
- **Footer**: 5-column grid (Brand & Social, Quick Links, Services, Contact, Why Us) + full-width Service Areas bar with 14 city links. Receives `company`, `socialLinks`, `services`, `areas` as props from layout. Custom SVG icons for Xiaohongshu, WeChat, WhatsApp.
- **ContactForm**: Reusable form component with `large` prop for accessibility (larger text/inputs for elderly users). Tracks success timeout via `useRef` with cleanup on unmount. Surfaces server error messages.
- **Server vs Client**: Page route files (`app/[locale]/**/page.tsx`) are server components that fetch data from DB, handle metadata, and render structured data. Page content components (`components/pages/`) are client components that receive all data as props. Navbar and Footer are client components rendered by the layout. Server routes should use `Promise.all` to parallelize independent async calls.
- **ProductLink** (`components/ProductLink.tsx`): Reusable external product link with hover image preview. Supports `size` prop (`'sm'` for modal, `'md'` for detail page). Used by `ProjectModal` and `SiteDetailPage`.
- **Admin components** (`components/admin/`): DataTable (supports `headerAction` prop for toolbar controls), ProjectForm, SiteForm (with site images gallery section), HouseStack (unified site/project management), BilingualInput, BilingualTextarea, ImageUrlInput, ConfirmDialog (modal with fixed centering and keyboard focus styles for a11y), Sidebar (accepts `onNavigate` callback for mobile close), TopBar (hamburger menu for mobile, hidden on desktop via CSS), DashboardShell (client wrapper for sidebar drawer with overlay, Escape key close, auto-close on desktop resize), StatusBadge, ToastProvider, SubmitButton, EditModeToggle, FormField, FormAlerts, AdminLocaleProvider (provides locale + sidebar open/close state, memoized context value), AdminPageHeader (responsive flex→column on mobile), ToggleButton, Tooltip (reusable help icons), DragHandleIcon (6-dot drag indicator SVG).
- **Admin mobile responsive** (`app/admin/admin-responsive.css`): CSS-only mobile overrides at `@media (max-width: 768px)`. Uses `className` attributes alongside inline styles — `!important` overrides inline values on mobile. Classes: `admin-sidebar` (fixed drawer), `admin-sidebar--open` (slide in), `admin-sidebar-overlay` (backdrop), `admin-hamburger` (shown on mobile), `admin-topbar`/`admin-main-content` (reduced padding), `admin-form-grid` (single column), `admin-form-card` (full width), `admin-page-header` (vertical stack), `admin-site-detail-grid` (single column). Desktop: overlay and hamburger hidden via `display: none`. Body scroll lock via `body:has(.admin-sidebar--open)`.
- **Reusable hooks** (`hooks/`): `useDragReorder<T>` — generic drag-and-drop reordering with optimistic UI, server sync, and proper cleanup (mountedRef pattern to prevent state updates after unmount). `useIsMobile(breakpoint?)` — `matchMedia` hook returning boolean, defaults to 768px.
- **House Stack UI**: Visual metaphor for site/project management. Roof = site, floors = project layers. Supports drag-and-drop reordering, keyboard navigation (Alt+Up/Down), and inline delete confirmation. Renders on `/admin/sites/[id]` page with detail panel for editing selected item. Supports `?project=<id>` URL param for deep-linking directly to a specific project's edit form.
- **Admin locale switching**: `AdminLocaleProvider` provides client-side locale + sidebar state context for admin panel. TopBar displays EN/ZH switcher buttons (gold highlight for active) and a hamburger menu (mobile only). Preference persists in localStorage (`admin_locale` key). All list clients show bilingual content (titleEn/titleZh, questionEn/questionZh, etc.) based on selected locale. Uses `useAdminLocale()` hook which returns `{ locale, setLocale, sidebarOpen, setSidebarOpen }`. Does not affect SEO (admin is auth-protected).

## Accessibility

- **Elderly-friendly text**: The `ContactForm` component supports a `large` prop that increases input text to `text-lg` with larger padding (`py-3.5` / `py-4`) for better readability. Used on the homepage contact section.
- **Hero text scaling**: Hero titles use responsive scaling up to `lg:text-6xl` for desktop readability.
- **Heading hierarchy**: All pages maintain valid H1 → H2 → H3 structure. Use `sr-only` for structurally required but visually redundant headings.
- **Lightbox accessibility**: Image lightbox includes `aria-live="polite"` counter, keyboard-accessible open/close handlers via `useCallback`.
- **Navbar focus trap**: Mobile menu implements focus trap with Escape key close and Tab cycling.
- **Functional updater pattern**: Toggle state setters use `setX((prev) => !prev)` to prevent stale closures in event handlers.

## Database Connection

The `db` export in `lib/db/index.ts` uses a **Proxy** for lazy initialization:

1. Module import does **not** connect to the database
2. First property access (e.g., `db.select()`) triggers connection
3. Driver is selected based on `DATABASE_URL`:
   - Contains `neon.tech` → `@neondatabase/serverless` + `drizzle-orm/neon-http`
   - Otherwise → `pg` Pool + `drizzle-orm/node-postgres`

This pattern prevents build-time crashes at import time. Note that `DATABASE_URL` is still required at build time because `layout.tsx` and page components make DB queries during pre-rendering.
