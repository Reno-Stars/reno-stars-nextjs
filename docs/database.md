# Database

## Overview

PostgreSQL database managed with Drizzle ORM. Supports two drivers:

| Environment | Driver | Package |
|------------|--------|---------|
| Production (Neon) | HTTP serverless | `@neondatabase/serverless` + `drizzle-orm/neon-http` |
| Local development | pg Pool | `pg` + `drizzle-orm/node-postgres` |

Driver selection is automatic based on whether `DATABASE_URL` contains `neon.tech`.

## Schema

Defined in `lib/db/schema.ts`. All tables use `pgTable()` from Drizzle.

### Core Tables

| Table | Purpose | Unique Key |
|-------|---------|------------|
| `services` | Renovation service types | `slug` |
| `service_areas` | Geographic coverage | `slug` |
| `projects` | Portfolio entries | `slug` |
| `project_images` | Images per project | `(projectId, displayOrder)` |
| `project_scopes` | Scope items per project | `(projectId, displayOrder)` |
| `blog_posts` | Blog articles | `slug` |
| `contact_submissions` | CRM leads | `id` (auto) |

### Reference Tables

| Table | Purpose | Unique Key |
|-------|---------|------------|
| `company_info` | Singleton company data | `id` |
| `showroom_info` | Singleton showroom data | `id` |
| `about_sections` | Singleton about-page content | `id` |
| `testimonials` | Customer reviews | `id` |
| `gallery_items` | Gallery images | `id` |
| `trust_badges` | Achievement badges | `badgeEn` |
| `social_links` | Social media profiles | `platform` |

### Enums

```sql
service_type: kitchen | bathroom | whole-house | basement | cabinet | commercial
contact_status: new | contacted | converted | rejected
social_platform: facebook | instagram | youtube | linkedin | twitter | xiaohongshu | wechat | whatsapp
gallery_category: kitchen | bathroom | whole-house | commercial
```

### Bilingual Pattern

All user-facing text columns use the `*En` / `*Zh` suffix convention:

```typescript
titleEn: varchar('title_en', { length: 256 }),
titleZh: varchar('title_zh', { length: 256 }),
```

## Commands

```bash
pnpm db:generate   # Generate migration SQL from schema changes
pnpm db:migrate    # Apply pending migrations
pnpm db:push       # Push schema directly (dev only — no migration files)
pnpm db:studio     # Open Drizzle Studio GUI
pnpm db:seed       # Seed database with initial data
```

## Seeding

`lib/db/seed.ts` populates:
- 6 services (kitchen, bathroom, whole-house, basement, cabinet, commercial) with icons, descriptions, and image URLs
- 14 service areas (Vancouver, Richmond, Burnaby, Surrey, etc.)
- Company info (including `foundingYear`, `reviewCount`, geo coordinates, logo URL)
- Showroom info, trust badges
- 5 social links (Xiaohongshu, WeChat, Instagram, Facebook, WhatsApp)
- About sections (bilingual, with `{yearsExperience}` placeholder in `ourJourney`)
- 3 featured testimonials

All seed operations use `onConflictDoNothing` for idempotency.

## Query Layer

`lib/db/queries.ts` provides cached async functions for runtime data access:

```typescript
import { getCompanyFromDb, getSocialLinksFromDb, getServicesFromDb } from '@/lib/db/queries';

// All functions use React cache() for request-level deduplication
const company = await getCompanyFromDb();      // Company
const links = await getSocialLinksFromDb();     // SocialLink[]
const services = await getServicesFromDb();     // Service[]
const testimonials = await getTestimonialsFromDb();  // Testimonial[]
const about = await getAboutSectionsFromDb();   // AboutSections
```

These functions return the same TypeScript types as the former static data exports, making the migration transparent to consuming components.

## Configuration

`drizzle.config.ts`:
```typescript
{
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
}
```

## Connection Pattern

```typescript
// lib/db/index.ts — safe to import anywhere
import { db } from '@/lib/db';

// Connection only happens on first actual query:
const results = await db.select().from(services);
```

The `db` proxy detects the driver at initialization time and uses `require()` to conditionally load either the Neon or pg driver, keeping the initialization synchronous.
