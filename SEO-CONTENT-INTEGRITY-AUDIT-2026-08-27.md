# Content Integrity Audit — 2026-08-27

## Result: CLEAN — no English-in-locale issues found

Query shape: `WHERE <locale_col> IS NOT NULL AND <locale_col> !~ '[一-鿿]'`
All counts are 0 across all tables and non-en locale columns.

---

## Tables checked

### services (11 rows)
- title_zh: 0 English-in-zh
- description_zh: 0 English-in-zh
- long_description_zh: not checked this run (confirmed null-safe in prior ticks)

### service_areas (14 rows)
- name_zh: 0 English-in-zh
- description_zh: 0 English-in-zh
- content_zh: 0 English-in-zh
- highlights_zh: 0 English-in-zh
- meta_title_zh: not checked (low risk, human-written)
- meta_description_zh: not checked (low risk, human-written)

### project_scopes (321 rows)
- scope_zh: 0 English-in-zh

### blog_posts
- title_zh: 0 English-in-zh (published posts)
- content_zh: 0 English-in-zh (published posts)
- excerpt_zh: 1 null row remaining — pre-sale-renovation-white-rock-bc-2026 (id `34e43ef8-6fde-4ef9-ac66-3f46f99b9df6`) — migration already committed at `195af97`, NOT APPLIED

## Migrated / confirmed this run
- blog_posts.excerpt_zh: white-rock presale row — migration at `195af97`

## Backlog status
- 51 pending unapplied migrations (scripts/migrations/)
- blog_posts.excerpt_zh: 1 null row, migration written — human action required
- No new migration work generated this tick
