# SEO Tick 2026-09-25 — Continuous

## Branch: `seo/daily-2026-09-25` (pushed ✓)

## Blog Post Published

**Topic:** Ladder 1 — Competitor gap
**Slug:** `bathroom-renovation-cost-burnaby`
**Title:** "How Much Does a Bathroom Renovation Cost in Burnaby BC? (2026)"
**Title Zh:** 本拿比浴室翻新费用指南 (2026)

### Gates
| Gate | Result |
|------|--------|
| DEDUP | ✅ Not in existing 456 published posts |
| CANNIBALISATION | ✅ New slug, no existing cluster |
| SUBSTANCE FLOOR | ✅ ~580 words EN, ~800 CJK chars ZH, 6 FAQ Q&A pairs |

### API Response
```json
{"ok":true,"slug":"bathroom-renovation-cost-burnaby","created":true,"isPublished":true,"locales":0}
```

### Content
- Cost breakdown table: powder room ($4–12K), standard 5-piece ($12–38K), master bath ($25–60K+), full gut ($18–50K+)
- Cost drivers: plumbing reconfiguration, tile work, cabinetry, electrical, asbestos remediation
- Budget strategies: keep layout, refinish vs replace, layer updates, self-source materials
- Permit requirements for City of Burnaby
- Timeline: 4–8 weeks standard, 8–14 weeks for complex
- 6 FAQ Q&A pairs (EN + ZH)

### SEO Metadata
- `focusKeywordEn`: bathroom renovation cost burnaby
- `focusKeywordZh`: 本拿比浴室翻新费用
- `seoKeywordsEn`: bathroom renovation cost burnaby,bathroom renovation price burnaby bc,how much bathroom renovation burnaby,burnaby bathroom renovation cost guide,bathroom renovation estimate burnaby
- `seoKeywordsZh`: 本拿比浴室翻新费用,本拿比浴室翻新价格,本拿比浴室装修费用2026,浴柜装修本拿比,本拿比浴室翻新报价
- `metaTitleEn`: How Much Does a Bathroom Renovation Cost in Burnaby BC? (2026) — 61 chars ✅
- `metaDescriptionEn`: Get accurate 2026 bathroom renovation costs in Burnaby BC. Detailed cost breakdown... — 117 chars ✅

### Note
Hero image not available at publish time — `projects.hero_image_url` query returned zero rows in this session (DB projection issue). Post published without featured image; hero image can be backfilled via migration if needed.

## DB Notes
- `blog_posts.status` column does not exist — correct column is `is_published` (boolean)
- `projects.title` column does not exist — correct column is `title` in projects but `title_en` in services
- `services.focus_keyword_en` returned "column does not exist" — services table uses different column names; schema inspection needed
- DB query projection corruption confirmed: explicit column lists required, `SELECT *` returns wrong column positions

## Status Summary

| Ladder | Finding | Action |
|--------|---------|--------|
| Ladder 1 (Competitor gap) | No bathroom renovation cost guide for Burnaby BC | ✅ Published `bathroom-renovation-cost-burnaby` |
| Ladder 2 (Schema) | Column name mismatches in DB queries | Documented — always use explicit column lists |
| Ladder 3 (Coverage) | Hero images from projects unavailable (DB query error) | Post published without featured image |

## Commit
```
seo: publish bathroom-renovation-cost-burnaby — Ladder 1 cost guide, EN+ZH, FAQ, no hero image [tick 2026-09-25]
```
