# Reno Stars

Bilingual (English / Chinese) website for [Reno Stars](https://reno-stars.com), a Vancouver-area renovation company. Built with Next.js 16, React 19, and Tailwind CSS 4.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** with TypeScript 5.7 (strict)
- **Tailwind CSS 4** — neumorphic design system
- **Drizzle ORM** → PostgreSQL (Neon in production, pg Pool locally)
- **next-intl** — bilingual routing (`/en/`, `/zh/`)
- **Vitest** + **Playwright** — unit and e2e testing

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.local.example .env.local

# Start local services (Postgres + MinIO), push schema, and seed data
pnpm dev:services

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local Development

Docker Compose provides PostgreSQL 16 and MinIO (S3-compatible storage):

```bash
pnpm docker:up        # Start Postgres + MinIO
pnpm docker:down      # Stop services
pnpm docker:reset     # Wipe volumes and restart
pnpm dev:services     # Start + push schema + seed DB + seed assets
```

MinIO console: [http://localhost:9001](http://localhost:9001) (minioadmin / minioadmin)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript type check |
| `pnpm test` | Unit tests (watch) |
| `pnpm test:run` | Unit tests (single run) |
| `pnpm test:e2e` | E2E tests (Playwright) |
| `pnpm db:push` | Push schema to database |
| `pnpm db:seed` | Seed database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm storage:seed` | Seed MinIO with production assets |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_BASE_URL` | Yes | Canonical site URL |
| `STORAGE_PROVIDER` | No | Set to `minio` for local asset rewriting |
| `MINIO_ORIGIN` | No | MinIO base URL (default: `http://localhost:9000/reno-stars`) |

## Project Structure

```
app/[locale]/          Route pages (en, zh)
components/            React components (pages/, structured-data/)
lib/db/                Drizzle schema, seed, lazy DB client
lib/data/              Static data (projects, services, areas)
lib/storage.ts         Asset URL rewriting (prod ↔ MinIO)
i18n/                  Locale config and request handler
messages/              Translation JSON (en.json, zh.json)
scripts/               Seed and build scripts
tests/                 Unit (Vitest) and e2e (Playwright) tests
docs/                  Architecture and development documentation
```

## Documentation

See [`docs/`](./docs/README.md) for architecture, database, i18n, SEO, and local development guides.

## License

Private — all rights reserved.
