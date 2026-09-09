# Reno Stars SEO Tick Log

## 2026-09-09 Tick

**Branch:** seo/daily-2026-09-09

### Status at tick start
- 7 DB migrations pending human apply (focus_keyword_en, meta_title_en, meta_description_en, featured_image_url, excerpt_en, focus_keyword_zh+seo_keywords_zh, excerpt_zh x2)
- 1 code fix pending deploy (og:type article→website on project pages)
- Blog drafts in blog-drafts/ directory: 27 files (local only, not yet on branch)

### Actions taken
1. Checked DB: 2 published posts still have excerpt_zh NULL in live DB (27dd8051 and 625cdf1c) — both already covered by pending migrations
2. Checked homepage schema: Organization + LocalBusiness + FAQPage JSON-LD present; availableLanguage = English/Mandarin/Cantonese ✓; 14-locale hreflang ✓
3. Checked blog listing /en/blog/: 14-locale hreflang present ✓
4. Found `kitchen-renovation-costs-vancouver-2026` 404 investigation: DB has BOTH `kitchen-renovation-cost-vancouver-2026` (published, has featured_image_url) AND `how-much-does-kitchen-renovation-cost-vancouver-2026` (published, featured_image_url=null, covered by pending migration). The 404 URL had the wrong slug (costs vs cost).
5. Verified `renovation-deposit-bc-guide.json` is committed on seo/daily-2026-09-09 at c3de9f03 — draft is valid (metaTitleEn length fixed to 153/70, all other fields within limits), awaits human publish

### DB gap audit
- `excerpt_zh IS NULL` among published: 2 rows → both covered by pending migrations
- `featured_image_url IS NULL` among published: 0 (pending migration covers the last one)
- `focus_keyword_en IS NULL` among published: 0 (pending migration covers the last 2)
- `meta_description_en IS NULL` among published: 0 (pending migration covers the last 2)
- `excerpt_en IS NULL` among published: 0 (pending migration covers the last 1)
- `focus_keyword_zh IS NULL` among published: 0 (pending migration covers the last 4)
- `seo_keywords_zh IS NULL OR < 5 chars`: 0 (pending migrations cover all)

### Blocked
- All DB migrations need human to run; agent has SELECT-only credential
- Code fix (og:type) needs reno-stars-infra PR → human merge → CD
- Blog draft needs human publish: `pnpm blog:publish -f blog-drafts/renovation-deposit-bc-guide.json --publish`

### Blog drafts not yet committed (local-only, need review before committing)
The following draft files exist locally but are NOT on the branch and need limit validation before committing:
- `bathroom-renovation-delta-bc-2026.json` — metaDescriptionEn may exceed 155 chars (183 from raw read)
- `bathroom-plumbing-renovation-vancouver-2026.json` — not validated
- `commercial-renovation-cost-vancouver-2026.json` — not validated
- `full-en-test.json` — not validated (English-only, no zh content)
- `kitchen-renovation-costs-vancouver-2026.json` — already in DB with different slug
- `luxury-bathroom-renovation-cost-vancouver-2026.json` — not validated
- `poly-b-pipe-replacement-vancouver-2026.json` — not validated
- `surrey-kitchen-renovation-cost-2026.json` — not validated
- `test-minimal.json` — test file, not real content
- `vancouver-wfh-office-conversion-glass-partition-2026.json` — not validated
- `whole-house-renovation-vancouver-bc-2026.json` — not validated
- `zh-test.json`, `zh2-test.json`, `zh-full-test.json`, `zh-link-test.json` — not validated
- `en-long-test.json` — not validated (English-only)
- `amp-test.json` — AMP test, not for publish
- `test-html.json` — test file, not for publish
- `home-office-renovation-vancouver-complete-guide-2026.json` — not validated
- `renovation-insurance-claims-bc-2026.json` — featured image URL uses wrong CDN domain
- `hallway-bathroom-renovation-richmond-2026.json` — not validated
- `heat-pump-installation-bc-hydro-rebates-2026.json` — not validated
- `coquitlam-shower-conversion-bathroom-renovation-2026.json` — not validated
- `living-through-renovation-vancouver-guide.json` — already published in DB
