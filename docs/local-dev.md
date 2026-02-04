# Local Development

## Prerequisites

- Node.js >= 20
- pnpm
- Docker & Docker Compose

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.local.example .env.local

# Start everything: Docker services + DB schema + DB seed + asset seed
pnpm dev:services

# Start Next.js dev server
pnpm dev
```

## Docker Services

Defined in `docker-compose.yml`:

| Service | Image | Ports | Credentials |
|---------|-------|-------|-------------|
| `postgres` | `postgres:16-alpine` | 5432 | `postgres` / `postgres` / DB: `renostars` |
| `minio` | `minio/minio` | 9000 (API), 9001 (console) | `minioadmin` / `minioadmin` |
| `createbucket` | `minio/mc` | — | Init container, creates `reno-stars` bucket |

Both services use Docker volumes (`pgdata`, `miniodata`) for persistence across restarts.

### Commands

```bash
pnpm docker:up      # Start services in background
pnpm docker:down    # Stop services (preserves data)
pnpm docker:reset   # Destroy volumes and restart (fresh state)
```

## MinIO (S3-Compatible Storage)

MinIO stands in for production image hosting (reno-stars.com) during local development.

### How It Works

1. `docker compose up` starts MinIO and auto-creates the `reno-stars` bucket with public-read access
2. `pnpm storage:seed` downloads 21 assets from production and uploads them to MinIO
3. Setting `NEXT_PUBLIC_STORAGE_PROVIDER=minio` in `.env.local` activates URL rewriting

### URL Rewriting

The `getAssetUrl()` function in `lib/storage.ts` rewrites asset URLs:

```
Production: https://reno-stars.com/wp-content/uploads/2025/04/photo.jpg
Local:      http://localhost:9000/reno-stars/uploads/2025/04/photo.jpg
```

This is transparent to components — they use the same URLs from `lib/data/`.

### MinIO Console

Browse uploaded assets at `http://localhost:9001`:
- Username: `minioadmin`
- Password: `minioadmin`
- Bucket: `reno-stars`

### Storage Seed Script

`scripts/seed-storage.ts` downloads all 21 assets referenced in the codebase:
- 6 hero/gallery images (JPG)
- 13 project images (PNG/JPG)
- 1 company logo (JPG)
- 1 video file (MP4)

The script is idempotent — it checks for existing objects via `HeadObject` before downloading.

## Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/renostars
NEXT_PUBLIC_STORAGE_PROVIDER=minio
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Database Setup

```bash
pnpm db:push    # Apply schema to local Postgres
pnpm db:seed    # Seed with initial data
pnpm db:studio  # Open Drizzle Studio at https://local.drizzle.studio
```

**Note:** `DATABASE_URL` must be set before running `pnpm build` because the locale layout and pages fetch data from the database during pre-rendering. Use `pnpm dev:services` to start local Docker services first, or set `DATABASE_URL` to a remote database.

## Full Reset

To start completely fresh:

```bash
pnpm docker:reset    # Wipes DB + MinIO volumes, restarts containers
pnpm db:push         # Re-apply schema
pnpm db:seed         # Re-seed database
pnpm storage:seed    # Re-seed storage
```

Or use the all-in-one command after reset:

```bash
pnpm docker:reset && pnpm dev:services
```
