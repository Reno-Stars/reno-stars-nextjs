# Reno Stars Website — Structure & SEO Migration Report

**Prepared for:** Client review
**Date:** February 2026
**Platform:** Next.js 16 on Vercel, Neon PostgreSQL

---

## 1. Site Architecture

### Bilingual Setup

Every page is available in both **English** and **Chinese (Simplified)**. All URLs are locale-prefixed:

```
https://reno-stars.com/en/projects/
https://reno-stars.com/zh/projects/
```

Switching languages keeps the user on the same page — only the prefix changes.

### Page Map

| Page | URL Pattern | Description |
|------|-------------|-------------|
| **Homepage** | `/en/` `/zh/` | Hero video, featured projects, services overview, testimonials, CTA |
| **Projects Hub** | `/en/projects/` | Filterable project gallery (by category, space type, budget) |
| **Project Category** | `/en/projects/kitchen/` | Category-filtered project listing (6 categories) |
| **Project Detail** | `/en/projects/richmond-kitchen-remodel-bath/` | Full project page with gallery, challenge/solution, specs |
| **Services Hub** | `/en/services/` | All 6 renovation service types |
| **Service Detail** | `/en/services/kitchen/` | Individual service page |
| **Service + City** | `/en/services/kitchen/vancouver/` | Location-specific service page (6 services x 14 areas = 84 pages) |
| **Blog Hub** | `/en/blog/` | Blog listing |
| **Blog Post** | `/en/blog/top-10-kitchen-renovation-trends-vancouver-2025/` | Individual article |
| **Service Areas** | `/en/areas/vancouver/` | City-specific landing page (14 areas) |
| **Benefits** | `/en/benefits/` | FAQ and value propositions |
| **Design Showcase** | `/en/design/` | Design system / visual showcase |
| **Contact** | `/en/contact/` | Contact form |
| **Thank You** | `/en/contact/thank-you/` | Post-submission confirmation (noindex) |

### Content Volume

| Content Type | Count |
|---|---|
| Service types | 6 (Kitchen, Bathroom, Whole House, Basement, Cabinet, Commercial) |
| Service areas | 14 (Vancouver, Richmond, Burnaby, Surrey, Coquitlam, Langley, Delta, North/West Vancouver, New Westminster, Port Coquitlam, Port Moody, Maple Ridge, White Rock) |
| Projects | 13 across 7 cities |
| Blog posts | 5 |
| Service + City pages | 84 |
| **Total unique URLs** | **~280** (across both languages) |

---

## 2. SEO Migration — What Was Preserved

### 2.1 WordPress URL Redirects (50+ rules, all 301 permanent)

Every old WordPress URL that had search impressions has been mapped to the equivalent new page. No link equity is lost.

#### Page Renames

| Old WordPress URL | New URL | Notes |
|---|---|---|
| `/project/:slug` | `/projects/:slug` | Singular to plural |
| `/have-a-project` | `/contact` | CTA page renamed |
| `/features-benefits` | `/benefits` | Simplified |
| `/vancouver-renovation-blog` | `/blog` | Simplified |
| `/renovation_article/:slug` | `/blog/:slug` | Blog CPT renamed |

#### Category Path Migration

| Old Path | New Path |
|---|---|
| `/vancouver-renovation-projects/kitchen` | `/projects/kitchen` |
| `/vancouver-renovation-projects/bathroom` | `/projects/bathroom` |
| `/vancouver-renovation-projects/full-house` | `/projects/whole-house` |
| `/vancouver-renovation-projects/commercial` | `/projects/commercial` |
| `/vancouver-renovation-projects/home-installation` | `/projects` |
| `/vancouver-renovation-projects` | `/projects` |
| `/category/:any` | `/projects` |
| `/projects/full-house` | `/projects/whole-house` |

#### High-Traffic Project Slugs (from Google Search Console)

These old project URLs had the highest impressions and are individually mapped to their new equivalents:

| Old WordPress Slug | New Project | GSC Impressions |
|---|---|---|
| `home-renovation-in-langley-kitchen-bathroom-basement` | `stunning-home-renovation-langley` | 18,477 |
| `surrey-home-renovation-kitchen-bathroom-stairs` | `surrey-home-renovation` | 7,971 |
| `kitchen-and-bathroom-renovation-in-delta-bc` | `kitchen-renovation-delta` | 6,848 |
| `richmond-kitchen-remodel-bathroom-renovation-project` | `richmond-kitchen-remodel-bath` | 6,380 |
| `west-vancouver-renovation-floating-bathroom-vanity` | `bathroom-vanity-west-vancouver` | — |
| `kitchen-bathroom-cabinet-refacing-in-coquitlam` | `coquitlam-white-shaker-cabinets` | — |
| `elegant-white-shaker-kitchens-in-coquitlam-...` | `coquitlam-white-shaker-cabinets` | — |
| `modern-renovation-at-kitchen-and-bathroom-richmond` | `modern-kitchen-richmond` | — |
| `modern-kitchen-renovation-in-richmond-bc-full-house` | `modern-kitchen-richmond` | — |
| `full-house-renovation-in-richmond-bc-kitchen-bath` | `richmond-kitchen-bathroom-remodel` | — |
| `beauty-clinic-remodel-in-vancouver-commercial-project` | `commercial-renovation-skin-lab-granville` | — |
| `kitchen-renovation-in-surrey-renovation-project` | `surrey-home-before-after` | — |
| `kitchen-renovation-in-white-rock-countertop` | `projects/kitchen` | — |

#### Remaining Old Slugs (mapped to category hubs)

22+ additional old project slugs are redirected to their best-matching category:

- Kitchen projects → `/projects/kitchen`
- Bathroom projects → `/projects/bathroom`
- Whole house projects → `/projects/whole-house`
- Commercial projects → `/projects/commercial`
- Others → `/projects` (hub)

#### URL Prefix Corrections

| Pattern | Redirect | Purpose |
|---|---|---|
| `/en/en/:path` | `/en/:path` | Fix double locale prefix |
| `/zh/zh/:path` | `/zh/:path` | Fix double locale prefix |
| `/zh/en/:path` | `/zh/:path` | Fix mixed locale prefix |
| `/en/zh/:path` | `/en/:path` | Fix mixed locale prefix |
| `/projects/:path` (no locale) | `/en/projects/:path` | Default to English |
| `/services/:path` (no locale) | `/en/services/:path` | Default to English |
| `/contact` (no locale) | `/en/contact` | Default to English |
| `/blog/:path` (no locale) | `/en/blog/:path` | Default to English |

---

## 3. Technical SEO Implementation

### 3.1 Sitemap

Dynamically generated at `https://reno-stars.com/sitemap.xml`.

Every entry includes:
- `lastModified` date
- `changeFrequency` (weekly or monthly)
- `priority` (0.6–1.0)
- **hreflang alternates** for `en`, `zh`, and `x-default`

| Section | URLs | Priority | Frequency |
|---|---|---|---|
| Homepage | 2 | 1.0 | Weekly |
| Services hub | 2 | 0.9 | Weekly |
| Projects hub | 2 | 0.9 | Weekly |
| Blog hub | 2 | 0.8 | Weekly |
| Contact | 2 | 0.8 | Monthly |
| Service detail pages | 12 | 0.8 | Monthly |
| Project category pages | 12 | 0.8 | Weekly |
| Service + City pages | 168 | 0.7 | Monthly |
| Service area pages | 28 | 0.7 | Monthly |
| Design & Benefits | 4 | 0.7 | Monthly |
| Individual projects | 26 | 0.6 | Monthly |
| Blog posts | 10 | 0.6 | Monthly |
| **Total** | **~280** | | |

### 3.2 robots.txt

```
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /*/contact/thank-you/
Sitemap: https://reno-stars.com/sitemap.xml
```

### 3.3 Metadata (every page)

Every page generates:
- **Title** and **description** (bilingual)
- **Open Graph** tags (title, description, image, URL, locale, site name)
- **hreflang** links (`en`, `zh`, `x-default`)
- **Canonical URL**

Project and blog pages use `og:type = article`. All others use `og:type = website`.

### 3.4 Structured Data (JSON-LD)

| Schema Type | Where | Purpose |
|---|---|---|
| **HomeAndConstructionBusiness** | Every page (global) | Company info, address, geo coordinates, service areas, hours, phone, social profiles, aggregate rating |
| **BreadcrumbList** | Every page | Breadcrumb navigation for search results |
| **Service** | Service & service+city pages | Service details, provider info, price range, area served |
| **Article** | Blog post pages | Headline, author, publisher, dates, image |
| **FAQPage** | Benefits page | 6 FAQ question-answer pairs for rich snippets |

### 3.5 Trailing Slashes

All URLs use trailing slashes (`/en/projects/`, not `/en/projects`) — consistent with the WordPress site structure.

---

## 4. Migration Checklist

| Item | Status |
|---|---|
| All old WordPress URLs 301-redirected to new routes | Done |
| High-impression project pages individually mapped | Done |
| Category URL structure preserved | Done |
| XML sitemap with hreflang for all pages | Done |
| robots.txt configured | Done |
| Page titles and meta descriptions on every page | Done |
| Open Graph tags on every page | Done |
| hreflang alternate links (EN/ZH/x-default) | Done |
| Canonical URLs set | Done |
| LocalBusiness structured data (JSON-LD) | Done |
| Breadcrumb structured data | Done |
| Service structured data | Done |
| Article structured data for blog | Done |
| FAQ structured data for benefits page | Done |
| Image optimization (Next.js Image component) | Done |
| Trailing slash consistency | Done |
| 404 page (custom) | Done |
| Thank-you page marked noindex | Done |
| Double/mixed locale prefix handling | Done |
| Non-localized URL fallback to English | Done |

---

## 5. Service Areas Coverage

Pages are generated for each service in each of these 14 areas (84 location pages total):

| Area | EN | ZH |
|---|---|---|
| Vancouver | Vancouver | 温哥华 |
| Richmond | Richmond | 列治文 |
| Burnaby | Burnaby | 本拿比 |
| North Vancouver | North Vancouver | 北温哥华 |
| West Vancouver | West Vancouver | 西温哥华 |
| Surrey | Surrey | 素里 |
| Coquitlam | Coquitlam | 高贵林 |
| Langley | Langley | 兰里 |
| New Westminster | New Westminster | 新西敏 |
| Delta | Delta | 三角洲 |
| Port Coquitlam | Port Coquitlam | 高贵林港 |
| Port Moody | Port Moody | 满地宝 |
| Maple Ridge | Maple Ridge | 枫树岭 |
| White Rock | White Rock | 白石镇 |

---

## 6. Social Media Integration

| Platform | Type |
|---|---|
| Facebook | Link |
| Instagram | Link |
| WhatsApp | Link |
| Xiaohongshu (Little Red Book) | Link |
| WeChat | ID display (tooltip, no external link) |

All social profiles are included in the LocalBusiness structured data `sameAs` field for search engine association.
