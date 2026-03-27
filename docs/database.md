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
| `service_tags` | Sub-service tags per service (bilingual) | `(serviceId, displayOrder)` |
| `service_benefits` | "Why Us" benefits per service (bilingual) | `(serviceId, displayOrder)` |
| `service_areas` | Geographic coverage (includes rich content, highlights, SEO meta) | `slug` |
| `project_sites` | Site containers for projects (includes `po_number` for sales tracking, `space_type_en`/`_zh` for space type) | `slug` |
| `site_image_pairs` | Before/after image pairs per site | `(siteId, displayOrder)` |
| `projects` | Portfolio entries (includes `po_number` for sales tracking, `space_type_en`/`_zh` for space type) | `slug` |
| `project_image_pairs` | Before/after image pairs per project | `(projectId, displayOrder)` |
| `project_scopes` | Scope items per project | `(projectId, displayOrder)` |
| `site_external_products` | External product links per site | `(siteId, displayOrder)` |
| `project_external_products` | External product links per project | `(projectId, displayOrder)` |
| `blog_posts` | Blog articles (optional project link) | `slug` |
| `contact_submissions` | CRM leads | `id` (auto) |

### Image Pair Tables

Both `project_image_pairs` and `site_image_pairs` share the same structure with comprehensive SEO metadata:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `project_id` / `site_id` | UUID | FK (cascade delete) |
| `before_image_url` | VARCHAR(500) | Before image URL (optional if after exists) |
| `before_alt_text_en` / `_zh` | VARCHAR(255) | Bilingual alt text for before image |
| `after_image_url` | VARCHAR(500) | After image URL (optional if before exists) |
| `after_alt_text_en` / `_zh` | VARCHAR(255) | Bilingual alt text for after image |
| `title_en` / `_zh` | VARCHAR(200) | Bilingual title for SEO |
| `caption_en` / `_zh` | TEXT | Bilingual caption |
| `photographer_credit` | VARCHAR(100) | Photographer attribution |
| `keywords` | TEXT | SEO keywords (comma-separated) |
| `display_order` | INTEGER | Sort order |
| `created_at` | TIMESTAMP | Creation timestamp |

**Constraint:** At least one of `before_image_url` or `after_image_url` must be non-null (CHECK constraint).

### Reference Tables

| Table | Purpose | Unique Key |
|-------|---------|------------|
| `company_info` | Singleton company data | `id` |
| `showroom_info` | Singleton showroom data | `id` |
| `about_sections` | Singleton about-page content | `id` |
| `testimonials` | ~~Customer reviews~~ (deprecated — replaced by Google Reviews API) | `id` |
| `designs` | Design rendering images (3D models, design concepts) | `id`, `image_url` (unique index) |
| `trust_badges` | Achievement badges | `badgeEn` |
| `social_links` | Social media profiles | `platform` |
| `faqs` | Frequently asked questions (global or area-specific) | `id`, composite index on `(isActive, displayOrder)`, index on `serviceAreaId` |
| `partners` | Partner logos (homepage carousel) | `id`, composite index on `(isActive, displayOrder)` |

### Social Media Posts

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `social_media_posts` | Social media campaign content for 3 platforms | `status` (enum), `selected_image_urls` (jsonb), 3 nullable source FKs with CHECK constraint |

The `social_post_status` enum tracks post readiness: `draft` → `ready` → `published`.

Each row represents a campaign with content for all 3 platforms (Instagram, Facebook, Xiaohongshu). Three nullable FKs (`blog_post_id`, `project_id`, `site_id`) with a CHECK constraint ensuring at most one is non-null. All FKs use `onDelete: 'set null'`. `selected_image_urls` is a `jsonb` column typed as `string[]` via Drizzle `$type<>()`.

Indexes: `status`, `blog_post_id`, `project_id`, `site_id`, `scheduled_at`, `created_at`.

Exported types: `DbSocialMediaPost`, `NewDbSocialMediaPost`.

### Batch Upload Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `batch_upload_jobs` | Tracks ZIP upload processing jobs | `status` (enum), `options` (jsonb), `created_site_ids`/`created_project_ids`/`created_blog_post_ids`/`errors` (jsonb arrays), `total_images`/`processed_images` (progress) |

The `batch_job_status` enum tracks processing progress: `pending` → `extracting` → `uploading` → `generating` → `saving` → `generating_blog` → `completed` | `failed` | `partial`.

JSON columns use Drizzle `jsonb` with `$type<>()` for TypeScript inference (no manual `JSON.parse`/`JSON.stringify`). Exported types: `BatchJobStatus`, `BatchJobOptions`, `DbBatchUploadJob`.

### Enums

```sql
contact_status: new | contacted | converted | rejected
social_platform: facebook | instagram | youtube | linkedin | twitter | xiaohongshu | wechat | whatsapp
social_post_status: draft | ready | published
batch_job_status: pending | extracting | uploading | generating | saving | generating_blog | completed | failed | partial
```

> **Removed enums:** `service_type` and `gallery_category` enums were replaced with `varchar` columns. Service types and gallery categories are now validated against `services.slug` values at the application layer, making them fully dynamic (adding a service in admin automatically makes it available as a project service type and gallery category).

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
- Company info (including `foundingYear`, geo coordinates, logo URL, hero video/image URLs)
- Showroom info, trust badges
- 5 social links (Xiaohongshu, WeChat, Instagram, Facebook, WhatsApp)
- About sections (bilingual, with `{yearsExperience}` placeholder in `ourJourney`)
- 37 design renderings from reno-stars.com original design page (uses `onConflictDoNothing` on `imageUrl` unique index)
- 5 FAQs with bilingual content (uses `{yearsExperience}` placeholder in answers)

All seed operations use `onConflictDoNothing` for idempotency.

### Performance Indexes

Key indexes beyond unique constraints:

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| `service_tags_service_id_idx` | `service_tags` | `(service_id)` | Tag lookup by service |
| `service_benefits_service_id_idx` | `service_benefits` | `(service_id)` | Benefit lookup by service |
| `project_sites_published_show_idx` | `project_sites` | `(isPublished, showAsProject)` | Public site queries |
| `projects_is_published_idx` | `projects` | `(isPublished)` | Public project queries |
| `blog_posts_is_published_idx` | `blog_posts` | `(isPublished)` | Public blog queries |
| `faqs_active_order_idx` | `faqs` | `(isActive, displayOrder)` | Active FAQ ordering |
| `faqs_service_area_id_idx` | `faqs` | `(serviceAreaId)` | Area-specific FAQ lookup |
| `partners_active_order_idx` | `partners` | `(isActive, displayOrder)` | Active partner ordering |
| `social_media_posts_status_idx` | `social_media_posts` | `(status)` | Status filtering |
| `social_media_posts_created_at_idx` | `social_media_posts` | `(created_at)` | Sort by creation date |
| `social_media_posts_blog_post_id_idx` | `social_media_posts` | `(blog_post_id)` | Source FK lookup |
| `social_media_posts_project_id_idx` | `social_media_posts` | `(project_id)` | Source FK lookup |
| `social_media_posts_site_id_idx` | `social_media_posts` | `(site_id)` | Source FK lookup |
| `social_media_posts_scheduled_at_idx` | `social_media_posts` | `(scheduled_at)` | Scheduling queries |

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
  getBlogPostSlugsFromDb, getDesignsFromDb, getTrustBadgesFromDb,
  getShowroomFromDb,
} from '@/lib/db/queries';

// All functions use React cache() for request-level deduplication
const company = await getCompanyFromDb();              // Company
const links = await getSocialLinksFromDb();             // SocialLink[]
const services = await getServicesFromDb();             // Service[]
const about = await getAboutSectionsFromDb();           // AboutSections
const projects = await getProjectsFromDb();             // Project[]
const project = await getProjectBySlugFromDb('slug');   // Project | null
const slugs = await getProjectSlugsFromDb();            // { slug, updatedAt }[]
const siteSlugs = await getSiteSlugsFromDb();           // { slug, updatedAt }[] (published, showAsProject=true)
const areas = await getServiceAreasFromDb();            // ServiceArea[]
const posts = await getBlogPostsFromDb();               // BlogPost[]
const post = await getBlogPostBySlugFromDb('slug');     // BlogPost | null (includes related_project if linked)
const postSlugs = await getBlogPostSlugsFromDb();       // string[]
const designs = await getDesignsFromDb();                // DesignItem[]
const badges = await getTrustBadgesFromDb();            // { en: string; zh: string }[]
const showroom = await getShowroomFromDb();             // Showroom
const faqs = await getFaqsFromDb();                      // Faq[] (global only, replaces {yearsExperience} placeholder)
const areaFaqs = await getFaqsByAreaFromDb(areaId);      // Faq[] (area-specific FAQs)
const areaProjects = await getProjectsByAreaFromDb(city); // Project[] (up to 6, case-insensitive city match)
const partners = await getPartnersFromDb();             // Partner[] (active, ordered)
const sites = await getSitesAsProjectsFromDb();         // SiteWithProjects[] (with aggregated data)
```

### Helper Functions (`lib/db/helpers.ts`)

Query aggregation utilities for site data:

```typescript
parseBudgetRange(budget: string): { min: number; max: number } | null
calculateCombinedBudget(projects: Project[]): string | undefined
aggregateDurations(projects: Project[]): Localized<string> | undefined
mergeServiceScopes(projects: Project[]): Localized<string[]>
collectAllImages(projects: Project[], site?: Site): SiteImage[]
collectAllExternalProducts(projects: Project[]): ExternalProduct[]
```

> **Note:** Homepage testimonials are no longer fetched from the database. They use `getGoogleReviews()` from `lib/google-reviews.ts` (Google Places API with 24h caching). The `testimonials` table is deprecated and will be dropped in a future migration.

These functions return the same TypeScript types as the former static data exports, making the migration transparent to consuming components.

### Admin Queries

Uncached query functions for the admin dashboard (return raw DB rows with explicit return types):

```typescript
import {
  getAllProjectsAdmin,      // DbProject[] with images/scopes
  getAllServicesAdmin,      // DbService[] (with tags)
  getAllBlogPostsAdmin,     // DbBlogPost[]
  getAllContactsAdmin,      // DbContactSubmission[]
  getAllSocialLinksAdmin,   // DbSocialLink[] — includes inactive
  getAllServiceAreasAdmin,  // DbServiceArea[] — includes inactive
  getAllDesignsAdmin,       // DbDesign[] — includes unpublished
  getAllTrustBadgesAdmin,   // DbTrustBadge[] — includes inactive
  getAllFaqsAdmin,          // DbFaq[] — includes inactive
  getAllPartnersAdmin,      // DbPartner[] — includes inactive
  getAllSitesAdmin,         // DbSite[] with siteImages — includes unpublished
  getAllSocialMediaPostsAdmin,  // DbSocialMediaPost[] — ordered by createdAt desc
  getSocialMediaPostByIdAdmin,  // DbSocialMediaPost | undefined — single post lookup
} from '@/lib/db/queries';
```

### Slug Uniqueness

Project and service area slugs have unique indexes in the database. The admin actions use `ensureUniqueSlug()` from `lib/utils.ts` to auto-append `-2`, `-3`, etc. on collision before insert/update. This prevents duplicate URL errors while keeping the first entry's URL clean. Used by `createProject()`, `updateProject()`, and `createServiceArea()`.

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
