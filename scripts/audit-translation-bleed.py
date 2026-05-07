#!/usr/bin/env python3
"""
Audit non-EN locale content in the DB for translation bleed.

Translation bleed = chunks of English left in a non-EN locale field, which
makes Google flag the page as a duplicate of the EN canonical and refuse to
index it ("Crawled - currently not indexed").

Heuristic: measure verbatim overlap with the EN canonical via word-5-grams.
For each non-EN value, build the set of word-5-grams (case-insensitive) and
the same for the EN canonical. en_ratio = |non_en_5grams ∩ en_5grams| /
|non_en_5grams|.

A correctly translated French/Spanish/Tagalog page will have ~0% verbatim
5-gram overlap with the EN source even though many individual words are
4+ Latin chars. A bled page (English chunks left in) will share most 5-grams.

Glossary terms ("Reno Stars", city names, "WorkSafeBC", ...) and URLs are
stripped before tokenizing — they're identical in every locale and would
inflate overlap.

Threshold: en_ratio > 0.30 → flagged. Tuning notes:
  - Latin-script locales (es, fr, tl, vi): typical clean translation < 0.05
  - CJK locales (zh, ja, ko): tokenization differs, but if EN bled in then the
    EN 5-grams will appear verbatim → still works
  - Numbers and city names removed → won't trigger false positives

Cap: only consider fields with at least 50 word-tokens. Smaller fields are
too noisy. The audit also requires the EN reference field to be non-empty.

Outputs:
  data/translation-bleed-audit.csv      — every audited tuple
  data/translation-bleed-flagged.csv    — flagged subset
"""

import csv
import json
import re
import subprocess
import sys
from pathlib import Path

CONFIG = json.load(open(Path.home() / 'reno-star-business-intelligent/config/env.json'))
DB = CONFIG['services']['neon_db']

# Locale → camelCase suffix used in jsonb keys
LOCALES = [
    ('zh-Hant', 'ZhHant'),
    ('ja',      'Ja'),
    ('ko',      'Ko'),
    ('es',      'Es'),
    ('pa',      'Pa'),
    ('tl',      'Tl'),
    ('fa',      'Fa'),
    ('vi',      'Vi'),
    ('ru',      'Ru'),
    ('ar',      'Ar'),
    ('hi',      'Hi'),
    ('fr',      'Fr'),
]

THRESHOLD = 0.30
N_GRAM = 5
MIN_TOKENS = 30  # don't flag tiny fields

# Brand / proper-noun glossary that should survive translation verbatim.
GLOSSARY = [
    'Reno Stars', 'reno-stars.com', 'WorkSafeBC', 'WCB', 'CGL',
    'Schluter Kerdi', 'Schluter', 'Sherwin Williams', 'Caesarstone',
    'LVP', 'RGB', 'LED', 'GFCI', 'HVAC', 'BC', 'BCBC', 'CSA',
    'Energy Star', 'Built Green', 'Net Zero',
    'Vancouver', 'Burnaby', 'Coquitlam', 'Richmond', 'Surrey',
    'Maple Ridge', 'Port Coquitlam', 'Port Moody', 'White Rock',
    'North Vancouver', 'West Vancouver', 'New Westminster',
    'Langley', 'Delta', 'Ladner', 'Tsawwassen',
    'Burke Mountain', 'Westwood Plateau', 'Maillardville', 'Austin Heights',
    'Eagle Ridge', 'Ranch Park', 'Heritage Mountain', 'Ioco', 'Newport',
    'Fleetwood', 'Newton', 'Cloverdale', 'Lynn Valley', 'Lonsdale',
    'Deep Cove', 'Caulfeild', 'Dundarave', 'Ambleside',
    'Citadel Heights', 'Lincoln Park', 'Oxford Heights',
    'Birchland Manor', 'Riverwood',
    'Albion', 'Cottonwood', 'Hammond', 'Haney',
    'Metrotown', 'Brentwood', 'Capitol Hill',
    'Kitsilano', 'Mount Pleasant', 'Yaletown', 'Gastown', 'Granville',
    'Strathcona', 'Fairview', 'Marpole', 'Kerrisdale', 'Shaughnessy',
    'Steveston', 'Brighouse',
    'IKEA', 'Home Depot', 'BC Hydro', 'Fortis', 'Telus',
    'CRA', 'PST', 'GST', 'HST',
]

# Fields we audit. EN canonical column has _en suffix.
AUDIT_FIELDS = {
    'blog_posts': ['content', 'excerpt', 'title', 'meta_title', 'meta_description'],
    'services':   ['description', 'long_description'],
    'service_areas': ['content', 'highlights', 'description'],
    'project_sites': ['description', 'excerpt'],
    'projects':   ['description', 'excerpt'],
}


# ---------------- text cleaning -------------------------------------------

URL_RE = re.compile(r'https?://\S+|www\.\S+')
EMAIL_RE = re.compile(r'\b[\w.+-]+@[\w-]+\.[\w.-]+\b')
CODE_FENCE_RE = re.compile(r'```.*?```', re.DOTALL)
INLINE_CODE_RE = re.compile(r'`[^`]+`')
HTML_TAG_RE = re.compile(r'<[^>]+>')
IMG_REF_RE = re.compile(r'!\[[^\]]*\]\([^)]+\)')
LINK_RE = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
MD_HEADER_RE = re.compile(r'^#{1,6}\s+', re.MULTILINE)
MD_PUNCT_RE = re.compile(r'[\*_~`#>|\-=:!?,.;()\[\]{}"\'/\\]+')
NUMBER_RE = re.compile(r'\b[\d,$.]+\b')


def strip_glossary(text):
    out = text
    for term in sorted(GLOSSARY, key=len, reverse=True):
        out = re.sub(re.escape(term), ' ', out, flags=re.IGNORECASE)
    return out


def clean_for_audit(text):
    if not text:
        return ''
    s = text
    s = CODE_FENCE_RE.sub(' ', s)
    s = INLINE_CODE_RE.sub(' ', s)
    s = IMG_REF_RE.sub(' ', s)
    s = LINK_RE.sub(r'\1', s)  # keep link text only
    s = URL_RE.sub(' ', s)
    s = EMAIL_RE.sub(' ', s)
    s = HTML_TAG_RE.sub(' ', s)
    s = MD_HEADER_RE.sub(' ', s)
    s = NUMBER_RE.sub(' ', s)
    s = strip_glossary(s)
    s = MD_PUNCT_RE.sub(' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s.lower()


def tokenize(text):
    """Whitespace tokens only; lowercased."""
    return clean_for_audit(text).split()


def ngrams(tokens, n=N_GRAM):
    if len(tokens) < n:
        return set()
    return set(' '.join(tokens[i:i+n]) for i in range(len(tokens) - n + 1))


def en_overlap_ratio(text, en_text):
    """ratio = |ngrams(text) ∩ ngrams(en_text)| / |ngrams(text)|.
    Returns (ratio, n_tokens, n_ngrams_text, n_overlap)."""
    text_tokens = tokenize(text)
    en_tokens = tokenize(en_text)
    text_ngrams = ngrams(text_tokens)
    en_ngrams = ngrams(en_tokens)
    if not text_ngrams:
        return 0.0, len(text_tokens), 0, 0
    overlap = text_ngrams & en_ngrams
    return len(overlap) / len(text_ngrams), len(text_tokens), len(text_ngrams), len(overlap)


# ---------------- DB plumbing ---------------------------------------------

def psql_json(sql):
    args = ['psql', DB, '-At', '-F', '|', '-c', sql]
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f'psql err: {r.stderr[:300]}')
    rows = []
    for line in r.stdout.split('\n'):
        line = line.strip()
        if not line:
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    return rows


def fetch_table(table, fields, where=''):
    cols = ['id', 'slug']
    for f in fields:
        cols.append(f'{f}_en AS "{f}_en"')
    cols.append('localizations')
    inner = f"SELECT {', '.join(cols)} FROM {table} {where} ORDER BY id"
    return psql_json(f"SELECT row_to_json(t) FROM ({inner}) t")


# ---------------- main audit ----------------------------------------------

def audit():
    out_rows = []
    for table, fields in AUDIT_FIELDS.items():
        where = ''
        if table in ('blog_posts', 'projects', 'project_sites'):
            where = 'WHERE is_published = true'
        elif table == 'service_areas':
            where = 'WHERE is_active = true'
        rows = fetch_table(table, fields, where)
        print(f'  {table}: {len(rows)} rows', flush=True)
        for row in rows:
            loc = row.get('localizations') or {}
            if isinstance(loc, str):
                try: loc = json.loads(loc)
                except: loc = {}
            for fbase in fields:
                en_val = row.get(f'{fbase}_en')
                if not en_val or len(en_val) < 80:
                    continue
                cc = fbase.split('_')[0] + ''.join(p.capitalize() for p in fbase.split('_')[1:])
                for our_loc, suffix in LOCALES:
                    key = f'{cc}{suffix}'
                    val = loc.get(key)
                    if not val or not isinstance(val, str):
                        continue
                    ratio, n_tokens, n_ngrams, n_overlap = en_overlap_ratio(val, en_val)
                    if n_tokens < MIN_TOKENS:
                        continue
                    out_rows.append({
                        'table': table,
                        'id': row['id'],
                        'slug': row.get('slug'),
                        'locale': our_loc,
                        'field': fbase,
                        'jsonb_key': key,
                        'n_tokens': n_tokens,
                        'n_ngrams': n_ngrams,
                        'n_overlap': n_overlap,
                        'en_ratio': round(ratio, 4),
                        'char_len': len(val),
                    })
    return out_rows


def main():
    print('Auditing translation bleed (5-gram overlap with EN)...', flush=True)
    rows = audit()
    flagged = [r for r in rows if r['en_ratio'] > THRESHOLD]
    flagged.sort(key=lambda r: -r['en_ratio'])

    out_path = Path('data') / 'translation-bleed-audit.csv'
    out_path.parent.mkdir(exist_ok=True)
    fields = ['table','id','slug','locale','field','jsonb_key','n_tokens','n_ngrams','n_overlap','en_ratio','char_len']
    with out_path.open('w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    flagged_path = Path('data') / 'translation-bleed-flagged.csv'
    with flagged_path.open('w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(flagged)

    print(f'\nAudited {len(rows)} (table, row, locale, field) tuples.')
    print(f'Flagged: {len(flagged)} (en_ratio > {THRESHOLD})')
    print(f'\nTop 30 worst:')
    for r in flagged[:30]:
        print(f"  {r['en_ratio']:.2%}  {r['locale']:7}  {r['table']:14}  {r['field']:18}  {r['slug']}")

    by_loc = {}
    for r in flagged:
        by_loc.setdefault(r['locale'], 0)
        by_loc[r['locale']] += 1
    print(f'\nBreakdown by locale:')
    for loc, n in sorted(by_loc.items(), key=lambda kv: -kv[1]):
        print(f'  {loc}: {n}')

    by_table = {}
    for r in flagged:
        by_table.setdefault(r['table'], 0)
        by_table[r['table']] += 1
    print(f'\nBreakdown by table:')
    for t, n in sorted(by_table.items(), key=lambda kv: -kv[1]):
        print(f'  {t}: {n}')

    if rows:
        avg_all = sum(r['en_ratio'] for r in rows) / len(rows)
        print(f'\nAverage en_ratio across all audited tuples: {avg_all:.4f}')
    if flagged:
        avg_flagged = sum(r['en_ratio'] for r in flagged) / len(flagged)
        print(f'Average en_ratio across flagged tuples: {avg_flagged:.4f}')

    print(f'\nFull audit:    {out_path}')
    print(f'Flagged only:  {flagged_path}')


if __name__ == '__main__':
    main()
