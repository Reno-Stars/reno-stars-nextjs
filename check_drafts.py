#!/usr/bin/env python3
import json, os

drafts_dir = '/workspace/repo/blog-drafts'
drafts = sorted(os.listdir(drafts_dir))

print(f"Total drafts: {len(drafts)}")
print()

limit_fields = {
    'metaTitleEn': 70,
    'metaDescriptionEn': 155,
    'metaTitleZh': 70,
    'metaDescriptionZh': 155,
    'focusKeywordEn': 50,
    'focusKeywordZh': 50,
}

for fname in drafts:
    if not fname.endswith('.json'):
        continue
    fpath = os.path.join(drafts_dir, fname)
    try:
        with open(fpath) as f:
            d = json.load(f)
        issues = []
        for field, limit in limit_fields.items():
            v = d.get(field, '')
            if len(v) > limit:
                issues.append(f'{field}={len(v)}/{limit}')
        title_en = d.get('titleEn', '')
        title_zh = d.get('titleZh', '')
        content_zh = d.get('contentZh', '')
        word_count = len(content_zh.replace('#', '').split()) if content_zh else 0
        has_chinese = any('\u4e00' <= c <= '\u9fff' for c in content_zh) if content_zh else False
        status = 'ISSUES: ' + ', '.join(issues) if issues else 'OK'
        print(f"{fname}")
        print(f"  titleEn={len(title_en)} | titleZh={len(title_zh)} | zh_words={word_count} | has_chinese={has_chinese}")
        print(f"  {status}")
    except Exception as e:
        print(f"{fname}: ERROR {e}")
