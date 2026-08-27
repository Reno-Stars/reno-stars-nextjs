# Technical SEO Findings
# Updated: 2026-08-27

## Sitemap / Indexable-Set Disagreement

| URL in sitemap | Live status | Issue |
|---|---|---|
| /en/services/kitchen-renovation/ | 404 | Old slug; correct slug is /en/services/kitchen/ |
| /en/services/bathroom-renovation/ | 404 | Likely same pattern — check /en/services/bathroom/ |
| /en/services/basement-renovation/ | 404 | Likely same pattern — check /en/services/basement/ |

Action: Remove 404 URLs from sitemap.xml OR add redirects to the correct slug.

## Service Page Slug Check

Service pages use SHORT slugs (no city prefix):
- /en/services/kitchen/ — 200 ✓
- /en/services/bathroom/ — 200 ✓
- /en/services/basement/ — 200 ✓
- /en/services/cabinet/ — 200 ✓
- /en/services/commercial/ — 200 ✓

URLs with `-renovation` suffix (kitchen-renovation, bathroom-renovation, etc.) are 404.
