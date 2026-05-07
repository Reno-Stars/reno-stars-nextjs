#!/usr/bin/env python3
"""
Re-translate flagged DB rows from data/translation-bleed-flagged.csv using the
gtx free endpoint (same pattern as ~/reno-star-business-intelligent/scripts/bulk-translate.py).

For each (table, id, locale, field) tuple in the flagged CSV:
  - Read the EN canonical (table.{field}_en).
  - gtx-translate to the target locale, with glossary protection.
  - Write back to localizations[{field}{Suffix}] via jsonb concat.

Cap: 50 fixes total (--cap 50). Throws if flagged count exceeds cap.

After completion, prints a re-audit hint and exits.
"""

import csv
import json
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

CONFIG = json.load(open(Path.home() / 'reno-star-business-intelligent/config/env.json'))
DB = CONFIG['services']['neon_db']

LOCALE_TO_GTX = {
    'zh-Hant': 'zh-TW',
    'ja':      'ja',
    'ko':      'ko',
    'es':      'es',
    'pa':      'pa',
    'tl':      'tl',
    'fa':      'fa',
    'vi':      'vi',
    'ru':      'ru',
    'ar':      'ar',
    'hi':      'hi',
    'fr':      'fr',
}

GLOSSARY = [
    'Reno Stars', 'reno-stars.com', 'WorkSafeBC', 'WCB', '$5M CGL',
    'Schluter', 'Schluter Kerdi', 'Sherwin Williams', 'Caesarstone',
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
    'Metrotown', 'Brentwood', 'Capitol Hill', 'The Heights',
]


def protect_glossary(text):
    mapping = {}
    wrapped = text
    counter = 0
    for term in sorted(GLOSSARY, key=len, reverse=True):
        if term in wrapped:
            counter += 1
            base = chr(ord('A') + (counter // 26))
            tail = chr(ord('A') + (counter % 26))
            marker = f'XQX{base}{tail}YQY'
            mapping[marker] = term
            wrapped = wrapped.replace(term, marker)
    return wrapped, mapping


def unprotect_glossary(text, mapping):
    out = text
    for marker, original in mapping.items():
        if marker in out:
            out = out.replace(marker, original)
        else:
            out = re.sub(re.escape(marker), original, out, flags=re.IGNORECASE)
            loose = ' *'.join(re.escape(c) for c in marker)
            out = re.sub(loose, original, out, flags=re.IGNORECASE)
    return out


CHUNK_SIZE = 3000


def _gtx_call(protected_text, target_lang, source_lang):
    params = {
        'client': 'gtx',
        'sl': source_lang,
        'tl': target_lang,
        'dt': 't',
        'q': protected_text,
    }
    url = 'https://translate.googleapis.com/translate_a/single?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0 Safari/537.36',
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    chunks = []
    for chunk in data[0]:
        if chunk and chunk[0]:
            chunks.append(chunk[0])
    return ''.join(chunks)


def _split_for_translate(text, max_size=CHUNK_SIZE):
    if len(text) <= max_size:
        return [text]
    out = []
    paragraphs = text.split('\n\n')
    buf = ''
    for p in paragraphs:
        candidate = (buf + '\n\n' + p) if buf else p
        if len(candidate) <= max_size:
            buf = candidate
            continue
        if buf:
            out.append(buf)
            buf = ''
        if len(p) <= max_size:
            buf = p
        else:
            sentences = p.replace('. ', '.\n\n').split('\n\n')
            sbuf = ''
            for s in sentences:
                cand = (sbuf + ' ' + s) if sbuf else s
                if len(cand) <= max_size:
                    sbuf = cand
                else:
                    if sbuf:
                        out.append(sbuf)
                    sbuf = s if len(s) <= max_size else s[:max_size]
            if sbuf:
                buf = sbuf
    if buf:
        out.append(buf)
    return out


def gtx_translate(text, target_lang, source_lang='en'):
    if not text or not text.strip():
        return text
    protected, mapping = protect_glossary(text)
    pieces = _split_for_translate(protected)
    translated_pieces = []
    for piece in pieces:
        translated_pieces.append(_gtx_call(piece, target_lang, source_lang))
        if len(pieces) > 1:
            time.sleep(0.1)
    out = '\n\n'.join(translated_pieces) if len(pieces) > 1 else translated_pieces[0]
    return unprotect_glossary(out, mapping)


def psql(sql):
    args = ['psql', DB, '-At', '-c', sql]
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f'psql err: {r.stderr[:300]}')
    return r.stdout


def sql_escape(s):
    if s is None:
        return 'NULL'
    return "'" + s.replace("'", "''") + "'"


def get_en(table, row_id, field):
    sql = f"SELECT row_to_json(t) FROM (SELECT {field}_en AS v FROM {table} WHERE id = {sql_escape(row_id)}) t;"
    out = psql(sql).strip()
    if not out:
        return None
    return json.loads(out).get('v')


def update_localization(table, row_id, key, value):
    payload = json.dumps({key: value}, ensure_ascii=False)
    sql = (
        f"UPDATE {table} "
        f"SET localizations = COALESCE(localizations, '{{}}'::jsonb) || {sql_escape(payload)}::jsonb "
        f"WHERE id = {sql_escape(row_id)};"
    )
    psql(sql)


def main():
    cap = 50
    if '--cap' in sys.argv:
        cap = int(sys.argv[sys.argv.index('--cap') + 1])
    dry_run = '--dry-run' in sys.argv

    flagged_path = Path('data/translation-bleed-flagged.csv')
    if not flagged_path.exists():
        sys.exit('Run audit-translation-bleed.py first to produce flagged.csv')

    with flagged_path.open() as f:
        flagged = list(csv.DictReader(f))

    if len(flagged) > cap:
        sys.exit(f'Flagged count ({len(flagged)}) exceeds cap ({cap}). Likely a systemic pipeline issue. Aborting; review manually.')

    print(f'Re-translating {len(flagged)} flagged tuples (cap={cap}, dry_run={dry_run})...', flush=True)

    fixed = []
    failed = []
    for i, r in enumerate(flagged, 1):
        table, row_id, field, locale, key = r['table'], r['id'], r['field'], r['locale'], r['jsonb_key']
        gtx_lang = LOCALE_TO_GTX.get(locale)
        if not gtx_lang:
            print(f'  [{i}/{len(flagged)}] SKIP {locale} (no gtx mapping)')
            continue
        print(f'  [{i}/{len(flagged)}] {table}/{r["slug"][:40]}  {locale}.{field}', flush=True)
        try:
            en_val = get_en(table, row_id, field)
            if not en_val:
                failed.append({**r, 'reason': 'no_en_value'})
                continue
            translated = gtx_translate(en_val, gtx_lang, 'en')
            if not translated or translated.strip() == en_val.strip():
                failed.append({**r, 'reason': 'gtx_returned_same_or_empty'})
                continue
            if not dry_run:
                update_localization(table, row_id, key, translated)
            fixed.append({**r, 'translated_chars': len(translated)})
            time.sleep(0.2)  # be polite to gtx
        except Exception as e:
            failed.append({**r, 'reason': f'exception: {str(e)[:120]}'})
            print(f'    ERR: {e}', flush=True)

    print(f'\nFixed: {len(fixed)}')
    print(f'Failed: {len(failed)}')
    if failed:
        for f in failed:
            print(f'  FAIL {f["table"]}/{f["slug"]}/{f["locale"]}.{f["field"]}: {f["reason"]}')

    # Write a fixed-log
    log_path = Path('data/translation-bleed-fixed.csv')
    if fixed:
        keys = list(fixed[0].keys())
        with log_path.open('w', newline='') as f:
            w = csv.DictWriter(f, fieldnames=keys)
            w.writeheader()
            w.writerows(fixed)
        print(f'\nFixed log: {log_path}')


if __name__ == '__main__':
    main()
