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
    process/              # 5-step renovation workflow page
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
  home/                   # Homepage section components (14 files: Hero, ServiceAreas, Testimonials, GoogleAvatar, Gallery, Services, Stats, About, TrustBadges, Partners, FAQ, Blog, Showroom, Contact)
  admin/                  # Admin UI components (DataTable, ProjectForm, HouseStack, Tooltip, DragHandle, etc.)
  structured-data/        # JSON-LD schema components (9 schemas)
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
    areas.ts              # Area localization helper (getLocalizedArea)
  admin/                  # Admin utilities
    auth.ts               # Session cookie auth (24h TTL)
    form-utils.ts         # Form validation + image pair parsing (getString, isValidUrl, parseImagePairs, etc.)
    gallery-categories.ts # Shared gallery category constants
    constants.ts          # Shared constants (SERVICE_TYPES, SPACE_TYPES, STANDALONE_SITE_SLUG, mappings)
    translations.ts       # Admin translation hooks
  ai/                     # AI content optimization
    openai.ts             # OpenAI client initialization (lazy loading)
    content-optimizer.ts  # AI functions for blog, project, alt text generation
    blog-generator.ts     # AI blog generation from project/site data (GPT-4o)
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

hooks/
  useDragReorder.ts       # Reusable drag-and-drop reordering with optimistic UI
  useIsMobile.ts          # Mobile breakpoint detection hook
  useSaveWarning.ts       # Pre-save warning dialog state for admin forms

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
- **Static data** (`lib/data/`): Only `video`, `images`, and `WORKSAFE_BC_LOGO` constants (hardcoded asset URLs) and localization helpers (`getLocalizedBlogPost`, `getLocalizedArea`) remain as static TypeScript. `lib/data/projects.ts` retains localization helpers, category slug constants, and the `imagesToPairs()` utility for converting legacy flat image arrays to `LocalizedImagePair[]`.
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
| `getPartnersFromDb()` | `Partner[]` | Active partners, ordered by `displayOrder` |
| `getSitesAsProjectsFromDb()` | `SiteWithProjects[]` | Sites with aggregated data for "Whole House" display |

Admin-only (uncached) query functions: `getAllProjectsAdmin()`, `getAllServicesAdmin()`, `getAllBlogPostsAdmin()`, `getAllContactsAdmin()`, `getAllSocialLinksAdmin()`, `getAllServiceAreasAdmin()`, `getAllGalleryItemsAdmin()`, `getAllTrustBadgesAdmin()`, `getAllFaqsAdmin()`, `getAllPartnersAdmin()`, `getAllSitesAdmin()`.

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
- **Homepage sections** (`components/home/`): 14 section components extracted from HomePage for code-splitting. 10 are Server Components (HeroSection, ServiceAreasBar, TestimonialsSection, ServicesSection, StatsSection, AboutSection, TrustBadgesSection, PartnersSection, BlogSection, ShowroomSection), 3 are Client Components (GallerySection, FaqSection, ContactSection), 1 is a Client utility (GoogleAvatar). TestimonialsSection uses CSS `@keyframes` marquee for infinite horizontal scroll with pause-on-hover. PartnersSection uses CSS `@keyframes` for infinite logo carousel with pause-on-hover/focus and `prefers-reduced-motion` support. FaqSection uses CSS Grid accordion animation (`grid-template-rows: 0fr` → `1fr`). Below-fold sections are loaded via `next/dynamic` with skeleton fallbacks.
- **Structured data** (`components/structured-data/`): JSON-LD schema injected via `<script type="application/ld+json">`. Used in server page route files. Schema components accept `company` as a prop. Includes 9 schemas: LocalBusinessSchema, LocalBusinessAreaSchema, ServiceSchema, ProjectSchema, ArticleSchema, BreadcrumbSchema, FAQSchema, ReviewSchema. Rating data comes from Google Reviews API (`googleRating`/`googleReviewCount` props) — no longer stored in the Company model. `aggregateRating` is conditionally rendered only when Google data is available. ReviewSchema emits individual reviews only (aggregate rating handled globally by LocalBusinessSchema in the layout).
- **Navbar**: Unified navigation with 7 links (Home, Services, Projects, Design, Benefits, Contact, Blog & News) + Areas dropdown (14 cities). Receives `company` and `areas` as props from layout. Uses `useMemo` for link arrays, `useCallback` for locale switching, focus trap for mobile menu. Logo uses `priority` for faster LCP. Toggle state setters use functional updater form.
- **Footer**: 5-column grid (Brand & Social, Quick Links, Services, Contact, Why Us) + full-width Service Areas bar with 14 city links. Receives `company`, `socialLinks`, `services`, `areas` as props from layout. Custom SVG icons for Xiaohongshu, WeChat, WhatsApp.
- **ContactForm**: Reusable form component with `large` prop for accessibility (larger text/inputs for elderly users). Tracks success timeout via `useRef` with cleanup on unmount. Surfaces server error messages.
- **Server vs Client**: Page route files (`app/[locale]/**/page.tsx`) are server components that fetch data from DB, handle metadata, and render structured data. Page content components (`components/pages/`) are client components that receive all data as props. Navbar and Footer are client components rendered by the layout. Server routes should use `Promise.all` to parallelize independent async calls.
- **ProductLink** (`components/ProductLink.tsx`): Reusable external product link with hover image preview. Supports `size` prop (`'sm'` for modal, `'md'` for detail page). Used by `ProjectModal` and `SiteDetailPage`.
- **Admin components** (`components/admin/`): DataTable (supports `headerAction` prop for toolbar controls), ProjectForm (pre-save warning via `useSaveWarning` hook for missing optional fields), SiteForm (pre-save warning via `useSaveWarning` hook for missing optional fields), HouseStack (unified site/project management, supports `?project=<id>` and `?new` URL params), BilingualInput, BilingualTextarea, ImageUrlInput (with optional `slug`/`imageRole` props for SEO-friendly upload naming), ImagePairEditor (before/after image pair management with SEO metadata fields, optional `slug` prop for slug-based S3 keys and auto-fill alt text), ConfirmDialog (modal with fixed centering and keyboard focus styles for a11y; `aria-describedby` wraps both message and items list; supports `items` list prop for bullet-point detail and `variant` prop — `'danger'` (red, default) or `'warning'` (gold)), Sidebar (collapsible navigation groups with Dashboard + Portfolio/Content/CRM/Settings sections, localStorage-persisted expanded state, auto-expand on child route navigation), TopBar (hamburger menu for mobile, hidden on desktop via CSS), DashboardShell (client wrapper for sidebar drawer with overlay, Escape key close, auto-close on desktop resize), DashboardClient (grouped stat cards in 3 sections — Portfolio/Content/CRM — with lucide-react icons in accent-colored circles, hover lift with neumorphic shadow transition, red notification dot for new contacts), StatusBadge, ToastProvider, SubmitButton, EditModeToggle, FormField, FormAlerts, AdminLocaleProvider (provides locale + sidebar open/close state, memoized context value), AdminPageHeader (responsive flex→column on mobile; supports single action via `actionKey`/`actionHref` or multiple actions via `actions` array with per-action `color`; exports shared `headerActionStyle`), ToggleButton, Tooltip (reusable help icons), DragHandleIcon (6-dot drag indicator SVG), SearchableSelect (type-to-filter dropdown with keyboard navigation, ARIA accessibility, visible keyboard focus indicator), AIContentEditor (blog content editor with AI optimization), AIBilingualTextarea (bilingual textarea with AI translation), AIProjectGenerator (project description generator with AI — includes memory leak prevention via mountedRef pattern).
- **Admin mobile responsive** (`app/admin/admin-responsive.css`): CSS-only mobile overrides at `@media (max-width: 768px)`. Uses `className` attributes alongside inline styles — `!important` overrides inline values on mobile. Classes: `admin-sidebar` (fixed drawer), `admin-sidebar--open` (slide in), `admin-sidebar-overlay` (backdrop), `admin-hamburger` (shown on mobile), `admin-topbar`/`admin-main-content` (reduced padding), `admin-form-grid` (single column), `admin-form-card` (full width), `admin-page-header` (vertical stack), `admin-site-detail-grid` (single column). Desktop: overlay and hamburger hidden via `display: none`. Body scroll lock via `body:has(.admin-sidebar--open)`. Defines `--color-navy` CSS variable for theme consistency. Includes `.confirm-dialog-btn:focus-visible` for keyboard accessibility.
- **Reusable hooks** (`hooks/`): `useDragReorder<T>` — generic drag-and-drop reordering with optimistic UI, server sync, and proper cleanup (mountedRef pattern to prevent state updates after unmount). Uses `DRAG_THRESHOLD_PX` constant (5px) to distinguish clicks from drags. `useIsMobile(breakpoint?)` — `matchMedia` hook with SSR-safe lazy initialization (prevents hydration mismatch), defaults to 768px. `useSaveWarning(formAction)` — manages pre-save warning dialog state (single `SaveWarningState` object); returns `{ showWarning, missingFields, requestSave, confirm, cancel }`; used by `ProjectForm` and `SiteForm` for optional field validation before submission.
- **House Stack UI**: Visual metaphor for site/project management. Roof = site, floors = project layers. Supports drag-and-drop reordering, keyboard navigation (Alt+Up/Down), and inline delete confirmation. Renders on `/admin/sites/[id]` page with detail panel for editing selected item. Supports `?project=<id>` URL param for deep-linking directly to a specific project's edit form, and `?new` for pre-selecting the new project form.
- **Sites admin list**: Two-tab UI — "All Sites" (expandable rows with child projects) and "Standalone Projects" (flat list of projects from non-whole-house sites). Page header uses `AdminPageHeader` with `actions` array for "New Standalone Project" (navy, links to `individual-projects` site with `?new`) and "New Site" (gold). `STANDALONE_SITE_SLUG` constant in `lib/admin/constants.ts`.
- **Hero image fallback**: `ProjectsPage` uses `reduce()` to build display projects from sites, resolving hero image as `site.hero_image || firstChildProject.hero_image`. Sites with no hero image at all are skipped.
- **Admin locale switching**: `AdminLocaleProvider` provides client-side locale + sidebar state context for admin panel. TopBar displays EN/ZH switcher buttons (gold highlight for active) and a hamburger menu (mobile only). Preference persists in localStorage (`admin_locale` key) with try/catch for private browsing mode. All list clients show bilingual content (titleEn/titleZh, questionEn/questionZh, etc.) based on selected locale. Uses `useAdminLocale()` hook which returns `{ locale, setLocale, sidebarOpen, setSidebarOpen }`. Does not affect SEO (admin is auth-protected).

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

## AI Content Optimization

The admin panel includes AI-powered content generation using OpenAI's GPT-4 models.

### Configuration (`lib/ai/openai.ts`)

```typescript
export const AI_CONFIG = {
  model: 'gpt-4o-mini',              // Default for short text, alt text
  modelContent: 'gpt-4o',             // Higher quality for blog content
  temperature: 0.3,
  maxTokensContent: 8192,             // Blog article optimization
  maxTokensBlogGeneration: 16384,     // Blog generation (bilingual 800-1200 words x2 + SEO in JSON)
  maxTokensShort: 1024,               // Short text translations
  maxTokensProjectDescription: 2048,  // Project descriptions + SEO (16 fields)
  maxTokensAltText: 256,              // Image alt text
  fetchTimeoutMs: 60000,
};
```

### Functions (`lib/ai/content-optimizer.ts`)

| Function | Purpose | Returns |
|----------|---------|---------|
| `optimizeContent(rawContent)` | Blog content optimization | `{ contentEn, contentZh, excerptEn, excerptZh, metaTitleEn, metaTitleZh, ... }` |
| `optimizeShortText(rawText)` | Short text translation | `{ textEn, textZh, detectedLanguage }` |
| `optimizeProjectDescription(rawNotes)` | Project description generation | `{ descriptionEn, descriptionZh, challengeEn, ..., metaTitleEn, seoKeywordsEn, ... }` |
| `generateAltText(image)` | Image alt text via vision | `{ altEn, altZh, isFallback? }` |

### Blog Generation (`lib/ai/blog-generator.ts`)

| Function | Purpose | Returns |
|----------|---------|---------|
| `generateBlogFromProjectData(project)` | Generate case study from single project | `BlogGeneration` (zod-validated) |
| `generateBlogFromSiteData(site, projects)` | Generate case study from whole-house site | `BlogGeneration` (zod-validated) |

`BlogGeneration` includes: bilingual title, content (semantic HTML), excerpt, SEO meta fields, focus/SEO keywords, reading time, and slug.

### Server Actions

**`app/actions/admin/optimize-content.ts`** — Content optimization actions (require admin auth):
- `optimizeBlogContent(rawContent)` — For blog post editing
- `optimizeProjectDescriptionAction(rawNotes)` — For project forms
- `generateImageAltText(imageUrl)` — For image uploads

**`app/actions/admin/generate-blog.ts`** — Blog generation actions (require admin auth):
- `generateBlogFromProject(projectId)` — Generate draft blog from single project
- `generateBlogFromSite(siteId)` — Generate draft blog from site + all child projects

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
| `AIBilingualTextarea` | Short text fields with AI translation button |
| `AIProjectGenerator` | Project form — paste notes, generates all text fields + SEO |

### Memory Leak Prevention

`AIProjectGenerator` uses the `mountedRef` pattern to prevent state updates after unmount:

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

## Image Upload

The admin panel supports direct image upload to S3-compatible storage (R2 in production, MinIO locally).

### Upload Action (`app/actions/admin/upload.ts`)

Server action behind `requireAuth()`. Accepts a `file` and optional `customKey` via FormData:

- **Custom key**: If `customKey` is provided, the S3 key becomes `uploads/admin/{customKey}.{ext}`. Sanitized to `/[a-z0-9-]/` only and capped at 200 chars.
- **Fallback**: Without `customKey`, uses `uploads/admin/{timestamp}-{random8}.{ext}`.
- **Validation**: Max 5 MB, allowed types: JPEG, PNG, WebP, SVG, GIF.

### SEO-Friendly Naming

When a slug is available in the form, image components pass a `customKey` to produce readable S3 keys:

| Component | Key Format | Example |
|-----------|------------|---------|
| `ImageUrlInput` | `{slug}-{imageRole}` | `richmond-kitchen-hero.webp` |
| `ImagePairEditor` (before) | `{slug}-before-renovation-{index}` | `richmond-kitchen-before-renovation-1.jpg` |
| `ImagePairEditor` (after) | `{slug}-after-renovation-{index}` | `richmond-kitchen-after-renovation-1.jpg` |

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

This prevents data loss on partial failure. Used by `updateProject()` and `updateSite()`.

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
