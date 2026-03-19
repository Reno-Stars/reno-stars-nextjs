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
    error.tsx             # Public error boundary (neumorphic, bilingual)
    page.tsx              # Homepage
    projects/             # Portfolio routes
    services/             # Service routes
    areas/                # Service areas hub + [slug] pages
    blog/                 # Blog routes
    contact/              # Contact form
    benefits/             # Benefits page
    design/               # Design showcase
    process/              # 5-step renovation workflow page
  admin/                  # Admin dashboard (auth-protected)
    (auth)/               # Login page
    (dashboard)/          # CRUD pages (projects, blog, etc.)
    layout.tsx            # Admin shell with sidebar
  layout.tsx              # Root layout (metadata, viewport, pass-through to locale layout)
  not-found.tsx           # Root 404 (fallback, no <html>/<body>)
  sitemap.ts              # Dynamic async sitemap (DB + static data)
  robots.ts               # robots.txt
  actions/                # Server Actions
    contact.ts            # Contact form submission
    admin/                # Admin CRUD actions (projects, blog, etc.)

components/
  pages/                  # One component per page route
  home/                   # Homepage section components (15 files: Hero, Testimonials, GoogleAvatar, Gallery, Services, Stats, About, TrustBadges, Partners, FAQ, Blog, Showroom, Contact, Marquee, marquee-utils)
  admin/                  # Admin UI components (DataTable, ProjectForm, HouseStack, Tooltip, DragHandle, etc.)
  structured-data/        # JSON-LD schema components (12 schemas)
  Navbar.tsx              # Global navigation (unified, no variants)
  Footer.tsx              # Global footer (5-column + service areas bar)
  ContactForm.tsx         # Contact form (client component)
  ProjectModal.tsx        # Project detail modal with image-pairs UX, click-to-toggle before/after
  ProductLink.tsx         # External product link with hover preview
  TetrisGallery.tsx       # Masonry gallery layout

lib/
  db/                     # Database layer
    schema.ts             # Drizzle table definitions (includes image pair tables)
    index.ts              # Lazy-init DB client
    queries.ts            # Cached query functions (company, services, projects, sites, blog, etc.)
    helpers.ts            # Query aggregation helpers (budget, duration, images, products)
    seed.ts               # Seed script
  data/                   # Static assets & localization helpers
    index.ts              # Images, video constants, type re-exports, localization helpers
    projects.ts           # Project localization helpers, category slugs
    services.ts           # Service type mappings and localization helpers
    areas.ts              # Area localization helper (getLocalizedArea — includes content, highlights, meta fields)
  admin/                  # Admin utilities
    auth.ts               # Session cookie auth (24h TTL)
    form-utils.ts         # Form validation + image pair parsing (getString, isValidUrl, parseImagePairs, etc.)
    gallery-categories.ts # Async gallery category options fetched from services DB
    constants.ts          # Shared constants (SERVICE_TYPES, SPACE_TYPES, SPACE_TYPE_TO_ZH, STANDALONE_SITE_SLUG, AreaOption, mappings)
    translations.ts       # Admin translation hooks
    s3.ts                 # Shared S3 client singleton + S3_BUCKET constant + MIME_TO_EXT map
    upload-constants.ts   # Shared upload limits (image: 50 MB, video: 1 GB) and allowed MIME types
    upload-client.ts      # Client-side presigned S3 URL upload helpers (image + video)
  ai/                     # AI content optimization
    openai.ts             # OpenAI client initialization (lazy loading)
    glossary.ts           # EN→ZH translation glossary injected into all AI prompts
    content-optimizer.ts  # AI functions for blog, project, alt text generation
    blog-generator.ts     # AI blog generation from project/site data (GPT-4o)
    social-post-generator.ts # AI social post generation for 3 platforms (GPT-4o)
  batch/                  # Batch upload processing
    types.ts              # ZIP parsing types (ParsedSite, ParsedProject, etc.)
    zip-parser.ts         # Async ZIP extraction + folder structure parsing
    batch-processor.ts    # Main pipeline: extract → upload → AI metadata → save → blog
  google-reviews.ts       # Google Places API reviews (24h cached, 5-star only)
  analytics.ts            # GA4 event tracking (disabled in development)
  email.ts                # Resend email notifications for contact form
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
  seed-area-content.ts    # Seed area rich content, highlights, meta, and area-specific FAQs
  fix-area-seo.ts         # Fix area SEO: meta lengths, brand name, AI writing tells

hooks/
  useDragReorder.ts       # Reusable drag-and-drop reordering with optimistic UI
  useIsMobile.ts          # Mobile breakpoint detection hook
  useSaveWarning.ts       # Pre-save warning dialog state for admin forms
  useBeforeUnload.ts      # Dirty-form navigation warning (beforeunload event)
  useFullscreenModal.ts   # Fullscreen modal a11y (scroll lock, focus trap, keyboard nav, return focus)

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

- **Database-driven** (`lib/db/queries.ts`): Company info, services, social links, about sections, projects, service areas, blog posts, gallery items, trust badges, partners, and showroom info are all fetched from PostgreSQL at runtime via cached async query functions. These use React `cache()` for per-request deduplication.
- **Google Reviews** (`lib/google-reviews.ts`): Testimonials are fetched from the Google Places API (New, v1) with 24h server-side caching, replacing the former database-managed testimonials. Two parallel requests (MOST_RELEVANT + NEWEST sort) are deduplicated and filtered to 5-star reviews.
- **Static data** (`lib/data/`): `video`, `images`, `WORKSAFE_BC_LOGO`, and `MAP_EMBED_URL` constants (hardcoded asset URLs) and localization helpers (`getLocalizedBlogPost`, `getLocalizedArea`) remain as static TypeScript. `lib/data/projects.ts` retains localization helpers, category slug constants, and the `imagesToPairs()` utility for converting legacy flat image arrays to `LocalizedImagePair[]`.
- **Asset URLs**: Wrapped with `getAssetUrl()` which rewrites production URLs to local MinIO when `NEXT_PUBLIC_STORAGE_PROVIDER=minio`.

### Query Layer (`lib/db/queries.ts`)

Cached async functions fetch data from the database and return the same TypeScript types as the former static exports:

| Function | Returns | Notes |
|----------|---------|-------|
| `getCompanyFromDb()` | `Company` | Computes `yearsExperience` from `foundingYear` (rounds up to nearest 5 via `Math.ceil`) |
| `getSocialLinksFromDb()` | `SocialLink[]` | Filters `isActive`, orders by `displayOrder` |
| `getServicesFromDb()` | `Service[]` | Orders by `displayOrder`, applies `getAssetUrl()`, batch-fetches tags via `groupBy()` |
| `getAboutSectionsFromDb()` | `AboutSections` | Replaces `{yearsExperience}` placeholder |
| `getProjectsFromDb()` | `Project[]` | Published projects with images and scopes |
| `getProjectBySlugFromDb(slug)` | `Project \| null` | Single project lookup by slug |
| `getProjectSlugsFromDb()` | `{ slug, updatedAt }[]` | Published project slugs + dates for sitemap |
| `getSiteSlugsFromDb()` | `{ slug, updatedAt }[]` | Published site slugs (showAsProject=true) + dates for sitemap |
| `getServiceAreasFromDb()` | `ServiceArea[]` | Active areas with content, highlights, meta fields; ordered by `displayOrder` |
| `getBlogPostsFromDb()` | `BlogPost[]` | Published posts, ordered by `publishedAt desc` |
| `getBlogPostBySlugFromDb(slug)` | `BlogPost \| null` | Single post lookup, includes related project if linked |
| `getBlogPostSlugsFromDb()` | `{ slug, updatedAt }[]` | Published slugs + dates for sitemap (uncached) |
| `getGalleryItemsFromDb()` | `GalleryItem[]` | Published items, `getAssetUrl()` applied to images |
| `getTrustBadgesFromDb()` | `{ en: string; zh: string }[]` | Active badges, ordered by `displayOrder` |
| `getShowroomFromDb()` | `Showroom` | Singleton row |
| `getFaqsFromDb()` | `Faq[]` | Active global FAQs (no area scope), replaces `{yearsExperience}` placeholder |
| `getFaqsByAreaFromDb(areaId)` | `Faq[]` | Active FAQs for a specific service area |
| `getProjectsByAreaFromDb(cityName)` | `Project[]` | Up to 6 published projects matching city (case-insensitive) |
| `getPartnersFromDb()` | `Partner[]` | Active partners, ordered by `displayOrder` |
| `getSitesAsProjectsFromDb()` | `SiteWithProjects[]` | Sites with aggregated data for "Whole House" display |

Admin-only (uncached) query functions: `getAllProjectsAdmin()`, `getAllServicesAdmin()`, `getAllBlogPostsAdmin()`, `getAllContactsAdmin()`, `getAllSocialLinksAdmin()`, `getAllServiceAreasAdmin()`, `getAllGalleryItemsAdmin()`, `getAllTrustBadgesAdmin()`, `getAllFaqsAdmin()`, `getAllPartnersAdmin()`, `getAllSitesAdmin()`, `getAllSocialMediaPostsAdmin()`, `getSocialMediaPostByIdAdmin()`.

`ensureStandaloneSite()` — Shared find-or-create function for the standalone projects container site (`STANDALONE_SITE_SLUG`). Returns the site ID, auto-creating the container if it doesn't exist (unpublished, `showAsProject: false`). Used by the admin sites page (guarantees "New Standalone Project" button works on fresh databases) and the batch processor's standalone mode.

#### Shared Helpers

`groupBy<T, K>(arr, keyFn)` — Groups array items by a key field into a `Map<K, T[]>`. Exported for reuse by server actions (e.g., grouping project relations by `projectId` in social post generation).

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
- Used by `createProject()`, `updateProject()`, `createSite()`, `updateSite()`, `createServiceArea()`, and blog generation actions
- `excludeSlug` param allows updates to keep their own slug without collision
- `updateProject()` and `updateSite()` detect slug renames by comparing the submitted slug with the post-dedup result, returning `renamedSlug` in the action response. `useFormToast` displays a bilingual warning toast via the `'warning'` toast type

### Layout Data Flow

**Root layout** (`app/layout.tsx`):
- Pass-through layout that delegates rendering to the locale layout
- Exports `metadata` (title, description, twitter cards) and `viewport` (device-width, initial-scale)
- Favicon auto-detected from `app/icon.png` and `app/apple-icon.png` (file convention)
- Does **not** render `<html>/<body>` — that is handled by the locale layout

**Locale layout** (`app/[locale]/layout.tsx`) is a Server Component that:
1. Renders `<html lang={locale}>` and `<body>` (the single HTML/body wrapper for the app)
2. Fetches `company`, `socialLinks`, `services`, `areas`, `googleReviews` from DB / Google API (via `Promise.all`)
3. Renders `<Navbar>` (receives `company`) and `<Footer>` (receives `company`, `socialLinks`, `services`, `areas`, `googleRating`) with this data as props
4. Renders `<WebSiteSchema>` and `<LocalBusinessSchema>` for JSON-LD structured data (LocalBusinessSchema receives `areas`, `googleRating`, `googleReviewCount` props)

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
| Gold Pale | `rgba(200,146,42,0.12)` | Icon backgrounds |
| Surface | `#E8E2DA` | Main background |
| Card | `#EDE8E1` | Card backgrounds |
| `GOLD_ICON_FILTER` | CSS filter string | Tints black SVG icons to Gold (#C8922A) |

Shadow utilities: `neu(size)` for raised elements, `neuIn(size)` for pressed/inset states.

## Component Patterns

- **Page components** (`components/pages/`): One per route. All are `'use client'` components. Receive `locale`, `company`, and page-specific data as props. Do **not** render Navbar or Footer. `AreaPage` receives area-specific FAQs, DB-sourced projects, and renders unique content/highlights when available from the database. `ServicesPage` receives `areas` and renders area city cards below the services grid.
- **Homepage sections** (`components/home/`): 14 section components extracted from HomePage for code-splitting. 9 are Server Components (HeroSection, TestimonialsSection, ServicesSection, StatsSection, AboutSection, TrustBadgesSection, PartnersSection, BlogSection, ShowroomSection), 3 are Client Components (GallerySection, FaqSection, ContactSection), 1 is a Client utility (GoogleAvatar), 1 is a shared Client component (Marquee), 1 is a shared utility module (marquee-utils). TestimonialsSection and PartnersSection use the `<Marquee>` client component for infinite horizontal scroll. ContactSection includes a Google Maps embed (using shared `MAP_EMBED_URL` from `lib/data`). FaqSection uses CSS Grid accordion animation (`grid-template-rows: 0fr` → `1fr`); `subtitle` prop is optional (omitted on area pages). Below-fold sections are loaded via `next/dynamic` with skeleton fallbacks.
- **Marquee** (`components/home/Marquee.tsx`): Renderless client component for infinite-scroll carousels used by TestimonialsSection and PartnersSection. Accepts `trackId` (string), `repeatCount` (number), and `duration` (number) as props — only primitives cross the client boundary, so the RSC payload contains no React elements. The parent server component renders semantic items into a track element with `id={trackId}`, then `<Marquee>` activates the animation client-side. Clones are created via DOM `cloneNode(true)` in a `useEffect` — appends `repeatCount * 2 - 1` clone sets into an `aria-hidden` + `inert` wrapper (the track scrolls from 0 to -50%, so it needs a second identical half). Animation uses `marquee-scroll` keyframes from `globals.css`. Respects `prefers-reduced-motion` with a live `matchMedia` listener — clones and animation are removed if the user toggles the setting. Hover and focus pause via container event listeners. Full cleanup on unmount (animation, clones, listeners). Shared `computeMarqueeParams()` in `marquee-utils.ts` (plain module, no `'use client'`) calculates `repeatCount` and `duration` from item count, item width, and seconds-per-item to ensure one set fills ≥2000px.
- **Structured data** (`components/structured-data/`): JSON-LD schema injected via `<script type="application/ld+json">`. Used in server page route files. Schema components accept `company` as a prop. Includes 13 schemas: LocalBusinessSchema, LocalBusinessAreaSchema, WebSiteSchema (with `SearchAction` for sitelinks search), ServiceSchema, ProjectSchema (`WebPage` with `mainEntity: Service`), ProjectCategorySchema (`ItemList` with positioned project links), ArticleSchema (with `ImageObject` including width/height), BreadcrumbSchema, FAQSchema, ReviewSchema, HowToSchema (process page, 5-step renovation workflow with tools and total time), ContactPageSchema (`ContactPage` with `HomeAndConstructionBusiness` + `ContactPoint`). Shared `parseAddress()` utility in `parse-address.ts` used by both `LocalBusinessSchema` and `ContactPageSchema`. Rating data comes from Google Reviews API (`googleRating`/`googleReviewCount` props) — no longer stored in the Company model. `aggregateRating` is conditionally rendered only when Google data is available. ReviewSchema emits individual reviews only (aggregate rating handled globally by LocalBusinessSchema in the layout).
- **Navbar**: Unified navigation with 8 links (Home, Services, Projects, Design, Benefits, Process, Contact, Blog & News). Receives `company` as a prop from layout. Uses `useMemo` for link arrays, focus trap for mobile menu. Logo uses `priority` for faster LCP. Toggle state setters use functional updater form. Language switcher uses `<Link>` with `locale` prop for crawlable alternate-language discovery.
- **Footer**: 5-column grid (Brand & Social, Quick Links, Services, Contact, Why Us) + full-width Service Areas bar with 14 city links. Receives `company`, `socialLinks`, `services`, `areas`, `googleRating` as props from layout. Custom SVG icons for Xiaohongshu, WeChat, WhatsApp.
- **ContactForm**: Reusable form component with `large` prop for accessibility (larger text/inputs for elderly users). Tracks success timeout via `useRef` with cleanup on unmount. Surfaces server error messages via inline `role="alert"` element (auto-announced by screen readers). Required fields have `aria-required="true"`. Success modal uses `onMouseDown` with `e.target === e.currentTarget` for backdrop dismiss (more robust than `onClick` + `stopPropagation`).
- **Server vs Client**: Page route files (`app/[locale]/**/page.tsx`) are server components that fetch data from DB, handle metadata, and render structured data. Page content components (`components/pages/`) are client components that receive all data as props. Navbar and Footer are client components rendered by the layout. Server routes should use `Promise.all` to parallelize independent async calls.
- **ProductLink** (`components/ProductLink.tsx`): Reusable external product link with hover image preview. Supports `size` prop (`'sm'` for modal, `'md'` for detail page). Used by `ProjectModal` and `SiteDetailPage`.
- **Admin components** (`components/admin/`): DataTable (supports `headerAction` prop for toolbar controls; optional `dragReorder` prop enables drag-and-drop row reordering with gold insertion line indicator — auto-disables column sorting, disabled during search; exports `DragReorderConfig` interface; search-aware empty state shows `t.common.noResultsFor` with the query when filtering, `t.common.noRecords` otherwise), ProjectForm (pre-save warning via `useSaveWarning` hook for missing optional fields; scopes and external products collapse to first 3 items with Show All toggle), SiteForm (pre-save warning via `useSaveWarning` hook for missing optional fields), HouseStack (unified site/project management, supports `?project=<id>` and `?new` URL params), BilingualInput (optional `maxLength` prop with color-coded character counter for SEO fields and bilingual `(max N)` label hint via `t.common.maxLength`), BilingualTextarea (dual-mode controlled/uncontrolled with `disabled` prop; used by ProjectForm and SiteForm for AI-populated description fields), ImageUrlInput (with optional `slug`/`imageRole`/`disabled` props for SEO-friendly upload naming; uses detached file picker via `document.createElement('input')` to bypass `<fieldset disabled>`; upload area hidden in view mode), ImagePairEditor (before/after image pair management with SEO metadata fields; collapses to first 3 pairs with "Show All (N)" toggle; hidden form inputs always render for all pairs; optional `slug` prop for slug-based S3 keys and auto-fill alt text; upload progress spinner using global `@keyframes admin-spin`), ConfirmDialog (native `<dialog>` modal with fixed centering, keyboard focus styles, and focus trap via Tab/Shift+Tab cycling; `aria-describedby` wraps both message and items list; supports `items` list prop for bullet-point detail and `variant` prop — `'danger'` (red, default) or `'warning'` (gold) — used for destructive actions and logout confirmation), Sidebar (collapsible navigation groups with Dashboard + Portfolio/Content/CRM/Settings sections, localStorage-persisted expanded state, auto-expand on child route navigation), TopBar (hamburger menu for mobile, hidden on desktop via CSS; logout button with `ConfirmDialog` confirmation), DashboardShell (client wrapper for sidebar drawer with overlay, Escape key close, auto-close on desktop resize), DashboardClient (grouped cards in 4 sections — Portfolio/Content/CRM/Settings — with lucide-react icons in accent-colored circles, hover lift with neumorphic shadow transition; stat cards show counts, Settings section uses link-only cards for singleton pages (Company, Showroom, About) via unified `DashboardCard` with optional `value` prop; section heading and grid styles extracted to `sectionHeaderStyle`/`sectionGridStyle` constants; red notification dot for new contacts, "New Contacts" card links to `/admin/contacts?status=new` for pre-filtered view), StatusBadge, ToastProvider (3 types: success/error/warning with `TOAST_COLORS` map), useFormToast (detects `renamedSlug` for slug rename warnings), SubmitButton, EditModeToggle, FormField, FormAlerts, AdminLocaleProvider (provides locale + sidebar open/close state, memoized context value), AdminPageHeader (responsive flex→column on mobile; supports single action via `actionKey`/`actionHref` or multiple actions via `actions` array with per-action `color`; optional `backHref`/`backLabelKey` props render a "Back to {page}" link with ChevronLeft icon above the title — used by all edit/new pages; exports shared `headerActionStyle`), ToggleButton (bilingual Yes/No toggle with pending state; defaults to `t.common.yes`/`t.common.no` from admin translations; accepts optional `activeLabel`/`inactiveLabel` overrides), Tooltip (reusable help icons), DragHandleIcon (6-dot drag indicator SVG), SearchableSelect (type-to-filter dropdown with keyboard navigation, ARIA accessibility, visible keyboard focus indicator), AIContentEditor (blog content editor with AI optimization), AIProjectGenerator (project description generator with AI — includes memory leak prevention via mountedRef pattern).
- **Admin mobile responsive** (`app/admin/admin-responsive.css`): CSS-only mobile overrides at `@media (max-width: 768px)`. Uses `className` attributes alongside inline styles — `!important` overrides inline values on mobile. Classes: `admin-sidebar` (fixed drawer), `admin-sidebar--open` (slide in), `admin-sidebar-overlay` (backdrop), `admin-hamburger` (shown on mobile), `admin-topbar`/`admin-main-content` (reduced padding), `admin-form-grid` (single column), `admin-form-card` (full width), `admin-page-header` (vertical stack), `admin-site-detail-grid` (single column). Desktop: overlay and hamburger hidden via `display: none`. Body scroll lock via `body:has(.admin-sidebar--open)`. Defines `--color-navy` CSS variable for theme consistency. Includes `.confirm-dialog-btn:focus-visible` for keyboard accessibility and `@keyframes admin-spin` for shared loading spinners. Global `fieldset:disabled` rule removes inset shadows from inputs/textareas/selects in view mode.
- **Reusable hooks** (`hooks/`): `useDragReorder<T>` — generic drag-and-drop reordering with optimistic UI, server sync, and proper cleanup (mountedRef pattern to prevent state updates after unmount). Uses `DRAG_THRESHOLD_PX` constant (5px) to distinguish clicks from drags. Used by GalleryListClient, PartnersListClient, ServicesListClient, ServiceAreasListClient, FaqsListClient, and TrustBadgesListClient. DataTable integration via `DragReorderConfig` prop. `useIsMobile(breakpoint?)` — `matchMedia` hook with SSR-safe lazy initialization (prevents hydration mismatch), defaults to 768px. `useSaveWarning(formAction)` — manages pre-save warning dialog state (single `SaveWarningState` object); returns `{ showWarning, missingFields, requestSave, confirm, cancel }`; used by `ProjectForm`, `SiteForm`, and `BlogPostForm` for optional field validation before submission. `useBeforeUnload(dirty)` — attaches `beforeunload` event listener when `dirty` is true; warns users before navigating away from forms with unsaved changes; used by `ProjectForm`, `SiteForm`, and `BlogPostForm`. `useFullscreenModal({ isOpen, onClose, onPrev?, onNext? })` — manages fullscreen image overlay accessibility: body scroll lock, focus trap (Tab cycling), keyboard navigation (Escape to close, ArrowLeft/ArrowRight for prev/next), and return focus to trigger element on close. Returns `{ overlayRef, triggerRef, captureTrigger }`. Used by `ProjectDetailPage` and `SiteDetailPage`.
- **House Stack UI**: Visual metaphor for site/project management. Roof = site, floors = project layers. Supports drag-and-drop reordering, keyboard navigation (Alt+Up/Down), and inline delete confirmation. Renders on `/admin/sites/[id]` page with detail panel for editing selected item. Supports `?project=<id>` URL param for deep-linking directly to a specific project's edit form, and `?new` for pre-selecting the new project form.
- **Sites admin list**: Three-tab UI — "All Sites" (expandable rows with child projects), "Whole House" (filtered to sites with `showAsProject === true`, same expandable rows), and "Standalone Projects" (flat list of projects from non-whole-house sites). Whole House and Standalone tabs show count badges. PO Number column shown first in both tabs. Search matches PO numbers in addition to titles, slugs, cities, and service types. Page header uses `AdminPageHeader` with `actions` array for "New Standalone Project" (navy, links to `individual-projects` site with `?new`) and "New Site" (gold). `STANDALONE_SITE_SLUG` constant in `lib/admin/constants.ts`.
- **Hero image fallback**: `ProjectsPage` uses `reduce()` to build display projects from sites, resolving hero image as `site.hero_image || firstChildProject.hero_image`. Sites with no hero image at all are skipped.
- **Projects page category filtering**: `ProjectsPage` filters by `service_type` slug (e.g., `"kitchen"`, `"bathroom"`) — not by localized category name. Categories from `getCategoriesLocalized()` include a `serviceType` field matching the project's `service_type` column. The `matchesCategory(project, serviceType)` helper handles the `'whole-house'` special case (matches `isSiteProject || service_type === 'whole-house'`). Both the "Browse by Category" cards and the dropdown filter use this slug-based matching.
- **Projects page pagination**: `ProjectsPage` paginates filtered projects with `PROJECTS_PER_PAGE = 12`. Smart page number generation with ellipsis for large page counts. Neumorphic-styled controls with Previous/Next buttons and numbered pages. Resets to page 1 on any filter change. Deduplicates projects whose slug matches a site-as-project slug to prevent double-display.
- **PO Number search**: The public projects page includes a text search input that filters by `po_number` — an internal field not visually displayed to customers but searchable by sales staff for quick project lookup. Both projects and sites carry `po_number` through the full data pipeline (DB → queries → types → localization → display).
- **Service icons**: Service icons are stored as image URLs (`iconUrl` column) pointing to SVG files in `public/icons/services/`. Frontend components render them as `<img>` tags with `GOLD_ICON_FILTER` CSS filter for gold tinting. Admin uses `ImageUrlInput` for upload. The old `iconName` column (Lucide component names) is retained but unused.
- **Service tags**: Each service has bilingual sub-service tags (e.g., "Floor Installation" / "地板安装") stored in the `service_tags` table. Tags are batch-fetched in `getServicesFromDb()` and `getAllServicesAdmin()` using the `groupBy()` + `sortByDisplayOrder()` pattern. Admin ServiceForm provides add/remove UI with collapse threshold. Public `ServiceDetailPage` renders tags as a neumorphic tag cloud between Hero and Benefits sections. Insert-before-delete pattern used for tag updates (same Neon constraint as image pairs).
- **Admin locale switching**: `AdminLocaleProvider` provides client-side locale + sidebar state context for admin panel. TopBar displays EN/ZH switcher buttons (gold highlight for active), hamburger menu (mobile only), and logout button with `ConfirmDialog` confirmation. Preference persists in localStorage (`admin_locale` key) with try/catch for private browsing mode. All list clients show bilingual content (titleEn/titleZh, questionEn/questionZh, etc.) based on selected locale. Uses `useAdminLocale()` hook which returns `{ locale, setLocale, sidebarOpen, setSidebarOpen }`. Does not affect SEO (admin is auth-protected).
- **Admin landing page previews**: Several admin pages include a "Landing Page Preview" below the main content, mirroring the homepage component layout. Uses `SURFACE_ALT` container with neumorphic cards. Switches with admin locale. Pages with previews: FAQs (expandable accordion), Services (icon cards), Service Areas (card grid + footer bar), Trust Badges (star cards), Gallery (drag-to-reorder grid), Partners (drag-to-reorder logos), About (responsive card grid with gold dividers and 3-line text clamp). Translation key pattern: `t.{entity}.landingPreview`.

## Accessibility

- **Skip to content**: Layout includes a skip link (`<a href="#main-content">`) with `sr-only` / `focus:not-sr-only` styling. Bilingual ("Skip to main content" / "跳到主要内容"). `<main id="main-content">` wraps page content.
- **Elderly-friendly text**: The `ContactForm` component supports a `large` prop that increases input text to `text-lg` with larger padding (`py-3.5` / `py-4`) for better readability. Used on the homepage contact section.
- **Hero text scaling**: Hero titles use responsive scaling up to `lg:text-6xl` for desktop readability.
- **Heading hierarchy**: All pages maintain valid H1 → H2 → H3 structure. Use `sr-only` for structurally required but visually redundant headings.
- **Lightbox accessibility**: Image lightbox includes `aria-live="polite"` counter, keyboard-accessible open/close handlers via `useCallback`.
- **Fullscreen modal accessibility**: `ProjectDetailPage` and `SiteDetailPage` fullscreen image overlays use `useFullscreenModal` hook for `role="dialog"`, `aria-modal="true"`, scroll lock, focus trap, Escape/Arrow key navigation, and return focus to the trigger element on close.
- **Navbar focus trap**: Mobile menu implements focus trap with Escape key close and Tab cycling.
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` overrides for `modalFadeIn` (globals.css) and `admin-spin` (admin-responsive.css) keyframes. `Marquee` client component uses a live `matchMedia('(prefers-reduced-motion: reduce)')` listener to disable clones and animation entirely when the user prefers reduced motion.
- **Functional updater pattern**: Toggle state setters use `setX((prev) => !prev)` to prevent stale closures in event handlers.

## Database Connection

The `db` export in `lib/db/index.ts` uses a **Proxy** for lazy initialization:

1. Module import does **not** connect to the database
2. First property access (e.g., `db.select()`) triggers connection
3. Driver is selected based on `DATABASE_URL`:
   - Contains `neon.tech` → `@neondatabase/serverless` + `drizzle-orm/neon-http`
   - Otherwise → `pg` Pool + `drizzle-orm/node-postgres`

This pattern prevents build-time crashes at import time. Note that `DATABASE_URL` is still required at build time because `layout.tsx` and page components make DB queries during pre-rendering.

## AI Content Optimization

The admin panel includes AI-powered content generation using OpenAI's GPT-4 models.

### Configuration (`lib/ai/openai.ts`)

```typescript
export const AI_CONFIG = {
  model: 'gpt-4o-mini',              // Default for short text
  modelContent: 'gpt-4o',             // Higher quality for blog content
  temperature: 0.3,
  maxTokensContent: 8192,             // Blog article optimization
  maxTokensBlogGeneration: 16384,     // Blog generation (bilingual 800-1200 words x2 + SEO in JSON)
  maxTokensShort: 1024,               // Short text translations
  maxTokensProjectDescription: 2048,  // Project descriptions + SEO (16 fields)
  maxTokensAltText: 256,              // Alt text generation
  maxTokensReview: 512,               // AI output review (lightweight)
  maxTokensSocialPost: 4096,          // Social post generation (3 platforms x bilingual)
  fetchTimeoutMs: 60000,
};
```

### Translation Glossary (`lib/ai/glossary.ts`)

A modular EN→ZH glossary injected into all 6 AI prompts to ensure domain-specific terms are translated correctly (e.g., "Delta" the city → "三角洲", not a phonetic transliteration). Terms are organized by category (locations, cabinet-styles, etc.) and serialized into a compact prompt block via `formatGlossaryForPrompt()`. The result is computed once at module load and cached. To add terms, append entries to the appropriate category in the `GLOSSARY` object — all AI prompts pick them up automatically.

### Functions (`lib/ai/content-optimizer.ts`)

| Function | Purpose | Returns |
|----------|---------|---------|
| `optimizeContent(rawContent)` | Blog content optimization | `OptimizedContent` (contentEn/Zh, excerptEn/Zh, SEO fields) |
| `optimizeShortText(rawText)` | Short text translation | `BilingualText` (textEn, textZh, detectedLanguage) |
| `optimizeProjectDescription(rawNotes, scopes?, types?)` | Project description + SEO generation with hybrid validation | `ProjectDescription & { corrections?: string[] }` |
| `validateProjectDescription(result, scopes?, types?)` | Programmatic fix of invalid scopes, serviceType, slug-title divergence | `{ corrected: ProjectDescription; corrections: string[] }` |
| `reviewProjectDescription(prompt, output, types?)` | Lightweight AI review for semantic accuracy (non-fatal) | `{ corrections; messages } \| null` |
| `optimizeSiteDescription(rawNotes)` | Site description + SEO generation | `SiteDescription` (slug, titleEn/Zh, descriptionEn/Zh, badgeEn/Zh, excerptEn/Zh, poNumber, budgetRange, durationEn/Zh, spaceTypeEn, SEO fields, locationCity) |
| `generateAltText(image)` | Image alt text via vision | `AltTextResult` (altEn, altZh, isFallback?) |

All return types are Zod-inferred (`z.infer<typeof Schema>`) and exported for reuse by form components via `Omit<T, 'detectedLanguage'>`.

### AI Output Review (Hybrid Validation)

`optimizeProjectDescription()` includes a two-layer validation pipeline that runs after the initial Zod parse:

1. **Programmatic validation** (`validateProjectDescription`) — always runs:
   - Filters `selectedScopes` to only entries in the provided scope list; falls back to all scopes if every AI selection was invalid
   - Sets `serviceType` to `null` if not in the allowed list
   - Regenerates slug from title if slug and title share fewer than `MIN_SLUG_TITLE_OVERLAP` (2) significant words

2. **AI review** (`reviewProjectDescription`) — runs after programmatic validation:
   - Cheap second AI call (`gpt-4o-mini`, `temperature: 0.1`, 512 max tokens)
   - Checks title accuracy, serviceType correctness, scope relevance, and slug match vs. original notes
   - Returns only fields to correct (partial JSON), or `null` if everything looks good
   - Review corrections are re-validated (serviceType checked against allowed list, slug sanitized, scopes re-filtered)
   - Non-fatal — failures are caught and logged as warnings

Both batch upload and admin form AI generate pass `availableServiceTypes` from the DB (`getServiceTypeMap()`) and all scopes to `optimizeProjectDescription()`. The review prompt's valid service type list is built dynamically via `buildReviewPrompt(availableServiceTypes)`. The batch processor's existing scope filter at save time remains as a redundant safety net.

### Blog Generation (`lib/ai/blog-generator.ts`)

| Function | Purpose | Returns |
|----------|---------|---------|
| `generateBlogFromProjectData(project)` | Generate case study from single project | `BlogGeneration` (zod-validated) |
| `generateBlogFromSiteData(site, projects)` | Generate case study from whole-house site | `BlogGeneration` (zod-validated) |

`BlogGeneration` includes: bilingual title, content (semantic HTML), excerpt, SEO meta fields, focus/SEO keywords, reading time, and slug.

### Social Post Generation (`lib/ai/social-post-generator.ts`)

| Function | Purpose | Returns |
|----------|---------|---------|
| `generateSocialPostsFromBlog(blog)` | Generate from blog post data | `SocialPostGeneration` (zod-validated) |
| `generateSocialPostsFromProject(project)` | Generate from project data | `SocialPostGeneration` (zod-validated) |
| `generateSocialPostsFromSite(site, projects)` | Generate from site + children | `SocialPostGeneration` (zod-validated) |

`SocialPostGeneration` includes: bilingual campaign title, Instagram captions + hashtags (EN/ZH), Facebook captions + hashtags (EN/ZH), Xiaohongshu captions (ZH primary, EN secondary) + topic tags. All 13 string fields validated with `.min(1)` to reject empty AI responses. Reuses `ProjectDataForBlog` / `SiteDataForBlog` types from `blog-generator.ts`.

Platform-specific formatting rules in system prompt:
- **Instagram**: max 2200 chars, up to 30 hashtags, emoji-rich, visual CTA
- **Facebook**: narrative format, 3-5 hashtags, professional tone, CTA
- **Xiaohongshu**: Chinese-first, heavy emojis, `#topic tags#` format, conversational

### Server Actions

**`app/actions/admin/optimize-content.ts`** — Content optimization actions (require admin auth):
- `optimizeBlogContent(rawContent)` — For blog post editing
- `optimizeProjectDescriptionAction(rawNotes)` — For project forms
- `optimizeSiteDescriptionAction(rawNotes)` — For site forms
- `generateImageAltText(imageUrl)` — For image uploads

**`app/actions/admin/generate-blog.ts`** — Blog generation actions (require admin auth):
- `generateBlogFromProject(projectId)` — Generate draft blog from single project
- `generateBlogFromSite(siteId)` — Generate draft blog from site + all child projects

**`app/actions/admin/social-posts.ts`** — Social media post CRUD + AI generation (require admin auth):
- `createSocialMediaPost(prevState, formData)` — Validate, insert, redirect to list
- `updateSocialMediaPost(id, prevState, formData)` — Validate, update with `publishedAt` preservation
- `deleteSocialMediaPost(id)` — Delete with `.returning()` verification
- `updateSocialPostStatus(id, status)` — Inline status toggle from list page
- `generateSocialPostFromBlog(blogPostId)` — Fetch blog, call AI, return content
- `generateSocialPostFromProject(projectId)` — Fetch project + relations, call AI, return content
- `generateSocialPostFromSite(siteId)` — Fetch site + children with `groupBy()`, call AI, return content
- `getSourceImages(sourceType, sourceId)` — Fetch available images from source (hero + image pairs + child project images)

Blog generation actions fetch project data with relations (image pairs, scopes, products), call GPT-4o, validate response with Zod, and insert an unpublished draft blog post. Safety measures include:
- **SEO field truncation**: `truncateField()` ensures metaTitle, metaDescription, and focusKeyword fit DB column max lengths (`SEO_META_TITLE_MAX=70`, `SEO_META_DESCRIPTION_MAX=155`, `SEO_FOCUS_KEYWORD_MAX=50`)
- **Slug sanitization**: `sanitizeSlug()` normalizes AI-generated slugs (lowercase, no consecutive hyphens, no leading/trailing hyphens, fallback to `'blog-post'`)
- **Slug deduplication**: `ensureUniqueSlug()` appends `-2`, `-3` etc. to prevent URL collisions
- **Shared insert logic**: `insertBlogDraft()` helper handles all post-processing (sanitize slug, truncate fields, insert, revalidate) for both actions
- **Truncation detection**: Throws clear error if `finish_reason === 'length'`

### Admin Components

| Component | Usage |
|-----------|-------|
| `AIContentEditor` | Blog post form — paste content, AI cleans up and translates |
| `AIFieldGenerator<T>` | Generic AI generator — notes textarea + generate button (used by wrappers below) |
| `AIProjectGenerator` | Project form — thin wrapper, generates slug, title, description, challenge, solution, badge, excerpt, PO number, budget, duration, SEO |
| `AISiteGenerator` | Site form — thin wrapper, generates slug, title, description, badge, excerpt, PO number, budget, duration, space type, SEO |

`AIProjectGenerator` and `AISiteGenerator` use exported `ProjectDescription` / `SiteDescription` types from `content-optimizer.ts` via `Omit<T, 'detectedLanguage'>` for their callback signatures, eliminating inline type duplication. Project/site description fields use `BilingualTextarea` in controlled mode (formerly `AIBilingualTextarea` with inline AI button, removed in favor of the top-level "AI Generate All" feature).

### Memory Leak Prevention

`AIFieldGenerator` uses the `mountedRef` pattern to prevent state updates after unmount:

```typescript
const mountedRef = useRef(true);
useEffect(() => {
  mountedRef.current = true;
  return () => {
    mountedRef.current = false;
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
  };
}, []);
```

## Batch Upload

Admin feature for bulk-creating sites, projects, image pairs, and blog posts from a ZIP file of renovation images. Supports two modes: **Sites** (whole-house with site containers) and **Standalone** (individual projects under the standalone site container).

### Architecture

```
BatchUploadClient (React)  ──POST──►  api/route.ts (create job row)
        │                                      │
        │                               Returns { jobId }
        │
        ├──POST──►  api/[jobId]/upload/route.ts  (init S3 multipart upload)
        │           Returns { uploadId }
        │
        ├──PUT ×N──►  api/[jobId]/upload/?uploadId=...&partNumber=N&contentLength=SIZE
        │           Returns { presignedUrl } (no chunk data in request)
        │    └──PUT ×N──►  S3 presigned URL (client uploads 10 MB chunk directly)
        │           Per-chunk retry (3 attempts, 1s/2s backoff)
        │
        ├──PATCH──►  api/[jobId]/upload/  (complete multipart upload)
        │           Body: { uploadId, totalParts }
        │           Server retrieves ETags via ListPartsCommand
        │           Aborts multipart upload on failure
        │
        ├──POST──►  api/[jobId]/process/route.ts
        │           Uses after() to run processBatchUpload() beyond response
        │
        └──GET (poll 2s)──►  api/[jobId]/route.ts (returns job status)
```

ZIP upload uses **S3 multipart upload with presigned URLs**. The API route generates presigned URLs for each 10 MB chunk and the client uploads directly to S3, bypassing Vercel's 4.5 MB serverless body size limit. On completion, the server retrieves ETags via `ListPartsCommand` (browsers can't read ETag from cross-origin S3 responses due to CORS restrictions). Shared `batchZipKey()` helper (`lib/batch/types.ts`) generates the S3 key for temp ZIP files.

### Processing Pipeline (`lib/batch/batch-processor.ts`)

Branches early based on `options.mode` to avoid dual-nullable patterns:

**Sites mode** (default):
1. **Extract** — Downloads ZIP from S3 temp, parses via `parseZip()` (async `fflate`)
2. **Upload** — Uploads all images to S3 in parallel batches of 15 (`UPLOAD_BATCH_SIZE`), per-site slug prefixes. Uses shared `collectProjectImages()` helper
3. **Generate** — AI metadata in parallel batches of 10 (`AI_METADATA_BATCH_SIZE`): `optimizeSiteDescription()` + `optimizeProjectDescription()` per entity. Site image pair alt text uses contextual titles (e.g., "Kitchen Renovation - Before 1")
4. **Save** — Inserts sites (including AI-detected `spaceTypeEn`/`spaceTypeZh` via `SPACE_TYPE_TO_ZH`), site image pairs (`site_image_pairs`), projects, project image pairs (`project_image_pairs`), and external products (with matched product images) into DB with deduplicated slugs. Uses shared `insertExternalProducts()` helper for both site-level and project-level products. Orphaned sites (0 successful projects AND 0 successful site image pairs) are cleaned up. `cleanupOrphanedSite()` checks both child projects and `site_image_pairs` before deleting
5. **Blog** (optional) — Calls `generateBlogFromSite()` for each created site via shared `generateBlogsForEntities()` helper

**Standalone mode**:
1. **Extract** — Downloads ZIP, parses via `parseZipStandalone()` (flattens subfolders into top-level projects)
2. **Upload** — Same image upload pipeline with per-project slug prefixes
3. **Generate** — `optimizeProjectDescription()` per project in parallel batches of 10. For single-project ZIPs, the ZIP filename (e.g., "2828-van") is passed as a `Reference/PO number` hint to the AI prompt
4. **Save** — Finds or creates the standalone site container via `ensureStandaloneSite()`, queries `max(display_order_in_site)`, and inserts projects with sequential display order. Uses shared `saveProject()` function. Single-project ZIP base name also used as fallback PO number
5. **Blog** (optional) — Calls `generateBlogFromProject()` for each created project

Shared helpers: `collectProjectImages()`, `collectAfterImageUrls()`, `generateBlogsForEntities()`, `finalizeJob()`, `cleanupTempZip()`, `pushSkippedFilesWarning()`, `ensureActionSuffix()`. AI extracts all metadata fields including service type, PO number, budget, duration from freeform notes (no hard regex extraction). AI-detected service type overrides folder-name heuristic (`detectServiceType()`) when available. Standalone mode prompt omits folder-detected service type when notes exist to avoid biasing the AI. Fallback metadata uses `ensureActionSuffix()` to guarantee labels include action words (Renovation/装修) and `buildFallbackSeo()` for consistent SEO fields.

### ZIP Structure Detection (`lib/batch/zip-parser.ts`)

Shared `extractFilesFromZip()` builds a file tree, notes map, and products map from the ZIP buffer. Filters out `__MACOSX` folders and macOS resource fork artifacts (`._` prefixed files). Detects unsupported image formats (HEIC, HEIF, TIFF, BMP, RAW) via `isUnsupportedImageFile()` and tracks them in a `skippedFiles` array surfaced as warnings. Two public parsers consume this:

**`parseZip()` (sites mode)** — supports three layouts:

- **Nested**: Top-level folder = site, subfolders = projects. Root-level images in the site folder become site-level image pairs (`site_image_pairs`), not a separate project. Subfolders become projects with their own `project_image_pairs`
- **Single-folder**: Top-level folder with no subfolders = single project wrapped in a site. Pairs belong to the project only (site `imagePairs` is empty to prevent duplication)
- **Flat**: All images at root (no folders) = single project, auto-wrapped in a site

**`parseZipStandalone()` (standalone mode)** — each top-level folder = one standalone project (no site wrapper). Subfolders are flattened into their parent top-level folder. Flat root images = single project. Notes/products from subfolders are intentionally ignored — only the top-level folder's text files are used

Image naming conventions:
- **Hero images**: `hero.jpg` at any folder level becomes the hero image for that entity
- **Before/after pairs**: `before-1.jpg` / `after-1.jpg` or `Before 1.jpg` / `After 1.jpg` auto-paired by number (accepts hyphen or space separator, case-insensitive)
- **Standalone images**: Files without `hero`/`before`/`after`/`product` naming become after-only pairs
- **Product images**: `product-N.jpg` (1-based) matched to Nth entry in `products.txt`. Sparse indices supported (e.g., `product-1.jpg` and `product-3.jpg` — product 2 gets no image). Warning logged when product images exist but no `products.txt` is found
- **Products files**: `products.txt`, `links.txt`, `external.txt` — one product per line: `URL | Label EN | Label ZH`. Lines starting with `#` are comments
- **Notes files**: `notes.txt`, `description.txt`, `readme.txt`, `info.txt`, `readme.md`, etc. provide AI context for metadata generation
- **Service type detection**: `detectServiceType(folderName, validTypes?)` matches folder names against `SERVICE_TYPE_ALIASES` (e.g., "Kitchen" → `kitchen`, "Bathroom" → `bathroom`). Returns `null` (not a hardcoded default) when no match is found. Accepts optional `validTypes: Set<string>` from the DB to validate alias targets. Batch processor passes `validServiceTypes` built from `getServiceTypeMap()`

### Job Status Tracking

Uses `batch_upload_jobs` table with jsonb columns for arrays (site/project/blog IDs, errors) and `BatchJobOptions` (generateBlog, mode). Client polls every 2 seconds via GET endpoint. Terminal states: `completed`, `failed`, `partial`. GET endpoint includes stale job detection: `STALE_PROCESSING_MS` (2 minutes) marks stuck processing jobs as `partial` (if any creations exist) or `failed`; `STALE_PENDING_MS` (30 minutes) catches abandoned pending jobs. Stale jobs receive `__TIMEOUT_*__` error markers that the client resolves into bilingual display text via `resolveErrorLabel()` helper (maps `__TIMEOUT_PARTIAL__`, `__TIMEOUT_FAILED__`, `__TIMEOUT_STEP__:{status}` to translation keys).

### Client UI (`BatchUploadClient.tsx`)

Tab bar at top for mode selection (Sites / Standalone Projects), disabled during processing. Three-phase UI: Upload (drag-and-drop zone + options) → Processing (step indicators + progress bar) → Results (summary cards + error list + action buttons). ZIP upload uses **S3 multipart upload with presigned URLs** (`api/[jobId]/upload/`): file is split into 10 MB chunks (`CHUNK_SIZE`), for each chunk the client fetches a presigned URL from the API then uploads directly to S3, with per-chunk retry (3 attempts, backoff). Progress bar shows chunks completed / total. Uses `AbortController` for cancellation. Polling starts immediately after job creation (before S3 upload completes) so the UI always transitions to results; on S3 upload failure the client returns to upload phase, but if only the process trigger fails polling continues. Error list uses `resolveErrorLabel()` to map `__TIMEOUT_*__` markers into bilingual display text. Upload phase includes a locale-aware "Download Example ZIP" link (mode-specific: `example-batch-upload-{locale}.zip` or `example-batch-upload-standalone-{locale}.zip`) next to the folder structure help toggle. Help section content (folder structure, notes.txt example, products.txt example) adapts to selected mode, fully bilingual via admin translation keys. Results phase conditionally shows Sites summary card (sites mode only) and mode-appropriate review links.

## Media Upload (Images & Video)

All admin media uploads use presigned S3 URLs, uploading directly from the browser to S3-compatible storage (R2 in production, MinIO locally). This bypasses Vercel's proxy body size limit. Supports images (JPEG, PNG, WebP, SVG, GIF — max 50 MB) and video (MP4, WebM, MOV — max 1 GB).

### Architecture

```
Browser                        API Route                       S3
  │                              │                              │
  │  POST /api/admin/upload      │                              │
  │  {fileName,fileSize,type}    │                              │
  ├─────────────────────────────►│  validate auth + metadata    │
  │                              │  generate S3 key             │
  │                              │  getSignedUrl(PutObject)     │
  │  {presignedUrl, publicUrl}   │                              │
  │◄─────────────────────────────┤                              │
  │                              │                              │
  │  PUT presignedUrl            │                              │
  │  body: file                  │                              │
  ├──────────────────────────────┼─────────────────────────────►│
  │                              │                              │
  │  200 OK                      │                              │
  │◄─────────────────────────────┼──────────────────────────────┤
```

### S3 Client (`lib/admin/s3.ts`)

Shared S3 client singleton with lazy initialization. Configured with `requestChecksumCalculation: 'WHEN_REQUIRED'` to disable AWS SDK v3 automatic CRC32 checksums (R2 rejects them as unsigned headers on presigned URLs). Exports:
- `getS3Client()` — Returns a cached `S3Client` or `null` if credentials are missing. Uses `undefined` sentinel to distinguish "not yet initialized" from "missing credentials".
- `S3_BUCKET` — Default bucket name (`process.env.S3_BUCKET || 'reno-stars'`).
- `MIME_TO_EXT` — MIME type → file extension map for image and video uploads.
- `deleteS3Object(publicUrl)` — Extracts S3 key from a public URL via `extractKeyFromUrl()` and deletes the object. Silently ignores failures (object already deleted, external URL, missing S3 config). Used by company action to clean up replaced uploads.

### Upload Constants (`lib/admin/upload-constants.ts`)

Shared validation constants used by both the API route and client-side helpers:
- `MAX_IMAGE_SIZE` / `MAX_IMAGE_SIZE_LABEL` — 50 MB limit for images.
- `MAX_VIDEO_SIZE` / `MAX_VIDEO_SIZE_LABEL` — 1 GB limit for video.
- `ALLOWED_IMAGE_TYPES` — `Set` of allowed image MIME types (JPEG, PNG, WebP, SVG, GIF).
- `ALLOWED_VIDEO_TYPES` — `Set` of allowed video MIME types (MP4, WebM, QuickTime/MOV).
- `ALLOWED_MEDIA_TYPES` — Combined `Set` of all allowed image + video types.

### Presign API Route (`app/admin/api/upload/route.ts`)

`POST /admin/api/upload` — auth-protected route that returns a presigned S3 PUT URL.

**Request:** `{ fileName: string, fileSize: number, contentType: string, customKey?: string }`
**Response:** `{ presignedUrl: string, publicUrl: string }`

- **Validation**: File size validated server-side (50 MB for images, 1 GB for video). Allowed types: JPEG, PNG, WebP, SVG, GIF, MP4, WebM, MOV. `ContentLength` is intentionally omitted from the presigned URL to avoid signature mismatches on R2 for large browser uploads.
- **Custom key**: If `customKey` is provided, the S3 key becomes `uploads/admin/{customKey}.{ext}`. Sanitized to `/[a-z0-9-]/` only and capped at 200 chars.
- **Fallback**: Without `customKey`, uses `uploads/admin/{timestamp}-{random8}.{ext}`.
- **Expiry**: 10 minutes for images (`PRESIGN_EXPIRY_SECONDS`), 60 minutes for video (`VIDEO_PRESIGN_EXPIRY_SECONDS`).

### Client Helper (`lib/admin/upload-client.ts`)

Shared `uploadDirect()` helper with two public wrappers:
- `uploadImageDirect({ file, customKey })` — images (50 MB, JPEG/PNG/WebP/SVG/GIF)
- `uploadVideoDirect({ file, customKey })` — video (1 GB, MP4/WebM/MOV)

Two-step upload: (1) request presigned URL from `POST /admin/api/upload`, (2) PUT file directly to S3. Includes client-side early validation (size + MIME type), `AbortController` with 30-minute timeout (`UPLOAD_TIMEOUT_MS`), and dev-only error logging.

### SEO-Friendly Naming

When a slug is available in the form, image components pass a `customKey` to produce readable S3 keys. Each key includes a base-36 timestamp suffix (`Date.now().toString(36)`) to ensure every upload produces a unique URL (avoids browser-cache stale-image issues when the same file type is re-uploaded):

| Component | Key Format | Example |
|-----------|------------|---------|
| `ImageUrlInput` | `{slug}-{imageRole}-{ts}` | `richmond-kitchen-hero-m3x7k2f.webp` |
| `VideoUrlInput` | `{slug}-{imageRole}-{ts}` | `company-hero-video-m3x7k2f.mp4` |
| `ImagePairEditor` (before) | `{slug}-before-renovation-{index}-{ts}` | `richmond-kitchen-before-renovation-1-m3x7k2f.jpg` |
| `ImagePairEditor` (after) | `{slug}-after-renovation-{index}-{ts}` | `richmond-kitchen-after-renovation-1-m3x7k2f.jpg` |

### Auto-Fill Alt Text

`ImagePairEditor` auto-populates empty alt text fields after a successful upload:
- **EN**: `{Humanized Slug} - Before/After Renovation {index}` (e.g., "Richmond Kitchen - Before Renovation 1")
- **ZH**: `{Humanized Slug} - 装修前/装修后 {index}` (e.g., "Richmond Kitchen - 装修前 1")

The `humanizeSlug()` helper converts `richmond-kitchen` to `Richmond Kitchen`.

## Analytics

Google Analytics 4 integration with development mode filtering.

### Configuration

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to enable tracking. Analytics are automatically disabled on `localhost` and `127.0.0.1` to prevent polluting production data during development.

### Tracking Functions (`lib/analytics.ts`)

| Function | Event | Usage |
|----------|-------|-------|
| `trackEvent(name, params?)` | Custom event | Generic tracking |
| `trackFormSubmission(formName, params?)` | `form_submission` | Contact forms |
| `trackPhoneClick(phoneNumber)` | `phone_click` | Phone link clicks |
| `trackExternalLinkClick(url, linkType?)` | `external_link_click` | Product/social links |
| `trackCtaClick(ctaName, location?)` | `cta_click` | CTA buttons |
| `trackProjectView(slug, title?)` | `project_view` | Project pages |
| `trackBlogView(slug, title?)` | `blog_view` | Blog articles |

## Email Notifications

Contact form submissions trigger email notifications via Resend.

### Configuration

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Sender email (must be verified in Resend) |
| `EMAIL_TO` | Recipient email(s) for notifications |

### Function (`lib/email.ts`)

```typescript
sendContactNotification(submission: ContactSubmission): Promise<boolean>
```

Sends HTML email with contact details, service requested, and project description.

## Admin CRUD Patterns

### Insert-Before-Delete Pattern

Admin update actions that modify related records (image pairs, scopes, external products) use an insert-before-delete strategy instead of transactions. The Neon HTTP driver does not support interactive transactions, so actions:

1. Fetch existing related record IDs before modification
2. Insert new records first (old data remains as fallback if insert fails)
3. Delete old records by ID after successful insert

This prevents data loss on partial failure. Used by `updateProject()`, `updateSite()`, and `updateService()` (for tags).

```typescript
// 1. Fetch existing IDs
const [existingPairs, existingScopes] = await Promise.all([
  db.select({ id: projectImagePairs.id }).from(projectImagePairs).where(eq(projectImagePairs.projectId, id)),
  db.select({ id: projectScopes.id }).from(projectScopes).where(eq(projectScopes.projectId, id)),
]);

// 2. Insert new data (old data still exists as fallback)
if (pairData.length > 0) {
  await db.insert(projectImagePairs).values(pairData.map((p) => ({ ...p, projectId: id })));
}

// 3. Delete old data by ID (new data already safely inserted)
if (existingPairs.length > 0) {
  await db.delete(projectImagePairs).where(inArray(projectImagePairs.id, existingPairs.map(r => r.id)));
}
```

For `createSite()`, a rollback cleanup deletes the orphaned parent record if child insertion fails.

### New Project Ordering

`createProject()` queries `max(display_order_in_site)` for the target site and places the new project at `max + 1` (end of list). Uses `coalesce(max(...), -1)` so the first project in an empty site gets order `0`. Users can then drag-reorder via the House Stack UI.

### Site Cascade Deletion

Deleting a site cascades through the full hierarchy via DB foreign keys:
- `project_sites` → `projects` (`onDelete: cascade`)
- `project_sites` → `site_image_pairs` (`onDelete: cascade`)
- `projects` → `project_image_pairs`, `project_scopes`, `project_external_products` (`onDelete: cascade`)
- `blog_posts.project_id` → `onDelete: set null` (blog posts survive, just lose the project link)

The `deleteSite()` action simply deletes the site row. The ConfirmDialog lists all project names inside the site before confirming.

### Reorder Actions Pattern

Six entity types support drag-and-drop display order reordering via server actions: services, service areas, FAQs, trust badges, gallery items, and partners. All follow the same pattern:

1. `requireAuth()` — admin session required
2. **Max-length guard**: `orderedIds.length > 200` — prevents unbounded parallel DB updates
3. **Duplicate-ID guard**: `new Set(orderedIds).size !== orderedIds.length` — catches buggy callers
4. **UUID validation**: Each ID checked via `isValidUUID()`
5. `Promise.all` update `displayOrder: i` for each item (plus `updatedAt: now` where the table has that column — `trustBadges` does not)
6. Revalidate admin + public paths

## Project Modal (`components/ProjectModal.tsx`)

Rich image gallery modal with image-pairs model and mobile-friendly interactions:

### Image Pairs Model

The modal uses `imagePairs[]` / `activePairIndex` / `showBefore` state instead of a flat image array. Each pair can have a `beforeImage` and/or `afterImage`. Users click the main image to toggle between before/after views when both exist.

Data source priority:
1. `project.image_pairs` (from DB) if available
2. `imagesToPairs(project.images)` (legacy conversion via shared utility)
3. Hero image as a single-pair fallback

### Animation Keys

Two-level key strategy prevents animation flicker on before/after toggle:
- Outer wrapper div: `key={activePairIndex}` — triggers slide animation on pair navigation
- Inner `<Image>`: `key={\`${activePairIndex}-${showBefore}\`}` — swaps image without re-triggering slide animation

### Touch Swipe Navigation

Swipe threshold: 50px. Only triggers when horizontal movement exceeds vertical (avoids scroll conflicts). Navigation arrows hidden on mobile (`hidden sm:flex`), visible on desktop hover.

### Z-Index Layering

| Element | Z-Index | Purpose |
|---------|---------|---------|
| Touch overlay | `z-[5]` | Captures swipe events |
| Before/After badge | `z-10` | Image metadata indicator |
| Navigation arrows | `z-20` | Always accessible above overlay |

### Thumbnails

Split before/after preview per pair (matching detail page UX). Each thumbnail shows both images side-by-side with a white divider line. Responsive sizing: `h-[30px] sm:h-[48px]`.
