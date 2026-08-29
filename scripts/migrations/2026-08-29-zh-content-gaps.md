# Migration: 2026-08-29 ZH Content Gaps — 6 Posts Need Full Chinese Translation

## NOT APPLIED — human action required

These 6 published posts have 9,600–12,800 char English content but only 22–193 char Chinese (placeholder level). All have 2026 focus, SSMUH/permit content that Chinese-speaking homeowners in Vancouver actively search for.

| slug | EN chars | ZH chars | ZH:EN ratio |
|------|----------|----------|--------------|
| kitchen-vs-bathroom-reno-vancouver-2026 | ~9,700 | 22 | 0.2% |
| adu-renovation-vancouver-2026 | 9,611 | 148 | 1.5% |
| split-level-home-renovation-burnaby-coquitlam-2026 | 11,040 | 180 | 1.6% |
| vancouver-infill-development-cost-2026 | 10,424 | 182 | 1.7% |
| heritage-home-renovation-vancouver-2026 | 12,456 | 188 | 1.5% |
| mid-century-rancher-renovation-vancouver-2026 | 12,869 | 193 | 1.5% |

## Recommended action

For each slug, write genuine Chinese content (target ≥80% of EN word count). Topics:
- `kitchen-vs-bathroom`: 温哥华装修先厨房还是先卫生间？厨房vs卫生间改造优先级判断
- `adu-renovation-vancouver-2026`: 温哥华ADU装修2026 — SSMUH许可、真实成本
- `split-level-home-renovation`: Burnaby/Coquitlam错层房屋改造 — 2026成本与布局指南
- `vancouver-infill-development-cost-2026`: 温哥华填充开发与分地2026 — SSMUH许可
- `heritage-home-renovation-vancouver-2026`: 温哥华遗产房屋改造 — 2026许可指南与成本
- `mid-century-rancher-renovation-vancouver-2026`: 温哥华中世纪牧场风格改造 — 2026成本与特色保护

Update: `UPDATE blog_posts SET content_zh = '<full Chinese HTML>', title_zh = '<Chinese title>' WHERE slug = '<slug>' AND is_published = true;`

IDs already covered by prior migrations: none of these slugs appear in prior migration files.
