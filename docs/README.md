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
- **Database-driven:** Company info, services, social links, testimonials, about sections, projects, service areas, blog posts, gallery items, trust badges, and showroom info fetched from PostgreSQL via cached query layer (`lib/db/queries.ts`)
- **Admin dashboard:** Auth-protected CRUD for projects, blog, testimonials, contacts, company info, and services at `/admin/`
- **SEO-optimized:** Dynamic sitemap, JSON-LD structured data (6 schema types), 50+ WordPress redirects, security headers via proxy
- **Neumorphic design:** Custom warm-beige design system with shadow utilities
- **Accessible:** Elderly-friendly large text mode for contact forms, responsive hero scaling, valid heading hierarchy, lightbox `aria-live` counter, keyboard focus traps
- **Social integration:** Xiaohongshu, WeChat, Instagram, Facebook, WhatsApp with custom SVG icons
- **Local-first dev:** Docker Compose with Postgres + MinIO, one-command setup
- **Type-safe:** Drizzle ORM with full TypeScript inference, strict mode
