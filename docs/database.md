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
| `project_external_products` | External product links per project | `(projectId, displayOrder)` |
| `blog_posts` | Blog articles | `slug` |
| `contact_submissions` | CRM leads | `id` (auto) |

### Reference Tables

| Table | Purpose | Unique Key |
|-------|---------|------------|
| `company_info` | Singleton company data | `id` |
| `showroom_info` | Singleton showroom data | `id` |
| `about_sections` | Singleton about-page content | `id` |
| `testimonials` | ~~Customer reviews~~ (deprecated — replaced by Google Reviews API) | `id` |
| `gallery_items` | Gallery images | `id`, `image_url` (unique index) |
| `trust_badges` | Achievement badges | `badgeEn` |
| `social_links` | Social media profiles | `platform` |
| `faqs` | Frequently asked questions | `id`, composite index on `(isActive, displayOrder)` |

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
pnpm db:generate        # Generate migration SQL from schema changes
pnpm db:migrate         # Apply pending migrations
pnpm db:push            # Push schema directly (dev only — no migration files)
pnpm db:studio          # Open Drizzle Studio GUI
pnpm db:seed            # Seed database with initial data
pnpm db:seed:projects   # Import static projects into DB
pnpm db:seed:blog       # Crawl WordPress site for blog content (22 articles, EN + ZH)
```

## Seeding

`lib/db/seed.ts` populates:
- 6 services (kitchen, bathroom, whole-house, basement, cabinet, commercial) with icons, descriptions, and image URLs
- 14 service areas (Vancouver, Richmond, Burnaby, Surrey, etc.)
- Company info (including `foundingYear`, geo coordinates, logo URL)
- Showroom info, trust badges
- 5 social links (Xiaohongshu, WeChat, Instagram, Facebook, WhatsApp)
- About sections (bilingual, with `{yearsExperience}` placeholder in `ourJourney`)
- 6 gallery items (uses `onConflictDoNothing` on `imageUrl` unique index)
- 5 FAQs with bilingual content (uses `{yearsExperience}` placeholder in answers)

All seed operations use `onConflictDoNothing` for idempotency.

### Blog Crawler (`scripts/seed-blog.ts`)

Crawls the old WordPress site for real blog content:
- **English**: Fetched via WP REST API (`/wp-json/wp/v2/renovation_article`) — structured JSON
- **Chinese**: Crawled from `/zh/renovation_article/{slug}/` HTML pages (WPML doesn't expose ZH via REST API)
- **Title extraction**: Tries `og:title`, `<title>`, `<h1>` tags; prefers whichever contains Chinese characters
- **Content cleaning**: Strips scripts, styles, shortcodes, inline styles, data attributes
- **Idempotent**: Uses `onConflictDoUpdate` to refresh content on re-run
- **Result**: 22 articles, 14/22 with distinct Chinese titles
- **Command**: `pnpm db:seed:blog`

## Query Layer

`lib/db/queries.ts` provides cached async functions for runtime data access:

```typescript
import {
  getCompanyFromDb, getSocialLinksFromDb, getServicesFromDb,
  getAboutSectionsFromDb,
  getProjectsFromDb, getProjectBySlugFromDb, getProjectSlugsFromDb,
  getServiceAreasFromDb, getBlogPostsFromDb, getBlogPostBySlugFromDb,
  getBlogPostSlugsFromDb, getGalleryItemsFromDb, getTrustBadgesFromDb,
  getShowroomFromDb,
} from '@/lib/db/queries';

// All functions use React cache() for request-level deduplication
const company = await getCompanyFromDb();              // Company
const links = await getSocialLinksFromDb();             // SocialLink[]
const services = await getServicesFromDb();             // Service[]
const about = await getAboutSectionsFromDb();           // AboutSections
const projects = await getProjectsFromDb();             // Project[]
const project = await getProjectBySlugFromDb('slug');   // Project | null
const slugs = await getProjectSlugsFromDb();            // string[]
const areas = await getServiceAreasFromDb();            // ServiceArea[]
const posts = await getBlogPostsFromDb();               // BlogPost[]
const post = await getBlogPostBySlugFromDb('slug');     // BlogPost | null
const postSlugs = await getBlogPostSlugsFromDb();       // string[]
const gallery = await getGalleryItemsFromDb();          // GalleryItem[]
const badges = await getTrustBadgesFromDb();            // { en: string; zh: string }[]
const showroom = await getShowroomFromDb();             // Showroom
const faqs = await getFaqsFromDb();                      // Faq[] (replaces {yearsExperience} placeholder)
```

> **Note:** Homepage testimonials are no longer fetched from the database. They use `getGoogleReviews()` from `lib/google-reviews.ts` (Google Places API with 24h caching). The `testimonials` table is deprecated and will be dropped in a future migration.

These functions return the same TypeScript types as the former static data exports, making the migration transparent to consuming components. Gallery categories are capitalized in the query layer (`'whole-house'` → `'Whole House'`).

### Admin Queries

Uncached query functions for the admin dashboard (return raw DB rows with explicit return types):

```typescript
import {
  getAllProjectsAdmin,      // DbProject[] with images/scopes
  getAllServicesAdmin,      // DbService[]
  getAllBlogPostsAdmin,     // DbBlogPost[]
  getAllContactsAdmin,      // DbContactSubmission[]
  getAllSocialLinksAdmin,   // DbSocialLink[] — includes inactive
  getAllServiceAreasAdmin,  // DbServiceArea[] — includes inactive
  getAllGalleryItemsAdmin,  // DbGalleryItem[] — includes unpublished
  getAllTrustBadgesAdmin,   // DbTrustBadge[] — includes inactive
  getAllFaqsAdmin,          // DbFaq[] — includes inactive
} from '@/lib/db/queries';
```

### Slug Uniqueness

Project slugs have a unique index in the database. The admin actions use `ensureUniqueSlug()` from `lib/utils.ts` to auto-append `-2`, `-3`, etc. on collision before insert/update. This prevents duplicate URL errors while keeping the first project's URL clean.

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
