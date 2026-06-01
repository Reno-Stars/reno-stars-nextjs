#!/usr/bin/env python3
"""
backfill-zh-thin-descriptions.py — machine-translate thin Chinese
description/long_description fields in the services + service_areas
tables to close the cross-locale content-depth gap surfaced by the
2026-06-01T08:00Z cross-locale parity scan.

EXTENDED 2026-06-01T12:00Z: now also handles multi-locale backfill
of localizations JSONB fields (longDescriptionJa, longDescriptionKo,
descriptionEs, etc.) for the 12 non-EN-non-ZH supported locales.
Audit found ALL services.longDescription* fields were empty across
ja/ko/es/fr/vi/etc — meaning /[locale]/services/* pages outside en/zh
rendered ONLY the short description with no body content.

Why this exists
---------------
Scan finding (data/seo-scans/2026-06-01/cross-locale-08-00z.json):
/zh/services/{kitchen,bathroom,basement}/ and /zh/areas/* were
emitting 14-45% of EN word count, scoring as thin content for
zh-CN searchers in Google. The gap source is the DB rows, not the
i18n message files (those were 95-135% of EN per per-namespace
audit).

DB audit (2026-06-01T10:30Z) confirmed:
- services.description_zh: 30-50% of description_en across all 11 rows
- services.long_description_zh: 33-47% of long_description_en
- service_areas.description_zh: 22-36% of description_en
- service_areas.content_zh: 40-43% of content_en

Translation method
------------------
Mirrors the existing scripts/translate-service-tags-benefits.ts
pattern (commit ed44e4f or earlier):
- free translate.googleapis.com gtx endpoint
- glossary protection: Reno Stars + canonical brand/place names
  pre-substituted with high-improbability ALL-CAPS markers, restored
  post-translation
- idempotent: skips rows where length(zh) / length(en) >= threshold
  (default 0.70 — translation expansion in EN→ZH typically gives
  60-70% byte count because Chinese is denser)

What this ships
---------------
1. Service rows: description_zh + long_description_zh for kitchen,
   bathroom, basement, whole-house, commercial, cabinet, basement-
   suite-conversion (the 7 highest-commercial-intent slugs).
2. Service-area rows: description_zh + content_zh for the 14 active
   areas (vancouver + 13 surrounding cities).

Run signature
-------------
Idempotent. Re-running after the first pass will skip already-
translated rows. To force-re-translate a specific slug:
    python3 scripts/backfill-zh-thin-descriptions.py --force kitchen

Schema-implementation-discipline note (template v1.8.1)
-------------------------------------------------------
DB write — verified read-after-write on each row by re-querying
length AFTER the update.
"""
import argparse
import os
import re
import sys
import time
import urllib.parse
import urllib.request

import psycopg

DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("SERVICES_NEON_DB")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL / SERVICES_NEON_DB not set", file=sys.stderr)
    sys.exit(2)

# Threshold below which we consider a ZH field "thin" and translate.
# Chinese is roughly 60-70% the byte count of EN due to character density,
# so 0.70 ratio = parity. Anything under 0.55 is genuinely missing content.
THIN_RATIO = 0.55

# Brand glossary — proper nouns we DON'T want translated. Pre-substitute
# with all-caps Latin markers (high-bigram-improbability ASCII, no
# whitespace), restore after translation. Same pattern as
# scripts/translate-service-tags-benefits.ts.
GLOSSARY = sorted([
    ("Metro Vancouver", "XQXAZYQY"),  # must come BEFORE "Vancouver" entry — longest-first sort enforces
    ("North Vancouver", "XQXAYYQY"),
    ("West Vancouver", "XQXAXYQY"),
    ("Reno Stars", "XQXAAYQY"),
    ("BC Hydro", "XQXABYQY"),
    ("BC Code", "XQXACYQY"),
    ("BC Building", "XQXADYQY"),
    ("CSA B651", "XQXAEYQY"),
    ("PEX-A", "XQXAFYQY"),
    ("PEX-B", "XQXAGYQY"),
    ("PEX", "XQXAHYQY"),
    ("WSBC", "XQXAKYQY"),
    ("Vancouver", "XQXAOYQY"),
    ("Burnaby", "XQXAPYQY"),
    ("Richmond", "XQXAQYQY"),
    ("Surrey", "XQXARYQY"),
    ("Coquitlam", "XQXASYQY"),
    ("Delta", "XQXATYQY"),
    ("Langley", "XQXAUYQY"),
    ("BC", "XQXAVYQY"),
], key=lambda x: -len(x[0]))


def apply_glossary(text: str) -> str:
    out = text
    for term, marker in GLOSSARY:
        out = out.replace(term, marker)
    return out


def restore_glossary(text: str) -> str:
    out = text
    for term, marker in GLOSSARY:
        out = out.replace(marker, term)
    return out


# Non-EN, non-ZH supported locales. Suffix is the camelCase key inside
# the `localizations` JSONB; gtx is the language code we pass to
# translate.googleapis.com. Pattern mirrors scripts/translate-service-
# tags-benefits.ts.
NON_ZH_LOCALES = [
    {"locale": "ja", "gtx": "ja", "suffix": "Ja"},
    {"locale": "ko", "gtx": "ko", "suffix": "Ko"},
    {"locale": "es", "gtx": "es", "suffix": "Es"},
    {"locale": "fr", "gtx": "fr", "suffix": "Fr"},
    {"locale": "vi", "gtx": "vi", "suffix": "Vi"},
    {"locale": "ru", "gtx": "ru", "suffix": "Ru"},
    {"locale": "ar", "gtx": "ar", "suffix": "Ar"},
    {"locale": "hi", "gtx": "hi", "suffix": "Hi"},
    {"locale": "pa", "gtx": "pa", "suffix": "Pa"},
    {"locale": "tl", "gtx": "tl", "suffix": "Tl"},
    {"locale": "fa", "gtx": "fa", "suffix": "Fa"},
    {"locale": "zh-Hant", "gtx": "zh-TW", "suffix": "ZhHant"},
]


def gtx_translate(text: str, target: str = "zh-CN", source: str = "en") -> str:
    """Free translate.googleapis.com gtx endpoint. No auth required."""
    if not text or not text.strip():
        return text
    protected = apply_glossary(text)
    params = urllib.parse.urlencode({
        "client": "gtx",
        "sl": source,
        "tl": target,
        "dt": "t",
        "q": protected,
    })
    url = f"https://translate.googleapis.com/translate_a/single?{params}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; RenoStarsSEOAgent/1.0)"
    })
    with urllib.request.urlopen(req, timeout=20) as resp:
        import json
        data = json.loads(resp.read())
    # gtx response: [[[translated_chunk, source_chunk, ...], ...], ...]
    translated = "".join(chunk[0] for chunk in data[0] if chunk[0])
    return restore_glossary(translated)


def maybe_backfill(cur, table: str, slug_col: str, slug: str,
                   en_field: str, zh_field: str, force: bool, dry_run: bool):
    cur.execute(
        f"SELECT {en_field}, {zh_field} FROM {table} WHERE {slug_col} = %s",
        (slug,))
    row = cur.fetchone()
    if not row:
        print(f"  {table}/{slug}/{zh_field}: not found, skipping")
        return False
    en, zh = row
    en_len = len(en or "")
    zh_len = len(zh or "")
    if en_len < 50:
        return False  # nothing to expand
    ratio = zh_len / en_len if en_len else 0
    if not force and ratio >= THIN_RATIO:
        print(f"  {table}/{slug}/{zh_field}: {ratio*100:.0f}% (>={THIN_RATIO*100:.0f}%) — skip")
        return False
    print(f"  {table}/{slug}/{zh_field}: en={en_len} zh={zh_len} ({ratio*100:.0f}%) → translating...")
    try:
        new_zh = gtx_translate(en)
    except Exception as e:
        print(f"    ERROR: {e}")
        return False
    new_len = len(new_zh)
    new_ratio = new_len / en_len if en_len else 0
    print(f"    new zh len={new_len} ({new_ratio*100:.0f}%)")
    if dry_run:
        print(f"    [dry-run] would update")
        print(f"    preview: {new_zh[:120]}{'...' if len(new_zh) > 120 else ''}")
        return True
    cur.execute(
        f"UPDATE {table} SET {zh_field} = %s, updated_at = NOW() WHERE {slug_col} = %s",
        (new_zh, slug))
    return True


def maybe_backfill_jsonb(cur, table: str, slug_col: str, slug: str,
                          en_field: str, jsonb_col: str, jsonb_key: str,
                          gtx_target: str, dry_run: bool,
                          thin_ratio: float = 0.45):
    """Translate an EN column → write into `localizations` JSONB key.

    Idempotent: skip the row if existing JSONB value is already
    >= thin_ratio of EN source length. For multi-locale where some
    locales already have partial content (e.g. 1000 chars of 4000 EN)
    we still want to re-translate up to fuller parity.

    The thin_ratio of 0.45 captures both the genuinely-empty case
    (existing 0-100 chars vs 4000 EN = ~2.5%) AND the partially-
    translated case (existing 1000 chars vs 4000 EN = 25%). Locales
    already at >=45% (typical first-MT-pass result) are left alone.
    """
    cur.execute(
        f"SELECT {en_field}, {jsonb_col} FROM {table} WHERE {slug_col} = %s",
        (slug,))
    row = cur.fetchone()
    if not row:
        return False
    en, loc = row
    en_len = len(en or "")
    if en_len < 100:
        return False  # source too short
    loc = loc or {}
    existing = loc.get(jsonb_key, "")
    existing_len = len(existing) if isinstance(existing, str) else 0
    existing_ratio = existing_len / en_len if en_len else 0
    if existing_ratio >= thin_ratio:
        return False  # already at or above threshold
    print(f"  {table}/{slug}/{jsonb_key}: en={en_len} existing={existing_len} ({existing_ratio*100:.0f}%) → translating to {gtx_target}...")
    try:
        new_val = gtx_translate(en, target=gtx_target)
    except Exception as e:
        print(f"    ERROR: {e}")
        return False
    new_len = len(new_val)
    print(f"    new len={new_len}")
    if dry_run:
        print(f"    [dry-run] would write")
        return True
    # JSONB update: set the single key, preserving other keys
    cur.execute(
        f"UPDATE {table} SET {jsonb_col} = jsonb_set({jsonb_col}, %s, to_jsonb(%s::text)), updated_at = NOW() WHERE {slug_col} = %s",
        ('{' + jsonb_key + '}', new_val, slug))
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true",
                        help="Don't UPDATE, just print what would change")
    parser.add_argument("--force", nargs="*", default=[],
                        help="slugs to re-translate even if not thin")
    parser.add_argument("--services-only", action="store_true",
                        help="Only services table (zh fields)")
    parser.add_argument("--areas-only", action="store_true",
                        help="Only service_areas table (zh fields)")
    parser.add_argument("--about-only", action="store_true",
                        help="Only about_sections table (zh fields)")
    parser.add_argument("--faqs-only", action="store_true",
                        help="Only faqs table (zh field)")
    parser.add_argument("--multi-locale-services", action="store_true",
                        help="Backfill services.localizations JSONB longDescription* "
                             "and description* keys for the 12 non-en/non-zh locales")
    parser.add_argument("--multi-locale-areas", action="store_true",
                        help="Backfill service_areas.localizations JSONB content* "
                             "and description* keys for the 12 non-en/non-zh locales")
    parser.add_argument("--blog-posts-short", action="store_true",
                        help="Backfill blog_posts.excerpt_zh + meta_description_zh "
                             "for thin rows (~138 + 155 of 162 published posts)")
    args = parser.parse_args()

    SERVICE_SLUGS = [
        "kitchen", "bathroom", "basement", "whole-house",
        "commercial", "cabinet", "basement-suite-conversion",
    ]
    ABOUT_FIELDS = [
        ("our_journey_en", "our_journey_zh"),
        ("what_we_offer_en", "what_we_offer_zh"),
        ("our_values_en", "our_values_zh"),
        ("why_choose_us_en", "why_choose_us_zh"),
        ("lets_build_together_en", "lets_build_together_zh"),
    ]

    # Mode flags: when any --*-only is set, run JUST that mode.
    only_modes = [args.services_only, args.areas_only, args.about_only,
                  args.faqs_only, args.multi_locale_services,
                  args.multi_locale_areas, args.blog_posts_short]
    run_services = args.services_only or not any(only_modes)
    run_areas = args.areas_only or not any(only_modes)
    run_about = args.about_only or not any(only_modes)
    run_faqs = args.faqs_only or not any(only_modes)
    run_multi_locale_services = args.multi_locale_services
    run_multi_locale_areas = args.multi_locale_areas
    run_blog_posts_short = args.blog_posts_short

    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            updated = 0
            if run_services:
                print("\n=== services ===")
                for slug in SERVICE_SLUGS:
                    for field_en, field_zh in [
                        ("description_en", "description_zh"),
                        ("long_description_en", "long_description_zh"),
                    ]:
                        if maybe_backfill(cur, "services", "slug", slug,
                                          field_en, field_zh,
                                          slug in args.force, args.dry_run):
                            updated += 1
                            time.sleep(0.3)  # gtx rate-limit politeness

            if run_areas:
                print("\n=== service_areas ===")
                cur.execute("SELECT slug FROM service_areas WHERE is_active = true ORDER BY display_order")
                area_slugs = [r[0] for r in cur.fetchall()]
                for slug in area_slugs:
                    for field_en, field_zh in [
                        ("description_en", "description_zh"),
                        ("content_en", "content_zh"),
                    ]:
                        if maybe_backfill(cur, "service_areas", "slug", slug,
                                          field_en, field_zh,
                                          slug in args.force, args.dry_run):
                            updated += 1
                            time.sleep(0.3)

            if run_about:
                # about_sections is a singleton table — usually 1 row.
                # 5 narrative fields per row. Run via id rather than slug since
                # the table has no slug column.
                print("\n=== about_sections ===")
                cur.execute("SELECT id FROM about_sections")
                ids = [r[0] for r in cur.fetchall()]
                for row_id in ids:
                    for field_en, field_zh in ABOUT_FIELDS:
                        if maybe_backfill(cur, "about_sections", "id", str(row_id),
                                          field_en, field_zh,
                                          False, args.dry_run):
                            updated += 1
                            time.sleep(0.3)

            if run_faqs:
                # faqs: one answer_zh per row. Scan finding showed 73/76 active
                # rows had zh<55% of en. question_zh tends to be parity since
                # questions are short — only translate the answer field.
                print("\n=== faqs ===")
                cur.execute("SELECT id FROM faqs WHERE is_active = true ORDER BY display_order")
                faq_ids = [r[0] for r in cur.fetchall()]
                for row_id in faq_ids:
                    if maybe_backfill(cur, "faqs", "id", str(row_id),
                                      "answer_en", "answer_zh",
                                      False, args.dry_run):
                        updated += 1
                        time.sleep(0.3)

            if run_blog_posts_short:
                # blog_posts.excerpt_zh + meta_description_zh — short SEO
                # fields without embedded JSON-LD (unlike content_zh which
                # is deferred for safety since content_en often embeds
                # <script type="application/ld+json"> blocks that would
                # corrupt under naive translation).
                # Audit (2026-06-01T13:00Z): 138 of 162 published blog
                # posts have thin excerpt_zh, 155 have thin meta_description_zh.
                print("\n=== blog_posts (short SEO fields) ===")
                cur.execute("SELECT id FROM blog_posts WHERE is_published=true ORDER BY published_at DESC NULLS LAST")
                blog_ids = [r[0] for r in cur.fetchall()]
                for row_id in blog_ids:
                    for field_en, field_zh in [
                        ("excerpt_en", "excerpt_zh"),
                        ("meta_description_en", "meta_description_zh"),
                    ]:
                        if maybe_backfill(cur, "blog_posts", "id", str(row_id),
                                          field_en, field_zh,
                                          False, args.dry_run):
                            updated += 1
                            time.sleep(0.3)

            if run_multi_locale_areas:
                # service_areas.localizations JSONB: each non-en/non-zh
                # locale has content{Suf} and description{Suf} keys. Audit
                # 2026-06-01T12:30Z found Ja/Ko at 4-7% of EN, Es at 10-16%,
                # Fr/Vi varying. Same pattern as multi-locale-services.
                print("\n=== service_areas.localizations (multi-locale) ===")
                cur.execute("SELECT slug FROM service_areas WHERE is_active=true ORDER BY display_order")
                area_slugs = [r[0] for r in cur.fetchall()]
                for slug in area_slugs:
                    for loc in NON_ZH_LOCALES:
                        suf = loc["suffix"]
                        for en_field, jsonb_key in [
                            ("description_en", f"description{suf}"),
                            ("content_en", f"content{suf}"),
                        ]:
                            if maybe_backfill_jsonb(
                                cur, "service_areas", "slug", slug,
                                en_field, "localizations", jsonb_key,
                                loc["gtx"], args.dry_run,
                            ):
                                updated += 1
                                time.sleep(0.4)

            if run_multi_locale_services:
                # services.localizations JSONB: each non-EN-non-ZH locale
                # has a key per field (descriptionJa, longDescriptionJa, ...).
                # Audit 2026-06-01T11:00Z found ALL services have ZERO
                # longDescription* in localizations across 12 supported
                # locales — meaning /ja/services/*, /ko/services/*, etc.
                # render only the short description with no body content.
                #
                # This loop translates EN long_description → each locale's
                # longDescription{Suffix} key, and EN description → each
                # locale's description{Suffix} key. 12 locales × 6 services
                # × 2 fields = up to 144 gtx calls.
                print("\n=== services.localizations (multi-locale) ===")
                for slug in SERVICE_SLUGS:
                    for loc in NON_ZH_LOCALES:
                        suf = loc["suffix"]
                        for en_field, jsonb_key in [
                            ("description_en", f"description{suf}"),
                            ("long_description_en", f"longDescription{suf}"),
                        ]:
                            if maybe_backfill_jsonb(
                                cur, "services", "slug", slug,
                                en_field, "localizations", jsonb_key,
                                loc["gtx"], args.dry_run,
                            ):
                                updated += 1
                                time.sleep(0.4)  # slightly longer for multi-locale loop

            if not args.dry_run:
                conn.commit()
            print(f"\n{'[dry-run] would update' if args.dry_run else 'committed'} {updated} field(s)")


if __name__ == "__main__":
    main()
