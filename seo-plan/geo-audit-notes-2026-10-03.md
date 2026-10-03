# GEO Audit — reno-stars.com — 2026-10-03

## Score: 78/100

## AI Crawler Posture (robots.txt) ✅
- Allowed: GPTBot, PerplexityBot, ClaudeBot, Google-Extended, Bingbot, Applebot-Extended
- Blocked: CCBot, anthropic-ai, cohere-ai, Diffbot, omgili/omgilibot (training crawlers)
- Verdict: Correct posture — maximizes AI search visibility without training content donation

## llms.txt ✅
- `/llms.txt` — 170 lines, ISR 7d, company facts + services + areas + key pages + 7 FAQs
- `/llms-full.txt` — 109 lines, ISR 7d, full catalog: all services + areas + 14 locales + 451 blog posts
- Both generated from DB/SSOT config — no drift risk

## RSL 1.0 ❌ ABSENT
- Neither llms.txt nor llms-full.txt contains License:, RSL, or License-Version:
- AI platforms may cite but have no explicit citation permission grant
- Fix: add RSL block to both route.ts files (see below)

## Brand Mentions
- YouTube: @RenostarsAI ✅
- Reddit: present ✅
- LinkedIn: Reno Stars Construction Inc. ✅
- Facebook: ✅
- X: @Renostars_ca ✅
- TikTok: @renostars.renovation_yvr ✅
- Xiaohongshu: ✅
- Wikipedia: ❌ ABSENT — 47.9% of ChatGPT citations are Wikipedia-sourced

## Visible Author Byline ❌ ABSENT
- Homepage has no visible "By [Name]" — JSON-LD @type Person only, invisible without JS
- Anonymous authorship is a weak authority signal for AI citation

## SSR ✅
- Next.js App Router with ISR — fully server-rendered, AI crawlers get complete HTML

## Top 5 Actions
1. Add RSL 1.0 terms to llms.txt + llms-full.txt (low effort, high impact)
2. Add visible byline to homepage + articles (By Reno Stars Team)
3. Expand llms.txt FAQ answers to 134–167 words each
4. Build Wikipedia presence for brand
5. Verify @type: Organization JSON-LD on homepage

## RSL Block to Add
```
const rslBlock = [
  '',
  '---',
  'License: https://creativecommons.org/licenses/by-nc/4.0/',
  'License-Version: 1.0',
  'AI Citation: Content on this site may be cited by AI search engines and answer engines (ChatGPT, Perplexity, Google AI Overviews, Claude) for informational purposes. Commercial reproduction or use requires prior written permission from Reno Stars Construction Inc.',
].join('\n');
```
Add rslBlock to body array in llms.txt/route.ts and llms-full.txt/route.ts.
