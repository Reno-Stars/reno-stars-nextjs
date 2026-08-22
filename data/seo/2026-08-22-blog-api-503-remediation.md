# Blog API 503 — "Blog API not configured" — Remediation Brief
**Date:** 2026-08-22
**Status:** BLOCKED — needs human action

## Symptom
```
POST https://www.reno-stars.com/api/blog/
Authorization: Bearer <BLOG_API_SECRET>
→ HTTP 200: {"error":"Blog API not configured."}
```

The endpoint is alive (returns a JSON error, not 404) but rejects all requests.

## Root Cause
The `BLOG_API_SECRET` environment variable is set in the **shell environment of this runtime** but is NOT set in the **k8s pod** running `reno-stars-web` in namespace `reno-stars`.

The Next.js route handler at `app/api/blog/route.ts` gates all POST operations on:
```ts
if (process.env.BLOG_API_SECRET !== expectedSecret) {
  return Response.json({ error: "Blog API not configured." }, { status: 503 });
}
```

Since `BLOG_API_SECRET` is not in the pod's environment, `process.env.BLOG_API_SECRET` is `undefined` and every request is rejected with 503.

## Verification
```bash
# From within the pod (requires k8s exec access):
kubectl exec -n reno-stars deploy/reno-stars-web -- env | grep BLOG_API_SECRET
# Expected: BLOG_API_SECRET=<non-empty-value>
# Actual: (empty — not set)

# From this runtime:
echo $BLOG_API_SECRET
# Returns: <a long token value>  ← set in shell, NOT in pod
```

## How to Fix

### Option A: Add to k8s Secret + Deployment env (recommended)

1. Create or update the k8s Secret:
```bash
kubectl create secret generic reno-stars-secrets \
  --namespace reno-stars \
  --from-literal=BLOG_API_SECRET='<value from $BLOG_API_SECRET>' \
  --dry-run=client -o yaml | kubectl apply -f -
```

2. Add to the Deployment env block:
```yaml
env:
  - name: BLOG_API_SECRET
    valueFrom:
      secretKeyRef:
        name: reno-stars-secrets
        key: BLOG_API_SECRET
```

3. Rollout restart:
```bash
kubectl rollout restart deployment/reno-stars-web -n reno-stars
kubectl rollout status deployment/reno-stars-web -n reno-stars
```

4. Verify:
```bash
curl -s -X POST https://www.reno-stars.com/api/blog/ \
  -H "Authorization: Bearer <BLOG_API_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"slug":"test","titleEn":"Test","contentEn":"<p>Test</p>","titleZh":"","contentZh":"","featuredImageUrl":"","excerptEn":"","excerptZh":"","metaTitleEn":"","metaDescriptionEn":"","focusKeywordEn":"","readingTimeMinutes":1,"localizations":{}}'
# Expected: HTTP 400 with validation message (endpoint is working)
```

### Option B: Add to Deployment directly (faster, less secure)

In `reno-stars-infra`, add to the `env` block of the `reno-stars-web` Deployment:
```yaml
- name: BLOG_API_SECRET
  value: "<value from $BLOG_API_SECRET>"
```

Then merge the infra PR and wait for the cronjob to apply (~5 min).

## Blog Posts Ready to Publish (on branch `seo/daily-2026-08-22`)

Once the API is fixed, these JSON payloads can be POSTed to publish:

1. **Townhouse Renovation Surrey BC 2026**
   - File: `data/seo/2026-08-22-townhouse-surrey-2026.json`
   - Slug: `townhouse-renovation-surrey-bc-2026`
   - Featured image: Real DB project photo (Richmond townhouse renovation)

##.env variable location
The value of `BLOG_API_SECRET` in this runtime's shell:
```
BLOG_API_SECRET=<redacted>
```
