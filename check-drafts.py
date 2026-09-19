#!/usr/bin/env python3
"""Validate blog-drafts field lengths and Chinese content."""
import json, glob

drafts = sorted(glob.glob("blog-drafts/*.json"))
violations = []
total = 0
for path in drafts:
    name = path.split("/")[-1]
    total += 1
    try:
        d = json.load(open(path))
    except Exception as e:
        violations.append(f"{name}: JSON PARSE ERROR {e}")
        continue
    
    issues = []
    for key, maxlen in [
        ("metaTitleEn", 70), ("metaTitleZh", 70),
        ("metaDescriptionEn", 155), ("metaDescriptionZh", 155),
        ("focusKeywordEn", 50), ("focusKeywordZh", 50),
        ("featuredImageUrl", 500),
    ]:
        val = d.get(key, "")
        if len(val) > maxlen:
            issues.append(f"{key}={len(val)}/{maxlen}")
    zh = d.get("titleZh", "")
    has_cjk = any(ord(c) > 127 for c in zh)
    if not has_cjk:
        issues.append(f"titleZh has no CJK")
    if issues:
        violations.append(f"{name}: {', '.join(issues)}")

if violations:
    for v in violations:
        print(v)
else:
    print("All drafts pass field length and Chinese content checks")
print(f"Checked {total} drafts")
