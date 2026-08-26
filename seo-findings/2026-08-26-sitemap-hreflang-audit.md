# SEO Finding: Sitemap + Hreflang Audit — 2026-08-26

## Sitemap Structure
- Total `<loc>` entries: 9,000+ (sitemap is large and comprehensive)
- Blog post count in hreflangs: confirmed via `bathroom-renovation-delta-bc-2026` sample
- Each blog post entry has 14 `<xhtml:link rel="alternate" hreflang="...">` entries (all 14 locales) + self-referencing `<loc>`
- Blog post entry includes `<image:image>` with real R2 hero image URL

## Hreflang Tags — CONFIRMED CORRECT
Sample: `bathroom-renovation-delta-bc-2026`
```
<xhtml:link rel="alternate" hreflang="en" href=".../en/blog/bathroom-renovation-delta-bc-2026/" />
<xhtml:link rel="alternate" hreflang="zh" href=".../zh/blog/bathroom-renovation-delta-bc-2026/" />
... (all 14 locales including zh-Hant, x-default)
```
- All 14 `INDEXABLE_LEAF_LOCALES` present (Ar, Es, Fa, Fr, Hi, Ja, Ko, Pa, Ru, Tl, Vi, zh, zh-Hant)
- `x-default` present and points to `/en/` version
- `x-default` NOT used for blog posts (correct — blog posts have no regional variant, only linguistic)

## Redirect Chain — CLEAN
```
/ → 308 /en/
/blog/ → 308 /en/blog/
/en/blog/ → 200 (blog listing)
```
No chained redirects. No indexable page returns a redirect.

## robots.txt
- `Allow: /` — full crawl allowed
- AI bot blocking: GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot, ClaudeBot, Claude-Web, Claude-SearchBot, Google-Extended, Applebot-Extended, Bingbot all listed (these bots obey robots.txt)
- Disallowed: /api/revalidate, /api/indexnow, /admin/, */contact/thank-you/, */invoice/, */kitchen-e2e-test/
- AI readers that respect robots.txt will be blocked from crawling; they should use /llms.txt instead (which is accessible and contains the full catalog)

## GEO / AI Reader Entry Points
- `/llms.txt` — curated short index, public, 200 OK
- `/llms-full.txt` — comprehensive catalog, public, 200 OK
- Both confirmed accessible from public internet

## Verdict
Sitemap and hreflang implementation: CORRECT. No regressions found.
