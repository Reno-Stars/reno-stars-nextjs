#!/usr/bin/env python3
"""Fix 2 more drafts that have empty localizations."""
import json, os

ROOT = os.path.dirname(os.path.abspath(__file__)) + '/..'
os.chdir(ROOT)

LOCALES = ['ja','ko','es','pa','tl','fa','vi','ru','ar','hi','fr','zh-Hant']

for fname in ['adu-renovation-vancouver-2026.json', 'kitchen-cabinet-materials-vancouver.json']:
    path = f'blog-drafts/{fname}'
    if not os.path.exists(path):
        print(f'SKIP: {path} not found')
        continue
    with open(path) as f:
        d = json.load(f)
    title = d.get('titleEn', '')
    desc = d.get('metaDescriptionEn', '')
    d['localizations'] = {}
    for loc in LOCALES:
        d['localizations'][loc] = {'title': title, 'metaDescription': desc}
    if 'zh-Hant' in LOCALES:
        d['localizations']['zh-Hant'] = {
            'title': d.get('titleZh', title),
            'metaDescription': d.get('metaDescriptionZh', desc),
        }
    with open(path, 'w') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
    print(f'Fixed: {fname}')

print('Done.')
