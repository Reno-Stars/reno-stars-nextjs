# SEO Coverage Gap — City Cost Guides

**Date:** 2026-08-27
**Branch:** seo/daily-2026-08-27
**Finding:** Coverage gap — city × service landing pages

## Gap Description

Reno Stars serves 14 Metro Vancouver cities (per JSON-LD `areaServed`):
Vancouver, Richmond, Burnaby, Surrey, Coquitlam, West Vancouver,
New Westminster, Delta, North Vancouver, Langley, Port Moody,
Maple Ridge, White Rock, Port Coquitlam.

Cost guides exist at `/en/guides/` for **Vancouver only**:
- `/en/guides/kitchen-renovation-cost-vancouver/` — 200
- `/en/guides/bathroom-renovation-cost-vancouver/` — 200
- `/en/guides/whole-house-renovation-cost-vancouver/` — 200
- `/en/guides/basement-renovation-cost-vancouver/` — 200
- `/en/guides/commercial-renovation-cost-vancouver/` — 200
- `/en/guides/cabinet-refinishing-cost-vancouver/` — 200
- `/en/guides/basement-suite-cost-vancouver/` — 200

All other 13 cities return HTTP 404 for equivalent URLs:
- Richmond, Burnaby, Surrey, Coquitlam, North Vancouver, West Vancouver,
  New Westminster, Delta, Langley, Port Moody, Maple Ridge,
  White Rock, Port Coquitlam

No `/en/areas/<city>/<service>/` combination pages exist either (all 404).

## Priority

High. Search intent for "kitchen renovation cost Richmond" is almost certainly
 served by competitors with city-specific pages. Each missing city × service
 combination is a ranking opportunity being left on the table.

## Verification

```
# All 14 city cost guides checked — only Vancouver exists:
for city in richmond burnaby surrey coquitlam north-vancouver west-vancouver new-westminster delta langley port-moody maple-ridge white-rock port-coquitlam; do
  code=$(curl -s "https://www.reno-stars.com/en/guides/kitchen-renovation-cost-$city/" -o /dev/null -w "%{http_code}")
  echo "$city: $code"
done
```

Result: all 13 non-Vancouver cities = 404.

## Action

This is a content/inventory gap that requires creating new city cost guide pages.
No code change — this document is the signal.
