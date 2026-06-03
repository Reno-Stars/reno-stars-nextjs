#!/usr/bin/env python3
"""
2026-06-02 FAQ inserts for striking-distance GSC queries.

Plan ref: data/2026-06-03-daily-branch-plan.md (hub) Commit 4.
GSC scan ref: data/seo-scans/2026-06-01/gsc-striking-distance.json (hub).

What this script does:
- Inserts 3 area-tagged FAQ rows whose `question_en` literally matches
  the high-impression GSC striking-distance queries that previously
  had no exact-match FAQ on the area page:

    1. burnaby + order=3: "How much does a basement renovation cost in Burnaby?"
       Target: "basement renovations burnaby" (55 imp pos 16.3) +
               "basement remodeling burnaby"  (31 imp pos 19.4)

    2. delta + order=3: "How much does a bathroom renovation cost in Delta?"
       Target: "bathroom renovation delta" (29 imp pos 13.5)

    3. richmond + order=2: "How much does a bathroom renovation cost in Richmond?"
       Target: "bathroom renovation richmond" (204 imp pos 16.2)
       NOTE: This is the highest-impression "MISSING FAQ" target. The
       homepage /en/ currently outranks the topical area page; adding
       this exact-match FAQ to /en/areas/richmond/ may help Google
       re-rank the topical page over the next 3-4 week crawl window.

- Each FAQ has answer_en grounded in real Reno Stars project data
  pulled from the `projects` table (where projects.location_city matches
  the area slug):
    - Burnaby basement: 0 projects → generic Metro Vancouver ranges with
      Burnaby-specific neighborhood detail (Heights, Capitol Hill,
      Burnaby Mountain slopes, Brentwood/Metrotown townhouses)
    - Delta bathroom: 1 verified project at $40K-$43K
    - Richmond bathroom: 6 verified projects, range $15K-$35K

- Each FAQ also has zh translations (question_zh + answer_zh) generated
  via the free GTX endpoint with brand glossary protection (letter-only
  markers — earlier digit-marker version corrupted city names to digits
  like '18年', confirmed broken then re-translated 2026-06-02T02:05Z).

Idempotency: this is a documentation script. Already executed once at
2026-06-02T02:02-02:05Z UTC against the prod Neon DB. Re-running would
duplicate the FAQs at the same display_order, which violates ranking
intent. Do not re-run blindly — use the SELECT block at the bottom to
verify state first.

DB rows inserted (verify via SELECT):
  burnaby:  faq_id present at display_order=3 (order=4 is the bathroom-cost analog)
  delta:    faq_id present at display_order=3 (order=4 is the generic-renovation analog)
  richmond: faq_id present at display_order=2 (orders 10/11 cover basement)

Why DB INSERT and not source-tree code change:
- The FAQs table is the source-of-truth for area-page FAQ content
  (per `getFaqsByAreaFromDb(area.id)` at app/[locale]/areas/[city]/page.tsx:348)
- Matches yesterday's MT-backfill pattern (PR #104) where DB writes
  were audit-trailed via committed script files
- The FAQSchema component automatically picks up new rows on next ISR
  rebuild (Vercel revalidate triggers on DB poll or deploy)

Run verification:
  python3 -c "
  import os, psycopg2
  c = psycopg2.connect(os.environ['SERVICES_NEON_DB']).cursor()
  c.execute(\"\"\"
    SELECT sa.slug, f.display_order, f.question_en
    FROM faqs f JOIN service_areas sa ON sa.id=f.service_area_id
    WHERE (sa.slug='burnaby' AND f.display_order=3)
       OR (sa.slug='delta'   AND f.display_order=3)
       OR (sa.slug='richmond' AND f.display_order=2)
    ORDER BY sa.slug;
  \"\"\")
  for r in c.fetchall(): print(r)
  "
"""

PLANNED_INSERTS = [
    {
        "area_slug": "burnaby",
        "display_order": 3,
        "question_en": "How much does a basement renovation cost in Burnaby?",
        "answer_en": (
            "Basement renovations in Burnaby typically run $40,000–$120,000 depending on scope. "
            "A basic finish — drywall, flooring, lighting and a 3-piece bathroom — starts around $40,000–$60,000 "
            "and works well for newer Brentwood and Metrotown townhouses. Mid-range projects with a second "
            "bathroom and small kitchenette run $60,000–$95,000 — typical for legal suite conversions in The "
            "Heights and South Burnaby. High-end legal suites with separate entrance, full kitchen, and premium "
            "finishes can exceed $100,000. Sloped lots around Capitol Hill and Burnaby Mountain may require "
            "additional drainage and waterproofing work. All projects include permits, $5M CGL coverage, and a "
            "3-year workmanship warranty."
        ),
        "gsc_targets": [
            ("basement renovations burnaby", 55, 16.3),
            ("basement remodeling burnaby", 31, 19.4),
        ],
    },
    {
        "area_slug": "delta",
        "display_order": 3,
        "question_en": "How much does a bathroom renovation cost in Delta?",
        "answer_en": (
            "Based on our completed Delta bathroom project, bathroom renovations in Delta have come in around "
            "$40,000–$43,000 — covering full demolition, new plumbing fixtures, custom tile, vanity, mirror, "
            "and lighting in a typical mid-size primary ensuite. A standard hall-bathroom update will run lower "
            "($20,000–$30,000) and a luxury Tsawwassen-style spa ensuite can exceed $50,000. All Delta projects "
            "include permits, coastal-aware framing (ferry-corridor logistics for materials), $5M CGL coverage, "
            "and a 3-year workmanship warranty."
        ),
        "gsc_targets": [
            ("bathroom renovation delta", 29, 13.5),
        ],
    },
    {
        "area_slug": "richmond",
        "display_order": 2,
        "question_en": "How much does a bathroom renovation cost in Richmond?",
        "answer_en": (
            "Based on our 6 completed Richmond bathroom projects, bathroom renovations in Richmond range from "
            "$15,000 to $35,000. Standard powder rooms and small full baths in Steveston and Brighouse condos "
            "run $15,000–$22,000. Mid-range updates with custom tile work and quartz countertops run "
            "$22,000–$30,000. Premium primary ensuites in Lulu Island single-family homes reach $33,000–$35,000. "
            "All Richmond projects include strata coordination where applicable, permits handled end-to-end, "
            "$5M CGL coverage, and a 3-year workmanship warranty."
        ),
        "gsc_targets": [
            ("bathroom renovation richmond", 204, 16.2),
        ],
    },
]

# Already executed 2026-06-02T02:02-02:05Z UTC. See module docstring.
# Do NOT re-run without first checking DB state.
