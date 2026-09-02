# Standing Work Items — September 2026

## Branch: seo/daily-2026-09-02 (COMPLETE ✅)
- Head: 513a61a
- All 4 ladders complete
- 6 reference docs committed
- 4 migrations written (pending human apply)
- 12 blog drafts committed (pending human publish)
- llms.txt DEPLOYED, robots.txt PENDING human merge

## September 2026 SEO Audit Schedule

| Date | Branch | Status |
|------|--------|--------|
| 2026-09-02 | seo/daily-2026-09-02 @ 513a61a | COMPLETE |
| 2026-09-03 | — | PENDING |
| 2026-09-04 | — | PENDING |
| 2026-09-05 | — | PENDING |
| ... | — | PENDING |

## Recurring Audit Tasks (per day)

1. **Ladder 1 — DB Content Integrity**
   - Query new rows added since yesterday (is_published, is_active flags)
   - Check for truncated zh content (LENGTH < 200)
   - Check for NULL zh columns in newly published posts

2. **Ladder 2 — New Page Schema**
   - New blog posts published since last audit
   - New service-city combinations
   - Schema validation on new pages

3. **Ladder 4 — Technical**
   - robots.txt: verify anthropic-ai/cohere-ai fix deployed
   - Sitemap: check for new entries
   - llms.txt: verify dynamic content

## Deferred Items (not actionable by agent)

- **Blog API publish**: Canvas outbound WAF blocks POST — human must publish from unrestricted env
- **DB migrations**: agent_ro credential is SELECT-only — human must apply
- **robots.txt deploy**: requires human merge via Gitea PR → reno-stars-infra → k3s
- **INP/CWV measurement**: PageSpeed API rate-limited, CrUX API blocked — no verification possible
- **kitchen-vs-bathroom zero inbound links**: editorial/content architecture decision required

