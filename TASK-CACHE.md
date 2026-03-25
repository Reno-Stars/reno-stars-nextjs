# Task: Add revalidate to all public pages to reduce Neon DB traffic

## Problem
The Neon free tier (5 GB/month network transfer) was exhausted in 6 days because:
- The `neon-http` driver makes a separate HTTPS request per query
- A homepage load triggers ~17-20 DB queries (~760 KB of data)
- Most public pages lack `revalidate`, so they SSR on every request
- Only layout.tsx, page.tsx (home), and feed.xml have `revalidate = 3600`

## Fix
Add `export const revalidate = 3600;` to ALL public-facing pages under `app/[locale]/`.

### Pages that need `revalidate = 3600` added:

1. `app/[locale]/design/page.tsx`
2. `app/[locale]/contact/page.tsx`
3. `app/[locale]/contact/thank-you/page.tsx`
4. `app/[locale]/showroom/page.tsx`
5. `app/[locale]/areas/[city]/page.tsx`
6. `app/[locale]/areas/page.tsx`
7. `app/[locale]/projects/page.tsx`
8. `app/[locale]/projects/[slug]/page.tsx`
9. `app/[locale]/blog/page.tsx`
10. `app/[locale]/blog/[slug]/page.tsx`
11. `app/[locale]/guides/kitchen-renovation-cost-vancouver/page.tsx`
12. `app/[locale]/guides/bathroom-renovation-cost-vancouver/page.tsx`
13. `app/[locale]/guides/page.tsx`
14. `app/[locale]/benefits/page.tsx`
15. `app/[locale]/services/[service-slug]/[city]/page.tsx`
16. `app/[locale]/services/[service-slug]/page.tsx`
17. `app/[locale]/services/page.tsx`
18. `app/[locale]/process/page.tsx`

### DO NOT touch:
- `app/admin/**` — these already have `force-dynamic` and SHOULD be dynamic
- `app/[locale]/layout.tsx` — already has revalidate = 3600
- `app/[locale]/page.tsx` — already has revalidate = 3600
- `app/[locale]/feed.xml/route.ts` — already has revalidate = 3600

### Where to add it:
Add `export const revalidate = 3600;` near the top of each file, after the imports and before any function declarations. Follow the same pattern as the existing files that already have it.

Example — the existing pattern in `app/[locale]/page.tsx`:
```tsx
import { ... } from '...';

// ... other imports

export const revalidate = 3600;

export function generateStaticParams() { ... }
```

### Rules:
- Only add the one line. Don't change anything else in the files.
- Make sure the line goes AFTER all imports and BEFORE function declarations.
- Use exactly: `export const revalidate = 3600;`
- Run `pnpm build` at the end to verify the build passes. If build fails, fix the issue.
- Do NOT run dev server or tests.

## Expected Result
After this change, all public pages will be cached for 1 hour (ISR). Combined with `generateStaticParams`, pages will be pre-rendered at build time and only revalidate once per hour. This should reduce Neon network transfer from ~5 GB/6 days to essentially zero for normal traffic.
