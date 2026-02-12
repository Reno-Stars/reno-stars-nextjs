# CLAUDE.md — Reno Stars Next.js

This file provides context for AI assistants working on this codebase.

## Project Overview

Bilingual (EN/ZH) renovation company website built with Next.js 16 App Router.
Deployed on Vercel with Neon PostgreSQL. Local dev uses Docker (Postgres + MinIO).

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript 5.7
- **Styling:** Tailwind CSS 4 with neumorphic design system
- **Database:** Drizzle ORM → Neon (prod) / pg Pool (local)
- **i18n:** next-intl 4 — locales: `en`, `zh`, prefix: `always`
- **Testing:** Vitest (unit), Playwright (e2e)
- **Storage:** Production images on reno-stars.com, local dev on MinIO (S3-compatible)

## Commands

```bash
# Development
pnpm dev                  # Start dev server (Turbopack)
pnpm build                # Production build
pnpm start                # Start production server
pnpm lint                 # ESLint
pnpm typecheck            # tsc --noEmit

# Database
pnpm db:generate          # Generate Drizzle migrations
pnpm db:migrate           # Run migrations
pnpm db:push              # Push schema directly (dev)
pnpm db:studio            # Open Drizzle Studio
pnpm db:seed              # Seed database
pnpm db:seed:projects     # Import static projects into DB
pnpm db:seed:blog         # Crawl WordPress site for blog content (22 articles, EN + ZH)

# Docker (local services)
pnpm docker:up            # Start Postgres + MinIO
pnpm docker:down          # Stop services
pnpm docker:reset         # Destroy volumes and restart
pnpm storage:seed         # Seed MinIO with 21 assets from production
pnpm dev:services         # docker:up + db:push + db:seed + seed:projects + seed:blog + storage:seed

# Testing
pnpm test                 # Vitest watch mode
pnpm test:run             # Vitest single run
pnpm test:coverage        # Coverage report
pnpm test:e2e             # Playwright headless
pnpm test:e2e:ui          # Playwright with UI
```

## Project Structure

```
app/
  [locale]/               # Locale-prefixed routes (en, zh)
    page.tsx              # Homepage
    projects/             # Projects hub + [slug] + category pages
    services/             # Services hub + [slug] + [slug]/[city]
    areas/                # Service area pages
    blog/                 # Blog listing + [slug]
    contact/              # Contact form + thank-you
    benefits/             # Benefits page
    design/               # Design showcase
    process/              # 5-step renovation workflow page
    layout.tsx            # Locale layout (NextIntlClientProvider, Navbar, Footer)
    not-found.tsx         # Locale-aware 404 page
  admin/                  # Admin dashboard (auth-protected)
    (auth)/               # Login page
    (dashboard)/          # CRUD pages (projects, blog, etc.)
    layout.tsx            # Admin shell with sidebar
  layout.tsx              # Root layout (<html>/<body>, locale detection, metadata)
  not-found.tsx           # Root 404 fallback (no <html>/<body>)
  sitemap.ts              # Dynamic async sitemap (DB + static data)
  robots.ts               # robots.txt generator
  actions/
    contact.ts            # Server action: contact form submission
    admin/                # Admin CRUD actions (projects, blog, etc.)

components/
  pages/                  # Page-level components (one per route)
  home/                   # Homepage section components (13 files: Hero, ServiceAreas, Testimonials, GoogleAvatar, Gallery, Services, Stats, About, TrustBadges, FAQ, Blog, Showroom, Contact)
  admin/                  # Admin UI components (DataTable, ProjectForm, HouseStack, Tooltip, DragHandle, AdminLocaleProvider, TopBar, Sidebar, DashboardShell, AIContentEditor, AIBilingualTextarea, etc.)
  structured-data/        # JSON-LD schema components (9 schemas)
  Navbar.tsx, Footer.tsx, ContactForm.tsx, ProductLink.tsx, etc.

lib/
  ai/
    openai.ts             # Lazy-initialized OpenAI client
    content-optimizer.ts  # AI content optimization (semantic HTML, translation, excerpts)
  db/
    schema.ts             # Drizzle schema (15+ tables)
    index.ts              # Lazy DB client (Neon or pg Pool)
    queries.ts            # Cached query functions (company, services, projects, sites, areas, blog, gallery, badges, showroom) + admin queries
    helpers.ts            # Query aggregation helpers (budget, duration, images, products)
    seed.ts               # Database seed script (services, areas, company, showroom, badges, social, about, blog, gallery)
  data/
    index.ts              # Static assets (images, video), type re-exports, localization helpers (blog post, area)
    projects.ts           # Project localization helpers, category slugs
    services.ts           # Service type mappings and localization helpers
    areas.ts              # Area localization helper (getLocalizedArea)
  admin/
    auth.ts               # Session cookie auth (24h TTL)
    form-utils.ts         # Form validation + image pair parsing (getString, isValidUrl, validateTextLengths, parseImagePairs, etc.)
    gallery-categories.ts # Shared gallery category constants
    constants.ts          # Shared constants (SERVICE_TYPES, SPACE_TYPES, mappings)
    translations.ts       # Admin translation hooks
  google-reviews.ts       # Google Places API reviews (24h cached, 5-star only)
  email.ts                # Resend email notifications for contact form
  storage.ts              # getAssetUrl() — rewrites URLs for local MinIO
  types.ts                # Core TypeScript types
  theme.ts                # Neumorphic design tokens + shadow helpers
  utils.ts                # String, array, date, validation utilities, ensureUniqueSlug(), truncateMetaDescription()

proxy.ts                  # Request proxy (i18n routing + admin auth + security headers)

i18n/
  config.ts               # Locale config, OG locale map, routing
  request.ts              # next-intl server request handler

messages/
  en.json                 # English UI translations
  zh.json                 # Chinese UI translations

scripts/
  seed-storage.ts         # Downloads 21 assets → MinIO
  seed-projects.ts        # Import static projects into DB
  seed-blog.ts            # WordPress blog crawler (EN via REST API, ZH via HTML crawling)

hooks/
  useDragReorder.ts       # Reusable drag-and-drop reordering with optimistic UI
  useIsMobile.ts          # Mobile breakpoint detection hook

tests/
  unit/                   # Vitest unit tests
  e2e/                    # Playwright e2e tests
```

## Key Architecture Decisions

- **Locale prefix always:** Every URL includes `/en/` or `/zh/`.
- **Hybrid data model:** Company info, services, social links, about sections, **projects**, service areas, blog posts, gallery items, trust badges, and showroom info are fetched from the database via `lib/db/queries.ts`. Homepage testimonials and structured data ratings are fetched from the Google Places API via `lib/google-reviews.ts` (24h cached, 5-star reviews only). Only `video` and `images` constants (hardcoded asset URLs) and project localization helpers remain as static TypeScript in `lib/data/`.
- **Query layer:** `lib/db/queries.ts` provides cached async functions (`getCompanyFromDb`, `getSocialLinksFromDb`, `getServicesFromDb`, `getAboutSectionsFromDb`, `getProjectsFromDb`, `getProjectBySlugFromDb`, `getProjectSlugsFromDb`, `getSitesAsProjectsFromDb`, `getServiceAreasFromDb`, `getBlogPostsFromDb`, `getBlogPostBySlugFromDb`, `getBlogPostSlugsFromDb`, `getGalleryItemsFromDb`, `getTrustBadgesFromDb`, `getShowroomFromDb`) using React `cache()` for request-level dedup. `getBlogPostBySlugFromDb` includes related project with external products when linked. `lib/db/helpers.ts` provides aggregation utilities (`collectAllImages`, `calculateCombinedBudget`, etc.) with `SITE_IMAGE_SLUG` sentinel for site-level images. Admin-only uncached queries: `getAllProjectsAdmin`, `getAllServicesAdmin`, `getAllBlogPostsAdmin`, `getAllContactsAdmin`, `getAllSocialLinksAdmin`, `getAllServiceAreasAdmin`, `getAllGalleryItemsAdmin`, `getAllTrustBadgesAdmin`, `getAllSitesAdmin`.
- **Layout structure:** Root layout (`app/layout.tsx`) provides the single `<html>/<body>` with locale detection via `getLocale()`. Locale layout (`app/[locale]/layout.tsx`) renders Navbar, Footer, and providers without `<html>/<body>`. Page components do not render Navbar/Footer.
- **Proxy (replaces middleware):** `proxy.ts` handles i18n routing (next-intl), admin auth (session cookies), and security headers (CSP, etc.). `middleware.ts` is deprecated in Next.js 16.
- **Lazy DB proxy:** `db` export uses a Proxy that only connects on first query. Safe to import at build time.
- **Dual DB driver:** `DATABASE_URL` containing `neon.tech` → Neon HTTP driver; otherwise → `pg` Pool.
- **Asset URL rewriting:** `getAssetUrl()` rewrites production URLs to MinIO when `NEXT_PUBLIC_STORAGE_PROVIDER=minio`.
- **Neumorphic design:** Warm beige surface (#E8E2DA), navy (#1B365D), gold (#C8922A) palette.
- **Unique slug generation:** `ensureUniqueSlug()` in `lib/utils.ts` auto-appends `-2`, `-3`, etc. when slugs collide. Used by `createProject()`, `updateProject()`, and `createServiceArea()` admin actions.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_BASE_URL` | Yes | Canonical site URL |
| `NEXT_PUBLIC_STORAGE_PROVIDER` | No | Set to `minio` for local dev asset rewriting |
| `S3_PUBLIC_URL` | No | Public-facing URL for the S3 bucket (e.g., R2 or MinIO public URL). Used by image upload to build public URLs. Falls back to `NEXT_PUBLIC_STORAGE_PROVIDER` |
| `GOOGLE_PLACES_API_KEY` | No | Google Places API key for homepage reviews |
| `GOOGLE_PLACE_ID` | No | Google Place ID for the business location |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics 4 Measurement ID (e.g., `G-XXXXXXXXXX`) for tracking |
| `RESEND_API_KEY` | No | Resend API key for contact form email notifications |
| `EMAIL_FROM` | No | Sender email for notifications (must be verified in Resend) |
| `EMAIL_TO` | No | Recipient email(s) for contact form notifications |
| `OPENAI_API_KEY` | No | OpenAI API key for AI content optimization in admin (blog + project forms) |

## Routing & Proxy

`proxy.ts` replaces the deprecated `middleware.ts` (Next.js 16). Handles admin auth, i18n locale routing (next-intl), and security headers (CSP, X-Frame-Options, etc.).

`next.config.ts` contains 50+ redirect rules mapping old WordPress URLs to new routes.
Key patterns:
- `/project/:slug` → `/projects/:slug`
- `/have-a-project` → `/contact`
- `/vancouver-renovation-projects/:cat` → `/projects/:cat`
- Double locale prefix stripping (`/en/en/...` → `/en/...`)

## Database Schema

15+ tables in `lib/db/schema.ts`. Key tables:
- `services` — 6 renovation service types
- `service_areas` — 14 geographic areas
- `project_sites`, `site_image_pairs` — site containers for whole-house renovations with before/after image pairs
- `projects`, `project_image_pairs`, `project_scopes`, `project_external_products` — portfolio with before/after image pairs
- `blog_posts` — articles (with optional project reference for products display)
- `contact_submissions` — CRM leads with rate limiting
- `company_info`, `showroom_info`, `about_sections` — singleton config
- `testimonials` (deprecated — replaced by Google Reviews API), `gallery_items`, `trust_badges`, `social_links`, `faqs`

### Image Pair Tables

Both `project_image_pairs` and `site_image_pairs` use a paired before/after structure with SEO metadata:
- Before/after image URLs (at least one required via CHECK constraint)
- Bilingual alt text (`*_en`, `*_zh`)
- Bilingual title and caption for SEO
- Photographer credit and keywords
- Display order for sorting

## Social Links

5 platforms configured in the database (seeded via `lib/db/seed.ts`): Xiaohongshu, WeChat, Instagram, Facebook, WhatsApp. Fetched at runtime via `getSocialLinksFromDb()`. Custom SVG icons for Xiaohongshu, WeChat, WhatsApp in `components/Footer.tsx`. WeChat uses `wechatId` (no link, tooltip only).

## Component Conventions

- **Navbar**: Unified, no variant props. 8 links (Home, Services, Projects, Design, Benefits, Contact, Process, Blog & News) + Areas dropdown. Receives `company` and `areas` props from layout.
- **Footer**: 5-column grid + service areas bar. Custom SVG icons for non-lucide platforms. Receives `company`, `socialLinks`, `services`, `areas` props from layout.
- **Page components** (`components/pages/`): All `'use client'`. Receive `locale` and `company` props (plus additional data props as needed). Do NOT render Navbar or Footer.
- **Root layout** (`app/layout.tsx`): Provides `<html lang={locale}>` and `<body>`. Detects locale via `getLocale()` from next-intl/server.
- **Locale layout** (`app/[locale]/layout.tsx`): Server Component that fetches shared data from DB + Google Reviews API (via `Promise.all`) and renders Navbar/Footer around page content. Does NOT render `<html>/<body>`.
- **Admin** (`app/admin/`): Auth-protected dashboard with CRUD for all 12 content types: projects, blog, contacts, company, services, social links, service areas, gallery, trust badges, FAQs, showroom, about sections. Uses `components/admin/` (DataTable, HouseStack, ProjectForm, SiteForm, ImagePairEditor, Tooltip, DragHandleIcon, ConfirmDialog, DashboardShell, SubmitButton, EditModeToggle, FormField, FormAlerts, AdminLocaleProvider, etc.) and `app/actions/admin/`. Mobile-responsive via `app/admin/admin-responsive.css` (CSS-only overrides with `className` hooks on form grids/cards/headers).
- **ImagePairEditor** (`components/admin/ImagePairEditor.tsx`): Visual editor for before/after image pairs with collapsible SEO metadata sections (title, caption, photographer credit, keywords). Supports drag-and-drop upload, bilingual alt text fields (with flag emoji labels), add/remove pairs, and reordering. Accepts optional `slug` prop for SEO-friendly upload naming (`{slug}-before-renovation-{index}`) and auto-fills empty alt text fields on upload (EN: `{Humanized Slug} - Before Renovation {index}`, ZH: `{Humanized Slug} - 装修前 {index}`). Uses `pairsRef` pattern to read latest state after async upload gap. Used by ProjectForm and SiteForm. Shared `parseImagePairs()` utility in `lib/admin/form-utils.ts` handles FormData parsing for both projects and sites.
- **ImageUrlInput** (`components/admin/ImageUrlInput.tsx`): URL input with drag-and-drop upload, image preview, and tooltip. Accepts optional `slug` and `imageRole` (default `'hero'`) props for SEO-friendly upload naming (`{slug}-{imageRole}.{ext}`).
- **Upload action** (`app/actions/admin/upload.ts`): S3 upload server action. Accepts optional `customKey` from FormData for slug-based naming; falls back to timestamp-random naming. `customKey` is sanitized server-side (`/[a-z0-9-]/` only, max 200 chars).
- **House Stack UI**: Unified site/project management. Visual metaphor: roof = site, floors = project layers. Supports drag-and-drop reordering, keyboard navigation (Alt+Up/Down), and inline delete confirmation.
- **ProductLink component** (`components/ProductLink.tsx`): Shared component for external product links with hover image preview. Supports `size` prop ('sm' for modal, 'md' for detail page). Used in ProjectModal, SiteDetailPage, and BlogPostPage.
- **DisplayProject type** (`lib/types.ts`): Extended project type for display purposes. Can represent regular projects or sites displayed as "Whole House" projects with aggregated data (childAreas, totalBudget, totalDuration, allServiceScopes, allExternalProducts).
- **Reusable admin components**: `Tooltip` (hover help icons), `DragHandleIcon` (6-dot drag indicator SVG), `ConfirmDialog` (modal with centered positioning, CSS `:focus-visible` for keyboard a11y), `FormField` (label + input wrapper with optional tooltip), `SearchableSelect` (type-to-filter dropdown with keyboard navigation and ARIA accessibility — used for scalable dropdowns like related project in BlogPostForm and linked site in ProjectForm).
- **AI content editor components**: `AIContentEditor` (tabbed interface for blog content with paste/EN/ZH tabs, AI optimization, preview mode, excerpt generation) and `AIBilingualTextarea` (simpler bilingual textarea with inline AI button for project descriptions/challenges/solutions). Both use OpenAI GPT-4o for language detection, translation, and content improvement. Uses DOMPurify for XSS protection in preview mode, zod for response validation. Respects `disabled` prop and syncs with form edit mode.
- **Slug validation**: `isValidSlug()` in `lib/admin/form-utils.ts` rejects consecutive hyphens (e.g., `a--b` is invalid). Uses regex `/^[a-z0-9]+(-[a-z0-9]+)*$/`.
- **useDragReorder hook** (`hooks/useDragReorder.ts`): Reusable drag-and-drop reordering logic with optimistic UI updates, server sync, and proper cleanup (mountedRef pattern). Uses `DRAG_THRESHOLD_PX` constant (5px) to distinguish clicks from drags. Used by `GalleryListClient` for drag-to-reorder functionality.
- **useIsMobile hook** (`hooks/useIsMobile.ts`): Mobile breakpoint detection with SSR-safe lazy initialization (prevents hydration mismatch). Defaults to 768px breakpoint.
- **Admin locale switching**: `AdminLocaleProvider` provides client-side locale + sidebar state context for admin panel. TopBar displays EN/ZH switcher buttons and hamburger menu (mobile only). Preference persists in localStorage (`admin_locale` key) with try/catch for private browsing mode. All list clients (projects, blog, FAQs, gallery, service areas, trust badges) show bilingual content based on selected locale. Does not affect SEO (admin is auth-protected).
- **Admin mobile responsive**: `DashboardShell` (client component) wraps the dashboard layout with sidebar drawer (slide-out on mobile, always visible on desktop). Uses `prevMobileRef` to only close sidebar on mobile→desktop transition. `admin-responsive.css` overrides inline styles at `@media (max-width: 768px)` via `!important`. Form grids (`admin-form-grid`) collapse to single column; form cards (`admin-form-card`) go full-width; page headers stack vertically. Sidebar closes on: overlay click, Escape key, nav link click, resize to desktop. Defines `--color-navy` CSS variable and `.confirm-dialog-btn:focus-visible` for keyboard accessibility.
- **Admin sidebar navigation**: Reorganized into 4 collapsible groups (Portfolio, Content, CRM, Settings) with Dashboard as standalone link. Groups expand/collapse on click with animated chevron. Settings is collapsed by default. Auto-expands when navigating to child routes. Expanded state persists in localStorage (`admin_sidebar_groups` key). Full accessibility: `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`. Group labels use CSS `text-transform: uppercase` for proper screen reader pronunciation.
- **Admin dashboard UI**: `DashboardClient` displays stats in 3 grouped sections (Portfolio/Content/CRM) with lucide-react icons in 40px accent-colored circles. Cards have hover lift animation (`translateY(-2px)` + `neu(4)`→`neu(8)` shadow transition). Welcome header replaces `AdminPageHeader`. Red notification dot (using `ERROR` from theme) on BellRing icon when `newContacts > 0`. Uses `INFO` from theme for Content section accent color.
- **Structured data**: Added in server page route files, not in client components. Schema components accept `company` as a prop. Rating data comes from Google Reviews API (`googleRating`/`googleReviewCount` props) — no longer stored in the Company model. `aggregateRating` is conditionally rendered only when Google data is available. Includes: LocalBusinessSchema (layout, global aggregateRating), LocalBusinessAreaSchema (area pages), ServiceSchema (service pages), ProjectSchema (project pages), ArticleSchema (blog), BreadcrumbSchema (all), FAQSchema (benefits + service pages), ReviewSchema (homepage, individual reviews only — no aggregate).
- **ContactForm**: Reusable form with optional `large` prop (bigger text/inputs for elderly users). Tracks success timeout via `useRef` with cleanup on unmount. Surfaces server error messages via `result.message`.
- **Heading hierarchy**: H1 (page title) → H2 (sections) → H3 (list items). Use `sr-only` H2 where visually redundant but structurally needed.
- **CTA text**: Use service-specific text (e.g., `cta.exploreService`) instead of generic "Learn More".
- **Performance**: Wrap derived data in `useMemo`, event handlers in `useCallback`, inline arrays in `useMemo`. Use functional updater form for toggle state setters (`setX((prev) => !prev)`). Use `key={label}` instead of `key={value}` for stats/badges to avoid collisions. Server routes should use `Promise.all` to parallelize independent async calls (e.g., batch DB updates). Homepage uses `next/dynamic` for below-fold sections with skeleton fallbacks. Avoid Suspense on SEO-critical pages (homepage) to ensure crawlers receive full content.
- **Shared constants**: Use `lib/admin/constants.ts` for service types, space types, and their EN/ZH mappings. Export TypeScript union types (e.g., `ServiceTypeKey`) for type safety.

## Homepage Section Order

Hero → Service Areas → Gallery → Services → Testimonials → Stats → About → Trust Badges → FAQ → Blog → Showroom CTA → Contact

## Known Issues

- `DATABASE_URL` is required at build time because `layout.tsx` fetches shared data from DB during pre-rendering. Use `pnpm dev:services` or set `DATABASE_URL` before building.
- `app/sitemap.ts` is now async and requires DB connection to fetch project slugs, blog post slugs, and service areas.
