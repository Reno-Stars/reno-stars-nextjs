# CLAUDE.md — Reno Stars Next.js

This file provides essential context for AI assistants. For detailed docs, see `docs/`.

## Project Overview

Bilingual (EN/ZH) renovation company website built with Next.js 16 App Router.

**Self-hosted (since mid-2026, migrated off Vercel).** Production runs as
`next start` on this Mac (launchd `com.renostars.reno-stars-web`, port 3000)
behind a Cloudflare Tunnel, backed by a **local PostgreSQL** instance
(`127.0.0.1:5435` — Neon retired). Local dev uses Docker (Postgres + MinIO).

**Deploy = rebuild + restart** (no Vercel git-push auto-deploy anymore):
`git pull` on `main` → `pnpm build` → `launchctl kickstart -k
gui/$(id -u)/com.renostars.reno-stars-web`, then verify HTTP 200 on
`http://127.0.0.1:3000/en/` and `https://www.reno-stars.com/en/`.

> **Self-hosting enables server-side background work.** Because production is a
> long-running Node process (not serverless), fire-and-forget promises actually
> complete after the response is sent. The Google-reviews cache uses this: a
> visit that finds the cache row >7 days stale triggers `refreshReviewsCache()`
> in the background (see `lib/google-reviews.ts`) — no external cron. Prefer this
> pattern over adding machine-local crons for site data.

Historical note: several architecture decisions below still reference Vercel
(ISR-Writes billing, image-quota bypass). Those explain *why* the current design
exists; the Vercel-specific costs no longer apply, but the designs remain sound.

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript 5.7
- **Styling:** Tailwind CSS 4 with neumorphic design system
- **Database:** Drizzle ORM → pg Pool against local PostgreSQL (`127.0.0.1:5435`) in prod and local dev. (Neon HTTP driver is retired but still auto-selected if `DATABASE_URL` contains `neon.tech` — see "Dual DB driver" below.)
- **i18n:** next-intl 4 — locales: `en`, `zh`, prefix: `always`
- **Testing:** Vitest (unit), Playwright (e2e)
- **Storage:** Production images on Cloudflare R2, local dev on MinIO (S3-compatible)

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

- **Rendering: ISR-on-visit + targeted on-demand revalidation (since 2026-06-04).**
  EN pages are prerendered at build time via `generateStaticParams`; the ~13k
  non-EN locale pages render lazily on first visit (`dynamicParams=true`) and
  detail routes carry `export const revalidate` so they refresh on a TTL floor.
  **Admin content edits do NOT trigger a deploy** — each server action fires
  *targeted* on-demand revalidation that touches only the pages the edit
  changed: `updateTag(...)` for tagged global/listing/detail data and
  `revalidatePathAllLocales('/projects/<slug>' | '/areas/<slug>')` (helper:
  `lib/seo/revalidate-paths.ts`) for the project/site detail pages, which read
  *untagged* `getProjectsFromDb` and so can only be refreshed by path. This
  replaced the old `triggerDeploy()` sledgehammer (removed with
  `lib/deploy-hook.ts` on 2026-06-04): every deploy wipes the entire ISR cache
  and forced all ~13k non-EN pages to regenerate on the next crawl — the
  dominant driver of the ~$84/mo ISR-Writes bill. Deploys now happen only on
  real code pushes. The external `/api/revalidate` endpoint (Bearer
  `REVALIDATE_SECRET`) gives the SEO agent the same per-page revalidation for
  direct-DB edits. `VERCEL_DEPLOY_HOOK_URL` is no longer fired by app code
  (leaving it set is harmless). Sitemap.ts and feed.xml/route.ts retain weekly
  ISR for crawler/RSS-subscriber freshness.
  **Documented ISR TTL floors (intentional, not drift):** the homepage
  (`app/[locale]/page.tsx`) and `/reviews/` (`app/[locale]/reviews/page.tsx`)
  carry `export const revalidate = 86400` (daily); blog 30d; projects/areas 7d.
  These are the no-edit refresh floors — on an actual edit the page surfaces
  immediately via the on-demand revalidation above. Any NEW build-time
  prerender-all-locales change must be flagged against this ISR-on-visit
  decision (it was tried 3× and rejected — see PR #115), not added silently.
- **Locale prefix always:** Every URL includes `/en/` or `/zh/`.
- **Proxy (replaces middleware):** `proxy.ts` handles i18n routing, admin auth, security headers.
- **Lazy DB proxy:** `db` export uses a Proxy — safe to import at build time.
- **Dual DB driver:** `DATABASE_URL` containing `neon.tech` → Neon HTTP; otherwise → pg Pool.
- **Asset URL rewriting:** `getAssetUrl()` rewrites production URLs to MinIO when `NEXT_PUBLIC_STORAGE_PROVIDER=minio`.
- **Neumorphic design:** Warm beige (#E8E2DA), navy (#1B365D), gold (#C8922A). `GOLD_ICON_FILTER` in `lib/theme.ts`.
- **Unique slug generation:** `ensureUniqueSlug()` in `lib/utils.ts` auto-appends `-2`, `-3` on collision.
- **Insert-before-delete pattern:** CRUD actions insert new related records before deleting old ones (originally because the Neon HTTP driver couldn't do interactive transactions; retained after the move to local Postgres).
- **Homepage section order:** Hero → **ZhTrustBand** (`ZhTrustLine`, zh / zh-Hant only — renders `null` on all other locales; added #171 as an owner-requested Chinese-market trust signal, **intentional — do not treat as drift and remove**) → AnswerBlock (What We Do + Services list, since #63 — GEO/AI-citability) → Gallery → Services → Testimonials → Stats → About → Trust Badges → Partners → Areas → Cost Guides → FAQ → Blog → Showroom CTA → Contact. (A floating `StickyHomeCta` mobile CTA also mounts last, outside the section flow.)
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
| `EMAIL_FROM` / `EMAIL_TO` | No | Email sender/recipient (TO supports comma-separated list) |
| `EMAIL_CC` | No | Comma-separated CC list. Defaults to `renostars.sylvia@gmail.com` so Sylvia sees new leads. Set to empty string to disable CC. |
| `OPENAI_API_KEY` | No | AI content optimization |
| `VERCEL_DEPLOY_HOOK_URL` | Unused | Legacy Vercel deploy-hook URL. No longer fired by app code as of 2026-06-04 (admin edits now use on-demand revalidation, not redeploy). Safe to leave set or remove. |
| `REVALIDATE_SECRET` | Prod-only | Bearer token for `POST /api/revalidate` — lets the SEO agent revalidate specific pages after direct-DB edits without a deploy. |

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
