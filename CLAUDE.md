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
    areas/                # Service areas hub + [slug] pages
    blog/                 # Blog listing + [slug]
    contact/              # Contact form + thank-you
    benefits/             # Benefits page
    design/               # Design showcase
    process/              # 5-step renovation workflow page
    layout.tsx            # Locale layout (NextIntlClientProvider, Navbar, Footer)
    not-found.tsx         # Locale-aware 404 page
    error.tsx             # Public error boundary (neumorphic, bilingual)
  admin/                  # Admin dashboard (auth-protected)
    (auth)/               # Login page
    (dashboard)/          # CRUD pages (projects, blog, etc.)
    layout.tsx            # Admin shell with sidebar
  layout.tsx              # Root layout (metadata, viewport, pass-through to locale layout)
  not-found.tsx           # Root 404 fallback (no <html>/<body>)
  sitemap.ts              # Dynamic async sitemap (DB + static data)
  robots.ts               # robots.txt generator
  actions/
    contact.ts            # Server action: contact form submission
    admin/                # Admin CRUD actions (projects, blog, etc.)

components/
  pages/                  # Page-level components (one per route)
  home/                   # Homepage section components (14 files: Hero, ServiceAreas, Testimonials, GoogleAvatar, Gallery, Services, Stats, About, TrustBadges, Partners, FAQ, Blog, Showroom, Contact)
  admin/                  # Admin UI components (DataTable, ProjectForm, HouseStack, Tooltip, DragHandle, AdminLocaleProvider, TopBar, Sidebar, DashboardShell, AIContentEditor, AIFieldGenerator, AIProjectGenerator, AISiteGenerator, etc.)
  structured-data/        # JSON-LD schema components (12 schemas)
  Navbar.tsx, Footer.tsx, ContactForm.tsx, ProductLink.tsx, etc.

lib/
  ai/
    openai.ts             # Lazy-initialized OpenAI client
    content-optimizer.ts  # AI content optimization (blog HTML, project/site description+SEO generation, translation, alt text)
    blog-generator.ts     # AI blog generation from project/site data (GPT-4o, zod-validated)
  db/
    schema.ts             # Drizzle schema (15+ tables)
    index.ts              # Lazy DB client (Neon or pg Pool)
    queries.ts            # Cached query functions (company, services, projects, sites, areas, blog, gallery, badges, showroom) + admin queries
    helpers.ts            # Query aggregation helpers (budget, duration, images, products)
    seed.ts               # Database seed script (services, areas, company, showroom, badges, social, about, blog, gallery)
  data/
    index.ts              # Static assets (images, video, WORKSAFE_BC_LOGO), type re-exports, localization helpers (blog post, area)
    projects.ts           # Project localization helpers, category slugs, imagesToPairs() utility
    services.ts           # Service type mappings and localization helpers
    areas.ts              # Area localization helper (getLocalizedArea)
  admin/
    auth.ts               # Session cookie auth (24h TTL)
    form-utils.ts         # Form validation + image pair parsing (getString, isValidUrl, validateTextLengths, parseImagePairs, etc.)
    gallery-categories.ts # Shared gallery category constants
    constants.ts          # Shared constants (SERVICE_TYPES, SPACE_TYPES, STANDALONE_SITE_SLUG, mappings)
    translations.ts       # Admin translation hooks
    s3.ts                 # Shared S3 client singleton, S3_BUCKET constant, MIME_TO_EXT map
  batch/
    types.ts              # Batch upload types (ParsedSite, ParsedProject, ExtractedImage, etc.)
    zip-parser.ts         # Async ZIP parsing: folder structure detection, image pairing, service type detection
    batch-processor.ts    # Main pipeline: extract → upload → AI metadata → save → blog
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
  useSaveWarning.ts       # Pre-save warning dialog state for admin forms
  useBeforeUnload.ts      # Dirty-form navigation warning (beforeunload event)
  useFullscreenModal.ts   # Fullscreen modal a11y (scroll lock, focus trap, keyboard nav, return focus)

tests/
  unit/                   # Vitest unit tests
  e2e/                    # Playwright e2e tests
```

## Key Architecture Decisions

- **Locale prefix always:** Every URL includes `/en/` or `/zh/`.
- **Hybrid data model:** Company info, services, social links, about sections, **projects**, service areas, blog posts, gallery items, trust badges, partners, and showroom info are fetched from the database via `lib/db/queries.ts`. Homepage testimonials and structured data ratings are fetched from the Google Places API via `lib/google-reviews.ts` (24h cached, 5-star reviews only). Only `video`, `images`, and `WORKSAFE_BC_LOGO` constants (hardcoded asset URLs), project localization helpers, and the `imagesToPairs()` utility remain as static TypeScript in `lib/data/`.
- **Query layer:** `lib/db/queries.ts` provides cached async functions (`getCompanyFromDb`, `getSocialLinksFromDb`, `getServicesFromDb`, `getAboutSectionsFromDb`, `getProjectsFromDb`, `getProjectBySlugFromDb`, `getProjectSlugsFromDb`, `getSiteSlugsFromDb`, `getSitesAsProjectsFromDb`, `getServiceAreasFromDb`, `getBlogPostsFromDb`, `getBlogPostBySlugFromDb`, `getBlogPostSlugsFromDb`, `getGalleryItemsFromDb`, `getTrustBadgesFromDb`, `getShowroomFromDb`, `getFaqsFromDb`, `getPartnersFromDb`) using React `cache()` for request-level dedup. `getBlogPostBySlugFromDb` includes related project with external products when linked. `lib/db/helpers.ts` provides aggregation utilities (`collectAllImages`, `calculateCombinedBudget`, etc.) with `SITE_IMAGE_SLUG` sentinel for site-level images. Admin-only uncached queries: `getAllProjectsAdmin`, `getAllServicesAdmin`, `getAllBlogPostsAdmin`, `getAllContactsAdmin`, `getAllSocialLinksAdmin`, `getAllServiceAreasAdmin`, `getAllGalleryItemsAdmin`, `getAllTrustBadgesAdmin`, `getAllSitesAdmin`, `getAllPartnersAdmin`.
- **Layout structure:** Root layout (`app/layout.tsx`) is a pass-through that exports metadata (title, twitter) and viewport config; favicon auto-detected via file convention (`app/icon.png`, `app/apple-icon.png`). It does not render `<html>/<body>`. Locale layout (`app/[locale]/layout.tsx`) provides the single `<html lang={locale}>` and `<body>`, renders Navbar, Footer, and providers. Page components do not render Navbar/Footer.
- **Proxy (replaces middleware):** `proxy.ts` handles i18n routing (next-intl), admin auth (session cookies), and security headers (CSP, etc.). `middleware.ts` is deprecated in Next.js 16.
- **Lazy DB proxy:** `db` export uses a Proxy that only connects on first query. Safe to import at build time.
- **Dual DB driver:** `DATABASE_URL` containing `neon.tech` → Neon HTTP driver; otherwise → `pg` Pool.
- **Asset URL rewriting:** `getAssetUrl()` rewrites production URLs to MinIO when `NEXT_PUBLIC_STORAGE_PROVIDER=minio`.
- **Neumorphic design:** Warm beige surface (#E8E2DA), navy (#1B365D), gold (#C8922A) palette. `GOLD_ICON_FILTER` in `lib/theme.ts` tints black SVG icons to gold via CSS filter.
- **Unique slug generation:** `ensureUniqueSlug()` in `lib/utils.ts` auto-appends `-2`, `-3`, etc. when slugs collide. Used by `createProject()`, `updateProject()`, `createServiceArea()`, and blog generation actions. Blog generation additionally sanitizes AI-generated slugs via `sanitizeSlug()` before deduplication. `updateProject()` and `updateSite()` detect slug renames and return `renamedSlug` in the action response; `useFormToast` shows a bilingual warning toast via the `'warning'` toast type.
- **Insert-before-delete pattern:** Admin CRUD actions that update related records (image pairs, scopes, external products) use an insert-before-delete strategy instead of transactions. The Neon HTTP driver does not support interactive transactions, so actions fetch existing record IDs, insert new records first (old data remains as fallback if insert fails), then delete old records by ID. This prevents data loss on partial failure. Used by `updateProject()` and `updateSite()`. For `createSite()`, a rollback cleanup deletes the orphaned parent record if child insertion fails.
- **New project ordering:** `createProject()` queries `max(display_order_in_site)` for the target site and places the new project at `max + 1` (end of list). Users can then drag-reorder via the House Stack UI.

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
| `OPENAI_API_KEY` | No | OpenAI API key for AI content optimization in admin (blog, project forms, site forms) |

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
- `services` — 6 renovation service types (icons stored as `iconUrl` pointing to SVGs in `public/icons/services/`; old `iconName` column retained but unused)
- `service_areas` — 14 geographic areas
- `project_sites`, `site_image_pairs` — site containers for whole-house renovations with before/after image pairs and optional `po_number` for sales tracking
- `projects`, `project_image_pairs`, `project_scopes`, `project_external_products` — portfolio with before/after image pairs and optional `po_number` for sales tracking
- `blog_posts` — articles (with optional project reference for products display)
- `contact_submissions` — CRM leads with rate limiting
- `company_info`, `showroom_info`, `about_sections` — singleton config
- `partners` — partner logos with bilingual names, optional website URL, active/hidden-visually states
- `batch_upload_jobs` — tracks batch ZIP upload processing (jsonb columns for options, created IDs, errors; `batch_job_status` enum)
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
- **Root layout** (`app/layout.tsx`): Pass-through layout that exports `metadata` (title, twitter) and `viewport` config. Favicon auto-detected from `app/icon.png` and `app/apple-icon.png` (file convention). Does not render `<html>/<body>` — delegates to locale layout.
- **Locale layout** (`app/[locale]/layout.tsx`): Server Component that renders `<html lang={locale}>` and `<body>`, fetches shared data from DB + Google Reviews API (via `Promise.all`), and renders Navbar/Footer around page content.
- **Admin** (`app/admin/`): Auth-protected dashboard with CRUD for all 13 content types: projects, blog, contacts, company, services, social links, service areas, gallery, trust badges, FAQs, showroom, about sections, partners. Uses `components/admin/` (DataTable, HouseStack, ProjectForm, SiteForm, ImagePairEditor, Tooltip, DragHandleIcon, ConfirmDialog, DashboardShell, SubmitButton, EditModeToggle, FormField, FormAlerts, AdminLocaleProvider, etc.) and `app/actions/admin/`. Mobile-responsive via `app/admin/admin-responsive.css` (CSS-only overrides with `className` hooks on form grids/cards/headers).
- **ImagePairEditor** (`components/admin/ImagePairEditor.tsx`): Visual editor for before/after image pairs with collapsible SEO metadata sections (title, caption, photographer credit, keywords). Shows first 3 pairs by default with "Show All (N)" / "Show Less" toggle (`COLLAPSE_THRESHOLD = 3`); hidden form inputs always render for ALL pairs to preserve FormData. Supports drag-and-drop upload with gold spinner progress indicator (uses global `@keyframes admin-spin` from `admin-responsive.css`), bilingual alt text fields (with flag emoji labels), add/remove pairs, and reordering. Accepts optional `slug` prop for SEO-friendly upload naming (`{slug}-before-renovation-{index}-{ts}` where `ts` is a base-36 timestamp for unique URLs) and auto-fills empty alt text fields on upload (EN: `{Humanized Slug} - Before Renovation {index}`, ZH: `{Humanized Slug} - 装修前 {index}`). Uses `pairsRef` pattern to read latest state after async upload gap. Used by ProjectForm and SiteForm. Shared `parseImagePairs()` utility in `lib/admin/form-utils.ts` handles FormData parsing for both projects and sites.
- **ImageUrlInput** (`components/admin/ImageUrlInput.tsx`): URL input with drag-and-drop upload, image preview, and tooltip. Accepts optional `slug`, `imageRole` (default `'hero'`), and `disabled` props. SEO-friendly upload naming (`{slug}-{imageRole}-{ts}.{ext}` where `ts` is a base-36 timestamp ensuring unique URLs per upload). Upload area uses a detached file picker (`document.createElement('input')`) to bypass `<fieldset disabled>` and is hidden entirely in view mode.
- **BilingualInput** (`components/admin/BilingualInput.tsx`): Dual-mode (controlled/uncontrolled) bilingual text input with EN/ZH flag labels. Accepts optional `maxLength` prop that renders a color-coded character counter below each input (gray < 80%, gold 80-100%, red at limit) and a bilingual `(max N)` hint next to the label (via `t.common.maxLength`). Used with `maxLength` on SEO fields: metaTitle (`SEO_META_TITLE_MAX=70`), metaDescription (`SEO_META_DESCRIPTION_MAX=155`), focusKeyword (`SEO_FOCUS_KEYWORD_MAX=50`). Counter colors use `TEXT_MUTED`, `GOLD`, and `ERROR` from theme.
- **BilingualTextarea** (`components/admin/BilingualTextarea.tsx`): Dual-mode (controlled/uncontrolled) bilingual textarea with EN/ZH flag labels. Supports `valueEn`/`onChangeEn`/`valueZh`/`onChangeZh` for controlled mode (used by ProjectForm and SiteForm for AI-populated description fields) and `defaultValueEn`/`defaultValueZh` for uncontrolled mode. Accepts `disabled` and `rows` props.
- **ToastProvider** (`components/admin/ToastProvider.tsx`): Context-based toast notification system with three types: `'success'` (green), `'error'` (red), `'warning'` (gold). Uses `TOAST_COLORS` map for styling. Auto-dismisses after 4s. Catches unhandled server action / network errors globally via `unhandledrejection` listener.
- **useFormToast** (`components/admin/useFormToast.ts`): Hook that watches `useActionState` state changes and fires toasts. Shows success message on `state.success`, error on `state.error`, and a bilingual warning toast on `state.renamedSlug` (when `ensureUniqueSlug()` adjusts a slug). Accepts optional `options.slugRenameLabel` for i18n; callers pass `t.common.slugRenamed`.
- **Upload action** (`app/actions/admin/upload.ts`): S3 upload server action. Uses shared `getS3Client()` from `lib/admin/s3.ts` (cached singleton). Accepts optional `customKey` from FormData for slug-based naming; falls back to timestamp-random naming. `customKey` is sanitized server-side (`/[a-z0-9-]/` only, max 200 chars).
- **S3 client** (`lib/admin/s3.ts`): Shared S3 client singleton with lazy initialization (caches `S3Client` or `null`). Exports `getS3Client()`, `S3_BUCKET` constant, and `MIME_TO_EXT` map. Used by upload action, batch upload API route, and batch processor.
- **Batch upload** (`app/admin/(dashboard)/batch-upload/`): ZIP file upload that auto-creates sites, projects, image pairs, and blog posts. Client polls job status every 2s. Processing runs via `after()` from `next/server` to survive Vercel response send. Pipeline: extract ZIP (async `fflate`) → upload images to S3 (batches of 3, per-site slug prefix) → generate AI metadata (site/project descriptions + alt text in parallel batches of 5) → save to DB (with orphan cleanup for failed sites) → optional blog generation. Uses `batch_upload_jobs` table with jsonb columns for type-safe progress tracking. `BatchUploadClient.tsx` has 3-phase UI (upload → processing → results) with step indicators, progress bar, error details, and a "Download Example ZIP" link (`public/example-batch-upload.zip`).
- **House Stack UI**: Unified site/project management. Visual metaphor: roof = site, floors = project layers. Supports drag-and-drop reordering, keyboard navigation (Alt+Up/Down), and inline delete confirmation. Supports `?project=<id>` for deep-linking to a project's edit form, and `?new` for pre-selecting the new project form.
- **ProductLink component** (`components/ProductLink.tsx`): Shared component for external product links with hover image preview. Supports `size` prop ('sm' for modal, 'md' for detail page). Used in ProjectModal, SiteDetailPage, and BlogPostPage.
- **ProjectModal** (`components/ProjectModal.tsx`): Image-pairs gallery with click-to-toggle before/after. Uses `imagePairs[]`/`activePairIndex`/`showBefore` state model. Supports touch swipe, keyboard navigation (ArrowLeft/ArrowRight), slide animation (dual-key strategy: wrapper `key={activePairIndex}` for slide, Image `key` includes `showBefore` for swap). Navigation arrows hidden on mobile (`hidden sm:flex`), visible on desktop hover. Thumbnails show split before/after preview per pair. Falls back to `imagesToPairs()` for legacy flat images.
- **DisplayProject type** (`lib/types.ts`): Extended project type for display purposes. Can represent regular projects or sites displayed as "Whole House" projects with aggregated data (childAreas, totalBudget, totalDuration, allServiceScopes, allExternalProducts).
- **Reusable admin components**: `Tooltip` (hover help icons), `DragHandleIcon` (6-dot drag indicator SVG), `ConfirmDialog` (native `<dialog>` modal with centered positioning, CSS `:focus-visible` for keyboard a11y, focus trap via Tab/Shift+Tab cycling; supports `items` list prop for bullet-point detail and `variant` prop — `'danger'` (red, default) or `'warning'` (gold) — for non-destructive confirmations like missing optional fields or logout), `FormField` (label + input wrapper with optional tooltip), `SearchableSelect` (type-to-filter dropdown with keyboard navigation and ARIA accessibility — used for scalable dropdowns like related project in BlogPostForm and linked site in ProjectForm), `AdminPageHeader` (client component with bilingual title via dot-path translation resolver; supports single action via `actionKey`/`actionHref` or multiple actions via `actions` array with per-action `color`; optional `backHref`/`backLabelKey` props render a "Back to {page}" link with ChevronLeft icon above the title — used by all edit/new pages; exports shared `headerActionStyle`), `ToggleButton` (bilingual Yes/No toggle with pending state; defaults to `t.common.yes`/`t.common.no` from admin translations; accepts optional `activeLabel`/`inactiveLabel` overrides — used by blog, sites, gallery, service areas, trust badges, FAQs, and partners list pages), `DataTable` (sortable/searchable table with pagination; search-aware empty state shows `t.common.noResultsFor` with the query when filtering, `t.common.noRecords` otherwise; supports `dragReorder` prop for row reordering).
- **AI content editor components**: `AIContentEditor` (tabbed interface for blog content with paste/EN/ZH tabs, AI optimization, preview mode, excerpt generation). Uses OpenAI GPT-4o for language detection, translation, and content improvement. Uses DOMPurify for XSS protection in preview mode, zod for response validation. Respects `disabled` prop and syncs with form edit mode. Project/site description fields use `BilingualTextarea` in controlled mode (formerly `AIBilingualTextarea` with inline AI button, removed in favor of the top-level "AI Generate All" feature).
- **AI field generators**: `AIFieldGenerator<T>` (generic component — notes textarea + generate button with error/success feedback, `mountedRef` cleanup). `AIProjectGenerator` and `AISiteGenerator` are thin wrappers providing entity-specific server actions and translations. Both generate slug, bilingual titles, descriptions, badges, and full SEO metadata. Positioned at the top of their respective forms (before slug/title fields). Response validated with Zod schemas in `lib/ai/content-optimizer.ts`.
- **AI blog generation** (`lib/ai/blog-generator.ts` + `app/actions/admin/generate-blog.ts`): Generates bilingual case study blog posts from project/site data via GPT-4o. Server actions `generateBlogFromProject(id)` and `generateBlogFromSite(id)` fetch data with relations, call AI, validate with Zod, truncate SEO fields to DB limits, sanitize/deduplicate slugs, and insert unpublished drafts. Triggered from "Generate Blog Post" button on site detail admin page.
- **Slug validation**: `isValidSlug()` in `lib/admin/form-utils.ts` rejects consecutive hyphens (e.g., `a--b` is invalid). Uses regex `/^[a-z0-9]+(-[a-z0-9]+)*$/`.
- **useDragReorder hook** (`hooks/useDragReorder.ts`): Reusable drag-and-drop reordering logic with optimistic UI updates, server sync, and proper cleanup (mountedRef pattern). Uses `DRAG_THRESHOLD_PX` constant (5px) to distinguish clicks from drags. Used by `GalleryListClient` and `PartnersListClient` for card-grid reordering, and by `ServicesListClient`, `ServiceAreasListClient`, `FaqsListClient`, and `TrustBadgesListClient` for DataTable row reordering via the `DragReorderConfig` prop.
- **useIsMobile hook** (`hooks/useIsMobile.ts`): Mobile breakpoint detection with SSR-safe lazy initialization (prevents hydration mismatch). Defaults to 768px breakpoint.
- **useSaveWarning hook** (`hooks/useSaveWarning.ts`): Manages pre-save warning dialog state for admin forms. Single `SaveWarningState` object (`open`, `formData`, `missingFields`). Returns `{ showWarning, missingFields, requestSave, confirm, cancel }`. `requestSave(fd, missing)` shows the warning dialog if missing fields exist, otherwise submits directly via `startTransition`. Used by `ProjectForm`, `SiteForm`, and `BlogPostForm` for pre-save optional field validation.
- **useBeforeUnload hook** (`hooks/useBeforeUnload.ts`): Warns users before navigating away from forms with unsaved changes. Accepts a `dirty` boolean; attaches `beforeunload` event listener when true. Used by `ProjectForm`, `SiteForm`, and `BlogPostForm`. Dirty state is set via `<form onChange>` and reset on successful save (`state.success`).
- **useFullscreenModal hook** (`hooks/useFullscreenModal.ts`): Manages fullscreen image overlay accessibility. Accepts `{ isOpen, onClose, onPrev?, onNext? }`. Returns `{ overlayRef, triggerRef, captureTrigger }`. Encapsulates: body scroll lock (`document.body.style.overflow`), focus trap (Tab cycling on focusable elements), keyboard navigation (Escape → close, ArrowLeft → prev, ArrowRight → next), and return focus to trigger element on close. Used by `ProjectDetailPage` and `SiteDetailPage`.
- **Admin locale switching**: `AdminLocaleProvider` provides client-side locale + sidebar state context for admin panel. TopBar displays EN/ZH switcher buttons, hamburger menu (mobile only), and logout button with `ConfirmDialog` confirmation (`variant="warning"`). Preference persists in localStorage (`admin_locale` key) with try/catch for private browsing mode. All list clients (projects, blog, FAQs, gallery, service areas, trust badges) show bilingual content based on selected locale. Does not affect SEO (admin is auth-protected).
- **Admin mobile responsive**: `DashboardShell` (client component) wraps the dashboard layout with sidebar drawer (slide-out on mobile, always visible on desktop). Uses `prevMobileRef` to only close sidebar on mobile→desktop transition. `admin-responsive.css` overrides inline styles at `@media (max-width: 768px)` via `!important`. Form grids (`admin-form-grid`) collapse to single column; form cards (`admin-form-card`) go full-width; page headers stack vertically. Sidebar closes on: overlay click, Escape key, nav link click, resize to desktop. Defines `--color-navy` CSS variable, `.confirm-dialog-btn:focus-visible` for keyboard accessibility, and `@keyframes admin-spin` for shared loading spinners. Global `fieldset:disabled` rule removes inset shadows from inputs/textareas/selects in view mode.
- **Admin sidebar navigation**: Reorganized into 4 collapsible groups (Portfolio, Content, CRM, Settings) with Dashboard as standalone link. Groups expand/collapse on click with animated chevron. Settings is collapsed by default. Auto-expands when navigating to child routes. Expanded state persists in localStorage (`admin_sidebar_groups` key). Full accessibility: `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`. Group labels use CSS `text-transform: uppercase` for proper screen reader pronunciation.
- **Admin dashboard UI**: `DashboardClient` displays stats in 4 grouped sections (Portfolio/Content/CRM/Settings) with lucide-react icons in accent-colored circles. Stat cards show count numbers with hover lift animation (`translateY(-2px)` + `neu(4)`→`neu(8)` shadow transition). Settings section uses link-only cards (no count) for singleton pages (Company, Showroom, About). Unified `DashboardCard` component handles both layouts via optional `value` prop. Section heading and grid styles extracted to `sectionHeaderStyle`/`sectionGridStyle` constants. Welcome header replaces `AdminPageHeader`. Red notification dot (using `ERROR` from theme) on BellRing icon when `newContacts > 0`. "New Contacts" card links to `/admin/contacts?status=new` for pre-filtered view. Uses `INFO` from theme for Content section accent color.
- **Admin error/loading pages**: `error.tsx` and `loading.tsx` in `app/admin/(dashboard)/` are client components using `useAdminTranslations()` for bilingual text. Error page shows styled error message with "Try Again" button. Loading page displays an animated gold CSS spinner with "Loading..." text. Translation keys: `common.errorTitle`, `common.tryAgain`, `common.loading`, `common.unexpectedError`.
- **Structured data**: Added in server page route files, not in client components. Schema components accept `company` as a prop. Rating data comes from Google Reviews API (`googleRating`/`googleReviewCount` props) — no longer stored in the Company model. `aggregateRating` is conditionally rendered only when Google data is available. Includes: LocalBusinessSchema (layout, global aggregateRating), LocalBusinessAreaSchema (area pages), WebSiteSchema (layout, `SearchAction` for sitelinks search), ServiceSchema (service pages), ProjectSchema (`WebPage` with `mainEntity: Service` + `HomeAndConstructionBusiness` provider, project pages), ArticleSchema (`ImageObject` with width/height, blog), BreadcrumbSchema (all), FAQSchema (benefits + service pages), ReviewSchema (homepage, individual reviews only — no aggregate), HowToSchema (process page, 5-step renovation workflow with tools and total time), ContactPageSchema (contact page, `ContactPage` + `HomeAndConstructionBusiness` + `ContactPoint`). Shared `parseAddress()` utility in `components/structured-data/parse-address.ts` used by both `LocalBusinessSchema` and `ContactPageSchema`. Before/after image alt text uses bilingual fallbacks via `t('projects.beforeLabel')` / `t('projects.afterLabel')` with the project/site title.
- **ContactForm**: Reusable form with optional `large` prop (bigger text/inputs for elderly users). Tracks success timeout via `useRef` with cleanup on unmount. Surfaces server error messages via `result.message`.
- **Heading hierarchy**: H1 (page title) → H2 (sections) → H3 (list items). Use `sr-only` H2 where visually redundant but structurally needed.
- **CTA text**: Use service-specific text (e.g., `cta.exploreService`) instead of generic "Learn More".
- **Performance**: Wrap derived data in `useMemo`, event handlers in `useCallback`, inline arrays in `useMemo`. Use functional updater form for toggle state setters (`setX((prev) => !prev)`). Use `key={label}` instead of `key={value}` for stats/badges to avoid collisions. Server routes should use `Promise.all` to parallelize independent async calls (e.g., batch DB updates). Homepage uses `next/dynamic` for below-fold sections with skeleton fallbacks. Avoid Suspense on SEO-critical pages (homepage) to ensure crawlers receive full content.
- **Shared constants**: Use `lib/admin/constants.ts` for service types, space types, `STANDALONE_SITE_SLUG`, and their EN/ZH mappings. Export TypeScript union types (e.g., `ServiceTypeKey`) for type safety.
- **Pre-save warnings**: `ProjectForm` and `SiteForm` check for empty optional fields (hero image, image pairs, badge, SEO metadata including metaTitle, metaDescription, focusKeyword, seoKeywords, excerpt, etc.) before submission. If fields are missing, a `ConfirmDialog` with `variant="warning"` lists them and asks the user to confirm. Uses `onSubmit` handler with `startTransition` instead of `action` prop to support the intercept flow.
- **Collapsible list sections**: `ImagePairEditor`, ProjectForm scopes, and ProjectForm external products show only the first 3 items by default with "Show All (N)" / "Show Less" toggle (`COLLAPSE_THRESHOLD = 3`). Hidden form inputs always render for all items to preserve FormData submission. Translation keys: `common.showAll` / `common.showLess`.
- **Admin list page pattern**: All list pages (services, service areas, FAQs, trust badges, social links, gallery, partners, blog, projects) follow a standardized action column pattern: Edit link (`GOLD`) + Delete button (`ERROR`) with `0.5rem` gap and `justifyContent: 'flex-end'`. Delete triggers `ConfirmDialog` via `deleteId` state. Social links list includes `deleteSocialLink` server action. All list pages with `AdminPageHeader` include "Add New" buttons via `actionKey`/`actionHref`.
- **Admin landing page previews**: Several admin list/form pages include a "Landing Page Preview" section below the main content that mirrors the homepage component layout. Uses `SURFACE_ALT` background container with neumorphic cards. Preview text switches with admin locale (EN/ZH). Pages with previews: FAQs (expandable accordion), Services (icon + description cards), Service Areas (card grid + footer bar), Trust Badges (star icon cards), Gallery (`t.common.preview` with drag-to-reorder), Partners (`t.common.preview` with drag-to-reorder), About (3-column responsive card grid with gold divider bars and 3-line text clamp). Translation key pattern: `t.{entity}.landingPreview`.
- **CompanyForm section grouping**: `CompanyForm` groups 12 fields into 4 labeled sections (Business Info, Location, Legal, Marketing) with `SURFACE` background containers and uppercase `TEXT_MUTED` section headers. Uses extracted `sectionHeaderStyle` constant for DRY styling. Grid spacers use `aria-hidden="true"` for screen reader correctness.

## Homepage Section Order

Hero → Service Areas → Gallery → Services → Testimonials → Stats → About → Trust Badges → Partners → FAQ → Blog → Showroom CTA → Contact

## Known Issues

- `DATABASE_URL` is required at build time because `layout.tsx` fetches shared data from DB during pre-rendering. Use `pnpm dev:services` or set `DATABASE_URL` before building.
- `app/sitemap.ts` is now async and requires DB connection to fetch project slugs, site slugs, blog post slugs, and service areas.
