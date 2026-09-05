#!/usr/bin/env python3
"""Validate blog drafts against column limits and required fields."""
import json, glob, sys, os

LIMITS = {
    'slug': 200, 'titleEn': 255, 'titleZh': 255,
    'metaTitleEn': 70, 'metaTitleZh': 70,
    'metaDescriptionEn': 155, 'metaDescriptionZh': 155,
    'focusKeywordEn': 50, 'focusKeywordZh': 50,
    'featuredImageUrl': 500,
}
REQUIRED = [
    'slug','titleEn','titleZh','contentEn','contentZh',
    'excerptEn','excerptZh',
    'metaTitleEn','metaTitleZh',
    'metaDescriptionEn','metaDescriptionZh',
    'focusKeywordEn','focusKeywordZh',
    'featuredImageUrl','readingTimeMinutes','localizations',
]
TRADE_NAME_ZH = '聚星装修'
TRADE_NAME_WRONG = ['雷诺之星', '雷諾之星']

os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/..')
drafts_dir = 'blog-drafts'
files = sorted(glob.glob(os.path.join(drafts_dir, '*.json')))
all_ok = True

for path in files:
    name = os.path.basename(path)
    try:
        with open(path) as f:
            d = json.load(f)
    except Exception as e:
        print(f'ERROR: {name}: JSON parse failed: {e}', file=sys.stderr)
        all_ok = False
        continue

    errors = []
    for k in REQUIRED:
        if k not in d or d[k] is None:
            errors.append(f'MISSING field: {k}')
    for k, limit in LIMITS.items():
        v = d.get(k)
        if v and len(str(v)) > limit:
            errors.append(f'LENGTH: {k}={len(str(v))}/{limit} > {limit}')
    raw = json.dumps(d)
    for wrong in TRADE_NAME_WRONG:
        if wrong in raw:
            errors.append(f'TRADE NAME: contains "{wrong}"')
    loc = d.get('localizations', {})
    if loc == {}:
        errors.append('localizations: empty object {} — needs all 14 locale entries')

    if errors:
        all_ok = False
        print(f'\n{name}:')
        for e in errors:
            print(f'  {e}')
    else:
        print(f'{name}: OK')

print()
if all_ok:
    print('All drafts valid.')
    sys.exit(0)
else:
    print('Some drafts have errors.', file=sys.stderr)
    sys.exit(1)
