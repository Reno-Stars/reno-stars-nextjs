# CLAUDE.md — Reno Stars Next.js

This file provides essential context for AI assistants. For detailed docs, see `docs/`.

## Project Overview

Bilingual (EN/ZH) renovation company website built with Next.js 16 App Router.

**Runs on the Enter OS k3s cluster (`ns/reno-stars`) since 2026-08-15.** NOT on
this Mac. The launchd service `com.renostars.reno-stars-web` is booted out and
`127.0.0.1:3000` / `127.0.0.1:5435` are dead — anything still pointing there is
broken. Postgres is `renostars-website-pg-0` in-cluster; www is served through
the cluster Cloudflare tunnel `f6974f01-…`. Local dev still uses Docker.

**Deploy = merge → Gitea builds → merge the deploy PR → CD applies.**
Push to `main` on GitHub → the Gitea mirror picks it up (`mirror-sync` to skip
the ≤10 min poll) → `.gitea/workflows/build.yml` builds and pushes
`registry.enteros.ai/reno-stars/reno-stars-web:<sha12>` → `propose-deploy` opens
a PR on `Reno-Stars/reno-stars-infra` → **merge it** → `cronjob/reno-stars-cd`
(*/5) applies. Merging your own deploy PR is expected; no human gate.

> ⚠️ **A merged deploy PR can be a SILENT NO-OP.** The namespace runs at ~99% of
> its ResourceQuota, and with `replicas: 2` the default rollingUpdate values
> deadlock (maxSurge 25% rounds UP to 1, maxUnavailable 25% rounds DOWN to 0), so
> a rollout needs a third pod the quota refuses. Git says the tag moved, the
> Deployment reports `Available=True`, the old pods keep serving, and nothing
> alerts. The manifest now pins `maxSurge: 0, maxUnavailable: 1`. **Always finish
> a deploy with `kubectl rollout status` and confirm
> `updatedReplicas == spec.replicas`, then read a byte back off the live site.**

> ⚠️ **Cloudflare caches HTML at the edge (`s-maxage=300`).** After a deploy the
> cached page carries a stale Server Action id and form submissions fail with
> *"Failed to find Server Action"* until it expires or is purged. Purging needs
> `CLOUDFLARE_API_TOKEN`; verify it resolves after any deploy that changes a
> server action.

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
- **Database:** Drizzle ORM → pg Pool. Production is `renostars-website-pg-0` in-cluster; local dev is Docker on `127.0.0.1:5435`. (Neon HTTP driver is retired but still auto-selected if `DATABASE_URL` contains `neon.tech` — see "Dual DB driver" below.)
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
pnpm site-visit:sync      # Pull quoting catalog → data/site-visit/catalog.json
pnpm site-visit:check     # Verify committed catalog against authored copy (CI-safe)
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
- **Site-visit checklist (`/[locale]/site-visit-checklist/`) — internal, noindex.** An
  ops tool for staff doing client site visits: pick scope → job type → add-ons, and
  the page renders only the checks that scope needs. Its structure is **generated from
  the quoting system**, not hand-maintained: `reno-stars-invoice-service/tools/export-site-visit-catalog.ts`
  walks every model factory and modifier, diffs the step keys, and emits JSON;
  `pnpm site-visit:sync` pulls that into `data/site-visit/catalog.json` and **fails if
  any catalog step lacks authored checks** in `messages/en/siteVisit.json`. So adding a
  modifier to the quoting system surfaces as a loud sync/test failure rather than a
  checklist that silently omits the new work. Committed artifact — no runtime
  dependency on the invoice service. The route is deliberately absent from
  `lib/sitemap/sections.ts` and carries `robots: {index:false}`; it is intentionally **not** in
  `robots.ts` disallow, because a disallow would stop crawlers reading the noindex.
  Chinese trade terms are repaired post-translation by
  `scripts/fix-site-visit-zh-glossary.mjs` (gtx renders "vanity" as 虚荣 and "paint" as 画).

## Secrets — how a value reaches the running app

`lib/secrets.ts` `getSecret(name)` resolves in THREE tiers, in order:

1. **`process.env`** — whatever the ExternalSecret maps in. Wins always, so an
   operator can override anything and local dev/CI need no vault access.
2. **Infisical** (`key.enteros.ai`, project `reno-stars-2p-t5`, env `prod`, path
   `/web`) — needs `INFISICAL_CLIENT_ID` / `INFISICAL_CLIENT_SECRET` in the pod.
   Cached 5 min, 30s failure backoff, serves stale during an outage.
3. **`app_secrets` table** — TEMPORARY bridge, see `scripts/create-app-secrets.sql`.

> ⚠️ **Writing a value into Infisical does NOT deliver it to the pod** unless the
> key is named in the `reno-stars-web-secrets` ExternalSecret, which only the
> platform operator can edit. That two-system gap is why the 2026-08-14 migration
> left **25 of 34 runtime variables undeliverable** and the contact form silently
> discarded 7 customer enquiries for 20 days. Tier 3 exists solely to route
> around it and self-retires once tier 1 or 2 can answer.
> Asks: `reno-stars-infra#184`, `molecule-ai/operator-config#812`.

**`NEXT_PUBLIC_*` cannot come from any tier** — Next inlines them at BUILD time.
Their production values are `Dockerfile` ARG defaults (lines 53-58), which is why
GA4, Google Ads conversion and Clarity kept working through the outage.

**Is the deployment actually configured?** `GET /api/health/config` → 200, or 503
naming the degraded capabilities. Add `Authorization: Bearer $REVALIDATE_SECRET`
for the specific variable names. The blackbox probe checks it every 300s.
A missing variable fails at FIRST USE, not at boot, so liveness cannot see it.

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
| `RESEND_API_KEY` | **Yes (prod)** | Contact form email. Absent = leads accepted and never delivered. |
| `ODOO_BASE_URL` / `ODOO_API_KEY` / `ODOO_DB` | **Yes (prod)** | CRM lead ingestion (`crm.lead/ingest_web_lead`). |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ZONE_ID` | **Yes (prod)** | Edge cache purge. Absent = purge is a silent no-op and post-deploy HTML goes stale. |
| `INFISICAL_CLIENT_ID` / `INFISICAL_CLIENT_SECRET` | Prod | Machine identity for the vault tier of `lib/secrets.ts`. |
| `BLOG_API_SECRET` | Prod | Blog publish API. |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` / `S3_BUCKET` / `S3_ENDPOINT` | Prod | Admin image uploads. |
| `TELEGRAM_BOT_TOKEN` | Prod | Dead-letter alerts when a lead reaches no channel. |
| `EMAIL_FROM` / `EMAIL_TO` | No | Email sender/recipient (TO supports comma-separated list) |
| `EMAIL_CC` | No | Comma-separated CC list. Defaults to `renostars.sylvia@gmail.com` so Sylvia sees new leads. Set to empty string to disable CC. |
| `OPENAI_API_KEY` | No | AI content optimization |
| `VERCEL_DEPLOY_HOOK_URL` | Unused | Legacy Vercel deploy-hook URL. No longer fired by app code as of 2026-06-04 (admin edits now use on-demand revalidation, not redeploy). Safe to leave set or remove. |
| `REVALIDATE_SECRET` | Prod-only | Bearer token for `POST /api/revalidate` — lets the SEO agent revalidate specific pages after direct-DB edits without a deploy. |
| `WEBMCP_ORIGIN_TRIAL_TOKEN` | Prod-only | Chrome WebMCP origin-trial token (www.reno-stars.com, **expires 2026-11-16** — renew at developer.chrome.com/origintrials). Emitted as an `origin-trial` meta tag by the locale layout; activates the native `document.modelContext` so agents + Lighthouse see the WebMCP tools registered by `WebMcpTools`. |

## Known Issues

- `DATABASE_URL` required at build time (layout.tsx fetches from DB during pre-rendering).
- The sitemap requires a DB connection for dynamic slugs (`lib/sitemap/data.ts`).
- **The apex `reno-stars.com` returns 530 on every path except `/`** — its DNS
  record still points at the retired Mac tunnel `aa755801-…`. A root-only
  Cloudflare redirect rule masks it at `/`. Needs a `DNS:Edit` token or the
  dashboard; neither the Argo tunnel token nor `CLOUDFLARE_API_TOKEN`
  (cache-purge scope) can change it. Use `www.` for anything that must work.
- **`ns/reno-stars` is at ~99% of its ResourceQuota** (40704Mi/40Gi,
  31750m/32 CPU across 28 pods). Deploys fit only because the web deployment
  rolls by replacement. Raising replicas or adding a service needs a quota
  increase (`reno-stars-infra#181`).
- **The database default ACL auto-grants `agent_ro` SELECT on every new table**
  created by `renostars` (`renostars | r | {agent_ro=r/renostars}`), and
  `agent_ro` is served publicly by `api.reno-stars.com`. **Any new table holding
  secrets or customer PII must `REVOKE ALL ... FROM agent_ro` explicitly.**

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
