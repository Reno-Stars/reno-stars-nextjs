# SEO Tick 2026-09-29 — Findings

Date: 2026-09-29 (UTC)
gh unavailable — using git.

## STOP Condition — ACTIVE

**Root cause:** `townhouse-reno-vancouver-2026` (id: `e50092a6-59f9-45a1-8ad3-4db06f6048ba`) has `seo_keywords_en = NULL` and `seo_keywords_zh = NULL`. Two migrations targeting this post are committed but NOT yet applied to DB:

- `scripts/migrations/2026-09-29-blog-seo-keywords-zh-townhouse-reno.sql`
- `scripts/migrations/2026-09-29-blog-seo-keywords-en-townhouse-reno.sql`

**Required action:** Human applies these migrations via infra pipeline after PR merge.

## STOP Condition — 11 focus_keyword_en Duplicate Clusters

Two dedup migrations committed but unapplied:
- `scripts/migrations/2026-09-29-focus-keyword-en-dedup-batch2.sql` (10 clusters)
- `scripts/migrations/2026-09-29-focus-keyword-en-dedup-coquitlam-condo.sql` (1 cluster: Coquitlam condo ×3)

**Required action:** Human applies these migrations.

## NEW Finding — 10 focus_keyword_zh Duplicate Clusters

Discovered 2026-09-29 (this tick). Not covered by any existing migration:

| focus_keyword_zh | Count | Slugs |
|---|---|---|
| 温哥华厨房装修 | 4 | budget-vs-luxury-kitchen-renovation-vancouver-2026, vancouver-kitchen-renovation-case-study, vancouver-kitchen-renovation-case-study-2, kitchen-renovation-vancouver-bc-2026 |
| 温哥华地下室装修 | 3 | basement-renovation-vancouver-2026-costs-permits, basement-vs-main-floor-renovation-vancouver-2026, basement-renovation-vancouver-complete-guide |
| 温哥华厨房装修费用 | 3 | kitchen-renovation-cost-vancouver-2026, how-much-does-kitchen-renovation-cost-vancouver-2026, vancouver-kitchen-renovation-cost-zh |
| 列治文全屋装修 | 3 | richmond-whole-house-renovation-case-study-3, richmond-whole-house-renovation-case-study-2, richmond-whole-house-renovation-case-study |
| 西溫哥華浴室翻新 | 2 | bathroom-renovation-west-vancouver-2026, west-vancouver-two-bathroom-renovation-2026 |
| (6 more clusters) | 2 each | — |

**Suggested next action:** After current dedup migrations are applied, write a `focus_keyword_zh` dedup migration.

## 5 Zero-Link Projects Found

Projects published with hero images but zero mentions in any published blog post (internal link equity gap):

1. `two-bathroom-renovation-burnaby-3` — Burnaby, bathroom
2. `commercial-warehouse-burnaby` — Burnaby, commercial
3. `two-bathroom-renovation-richmond-2` — Richmond, bathroom
4. `powder-room-renovation-richmond` — Richmond, service_type NULL
5. `ensuite-bathroom-renovation-richmond` — Richmond, service_type NULL

## Blog API Status

`POST https://www.reno-stars.com/api/blog/` — reachable (HTTP 405 on GET, expected). No publish attempt made — STOP blocks publishing.

## No Open PRs

`gh` CLI not available in this runtime. Remote state confirmed via git only.

## Pending Migration Backlog

88 pending migrations in `scripts/migrations/`. Skill rule: if 3+ pending migrations touch the same column type, stop and report.
