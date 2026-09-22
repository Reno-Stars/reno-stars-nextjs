import json, glob, sys
violations = []
for path in sorted(glob.glob("/workspace/repo/blog-drafts/*.json")):
    with open(path) as f:
        d = json.load(f)
    for col, limit in [("metaTitleEn",70),("metaTitleZh",70),("metaDescriptionEn",155),("metaDescriptionZh",155),("focusKeywordEn",50),("focusKeywordZh",50),("titleEn",255),("titleZh",255)]:
        val = d.get(col,"")
        if len(val) > limit:
            violations.append(f"{path.split('/')[-1]}: {col}={len(val)}/{limit} | {val[:80]}")
print(f"Total: {len(violations)}")
for v in violations: print(v)
