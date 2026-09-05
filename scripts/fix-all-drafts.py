#!/usr/bin/env python3
"""Fix all 9 blog drafts: meta field lengths + add localizations."""
import json, os, glob

ROOT = os.path.dirname(os.path.abspath(__file__)) + '/..'
os.chdir(ROOT)

LOCALES = ['ja','ko','es','pa','tl','fa','vi','ru','ar','hi','fr','zh-Hant']

FIXES = {
    'bathroom-plumbing-renovation-vancouver-2026.json': {
        'metaTitleEn': 'Bathroom Plumbing Costs Vancouver 2026: Permit, Re-Pipe and Timeline',
        'metaDescriptionEn': 'Real plumbing costs for bathroom renovations in Greater Vancouver 2026. What homeowners pay for rough-in, re-piping and fixtures.',
    },
    'bathroom-renovation-delta-bc-2026.json': {
        'metaTitleEn': 'Bathroom Renovation Cost Delta BC (2026): Real Project Data',
        'metaDescriptionEn': 'How much does a bathroom renovation cost in Delta BC? Real costs from 2024\u20132025 Reno Stars projects: $15K\u2013$43K. Ladner, North Delta. Free quote.',
    },
    'commercial-renovation-cost-vancouver-2026.json': {
        'metaTitleEn': 'Commercial Renovation Cost Vancouver 2026 \u2014 Office, Retail & Clinic',
        'metaDescriptionEn': 'How much does a commercial renovation cost in Vancouver in 2026? Real cost data for office, retail, restaurant, and clinic projects from Reno Stars.',
    },
    'heat-pump-installation-bc-hydro-rebates-2026.json': {
        # no meta fixes needed, just localizations
    },
    'luxury-bathroom-renovation-cost-vancouver-2026.json': {
        'metaDescriptionEn': 'How much does a luxury bathroom renovation cost in Vancouver 2026? Real costs from $25K\u2013$100K+ from completed Reno Stars projects. Tier breakdown and FAQ.',
    },
    'poly-b-pipe-replacement-vancouver-2026.json': {
        'metaTitleEn': 'Poly-B Pipe Replacement Vancouver 2026: Costs, Risks & Guide',
        'metaDescriptionEn': 'Poly-B pipe replacement in Vancouver & Metro Vancouver homes built 1986\u20131997. 2026 costs, insurance risks, and what homeowners should do now.',
    },
    'renovation-deposit-bc-guide.json': {
        'metaDescriptionEn': 'BC sets no maximum on renovation deposits. Reno Stars explains what is standard, the red flags, and how to structure payments to stay protected.',
    },
    'renovation-insurance-claims-bc-2026.json': {
        'metaDescriptionEn': 'Step-by-step guide to filing a home renovation insurance claim in BC. Covers BC Insurance Act deadlines, what is covered, disputes, and your rights.',
    },
    'whole-house-renovation-vancouver-bc-2026.json': {
        'metaTitleEn': 'Whole House Renovation Vancouver BC 2026: Costs, Permits & Projects',
        'metaDescriptionEn': 'How much does a whole house renovation cost in Vancouver BC in 2026? Cost data, permit requirements, timelines, and neighbourhood guide from Reno Stars.',
    },
}

for fname, fixes in FIXES.items():
    path = f'blog-drafts/{fname}'
    with open(path) as f:
        d = json.load(f)
    for k, v in fixes.items():
        d[k] = v
    d['localizations'] = {}
    title = d.get('titleEn', '')
    desc = d.get('metaDescriptionEn', '')
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

print('\nAll fixes applied.')
