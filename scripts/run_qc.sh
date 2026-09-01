#!/bin/bash
export $(grep -v '^#' /tmp/rs-nextjs/.env.local | xargs) 2>/dev/null || true
echo "TOKEN=${DB_QUERY_API_TOKEN:0:8}..."
echo "URL=$DB_QUERY_API_URL"
python3 - <<'PYEOF'
import os, urllib.request, json

token = os.environ.get("DB_QUERY_API_TOKEN","")
url   = os.environ.get("DB_QUERY_API_URL","")   # already ends with /query
print(f"token={token[:8]}... url={url}")

queries = {
    "blog_excerpt_zh":      "SELECT id, slug, excerpt_zh FROM blog_posts WHERE excerpt_zh IS NOT NULL AND excerpt_zh <> '' AND excerpt_zh !~ '[一-鿿]' LIMIT 20",
    "services_desc_zh":      "SELECT id, slug, description_zh FROM services WHERE description_zh IS NOT NULL AND description_zh <> '' AND description_zh !~ '[一-鿿]' LIMIT 20",
    "service_areas_desc_zh":"SELECT id, city, description_zh FROM service_areas WHERE description_zh IS NOT NULL AND description_zh <> '' AND description_zh !~ '[一-鿿]' LIMIT 20",
    "proj_scopes_challenge_zh": "SELECT id, slug, challenge_zh, solution_zh FROM project_scopes WHERE challenge_zh IS NOT NULL AND challenge_zh <> '' AND challenge_zh !~ '[一-鿿]' LIMIT 20",
    "proj_scopes_solution_zh":  "SELECT id, slug, challenge_zh, solution_zh FROM project_scopes WHERE solution_zh IS NOT NULL AND solution_zh <> '' AND solution_zh !~ '[一-鿿]' LIMIT 20",
}

for name, sql in queries.items():
    payload = json.dumps({"sql": sql}).encode()
    req = urllib.request.Request(url, data=payload,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST")
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            d = json.loads(r.read())
            rows = d.get("rows", [])
            print(f"\n=== {name}: {d.get('rowCount',0)} rows ===")
            for row in rows[:5]:
                print(row)
    except Exception as e:
        print(f"\n=== {name}: ERROR {e} ===")
PYEOF
