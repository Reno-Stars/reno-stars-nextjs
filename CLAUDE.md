# CLAUDE.md — Reno Stars Next.js

This file provides essential context for AI assistants. For detailed docs, see `docs/`.

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
pnpm dev                  # Dev server (Turbopack)
pnpm build                # Production build
pnpm lint                 # ESLint
pnpm typecheck            # tsc --noEmit
pnpm db:generate          # Generate Drizzle migrations
pnpm db:migrate           # Run migrations
pnpm db:push              # Push schema directly (dev)
pnpm db:studio            # Open Drizzle Studio
pnpm db:seed              # Seed database
pnpm db:seed:projects     # Import static projects into DB
pnpm db:seed:blog         # Crawl WordPress site for blog content
pnpm docker:up / down     # Start/stop Postgres + MinIO
pnpm docker:reset         # Destroy volumes and restart
pnpm dev:services         # docker:up + db:push + all seeds
pnpm test                 # Vitest watch
pnpm test:run             # Vitest single run
pnpm test:e2e             # Playwright headless
```

## Key Architecture Decisions

- **Rendering: SSG + admin-triggered redeploy webhook (since 2026-05-04).**
  Marketing pages are fully static — no ISR. Every URL is prerendered at
  build time via `generateStaticParams`. Admin content edits fire
  `triggerDeploy()` (lib/deploy-hook.ts) which calls Vercel's deploy hook;
  Vercel queues a fresh build, new content is live in ~2-4 minutes. ISR
  was removed from 36 page routes in commit 91d43e4 because the cost of
  scheduled re-writes (~$8.53/mo Vercel ISR Writes line) exceeded the
  benefit for a renovation marketing site where content updates run on a
  weekly cadence. The deploy webhook URL must be set as
  `VERCEL_DEPLOY_HOOK_URL` in Vercel production env vars (NOT preview/dev,
  which should leave it unset). Sitemap.ts and feed.xml/route.ts retain
  weekly ISR for crawler/RSS-subscriber freshness.
- **Locale prefix always:** Every URL includes `/en/` or `/zh/`.
- **Proxy (replaces middleware):** `proxy.ts` handles i18n routing, admin auth, security headers.
- **Lazy DB proxy:** `db` export uses a Proxy — safe to import at build time.
- **Dual DB driver:** `DATABASE_URL` containing `neon.tech` → Neon HTTP; otherwise → pg Pool.
- **Asset URL rewriting:** `getAssetUrl()` rewrites production URLs to MinIO when `NEXT_PUBLIC_STORAGE_PROVIDER=minio`.
- **Neumorphic design:** Warm beige (#E8E2DA), navy (#1B365D), gold (#C8922A). `GOLD_ICON_FILTER` in `lib/theme.ts`.
- **Unique slug generation:** `ensureUniqueSlug()` in `lib/utils.ts` auto-appends `-2`, `-3` on collision.
- **Insert-before-delete pattern:** CRUD actions insert new related records before deleting old ones (Neon doesn't support interactive transactions).
- **Homepage section order:** Hero → Gallery → Services → Testimonials → Stats → About → Trust Badges → Partners → FAQ → Blog → Showroom CTA → Contact
- **Heading hierarchy:** H1 (page title) → H2 (sections) → H3 (items). Use `sr-only` H2 where needed.
- **Performance:** `useMemo`/`useCallback` for derived data. `Promise.all` for parallel queries. `next/dynamic` for below-fold sections. No Suspense on SEO-critical pages.
- **Self-hosted image optimization:** `app/api/image/route.ts` uses `sharp` for resizing + WebP conversion (bypasses Vercel image quota). `OptimizedImage` component generates responsive `srcSet`. Shared breakpoints in `lib/image.ts`. `next.config.ts` keeps `unoptimized: true`.
- **Dynamic OG images:** `app/api/og/route.tsx` edge function generates branded 1200×630 images. `buildOgImageUrl()` in `lib/utils.ts` constructs the URL.
- **RSS feed:** `app/[locale]/feed.xml/route.ts` generates bilingual RSS 2.0 feeds with ISR.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_BASE_URL` | Yes | Canonical site URL |
| `NEXT_PUBLIC_STORAGE_PROVIDER` | No | `minio` for local dev |
| `S3_PUBLIC_URL` | No | Public S3 bucket URL |
| `GOOGLE_PLACES_API_KEY` | No | Google Places API for reviews |
| `GOOGLE_PLACE_ID` | No | Google Place ID |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | GA4 Measurement ID |
| `RESEND_API_KEY` | No | Contact form email |
| `EMAIL_FROM` / `EMAIL_TO` | No | Email sender/recipient |
| `OPENAI_API_KEY` | No | AI content optimization |
| `VERCEL_DEPLOY_HOOK_URL` | Prod-only | Vercel deploy hook URL — fired by admin actions to rebuild after content edits. Set in Vercel Production env only (leave preview/dev unset). |

## Known Issues

- `DATABASE_URL` required at build time (layout.tsx fetches from DB during pre-rendering).
- `app/sitemap.ts` requires DB connection for dynamic slugs.

## Detailed Documentation

Read these docs on-demand when working on the relevant area:

| Document | When to read |
|----------|-------------|
| [`docs/architecture.md`](docs/architecture.md) | Project structure, data model, query layer, routing |
| [`docs/database.md`](docs/database.md) | Schema, tables, migrations, seeding, query functions |
| [`docs/admin-components.md`](docs/admin-components.md) | Admin UI components, forms, hooks, upload flow, AI features, batch upload |
| [`docs/seo.md`](docs/seo.md) | Sitemap, structured data, redirects, meta tags, OG images |
| [`docs/i18n.md`](docs/i18n.md) | Bilingual content model, locale routing, translations |
| [`docs/local-dev.md`](docs/local-dev.md) | Docker setup, MinIO, storage seeding |
