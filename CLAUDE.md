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

# Docker (local services)
pnpm docker:up            # Start Postgres + MinIO
pnpm docker:down          # Stop services
pnpm docker:reset         # Destroy volumes and restart
pnpm storage:seed         # Seed MinIO with 21 assets from production
pnpm dev:services         # docker:up + db:push + db:seed + storage:seed

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
    layout.tsx            # Locale layout with NextIntlClientProvider
  layout.tsx              # Root layout (metadata, fonts)
  not-found.tsx           # 404 page
  sitemap.ts              # Dynamic sitemap generator
  robots.ts               # robots.txt generator
  actions/contact.ts      # Server action: contact form submission

components/
  pages/                  # Page-level components (one per route)
  structured-data/        # JSON-LD schema components
  Navbar.tsx, Footer.tsx, ContactForm.tsx, etc.

lib/
  db/
    schema.ts             # Drizzle schema (15+ tables)
    index.ts              # Lazy DB client (Neon or pg Pool)
    queries.ts            # Cached async query functions (company, services, social, testimonials, about)
    seed.ts               # Database seed script
  data/
    index.ts              # Static data: images, video, gallery, blog posts, showroom, trust badges
    projects.ts           # 15 project entries with bilingual content
    services.ts           # Service type mappings and localization helpers
    areas.ts              # 14 service area definitions
  storage.ts              # getAssetUrl() — rewrites URLs for local MinIO
  types.ts                # Core TypeScript types
  theme.ts                # Neumorphic design tokens + shadow helpers
  utils.ts                # String, array, date, validation utilities

i18n/
  config.ts               # Locale config, OG locale map
  request.ts              # next-intl server request handler

messages/
  en.json                 # English UI translations
  zh.json                 # Chinese UI translations

scripts/
  seed-storage.ts         # Downloads 21 assets → MinIO

tests/
  unit/                   # Vitest unit tests
  e2e/                    # Playwright e2e tests
```

## Key Architecture Decisions

- **Locale prefix always:** Every URL includes `/en/` or `/zh/`.
- **Hybrid data model:** Company info, services, social links, testimonials, and about sections are fetched from the database via `lib/db/queries.ts`. Projects, areas, blog posts, gallery, and showroom data remain as static TypeScript arrays in `lib/data/`.
- **Query layer:** `lib/db/queries.ts` provides 5 cached async functions (`getCompanyFromDb`, `getSocialLinksFromDb`, `getServicesFromDb`, `getTestimonialsFromDb`, `getAboutSectionsFromDb`) using React `cache()` for request-level dedup.
- **Layout-level shared components:** Navbar and Footer are rendered in `app/[locale]/layout.tsx` (Server Component) which fetches shared data from DB and passes it as props. Page components do not render Navbar/Footer.
- **Lazy DB proxy:** `db` export uses a Proxy that only connects on first query. Safe to import at build time.
- **Dual DB driver:** `DATABASE_URL` containing `neon.tech` → Neon HTTP driver; otherwise → `pg` Pool.
- **Asset URL rewriting:** `getAssetUrl()` rewrites production URLs to MinIO when `NEXT_PUBLIC_STORAGE_PROVIDER=minio`.
- **Neumorphic design:** Warm beige surface (#E8E2DA), navy (#1B365D), gold (#C8922A) palette.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_BASE_URL` | Yes | Canonical site URL |
| `NEXT_PUBLIC_STORAGE_PROVIDER` | No | Set to `minio` for local dev asset rewriting |

## Routing & Redirects

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
- `projects`, `project_images`, `project_scopes` — portfolio
- `blog_posts` — articles
- `contact_submissions` — CRM leads with rate limiting
- `company_info`, `showroom_info`, `about_sections` — singleton config
- `testimonials`, `gallery_items`, `trust_badges`, `social_links`

## Social Links

5 platforms configured in the database (seeded via `lib/db/seed.ts`): Xiaohongshu, WeChat, Instagram, Facebook, WhatsApp. Fetched at runtime via `getSocialLinksFromDb()`. Custom SVG icons for Xiaohongshu, WeChat, WhatsApp in `components/Footer.tsx`. WeChat uses `wechatId` (no link, tooltip only).

## Component Conventions

- **Navbar**: Unified, no variant props. 6 links + Areas dropdown. Receives `company` and `areas` props from layout.
- **Footer**: 5-column grid + service areas bar. Custom SVG icons for non-lucide platforms. Receives `company`, `socialLinks`, `services`, `areas` props from layout.
- **Page components** (`components/pages/`): All `'use client'`. Receive `locale` and `company` props (plus additional data props as needed). Do NOT render Navbar or Footer.
- **Layout** (`app/[locale]/layout.tsx`): Server Component that fetches shared data from DB and renders Navbar/Footer around page content.
- **Structured data**: Added in server page route files, not in client components. Schema components accept `company` as a prop.
- **Heading hierarchy**: H1 (page title) → H2 (sections) → H3 (list items).
- **CTA text**: Use service-specific text (e.g., `cta.exploreService`) instead of generic "Learn More".
- **Performance**: Wrap data calls in `useMemo`, event handlers in `useCallback` in client components.

## Known Issues

- `DATABASE_URL` is required at build time because `layout.tsx` fetches shared data from DB during pre-rendering. Use `pnpm dev:services` or set `DATABASE_URL` before building.
