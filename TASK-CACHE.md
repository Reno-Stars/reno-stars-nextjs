# Task: Add revalidate to all public pages to reduce Neon DB traffic ✅ DONE 2026-09-24

## Problem
The Neon free tier (5 GB/month network transfer) was exhausted in 6 days because:
- The `neon-http` driver makes a separate HTTPS request per query
- A homepage load triggers ~17-20 DB queries (~760 KB of data)
- Most public pages lacked `revalidate`, so they SSR on every request
- Only feed.xml and videos/[slug] had `revalidate = 604800`

## Fix Applied (2026-09-24)
Added `export const revalidate = 3600;` to 12 public pages under `app/[locale]/`:

1. ✅ `app/[locale]/design/page.tsx`
2. ✅ `app/[locale]/contact/page.tsx`
3. ✅ `app/[locale]/contact/thank-you/page.tsx`
4. ✅ `app/[locale]/showroom/page.tsx`
5. ✅ `app/[locale]/areas/[city]/page.tsx`
6. ✅ `app/[locale]/areas/page.tsx`
7. ✅ `app/[locale]/projects/page.tsx`
8. ✅ `app/[locale]/projects/[slug]/page.tsx`
9. ✅ `app/[locale]/blog/page.tsx`
10. ✅ `app/[locale]/blog/[slug]/page.tsx`
11. ✅ `app/[locale]/guides/page.tsx`
12. ✅ `app/[locale]/services/page.tsx`

NOT DONE (force-dynamic route — changing these would defeat their purpose):
- `app/[locale]/services/[service-slug]/[city]/page.tsx` — force-dynamic for per-city live data
- `app/[locale]/services/[service-slug]/page.tsx` — force-dynamic

MISSING from task (found during work, out of scope):
- Individual guide sub-pages under `app/[locale]/guides/*/page.tsx` — 8 hardcoded guide pages
- `app/[locale]/benefits/page.tsx` — does not exist
- `app/[locale]/process/page.tsx` — does not exist

## Note on layout.tsx
`app/[locale]/layout.tsx` has `export const dynamic = 'force-dynamic'`, NOT `revalidate = 3600`.
Per-page `revalidate` in Next.js App Router overrides layout-level `dynamic`, so
the 12 pages above will now be ISR-cached despite the layout setting.

## DO NOT touch:
- `app/admin/**` — force-dynamic, intentionally dynamic
- `app/[locale]/services/[service-slug]/**` — force-dynamic for live review data
- `app/[locale]/videos/[slug]/page.tsx` — already has revalidate = 604800
- `app/[locale]/feed.xml/route.ts` — already has revalidate = 604800

## Expected Result
After merge, those 12 pages will be ISR-cached for 1 hour. Neon DB traffic should
drop from ~5 GB/6 days to near zero for normal crawler patterns.
