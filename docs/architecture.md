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
    (dashboard)/          # CRUD pages (projects, blog, testimonials, etc.)
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
  admin/                  # Admin UI components (DataTable, ProjectForm, etc.)
  structured-data/        # JSON-LD schema components
  Navbar.tsx              # Global navigation (unified, no variants)
  Footer.tsx              # Global footer (5-column + service areas bar)
  ContactForm.tsx         # Contact form (client component)
  ProjectModal.tsx        # Project detail modal
  TetrisGallery.tsx       # Masonry gallery layout

lib/
  db/                     # Database layer
    schema.ts             # Drizzle table definitions
    index.ts              # Lazy-init DB client
    queries.ts            # Cached query functions (company, services, projects, etc.)
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
  storage.ts              # Asset URL rewriting (prod ↔ MinIO)
  types.ts                # Shared TypeScript types
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

- **Database-driven** (`lib/db/queries.ts`): Company info, services, social links, testimonials, about sections, projects, service areas, blog posts, gallery items, trust badges, and showroom info are all fetched from PostgreSQL at runtime via cached async query functions. These use React `cache()` for per-request deduplication.
- **Static data** (`lib/data/`): Only `video` and `images` constants (hardcoded asset URLs) and localization helpers (`getLocalizedBlogPost`, `getLocalizedArea`) remain as static TypeScript. `lib/data/projects.ts` retains localization helpers and category slug constants.
- **Asset URLs**: Wrapped with `getAssetUrl()` which rewrites production URLs to local MinIO when `NEXT_PUBLIC_STORAGE_PROVIDER=minio`.

### Query Layer (`lib/db/queries.ts`)

Cached async functions fetch data from the database and return the same TypeScript types as the former static exports:

| Function | Returns | Notes |
|----------|---------|-------|
| `getCompanyFromDb()` | `Company` | Computes `yearsExperience` from `foundingYear` |
| `getSocialLinksFromDb()` | `SocialLink[]` | Filters `isActive`, orders by `displayOrder` |
| `getServicesFromDb()` | `Service[]` | Orders by `displayOrder`, applies `getAssetUrl()` |
| `getTestimonialsFromDb()` | `Testimonial[]` | Filters `isFeatured` |
| `getAboutSectionsFromDb()` | `AboutSections` | Replaces `{yearsExperience}` placeholder |
| `getProjectsFromDb()` | `Project[]` | Published projects with images and scopes |
| `getProjectBySlugFromDb(slug)` | `Project \| null` | Single project lookup by slug |
| `getProjectSlugsFromDb()` | `string[]` | Published slugs for sitemap |
| `getServiceAreasFromDb()` | `ServiceArea[]` | Active areas, ordered by `displayOrder` |
| `getBlogPostsFromDb()` | `BlogPost[]` | Published posts, ordered by `publishedAt desc` |
| `getBlogPostBySlugFromDb(slug)` | `BlogPost \| null` | Single post lookup |
| `getBlogPostSlugsFromDb()` | `string[]` | Published slugs for sitemap (uncached) |
| `getGalleryItemsFromDb()` | `GalleryItem[]` | Published items, `getAssetUrl()` applied to images |
| `getTrustBadgesFromDb()` | `{ en: string; zh: string }[]` | Active badges, ordered by `displayOrder` |
| `getShowroomFromDb()` | `Showroom` | Singleton row |

Admin-only (uncached) query functions: `getAllProjectsAdmin()`, `getAllServicesAdmin()`, `getAllTestimonialsAdmin()`, `getAllBlogPostsAdmin()`, `getAllContactsAdmin()`, `getAllSocialLinksAdmin()`, `getAllServiceAreasAdmin()`, `getAllGalleryItemsAdmin()`, `getAllTrustBadgesAdmin()`.

### Slug Utilities (`lib/utils.ts`)

Project slugs are auto-deduplicated to prevent URL collisions:

```typescript
ensureUniqueSlug(slug, existingSlugs, excludeSlug?) → string
```

- If slug doesn't collide, returns it unchanged (clean URL)
- On collision, appends `-2`, `-3`, etc. until unique
- Used by `createProject()` and `updateProject()` admin actions
- `excludeSlug` param allows updates to keep their own slug without collision

### Layout Data Flow

**Root layout** (`app/layout.tsx`):
- Detects locale via `getLocale()` from next-intl/server
- Renders the single `<html lang={locale}>` and `<body>` wrapper for the entire app
- Prevents hydration mismatches by ensuring only one `<html>` element exists

**Locale layout** (`app/[locale]/layout.tsx`) is a Server Component that:
1. Fetches `company`, `socialLinks`, `services`, `areas` from DB (via `Promise.all`)
2. Renders `<Navbar>` and `<Footer>` with this data as props
3. Renders `<LocalBusinessSchema>` for JSON-LD structured data (receives `areas` prop)
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
  // ...
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
- **Structured data** (`components/structured-data/`): JSON-LD schema injected via `<script type="application/ld+json">`. Used in server page route files. Schema components accept `company` as a prop.
- **Navbar**: Unified navigation with 7 links (Home, Services, Projects, Design, Benefits, Contact, Blog & News) + Areas dropdown (14 cities). Receives `company` and `areas` as props from layout. Uses `useMemo` for link arrays, `useCallback` for locale switching, focus trap for mobile menu. Logo uses `priority` for faster LCP. Toggle state setters use functional updater form.
- **Footer**: 5-column grid (Brand & Social, Quick Links, Services, Contact, Why Us) + full-width Service Areas bar with 14 city links. Receives `company`, `socialLinks`, `services`, `areas` as props from layout. Custom SVG icons for Xiaohongshu, WeChat, WhatsApp.
- **ContactForm**: Reusable form component with `large` prop for accessibility (larger text/inputs for elderly users). Tracks success timeout via `useRef` with cleanup on unmount. Surfaces server error messages.
- **Server vs Client**: Page route files (`app/[locale]/**/page.tsx`) are server components that fetch data from DB, handle metadata, and render structured data. Page content components (`components/pages/`) are client components that receive all data as props. Navbar and Footer are client components rendered by the layout. Server routes should use `Promise.all` to parallelize independent async calls.
- **Admin components** (`components/admin/`): DataTable, ProjectForm, BilingualInput, BilingualTextarea, ImageUrlInput, ConfirmDialog, Sidebar, TopBar, StatusBadge, ToastProvider, SubmitButton, EditModeToggle, FormField, FormAlerts.

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
