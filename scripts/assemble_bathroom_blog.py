#!/usr/bin/env python3
import json, sys

chunk1 = open('/tmp/bathroom_chunk1.json').read()
chunk2 = open('/tmp/bathroom_chunk2.json').read()
chunk3 = open('/tmp/bathroom_chunk3.json').read()
chunk4 = open('/tmp/bathroom_chunk4.json').read()

# Extract contentEn (strip surrounding quotes from chunk1 which wraps the JSON string)
c1 = json.loads(chunk1)
c2_raw = chunk2.strip()
c3_raw = chunk3.strip()
c4_raw = chunk4.strip()

content_en = c1['contentEn'] + c2_raw + c4_raw
content_zh = c1.get('contentZh', '') + c3_raw

post = {
    "titleEn": c1['titleEn'],
    "titleZh": c1['titleZh'],
    "slug": c1['slug'],
    "focusKeywordEn": c1['focusKeywordEn'],
    "focusKeywordZh": c1['focusKeywordZh'],
    "metaTitleEn": c1['metaTitleEn'],
    "metaTitleZh": c1['metaTitleZh'],
    "metaDescriptionEn": c1['metaDescriptionEn'],
    "metaDescriptionZh": c1['metaDescriptionZh'],
    "excerptEn": c1['excerptEn'],
    "excerptZh": c1['excerptZh'],
    "contentEn": content_en,
    "contentZh": content_zh,
    "featuredImageUrl": "https://www.reno-stars.com/images/projects/vancouver-whole-house-bathroom-renovation-hero.jpg",
    "projectIds": [],
    "titleJa": "",
    "contentJa": "",
    "titleKo": "",
    "contentKo": "",
    "titleVi": "",
    "contentVi": "",
    "titleTh": "",
    "contentTh": "",
    "titleId": "",
    "contentId": "",
    "titleMs": "",
    "contentMs": "",
    "titleZhHant": "",
    "contentZhHant": ""
}

# Remove empty top-level locale fields
post = {k: v for k, v in post.items() if v != ""}

out = json.dumps(post, indent=2, ensure_ascii=False)
with open('blog-drafts/vancouver-bathroom-renovation-timeline-2026.json', 'w') as f:
    f.write(out)

print(f"Written: {len(out)} chars, {out.count(chr(10))} lines")
