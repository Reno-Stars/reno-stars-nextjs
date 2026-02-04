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
    layout.tsx            # NextIntlClientProvider wrapper
    page.tsx              # Homepage
    projects/             # Portfolio routes
    services/             # Service routes
    areas/                # Service area routes
    blog/                 # Blog routes
    contact/              # Contact form
    benefits/             # Benefits page
    design/               # Design showcase
  layout.tsx              # Root layout (fonts, metadata)
  not-found.tsx           # 404
  sitemap.ts              # Dynamic sitemap
  robots.ts               # robots.txt
  actions/                # Server Actions
    contact.ts            # Contact form submission

components/
  pages/                  # One component per page route
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
    queries.ts            # Cached async query functions (company, services, social, testimonials, about)
    seed.ts               # Seed script
  data/                   # Static data layer
    index.ts              # Images, video, gallery, blog posts, showroom, trust badges
    projects.ts           # 13 portfolio projects
    services.ts           # Service type mappings and localization helpers
    areas.ts              # 14 service areas
  storage.ts              # Asset URL rewriting (prod ↔ MinIO)
  types.ts                # Shared TypeScript types
  theme.ts                # Neumorphic design tokens
  utils.ts                # Utility functions

i18n/                     # Internationalization
  config.ts               # Locale definitions
  request.ts              # Server request handler

messages/                 # Translation JSON files
  en.json
  zh.json

scripts/
  seed-storage.ts         # MinIO asset seeder

tests/
  unit/                   # Vitest tests
  e2e/                    # Playwright tests
```

## Request Flow

```
Browser → Next.js Middleware (locale detection)
       → App Router ([locale] segment)
       → layout.tsx (fetches company, socialLinks, services from DB; renders Navbar/Footer)
       → Server page.tsx (fetches page-specific data from DB or static data)
       → Client page component hydrates (receives data as props)
```

## Data Architecture

The app uses a **hybrid static/database** model:

- **Database-driven** (`lib/db/queries.ts`): Company info, services, social links, testimonials, and about sections are fetched from PostgreSQL at runtime via cached async query functions. These use React `cache()` for per-request deduplication.
- **Static data** (`lib/data/`): Projects, areas, blog posts, gallery items, showroom info, and trust badges remain as hardcoded TypeScript arrays. The DB schema exists for these entities but is not yet used at runtime.
- **Asset URLs**: Wrapped with `getAssetUrl()` which rewrites production URLs to local MinIO when `NEXT_PUBLIC_STORAGE_PROVIDER=minio`.

### Query Layer (`lib/db/queries.ts`)

Five cached async functions fetch data from the database and return the same TypeScript types as the former static exports:

| Function | Returns | Notes |
|----------|---------|-------|
| `getCompanyFromDb()` | `Company` | Computes `yearsExperience` from `foundingYear` |
| `getSocialLinksFromDb()` | `SocialLink[]` | Filters `isActive`, orders by `displayOrder` |
| `getServicesFromDb()` | `Service[]` | Orders by `displayOrder`, applies `getAssetUrl()` |
| `getTestimonialsFromDb()` | `Testimonial[]` | Filters `isFeatured` |
| `getAboutSectionsFromDb()` | `AboutSections` | Replaces `{yearsExperience}` placeholder |

### Layout Data Flow

`app/[locale]/layout.tsx` is a Server Component that:
1. Fetches `company`, `socialLinks`, `services` from DB (via `Promise.all`)
2. Loads `areas` from static data (not yet migrated)
3. Renders `<Navbar>` and `<Footer>` with this data as props
4. Renders `<LocalBusinessSchema>` for JSON-LD structured data

Page components (`components/pages/`) do **not** render Navbar or Footer — they only render page content and receive data as props from their server page files.

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
- **Navbar**: Unified navigation with 6 links + Areas dropdown (14 cities). Receives `company` and `areas` as props from layout. Uses `useMemo` for link arrays, `useCallback` for locale switching, focus trap for mobile menu.
- **Footer**: 5-column grid (Brand & Social, Quick Links, Services, Contact, Why Us) + full-width Service Areas bar with 14 city links. Receives `company`, `socialLinks`, `services`, `areas` as props from layout. Custom SVG icons for Xiaohongshu, WeChat, WhatsApp.
- **Server vs Client**: Page route files (`app/[locale]/**/page.tsx`) are server components that fetch data from DB, handle metadata, and render structured data. Page content components (`components/pages/`) are client components that receive all data as props. Navbar and Footer are client components rendered by the layout.

## Database Connection

The `db` export in `lib/db/index.ts` uses a **Proxy** for lazy initialization:

1. Module import does **not** connect to the database
2. First property access (e.g., `db.select()`) triggers connection
3. Driver is selected based on `DATABASE_URL`:
   - Contains `neon.tech` → `@neondatabase/serverless` + `drizzle-orm/neon-http`
   - Otherwise → `pg` Pool + `drizzle-orm/node-postgres`

This pattern prevents build-time crashes at import time. Note that `DATABASE_URL` is still required at build time because `layout.tsx` and page components make DB queries during pre-rendering.
