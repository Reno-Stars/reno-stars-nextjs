#!/usr/bin/env python3
import urllib.request, json, sys

url = 'https://api.reno-stars.com/query'
token = 'rndoak_9a616e01f6b4ccd60b21f1f76da89b5c'

def q(sql):
    req = urllib.request.Request(url,
        data=json.dumps({"sql": sql}).encode(),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())

checks = [
    ("service_areas name_zh NULL/empty",
     "SELECT id, name_en FROM service_areas WHERE name_zh IS NULL OR name_zh = '' LIMIT 20"),
    ("service_areas meta_description_zh NULL/empty",
     "SELECT id, name_en FROM service_areas WHERE meta_description_zh IS NULL OR meta_description_zh = '' LIMIT 20"),
    ("services meta_description_zh NULL/empty",
     "SELECT id, title_en FROM services WHERE meta_description_zh IS NULL OR meta_description_zh = '' LIMIT 10"),
    ("project_scopes content_zh Chinese char check",
     "SELECT id FROM project_scopes WHERE content_zh IS NOT NULL AND content_zh != '' AND content_zh !~ '[一-鿿]' LIMIT 10"),
]

for label, sql in checks:
    try:
        r = q(sql)
        print(f"\n=== {label} ===")
        print(f"Found: {len(r['rows'])} rows")
        for row in r['rows'][:5]:
            print(row)
    except Exception as e:
        print(f"ERROR {label}: {e}")
