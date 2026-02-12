# Reno Stars — Documentation

Bilingual (English / Chinese) renovation company website for [Reno Stars](https://reno-stars.com), built with Next.js 16, React 19, and Tailwind CSS 4.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template
cp .env.local.example .env.local

# 3. Start local services (Postgres + MinIO) and seed data
pnpm dev:services

# 4. Start development server
pnpm dev
```

The site is available at `http://localhost:3000`. MinIO console at `http://localhost:9001` (minioadmin/minioadmin).

## Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | System architecture, tech stack, and design decisions |
| [Database](./database.md) | Schema, migrations, seeding, dual-driver setup |
| [Local Development](./local-dev.md) | Docker setup, MinIO, storage seeding |
| [Internationalization](./i18n.md) | Bilingual content model, locale routing, translations |
| [SEO & Redirects](./seo.md) | Sitemap, structured data, WordPress redirect map |
| [Edit History](./edit-history/) | Session-by-session change log |

## Project Highlights

- **276 statically generated pages** across 13 route patterns
- **Bilingual:** Full English/Chinese support with `next-intl`, locale-prefixed URLs
- **Database-driven:** Company info, services, social links, about sections, projects, service areas, blog posts, gallery items, trust badges, and showroom info fetched from PostgreSQL via cached query layer (`lib/db/queries.ts`). Homepage testimonials powered by Google Places API (`lib/google-reviews.ts`) with 24h caching
- **Admin dashboard:** Auth-protected CRUD for all 12 content types at `/admin/` with unified House Stack UI for site/project management (sites, projects, blog, contacts, company, services, social links, service areas, gallery, trust badges, showroom, about sections, FAQs). AI-powered content optimization via OpenAI for blog posts and project descriptions. Blog posts can link to related projects to display products used
- **Whole House projects:** Sites aggregate child projects with combined budget, duration, service scopes, and external products for "Whole House" renovation display. Both projects and sites use before/after image pairs with full SEO metadata (bilingual titles, captions, alt text, photographer credit, keywords)
- **SEO-optimized:** Dynamic sitemap, JSON-LD structured data (8 schema types including FAQ), 50+ WordPress redirects, meta description truncation, security headers via proxy
- **Neumorphic design:** Custom warm-beige design system with shadow utilities
- **Accessible:** Elderly-friendly large text mode for contact forms, responsive hero scaling, valid heading hierarchy, lightbox `aria-live` counter, keyboard focus traps
- **Social integration:** Xiaohongshu, WeChat, Instagram, Facebook, WhatsApp with custom SVG icons
- **Local-first dev:** Docker Compose with Postgres + MinIO, one-command setup
- **Type-safe:** Drizzle ORM with full TypeScript inference, strict mode
- **Performance-optimized:** Homepage split into 11 code-split sections (9 Server Components), resource preloading, lazy-loaded below-fold content
- **Well-tested:** 316 unit tests across 21 test files (Vitest), covering admin components, hooks, actions, and utilities
