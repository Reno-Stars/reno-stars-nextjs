#!/usr/bin/env python3
"""
2026-06-02 FAQ inserts — batch 2 (Commit 6). Extends Commit 4 (ff7edfb)
to cover striking-distance area+service combos found in rows 21-36 of
the GSC scan that were missed in the initial top-20 audit.

Plan ref: data/2026-06-03-daily-branch-plan.md (hub) — extension beyond
the original 5-commit plan after re-auditing the full 36-row striking-
distance list.
GSC scan ref: data/seo-scans/2026-06-01/gsc-striking-distance.json (hub).

What this script does:
- Inserts 2 area-tagged FAQ rows whose `question_en` literally matches
  high-impression GSC striking-distance queries from rows 21-36 that
  had no exact-match FAQ on the area page:

    1. port-coquitlam + order=3: "How much does a basement renovation
       cost in Port Coquitlam?"
       Target: "basement renovations port coquitlam" (18 imp pos 13.2)

    2. coquitlam + order=3: "How much does a basement renovation
       cost in Coquitlam?"
       Target: "basement renovations coquitlam" (11 imp pos 18.4)

Why these two: both extend the "basement renovation cost in <Lower-
Mainland suburb>" pattern Commit 4 established for Burnaby. Lower-
Mainland suburbs collectively show striking-distance ranking on basement
queries — adding exact-match FAQ entries to /areas/{slug}/ pages
mirrors the FAQ schema across the suburb cluster.

Both areas had 0 projects in the projects table for basement service-
type, so answer_en uses generic Metro Vancouver basement renovation
ranges with area-specific neighborhood detail:
- Port Coquitlam: Citadel Heights, Riverwood, Lincoln Park, Oxford Heights
- Coquitlam: Burke Mountain, Westwood Plateau, Maillardville, Austin Heights

zh translations via free GTX endpoint with letter-only marker scheme
(same as Commit 4 — first batch had digit-marker corruption fix-forward,
this batch used the working letter-marker version on first attempt).

Idempotency: this is a documentation script. Already executed once at
2026-06-02T02:33Z UTC against the prod Neon DB. Do not re-run blindly.

Commit 6 target: 18 + 11 = 29 imp/28d combined. Brings daily-2026-06-03
cumulative to ~1357 imp/28d across 6 commits.

Run verification:
  python3 -c "
  import os, psycopg2
  c = psycopg2.connect(os.environ['SERVICES_NEON_DB']).cursor()
  c.execute(\"\"\"
    SELECT sa.slug, f.display_order, f.question_en
    FROM faqs f JOIN service_areas sa ON sa.id=f.service_area_id
    WHERE (sa.slug='port-coquitlam' AND f.display_order=3)
       OR (sa.slug='coquitlam'      AND f.display_order=3)
    ORDER BY sa.slug;
  \"\"\")
  for r in c.fetchall(): print(r)
  "
"""

PLANNED_INSERTS = [
    {
        "area_slug": "port-coquitlam",
        "display_order": 3,
        "question_en": "How much does a basement renovation cost in Port Coquitlam?",
        "answer_en": (
            "Basement renovations in Port Coquitlam typically run $40,000–$110,000 depending on scope. "
            "Basic finishes — drywall, flooring, lighting and a 3-piece bathroom — start around "
            "$40,000–$55,000 and suit newer Citadel Heights and Riverwood single-family homes. Mid-range "
            "projects with a second bathroom and small kitchenette run $55,000–$85,000 — common for legal "
            "suite conversions in Lincoln Park and Oxford Heights. High-end legal suites with separate "
            "entrance and full kitchen reach $90,000–$110,000. Older homes around Lincoln Park may need "
            "additional waterproofing and electrical updates. All Port Coquitlam projects include permits, "
            "$5M CGL coverage, and a 3-year workmanship warranty."
        ),
        "gsc_targets": [
            ("basement renovations port coquitlam", 18, 13.2),
        ],
    },
    {
        "area_slug": "coquitlam",
        "display_order": 3,
        "question_en": "How much does a basement renovation cost in Coquitlam?",
        "answer_en": (
            "Basement renovations in Coquitlam typically run $40,000–$130,000 depending on scope. Basic "
            "finishes — drywall, flooring, lighting and a 3-piece bathroom — start around $40,000–$60,000 "
            "and work well for older Maillardville and Austin Heights homes. Mid-range projects with a "
            "second bathroom and small kitchenette run $60,000–$95,000 — typical for legal suite conversions "
            "in Burke Mountain and Westwood Plateau. High-end legal suites with separate entrance, full "
            "kitchen, and premium finishes can exceed $100,000. Sloped Burke Mountain and Westwood Plateau "
            "lots may require additional drainage and waterproofing work. All Coquitlam projects include "
            "permits, $5M CGL coverage, and a 3-year workmanship warranty."
        ),
        "gsc_targets": [
            ("basement renovations coquitlam", 11, 18.4),
        ],
    },
]

# Already executed 2026-06-02T02:33Z UTC. See module docstring.
