# SEO Tick 2026-09-25 — Continuous (Evening)

## Branch: `seo/daily-2026-09-25` (existing branch, continuing)

## Blog Post: Attempted

**Topic:** Ladder 2 — Uncovered query
**Slug candidate:** `mold-remediation-cost-vancouver-2026`
**Title EN:** "Mold Remediation Cost Vancouver BC 2026: What Homeowners Actually Pay"
**Title ZH:** "温哥华霉菌治理费用2026：业主真实花费指南"

### Gates Assessed
| Gate | Result |
|------|--------|
| DEDUP | ✅ CLEAR — 0 posts for `mold`, `solar`, `ventilation`; no matching slugs |
| CANNIBALISATION | ✅ CLEAR — new slug, no existing cluster |
| SUBSTANCE FLOOR | ✅ ~1,100 words EN, ~1,600 CJK chars ZH, 6 FAQ Q&A pairs |

### Blog API Status
- Blog API confirmed alive (HTTP 200)
- Slug `mold-remediation-cost-vancouver-2026` confirmed not in DB (rowCount: 0)
- Hero image: `https://pub-b88db8c50fd64a9a87f60a4486a4a488.r2.dev/...` (real R2 URL, verified in DB)
- **BLOCKED:** Shell security scanner blocks `.dev` in terminal curl commands; execute_code requires interactive approval; pnpm/node not available in this environment

### Content Written
- Full HTML article drafted: `/workspace/repo/blog-drafts/mold-remediation-cost-vancouver-2026.md`
- JSON metadata file: `/workspace/repo/blog-drafts/mold-remediation-cost-vancouver-2026.json`
- Topics covered:
  - Cost by scope table ($500 – $30,000+)
  - Vancouver climate factors (1,400–1,700mm rainfall, 1980s–90s vapour barrier gaps)
  - Inspection costs ($250–$1,200)
  - BC Building Code 2024 / Vancouver Bylaw
  - WorkSafeBC compliance
  - 6 FAQ Q&A pairs (EN + ZH)
  - Post-remediation steps

### SEO Tick Findings

| Check | Result |
|-------|--------|
| Attic-insulation post | ✅ Published this session (Ladder 1) |
| Mold dedup | ✅ CLEAR — 0 posts for mold/solar/ventilation |
| Guides competition | ✅ /en/guides/mold/ = 404, /solar/ = 404, /ventilation/ = 404 |
| service_areas meta trim | ⚠️ richmond (163 > 155), west-vancouver (157 > 155) — migrations written but not applied |
| Hero image DB | ⚠️ `projects.hero_image_url` query with explicit cols returned 5 rows; earlier `SELECT *` returned 0 rows — confirms explicit column list requirement |
| `.dev` URL block | 🚫 Shell scanner blocks `.dev` in terminal — publish via Blog API blocked; execute_code needs approval |

## SEO Tick Summary

| Ladder | Finding | Action |
|--------|---------|--------|
| L1 (attic insulation) | ✅ Published `attic-insulation-cost-vancouver-2026` this session | Done |
| L2 (mold query) | ✅ Content written, slug CLEAR, hero image confirmed | **Publish blocked by env — needs pnpm/blog-publish or DB INSERT** |
| Schema | Confirmed: explicit col lists required for `projects.hero_image_url` | Documented |
| service_areas | richmond + west-vancouver meta_description_en over 155 chars | Migrations written, not applied |

## Blocking Issue
- **Cannot publish via Blog API or DB INSERT** — `.dev` domain blocked in all terminal shell commands by security scanner; `execute_code` requires interactive one-shot approval; pnpm/node unavailable in this container environment
- **Workaround available:** Run `pnpm blog:publish -f blog-drafts/mold-publish.json --publish` on a machine with pnpm + node + .env.local

## Commit
```
seo: draft mold-remediation-cost-vancouver-2026 — Ladder 2, EN+ZH, FAQ, cost table [tick 2026-09-25]
```
