# GEO Audit — reno-stars.com — 2026-10-03

## Score: 86/100

## AI Crawler Posture (robots.txt)
- GPTBot ✅ Allowed (OpenAI / ChatGPT web search)
- PerplexityBot ✅ Allowed (Perplexity AI search)
- ClaudeBot ✅ Allowed (Anthropic / Claude web features)
- Google-Extended ✅ Allowed (Google AI Overviews / SGE)
- Applebot-Extended ✅ Allowed (Apple Intelligence)
- CCBot 🚫 Blocked (Common Crawl / training — correct posture)
- anthropic-ai 🚫 Blocked (Anthropic training)
- cohere-ai 🚫 Blocked (Cohere training)

## RSL 1.0 — SHIPPED
- `app/llms.txt/route.ts` lines 151-157: RSL block present
- `app/llms-full.txt/route.ts` lines 101-107: RSL block present
- License: CC BY-NC 4.0
- AI Citation clause grants explicit citation rights for ChatGPT, Perplexity, Google AI Overviews, Claude

## Author Byline — SHIPPED
- `components/pages/HomePage.tsx` lines 144 + 173
- Text: `By Reno Stars Team · Vancouver Renovation Experts Since {company.foundingYear}`
- Note: JSON-LD Person schema is invisible to readers; visible HTML byline is what AI crawlers read

## llms.txt — PRESENT
- `/llms.txt` — 179-line route.ts, DB-generated, FAQ + company facts + services
- `/llms-full.txt` — 117-line route.ts, full blog catalog + services + areas
- Both: text/plain, 1h cache, 7d ISR revalidation

## JSON-LD — PRESENT
- 50+ matches for Organization/LocalBusiness/HomeAndConstructionBusiness
- Homepage: sameAs + aggregateRating
- ArticleSchema on blog posts

## Blog Corpus — 454 published posts
- All genuine (150+ words, HTML, CTA, FAQ, real project links)
- GEO-optimized structure: answer-first openings, question H2s, 134-167 word passages

## Wikipedia — ABSENT (TOP PRIORITY GAP)
- ChatGPT cites Wikipedia for 47.9% of informational queries
- Reno Stars has no Wikipedia article or entry
- **Action required: human creation**

## YouTube — ABSENT
- 0.737 correlation with AI citations (strongest brand signal per Ahrefs 2025)
- Project walkthrough videos would materially improve GEO

## Score Breakdown
| Factor | Score |
|--------|-------|
| AI Crawler Access | 20/20 |
| RSL 1.0 | 20/20 |
| Author Byline | 18/20 |
| llms.txt | 10/10 |
| JSON-LD | 8/10 |
| Blog Corpus | 10/10 |
| Wikipedia | 0/10 |
| **Total** | **86/100** |
